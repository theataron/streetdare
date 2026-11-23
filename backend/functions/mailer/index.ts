// STREETDARE mailer: sends the welcome and "shirt claimed" emails and powers the admin Emails tab.
// Two ways in:
//  1. x-cron-secret (private.run_mailer(), woken by claim_shirt() and a 1-minute cron while anything is queued)
//     -> sends every queued row in public.email_log.
//  2. Authorization: Bearer <admin login>  (streetdare.com/admin/, Emails tab) with {action}:
//     list    -> our email_log + Resend's own list of sent emails (includes login codes sent through Supabase SMTP)
//     view    -> {resend_id}: the exact email Resend sent (html, status)
//     preview -> {kind, lang}: a template with sample data
//     test    -> {kind, lang}: send that template to the admin's own inbox
//     retry   -> {id}: put a failed row back in the queue and send it
// Needs the secret RESEND_API_KEY. Deploy with verify_jwt off (it checks the caller itself).
import { createClient } from "npm:@supabase/supabase-js@2";
import { claimed, pickLang, welcome, type L, type Mail } from "./templates.ts";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const sb = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "STREETDARE <hello@streetdare.com>";
const WELCOME_DELAY_MS = 3 * 60e3; // give /me time to save the person's language
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

async function replyTo(): Promise<string | undefined> {
  const { data } = await sb.rpc("contact_to");
  return (data as string) || undefined;
}

async function resendSend(to: string, m: Mail, reply?: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject: m.subject, html: m.html, text: m.text, ...(reply ? { reply_to: reply } : {}) }),
  });
  const body = await r.json().catch(() => ({}));
  return r.ok ? { ok: true, id: body.id as string } : { ok: false, error: JSON.stringify(body).slice(0, 300) };
}

async function render(kind: string, profileId: string | null, shirtId: string | null) {
  const { data: p } = await sb.from("profiles").select("email, name, lang, marketing_opt_in").eq("id", profileId).maybeSingle();
  if (!p?.email) return null;
  const lang = pickLang(p.lang);
  if (kind === "welcome") return { to: p.email, lang, mail: welcome(lang, { name: p.name || "", optedIn: !!p.marketing_opt_in }) };
  if (kind === "shirt_claimed") {
    const { data: s } = await sb.from("shirts").select("id, name").eq("id", shirtId).maybeSingle();
    const { data: c } = await sb.from("shirt_codes").select("code").eq("shirt_id", shirtId).maybeSingle();
    return { to: p.email, lang, mail: claimed(lang, { name: p.name || s?.name || "", shirt: s?.id || shirtId || "", code: c?.code || "" }) };
  }
  return null;
}

async function processQueue() {
  const { data: rows } = await sb.from("email_log").select("*").eq("status", "queued").lt("attempts", 5)
    .in("kind", ["welcome", "shirt_claimed"]).order("created_at").limit(25);
  const reply = await replyTo();
  let sent = 0;
  for (const row of rows ?? []) {
    if (row.kind === "welcome" && Date.now() - new Date(row.created_at).getTime() < WELCOME_DELAY_MS) continue;
    const r = await render(row.kind, row.profile_id, row.shirt_id);
    if (!r) { await sb.from("email_log").update({ status: "skipped", error: "no profile or email" }).eq("id", row.id); continue; }
    const res = await resendSend(r.to, r.mail, reply);
    await sb.from("email_log").update(res.ok
      ? { status: "sent", resend_id: res.id, sent_at: new Date().toISOString(), to_email: r.to, lang: r.lang, subject: r.mail.subject, error: null, attempts: row.attempts + 1 }
      : { status: row.attempts + 1 >= 5 ? "failed" : "queued", error: res.error, to_email: r.to, lang: r.lang, subject: r.mail.subject, attempts: row.attempts + 1 }).eq("id", row.id);
    if (res.ok) sent++;
  }
  return sent;
}

