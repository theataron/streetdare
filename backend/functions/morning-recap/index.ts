// STREETDARE morning recap: the day after a night out, each shirt owner gets
// "Last night: 9 scans, 4 dares, 4 new people 🔥".
// Runs every day from pg_cron (see backend/SETUP.md). Needs the secret RESEND_API_KEY.
// Body {} = normal daily run (last 24 h, owners with recap_opt_in).
// Body {"test_shirt":"aron","days":7} = send one test email for that shirt.
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";

type L = "en" | "es" | "hu";
const T: Record<L, Record<string, string>> = {
  en: {
    subj: "Last night: {s} scans, {d} dares 🔥", hi: "Morning, {name} ☀️", intro: "Here’s what your STREETDARE shirt did last night.",
    scans: "scans", dares: "dares done", people: "new people", top: "Last dare you did", where: "Scanned in",
    share: "Screenshot this and post it 📸 The best nights deserve proof.", cta: "See your night", again: "Wear it again this weekend, and let the next stranger make the first move.",
    foot: "You get this because you own a STREETDARE shirt. Don’t want morning recaps? Switch them off in your profile.", off: "Turn off recaps",
  },
  es: {
    subj: "Anoche: {s} escaneos, {d} retos 🔥", hi: "Buenos días, {name} ☀️", intro: "Esto es lo que hizo tu camiseta STREETDARE anoche.",
    scans: "escaneos", dares: "retos hechos", people: "personas nuevas", top: "Último reto que hiciste", where: "Escaneada en",
    share: "Hazle captura y súbela 📸 Las mejores noches merecen pruebas.", cta: "Ver tu noche", again: "Vuelve a ponértela este finde y deja que el próximo desconocido dé el primer paso.",
    foot: "Te llega porque tienes una camiseta STREETDARE. ¿No quieres estos resúmenes? Desactívalos en tu perfil.", off: "Desactivar resúmenes",
  },
  hu: {
    subj: "Tegnap este: {s} szkennelés, {d} kihívás 🔥", hi: "Jó reggelt, {name} ☀️", intro: "Ezt csinálta tegnap este a STREETDARE pólód.",
    scans: "szkennelés", dares: "teljesített kihívás", people: "új ember", top: "Az utolsó kihívásotok", where: "Itt szkenneltek be",
    share: "Csinálj róla képernyőképet, és posztold 📸 A legjobb esték bizonyítékot érdemelnek.", cta: "Nézd meg az estédet", again: "Vedd fel újra a hétvégén, és hagyd, hogy a következő idegen tegye meg az első lépést.",
    foot: "Azért kapod, mert van STREETDARE pólód. Nem kérsz ilyen összefoglalót? Kapcsold ki a profilodban.", off: "Összefoglalók kikapcsolása",
  },
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const city = (tz: string) => tz.split("/").pop()!.replace(/_/g, " ");

function tile(n: number, label: string) {
  return `<td style="width:33%;padding:6px"><div style="background:#ffffff;border-radius:18px;padding:16px 6px;text-align:center">
    <div style="font:900 40px/1 Arial,sans-serif;color:#DA3030">${n}</div>
    <div style="font:700 13px/1.3 Arial,sans-serif;color:#111;margin-top:6px">${esc(label)}</div></div></td>`;
}

function html(t: Record<string, string>, name: string, s: { scans: number; dares: number; people: number; top: string; places: string[] }) {
  return `<!doctype html><html><body style="margin:0;background:#f5f1e8">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif">
    <div style="background:#000;border-radius:26px;padding:28px 20px;color:#fff">
      <div style="font:900 22px Arial,sans-serif;color:#DA3030;letter-spacing:1px">STREETDARE</div>
      <h1 style="font:900 28px/1.15 Arial,sans-serif;color:#FFE32A;margin:18px 0 6px">${esc(t.hi.replace("{name}", name))}</h1>
      <p style="font:16px/1.45 Arial,sans-serif;margin:0 0 16px;color:#eee">${esc(t.intro)}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse"><tr>${tile(s.scans, t.scans)}${tile(s.dares, t.dares)}${tile(s.people, t.people)}</tr></table>
      ${s.top ? `<p style="font:13px Arial,sans-serif;color:#aaa;margin:18px 0 4px;text-transform:uppercase;letter-spacing:1px">${esc(t.top)}</p>
      <p style="font:700 17px/1.4 Arial,sans-serif;margin:0;color:#fff">“${esc(s.top)}”</p>` : ""}
      ${s.places.length ? `<p style="font:14px Arial,sans-serif;color:#ccc;margin:14px 0 0">📍 ${esc(t.where)}: ${esc(s.places.join(", "))}</p>` : ""}
      <p style="font:700 15px/1.45 Arial,sans-serif;margin:20px 0 0;color:#FFE32A">${esc(t.share)}</p>
    </div>
    <p style="text-align:center;margin:22px 0 8px"><a href="https://streetdare.com/me/" style="display:inline-block;background:#DA3030;color:#fff;font:700 16px Arial,sans-serif;text-decoration:none;padding:15px 28px;border-radius:99px">${esc(t.cta)}</a></p>
    <p style="font:15px/1.45 Arial,sans-serif;color:#222;text-align:center;margin:10px 8px 22px">${esc(t.again)}</p>
    <p style="font:12px/1.5 Arial,sans-serif;color:#777;text-align:center">${esc(t.foot)} <a href="https://streetdare.com/me/#recap" style="color:#777">${esc(t.off)}</a></p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  const secret = req.headers.get("x-cron-secret") ?? "";
  const { data: ok } = await sb.rpc("recap_secret_ok", { p: secret });
  if (!ok) return new Response("forbidden", { status: 403 });
  if (!RESEND) return new Response("RESEND_API_KEY missing", { status: 500 });
  const body = await req.json().catch(() => ({}));
  const test: string | null = body.test_shirt ?? null;
  const hours = test ? 24 * Math.min(Number(body.days) || 7, 30) : 24;
  const since = new Date(Date.now() - hours * 3600e3).toISOString();

  let q = sb.from("shirts").select("id, owner_id, profiles!inner(email, name, lang, recap_opt_in)").not("owner_id", "is", null).eq("status", "active");
  if (test) q = q.eq("id", test);
  const { data: shirts, error } = await q;
  if (error) return new Response(error.message, { status: 500 });

  // one email per owner, adding up all their shirts
  const owners = new Map<string, { email: string; name: string; lang: L; ids: string[] }>();
  for (const s of shirts ?? []) {
    const p = (s as any).profiles;
    if (!p?.email || (!test && !p.recap_opt_in)) continue;
    const o = owners.get(s.owner_id) ?? { email: p.email, name: p.name || "", lang: (["en", "es", "hu"].includes(p.lang) ? p.lang : "en") as L, ids: [] };
    o.ids.push(s.id); owners.set(s.owner_id, o);
  }

  const sent: string[] = [];
  for (const [, o] of owners) {
    const { data: ev } = await sb.from("play_events").select("event, device_id, dare_id, dare_text, tz, created_at")
      .in("shirt_id", o.ids).gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
    const rows = ev ?? [];
    const remote = new Set(rows.filter((r) => r.event === "remote").map((r) => r.device_id));
    const real = rows.filter((r) => !remote.has(r.device_id));
    const scans = new Set(real.filter((r) => r.event === "scan").map((r) => r.device_id)).size;
    if (!scans && !test) continue;
    const dones = real.filter((r) => r.event === "done");
    const people = new Set(real.filter((r) => r.event === "accept").map((r) => r.device_id)).size;
    const places = [...new Set(real.map((r) => r.tz).filter(Boolean).map((z) => city(z as string)))].slice(0, 3);
    let top = "";
    if (dones[0]) {
      top = dones[0].dare_text ?? "";
      if (dones[0].dare_id && o.lang !== "en") {
        const { data: d } = await sb.from("dares").select("text_es, text_hu").eq("id", dones[0].dare_id).maybeSingle();
        top = (o.lang === "es" ? d?.text_es : d?.text_hu) || top;
      }
    }
    const t = T[o.lang];
    const name = o.name || "STREETDARE";
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "STREETDARE <hello@streetdare.com>", to: o.email,
        subject: t.subj.replace("{s}", String(scans)).replace("{d}", String(dones.length)),
        html: html(t, name, { scans, dares: dones.length, people, top, places }),
      }),
    });
    if (r.ok) sent.push(o.email.replace(/(.).*@/, "$1…@"));
  }
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
