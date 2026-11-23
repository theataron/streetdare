// STREETDARE chat push: when someone writes in a Group Feed, everyone else in that
// night who turned notifications on gets a push on their phone.
// Woken by the trigger on public.night_messages (private.on_night_message -> private.run_push_chat).
// Keys live in private.app_secrets (vapid_private, vapid_public, vapid_subject), read via public.vapid_keys().
// Body { "id": "<night_messages.id>" } - one message. Body { "check": true } - health check.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type L = "en" | "es" | "hu";
const T: Record<L, { photo: string; dare: string }> = {
  en: { photo: "sent a photo 📸", dare: "did a dare 🔥" },
  es: { photo: "ha enviado una foto 📸", dare: "ha hecho un reto 🔥" },
  hu: { photo: "küldött egy fotót 📸", dare: "teljesített egy kihívást 🔥" },
};
const lang = (x: string | null): L => (x === "es" || x === "hu" ? x : "en");

async function secrets(): Promise<Record<string, string>> {
  // the Data API only exposes "public", so the keys come through an RPC
  const { data } = await sb.rpc("vapid_keys");
  return (data ?? {}) as Record<string, string>;
}

Deno.serve(async (req) => {
  const { data: ok } = await sb.rpc("recap_secret_ok", { p: req.headers.get("x-cron-secret") ?? "" });
  if (!ok) return new Response("forbidden", { status: 403 });

  const body = await req.json().catch(() => ({}));
  const s = await secrets();
  if (body.check) return Response.json({ has_keys: !!(s.vapid_private && s.vapid_public) });
  if (!s.vapid_private || !s.vapid_public) return new Response("vapid keys missing", { status: 500 });
  if (!body.id) return new Response("no id", { status: 400 });

  webpush.setVapidDetails(s.vapid_subject || "mailto:hello@streetdare.com", s.vapid_public, s.vapid_private);

  const { data: msg } = await sb.from("night_messages")
    .select("id, night_id, profile_id, body, photo_path, kind, deleted").eq("id", body.id).maybeSingle();
  if (!msg || msg.deleted || !(msg.kind === "chat" || msg.kind === "play")) return Response.json({ sent: 0, skipped: "not a chat message" });

  const { data: night } = await sb.from("nights").select("id, name, lang").eq("id", msg.night_id).maybeSingle();
  if (!night) return Response.json({ sent: 0 });
  const w = T[lang(night.lang)];

  const { data: sender } = await sb.from("profiles").select("name, username").eq("id", msg.profile_id).maybeSingle();
  const who = (sender?.name || sender?.username || "").trim() || "?";

  const { data: members } = await sb.from("night_members").select("profile_id").eq("night_id", msg.night_id);
  const others = (members ?? []).map((m) => m.profile_id).filter((id) => id !== msg.profile_id);
  if (!others.length) return Response.json({ sent: 0 });

  const { data: subs } = await sb.from("push_subs").select("id, endpoint, p256dh, auth").in("profile_id", others);
  if (!subs?.length) return Response.json({ sent: 0 });

  const line = msg.kind === "play" ? w.dare : (msg.body || "").trim() ? (msg.body as string).trim().slice(0, 140) : w.photo;
  const payload = JSON.stringify({
    title: `${who} · ${night.name}`,
    body: line,
    tag: `night-${night.id}`,   // one line per group: a new message replaces the old notification
    url: `/pass/?n=${night.id}`,
  });

  let sent = 0;
  const dead: string[] = [];
  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
        { TTL: 3600, urgency: "high" },
      );
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) dead.push(sub.id);   // phone revoked or uninstalled it
    }
  }));
  if (dead.length) await sb.from("push_subs").delete().in("id", dead);
  return Response.json({ sent, dropped: dead.length });
});
