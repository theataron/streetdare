/* ===== STREETDARE - shared login helper for /login, /me and /admin (ES module) ===== */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const sb = createClient('https://jlnsqerwiwmbqpzzcskf.supabase.co', 'sb_publishable_zWPRZvdU4QyCI5hlmAvCWA_Mz7_koXT');

/* "Continue with Google" stays hidden until the Google login is switched on in Supabase */
export const GOOGLE_ENABLED = false;

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
  try{ const s = localStorage.getItem('sd_lang'); if (s) return s; }catch(e){}
  return (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
}
export function setLang(l){ try{ localStorage.setItem('sd_lang', l); }catch(e){} }

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
