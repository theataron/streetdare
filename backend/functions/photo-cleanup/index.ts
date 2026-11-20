// STREETDARE photo cleanup: Shirtless Pass photos (bucket night-photos) are deleted 7 days after upload.
// Runs every hour from pg_cron (job "photo-cleanup" → private.run_photo_cleanup()).
// Uses the same cron secret as the morning recap.
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const DAYS = 7;

Deno.serve(async (req) => {
  const secret = req.headers.get("x-cron-secret") ?? "";
  const { data: ok } = await sb.rpc("recap_secret_ok", { p: secret });
  if (!ok) return new Response("forbidden", { status: 403 });

  const { data: paths, error } = await sb.rpc("old_night_photos", { p_days: DAYS });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const list: string[] = (paths ?? []) as string[];
  let removed = 0;
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const { data, error: e } = await sb.storage.from("night-photos").remove(chunk);
    if (e) return new Response(JSON.stringify({ error: e.message, removed }), { status: 500 });
    removed += (data ?? []).length;
  }
  return new Response(JSON.stringify({ removed }), { headers: { "Content-Type": "application/json" } });
});
