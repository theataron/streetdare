/* ===== STREETDARE - shared login helper for /login, /me and /admin (ES module) ===== */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const sb = createClient('https://jlnsqerwiwmbqpzzcskf.supabase.co', 'sb_publishable_zWPRZvdU4QyCI5hlmAvCWA_Mz7_koXT');

/* "Continue with Google" only shows once Google login is switched on in Supabase (checked live) */
export async function googleEnabled(){
  try{
    const r = await fetch('https://jlnsqerwiwmbqpzzcskf.supabase.co/auth/v1/settings', { headers:{ apikey:'sb_publishable_zWPRZvdU4QyCI5hlmAvCWA_Mz7_koXT' } });
    const j = await r.json(); return !!(j.external && j.external.google);
  }catch(e){ return false; }
}

/* resolves with the session (or null) once Supabase has read it from storage or the URL */
export function getSession(){
  return new Promise(resolve => {
    const { data } = sb.auth.onAuthStateChange((evt, session) => {
      if (evt === 'INITIAL_SESSION'){ setTimeout(() => data.subscription.unsubscribe(), 0); resolve(session); }
    });
  });
}

/* only ever send people back to a page on this site */
export function safeNext(v, fallback){
  return (v && /^\/[A-Za-z0-9/_\-?=&.]*$/.test(v) && !v.startsWith('//')) ? v : (fallback || '/me/');
}

export function lang(){
  /* English by default for everyone; another language only after the picker's warning was confirmed */
  try{ const s = localStorage.getItem('sd_lang2'); if (s === 'es' || s === 'hu') return s; }catch(e){}
  return 'en';
}
export function setLang(l){ try{ localStorage.setItem('sd_lang2', l); }catch(e){} }

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* kept for pages a browser may still have cached from before the live Google check */
export const GOOGLE_ENABLED = false;