/* ---------- previews ---------- */
async function preview(kind: string, lang: L): Promise<Mail | { error: string }> {
  if (kind === "welcome") return welcome(lang, { name: "Luca", optedIn: false });
  if (kind === "welcome_listed") return welcome(lang, { name: "Luca", optedIn: true });
  if (kind === "shirt_claimed") return claimed(lang, { name: "Luca", shirt: "luca", code: "1234" });
  if (kind === "morning_recap" || kind === "contact") {
    const fn = kind === "morning_recap" ? "morning-recap" : "contact-mail";
    const r = await fetch(`${URL_}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-cron-secret": await cronSecret() },
      body: JSON.stringify({ preview: true, lang }),
    });
    if (!r.ok) return { error: `${fn} preview failed (${r.status})` };
    return await r.json();
  }
  return { error: "unknown template" };
}
let _secret = "";
async function cronSecret() {
  if (_secret) return _secret;
  const { data } = await sb.rpc("mailer_cron_secret");
  _secret = (data as string) || "";
  return _secret;
}

/* ---------- Resend's own history ---------- */
async function resendList(pages = 3) {
  const out: unknown[] = [];
  let after = "";
  for (let i = 0; i < pages; i++) {
    const r = await fetch(`https://api.resend.com/emails?limit=100${after ? "&after=" + after : ""}`, { headers: { Authorization: `Bearer ${RESEND}` } });
    if (!r.ok) return { error: `Resend ${r.status}: ${(await r.text()).slice(0, 200)}`, data: out };
    const b = await r.json();
    out.push(...(b.data ?? []));
    if (!b.has_more || !b.data?.length) break;
    after = b.data[b.data.length - 1].id;
  }
  return { data: out };
}

async function isAdmin(req: Request) {
  const tok = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!tok) return null;
  const { data: u } = await sb.auth.getUser(tok);
  if (!u?.user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", u.user.id).maybeSingle();
  return p?.role === "admin" ? { id: u.user.id, email: p.email as string } : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!RESEND) return json({ error: "RESEND_API_KEY missing" }, 500);

  const cron = req.headers.get("x-cron-secret");
  if (cron) {
    const { data: ok } = await sb.rpc("recap_secret_ok", { p: cron });
    if (!ok) return json({ error: "forbidden" }, 403);
    return json({ sent: await processQueue() });
  }

  const admin = await isAdmin(req);
  if (!admin) return json({ error: "forbidden" }, 403);
  const body = await req.json().catch(() => ({}));
  const lang = pickLang(body.lang);

  switch (body.action) {
    case "list": {
      const [{ data: log }, rs] = await Promise.all([
        sb.from("email_log").select("*").order("created_at", { ascending: false }).limit(300),
        resendList(),
      ]);
      return json({ log: log ?? [], resend: rs.data, resend_error: (rs as { error?: string }).error ?? null });
    }
    case "view": {
      const r = await fetch(`https://api.resend.com/emails/${encodeURIComponent(body.resend_id)}`, { headers: { Authorization: `Bearer ${RESEND}` } });
      const b = await r.json().catch(() => ({}));
      return r.ok ? json(b) : json({ error: `Resend ${r.status}: ${JSON.stringify(b).slice(0, 200)}` }, 502);
    }
    case "preview":
      return json(await preview(String(body.kind), lang));
    case "test": {
      const m = await preview(String(body.kind), lang);
      if ("error" in m) return json(m, 400);
      const subject = "[TEST] " + m.subject;
      const res = await resendSend(admin.email, { ...m, subject });
      await sb.from("email_log").insert({ kind: "test", profile_id: admin.id, to_email: admin.email, lang, subject,
        status: res.ok ? "sent" : "failed", resend_id: res.ok ? res.id : null, error: res.ok ? null : res.error, attempts: 1,
        sent_at: res.ok ? new Date().toISOString() : null, meta: { template: body.kind } });
      return json(res);
    }
    case "retry": {
      await sb.from("email_log").update({ status: "queued", attempts: 0, error: null }).eq("id", body.id).in("status", ["failed", "skipped", "queued"]);
      return json({ sent: await processQueue() });
    }
    case "send_now": {
      // queue a missed welcome / claimed email for an existing account, then send it
      const kind = body.kind === "shirt_claimed" ? "shirt_claimed" : "welcome";
      const { data: p } = await sb.from("profiles").select("id, email").eq("id", body.profile_id).maybeSingle();
      if (!p?.email) return json({ error: "no such profile" }, 404);
      const { error } = await sb.from("email_log").insert({ kind, profile_id: p.id, to_email: p.email, shirt_id: kind === "shirt_claimed" ? body.shirt_id : null,
        created_at: new Date(Date.now() - WELCOME_DELAY_MS).toISOString(), meta: { sent_by_admin: admin.email } });
      if (error) return json({ error: error.code === "23505" ? "already sent or queued" : error.message }, 409);
      return json({ sent: await processQueue() });
    }
  }
  return json({ error: "unknown action" }, 400);
});
