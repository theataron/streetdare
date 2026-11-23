// STREETDARE contact form: sends every new message from streetdare.com/contact/ to Áron's inbox.
// Woken by public.send_contact() (and a 10-minute cron retry). Needs the secret RESEND_API_KEY.
// The recipient is private.app_secrets 'contact_to'. Reply-To is the visitor, so "Reply" answers them.
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const TOPIC: Record<string, string> = { player: "Player / shirt question", collab: "Collaboration", press: "Press", other: "Other", safety: "Safety", report: "🚩 SAFETY REPORT" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function mailHtml(m: { name: string; email: string; message: string; lang?: string | null }, topic: string) {
  return `<div style="font:15px/1.5 Arial,sans-serif;color:#1B1412;max-width:560px">
      <p style="margin:0 0 4px;font:700 12px Arial,sans-serif;letter-spacing:1px;color:#E3141B">STREETDARE · CONTACT FORM</p>
      <p style="margin:0 0 16px;font:700 18px Arial,sans-serif">${esc(topic)} · ${esc(m.name)}</p>
      <div style="white-space:pre-wrap;background:#fbf8ef;border-radius:12px;padding:14px 16px">${esc(m.message)}</div>
      <p style="color:#6b5f58;font-size:13px;margin-top:16px">From ${esc(m.name)} &lt;${esc(m.email)}&gt; · language ${esc(m.lang ?? "-")}<br>Just hit Reply to answer them.</p></div>`;
}

Deno.serve(async (req) => {
  const { data: ok } = await sb.rpc("recap_secret_ok", { p: req.headers.get("x-cron-secret") ?? "" });
  if (!ok) return new Response("forbidden", { status: 403 });
  const body = await req.json().catch(() => ({}));
  if (body.preview) {
    const m = { name: "Luca", email: "luca@example.com", topic: "player", message: "Hi! Can I get my shirt in black?", lang: body.lang ?? "en" };
    return Response.json({ subject: `${TOPIC[m.topic]}: message from ${m.name}`, html: mailHtml(m, TOPIC[m.topic]) });
  }
  if (body.check) return Response.json({ has_key: !!RESEND });
  if (!RESEND) return new Response("RESEND_API_KEY missing", { status: 500 });

  const { data: to } = await sb.rpc("contact_to");
  const { data: rows } = await sb.from("contact_messages").select("*").is("sent_at", null)
    .gt("created_at", new Date(Date.now() - 2 * 864e5).toISOString()).order("created_at").limit(20);
  const done: string[] = [];
  for (const m of rows ?? []) {
    const topic = TOPIC[m.topic] ?? "Other";
    const text = `${m.message}\n\n---\nFrom: ${m.name} <${m.email}>\nTopic: ${topic}\nLanguage: ${m.lang ?? "-"}\nSent from streetdare.com/contact`;
    const html = mailHtml(m, topic);
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "STREETDARE contact <hello@streetdare.com>", to, reply_to: m.email,
        subject: `${topic}: message from ${m.name}`, text, html,
      }),
    });
    const err = r.ok ? null : (await r.text()).slice(0, 300);
    const rb = r.ok ? await r.json().catch(() => ({})) : {};
    await sb.from("email_log").insert({ kind: "contact", to_email: to, lang: m.lang, subject: `${topic}: message from ${m.name}`,
      status: r.ok ? "sent" : "failed", resend_id: r.ok ? rb.id : null, error: err, attempts: 1, sent_at: r.ok ? new Date().toISOString() : null,
      meta: { from: m.email, contact_id: m.id } });
    await sb.from("contact_messages").update(r.ok ? { sent_at: new Date().toISOString(), error: null } : { error: err }).eq("id", m.id);
    if (r.ok) done.push(m.id);
  }
  return Response.json({ sent: done.length });
});
