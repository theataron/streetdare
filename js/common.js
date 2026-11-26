/* ===== STREETDARE - settings & helpers =====
   API_URL: paste the Google Apps Script web-app link (ending in /exec) between the quotes.
   While it is empty the site runs in DEMO MODE: email sign-ups are NOT collected,
   and wall messages only live on the visitor's own phone. See backend/SETUP.md. */
/* GTM_ID: Google Tag Manager container (GA4 is set up inside it). GA_ID: optional direct GA4 ID (G-...) if GTM isn't used.
   While both are empty there is no analytics and no cookie banner. */
const SD = { GTM_ID: '', GA_ID: 'G-P7KSSZ5108', API_URL: 'https://script.google.com/macros/s/AKfycbzJsL0f9hHVi1GYV_vMrzFgDBMkWBeLgugA8oV-zaMIh1sDrTbZ3LN595ZrwVy5eLAt/exec' };

const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
const $ = id => document.getElementById(id);
const SHIRT = (new URLSearchParams(location.search).get('s') || '').replace(/[^\w-]/g,'').slice(0,12);

/* ----- referral: scanning someone's shirt in real life remembers whose shirt it was -----
   referred_by stays, so a later sign-up or order can be credited to that wearer.
   The scanner's own perk (money off their shirt) only lasts REF_HOURS from the scan. */
const REF_HOURS = 6;
function refSave(id){
  const r = refGet();
  if (r && r.id === id && r.left > 0) return;
  store.set('referred_by', id); store.set('referred_at', String(Date.now()));
}
function refGet(){
  const id = store.get('referred_by'); if (!id) return null;
  const at = Number(store.get('referred_at')) || 0;
  return { id, at, left: at + REF_HOURS * 3600000 - Date.now() };
}

/* ----- language ----- */
/* English is the default for everyone: the phone's language is not used any more. Other languages are
   auto-generated, so the picker (js/langpick.js) warns before switching. Key is sd_lang2 so that choices
   made before the warning existed don't stick. */
const LANG_CHOSEN = !!store.get('sd_lang2');
let LANG = ['es','hu'].includes(store.get('sd_lang2')) ? store.get('sd_lang2') : 'en';
function setLang(code){ LANG = code; store.set('sd_lang2', code); applyLang(); }
let DICT = { en:{} };
const t = k => (DICT[LANG] && DICT[LANG][k]) ?? (DICT.en[k] ?? k);
/* ----- account links: "Log in" in the header, "Log in" + "Create account" in the menu ----- */
const ACCT = {
  en:{ contact:'Contact', contactS:'Questions, collabs, press', pass:'Shirtless Pass', passS:'No shirt? Play tonight with your friends', login:'Log in', me:'Profile', signup:'Create account', loginS:'Your profile, your shirts, your stats', signupS:'Got a shirt? Claim it here', meS:'Your photo, your shirts and your stats' },
  hu:{ contact:'Kapcsolat', contactS:'Kérdések, együttműködés, sajtó', pass:'Shirtless Pass', passS:'Nincs pólód? Játssz ma este a barátaiddal', login:'Belépés', me:'Profil', signup:'Fiók létrehozása', loginS:'A profilod, a pólóid, a statisztikáid', signupS:'Van pólód? Itt igényelheted', meS:'A fotód, a pólóid és a statisztikáid' },
  es:{ contact:'Contacto', contactS:'Preguntas, colaboraciones, prensa', pass:'Shirtless Pass', passS:'¿Sin camiseta? Juega esta noche con tus amigos', login:'Entrar', me:'Perfil', signup:'Crear cuenta', loginS:'Tu perfil, tus camisetas, tus estadísticas', signupS:'¿Tienes camiseta? Reclámala aquí', meS:'Tu foto, tus camisetas y tus estadísticas' }
};
const loggedIn = () => !!store.get('sb-jlnsqerwiwmbqpzzcskf-auth-token');
function paintAccount(){
  const a = ACCT[LANG] || ACCT.en, right = document.querySelector('.top .right'), menu = $('menu');
  if (window.STAGE) return;
  if (right && !$('acctBtn')){ const l = document.createElement('a'); l.id = 'acctBtn'; l.className = 'acct'; right.appendChild(l);  /* far right of the header */ }
  if (menu && !$('mLogin')){
    /* Everything we add goes above the dark-mode row, so that row stays at the bottom. */
    const foot = menu.querySelector('.nightrow') || menu.querySelector('.foot');
    const mk = id => { const el = document.createElement('a'); el.id = id; el.innerHTML = '<span></span><small></small>'; menu.insertBefore(el, foot); return el; };
    mk('mPass'); mk('mSignup');
    /* The Wall belongs low in the menu, right above Contact. Profile is not in here at
       all any more: it's the highlighted button in the top right of the header. */
    const wall = menu.querySelector('a[href="#wall"], a[href="/#wall"], a[data-to="wall"]');
    if (wall) menu.insertBefore(wall, foot);
    mk('mContact');
  }
  const mc = $('mContact');
  if (mc){ mc.href = '/contact/'; mc.querySelector('span').textContent = a.contact; mc.querySelector('small').textContent = a.contactS; }
  const mp = $('mPass');
  if (mp){ mp.href = '/pass/'; mp.querySelector('span').textContent = a.pass; mp.querySelector('small').textContent = a.passS; }
  const btn = $('acctBtn');
  if (btn){
    btn.href = loggedIn() ? '/me/' : '/login/'; btn.textContent = loggedIn() ? a.me : a.login;
    const pic = store.get('sd_avatar');
    if (loggedIn() && pic && /^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(pic)){ const i = document.createElement('img'); i.src = pic; i.alt = ''; btn.prepend(i); btn.classList.add('withpic'); }
  }
  const ms = $('mSignup');
  if (ms){ ms.hidden = loggedIn(); ms.href = '/login/?mode=signup'; ms.querySelector('span').textContent = a.signup; ms.querySelector('small').textContent = a.signupS; }
}
/* ----- Shirtless Pass: while a night is live it is the home page, and a bar links back to it ----- */
function livePass(){ try{ const p = JSON.parse(store.get('sd_pass') || 'null'); return p && p.ends > Date.now() && loggedIn() ? p : null; }catch(e){ return null; } }
(function passTakeover(){
  const q = new URLSearchParams(location.search), home = location.pathname === '/' || location.pathname === '/index.html';
  if (q.has('home')){ try{ sessionStorage.setItem('sd_home_ok', '1'); }catch(e){} }
  let ok = false; try{ ok = !!sessionStorage.getItem('sd_home_ok'); }catch(e){}
  const p = livePass();
  if (home && p && !ok && !window.STAGE && !location.hash) location.replace('/pass/?n=' + encodeURIComponent(p.id));
  /* A shirt owner already knows what STREETDARE is: their home page is their nights (/nights/).
     The flag is set by /nights/ (and checked once here the first time), ?home=1 still shows the info page. */
  else if (home && !ok && !window.STAGE && !location.hash && loggedIn()){
    if (store.get('sd_owner') === '1') location.replace('/nights/');
    else if (store.get('sd_owner') !== '0') setTimeout(() => sbSession().then(s => s && fetch(SB.url + '/rest/v1/shirts?select=id&limit=1&owner_id=eq.' + s.user.id,
        { headers:{ apikey: SB.key, Authorization: 'Bearer ' + s.access_token } }).then(r => r.ok ? r.json() : []).then(rows => {
        store.set('sd_owner', rows.length ? '1' : '0');
        if (rows.length) location.replace('/nights/');
      })).catch(() => {}), 0);
  }
})();
function paintPassBar(){
  const p = livePass(); let bar = $('passBar');
  if (!p || window.STAGE || location.pathname.startsWith('/p/')){ if (bar) bar.remove(); return; }
  if (!bar){ bar = document.createElement('a'); bar.id = 'passBar'; bar.className = 'passbar'; document.body.prepend(bar); }
  bar.href = '/pass/?n=' + encodeURIComponent(p.id);
  const ms = p.ends - Date.now(), h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60;
  bar.innerHTML = '<span>⏱ ' + h + 'h ' + m + 'm · <b></b></span><span>→</span>';
  bar.querySelector('b').textContent = p.name;
}
function applyLang(){
  paintAccount();
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  if (window.paintLangPick) paintLangPick();
  document.dispatchEvent(new Event('langchange'));
}
function initLang(dict){
  DICT = dict;
  window.paintLangPick = langPicker($('lang'), () => LANG, code => setLang(code));
  applyLang();
}

/* ----- backend (Google Apps Script) with demo fallback ----- */
const Demo = {
  _wall(){ try{ return JSON.parse(store.get('sd_demo_wall')||'[]'); }catch(e){ return []; } },
  getWall(){ return this._wall(); },
  postMessage(d){ const w = this._wall(); w.unshift({ text:d.text, ig:d.ig||'', created:Date.now() }); store.set('sd_demo_wall', JSON.stringify(w.slice(0,50))); return true; },
  reportMessage(d){ store.set('sd_demo_wall', JSON.stringify(this._wall().filter(m => m.created !== d.created))); return true; },
  joinWaitlist(){ return true; },
  logEvent(){ return true; }
};
async function api(fn, data){
  if (!SD.API_URL) return Demo[fn](data||{});
  const res = fn === 'getWall'
    ? await fetch(SD.API_URL + '?fn=getWall&t=' + Date.now())
    : await fetch(SD.API_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(Object.assign({ fn, shirt: SHIRT || (refGet() || {}).id || '', lang:LANG }, data||{})) });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || 'error');
  return j.data;
}
/* the hidden /stage/ preview never writes scan stats */
function track(type, extra){
  if (SD.API_URL && !window.STAGE) api('logEvent', Object.assign({ type }, extra||{})).catch(()=>{});
  gaEvent(type, extra);
}

/* ----- Google Analytics 4, only after a clear "OK" -----
   Nothing from Google loads until the visitor taps OK (Consent Mode v2, basic). "No thanks" is the same size and colour.
   The choice is remembered for 12 months; /privacy/ has a button to change it. */
const CONSENT_TEXT = {
  en:{ q:'Can we count your visit with Google Analytics? It helps us improve STREETDARE.', yes:'OK', no:'No thanks', more:'Details' },
  es:{ q:'¿Podemos contar tu visita con Google Analytics? Nos ayuda a mejorar STREETDARE.', yes:'Vale', no:'No, gracias', more:'Detalles' },
  hu:{ q:'Megszámolhatjuk a látogatásodat a Google Analyticsszel? Ezzel segítesz jobbá tenni a STREETDARE-t.', yes:'Mehet', no:'Inkább ne', more:'Részletek' }
};
function consentGet(){
  try{ const c = JSON.parse(store.get('sd_consent') || 'null'); if (c && Date.now() - c.at < 365 * 864e5) return c.v; }catch(e){}
  return null;
}
function consentSet(v){ store.set('sd_consent', JSON.stringify({ v, at: Date.now() })); }
let gaReady = false;
const analyticsOn = () => !!(SD.GTM_ID || SD.GA_ID) && !window.STAGE;
function gaLoad(){
  if (gaReady || !analyticsOn()) return; gaReady = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('consent', 'default', { analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
  if (SD.GTM_ID){
    dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(SD.GTM_ID); document.head.appendChild(g);
    return;
  }
  gtag('js', new Date());
  gtag('config', SD.GA_ID, { anonymize_ip: true, page_path: location.pathname + location.hash });
  const sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(SD.GA_ID); document.head.appendChild(sc);
}
function gaEvent(name, extra){
  if (!gaReady) return;
  const p = {}; if (typeof SHIRT !== 'undefined' && SHIRT) p.shirt = SHIRT.toLowerCase(); if (extra && 'verified' in extra) p.verified = !!extra.verified;
  if (SD.GTM_ID) dataLayer.push(Object.assign({ event: 'sd_' + name }, p));
  else if (window.gtag) gtag('event', 'sd_' + name, p);
}
function consentAsk(){
  if (!analyticsOn() || consentGet() || $('consent')) return;
  const c = CONSENT_TEXT[LANG] || CONSENT_TEXT.en, base = location.pathname.split('/').length > 2 ? '../' : '';
  const box = document.createElement('div'); box.id = 'consent'; box.className = 'consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite');
  box.innerHTML = '<p>' + c.q + ' <a href="' + base + 'privacy/#cookies">' + c.more + '</a></p><div class="cbtns"><button type="button" data-v="denied">' + c.no + '</button><button type="button" data-v="granted">' + c.yes + '</button></div>';
  box.querySelectorAll('button').forEach(b => b.onclick = () => { consentSet(b.dataset.v); box.remove(); if (b.dataset.v === 'granted') gaLoad(); });
  document.body.appendChild(box);
}
function consentInit(){
  if (!analyticsOn()) return;
  if (consentGet() === 'granted') return gaLoad();
  if (consentGet() === 'denied') return;
  setTimeout(consentAsk, 900);
}
window.addEventListener('hashchange', () => { if (gaReady && !SD.GTM_ID && window.gtag) gtag('event', 'page_view', { page_path: location.pathname + location.hash }); });
function consentReset(){ try{ localStorage.removeItem('sd_consent'); }catch(e){} location.reload(); }

/* ----- Supabase database (decks, shirts, live stats for /admin) -----
   The publishable key is meant to be public: the database's own rules decide what it can do.
   If the database is unreachable the site keeps working with the decks in js/quests.js. */
const SB = { url: 'https://jlnsqerwiwmbqpzzcskf.supabase.co', key: 'sb_publishable_zWPRZvdU4QyCI5hlmAvCWA_Mz7_koXT' };
async function sbGet(path, ms){
  const ctl = window.AbortController ? new AbortController() : null;
  const timer = ctl && setTimeout(() => ctl.abort(), ms || 4000);
  try{
    const res = await fetch(SB.url + '/rest/v1/' + path, { headers:{ apikey: SB.key }, signal: ctl && ctl.signal });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } finally { if (timer) clearTimeout(timer); }
}
function deviceId(){
  let d = store.get('sd_device');
  if (!d){ d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); store.set('sd_device', d); }
  return d;
}
/* the phone's timezone (e.g. Europe/Madrid): tells us roughly where a scan happened, without IP or GPS */
function phoneTz(){ try{ return (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 40) || null; }catch(e){ return null; } }
function sbLog(event, extra){
  const s = SHIRT.toLowerCase();
  if (window.STAGE || !s || s === 'demo') return;
  /* someone who said they're not with the wearer: only their 'remote' answer is logged, so the wearer's stats stay real */
  if (window.SD_REMOTE && event !== 'remote') return;
  fetch(SB.url + '/rest/v1/play_events', {
    method:'POST', keepalive:true,
    headers:{ apikey: SB.key, 'Content-Type':'application/json', Prefer:'return=minimal' },
    body: JSON.stringify(Object.assign({ event, shirt_id: s, device_id: deviceId(), lang: LANG, tz: phoneTz() }, extra||{}))
  }).catch(()=>{});
}

/* ----- email sign-up forms (any <form class="wl">) ----- */
const WL_TEXT = {
  en:{ ctry:'Your country (optional)', ctryNone:'No country with that name', ship:'We start in Spain and Hungary. Shipping to more countries coming soon.', member:'You’re already in the STREETDARE community ✓', optL:'Email me so I don’t miss new shirts, decks, features and events', optOn:'You’re on the list ✓', optFail:'Your login has run out. <a href="{login}">Log in again</a> and you can switch this on.', note:'One email when the shirts drop, plus new decks, features and events now and then. No spam, unsubscribe with one reply. <a href="/privacy/">Privacy</a>', ph:'Your email', send:'Join & get the drop alert 🎟️', sending:'Sending…', ok:'You’re in 🎉 Welcome to the STREETDARE community. You won’t miss the drop.', bad:'That email doesn’t look right.', err:'Couldn’t connect. Try again.', demo:'Demo mode - sign-ups are not being saved yet.' },
  hu:{ ctry:'Országod (nem kötelező)', ctryNone:'Nincs ilyen nevű ország', ship:'Spanyolországban és Magyarországon kezdünk. Hamarosan több országba is szállítunk.', member:'Már a STREETDARE közösség tagja vagy ✓', optL:'Írjatok, hogy ne maradjak le az új pólókról, paklikról, funkciókról és eseményekről', optOn:'Fent vagy a listán ✓', optFail:'Lejárt a bejelentkezésed. <a href="{login}">Lépj be újra</a>, és bekapcsolhatod.', note:'Egy e-mail, amikor kijönnek a pólók, és néha hírek az új paklikról, funkciókról és eseményekről. Spam nincs, egy válasszal leiratkozhatsz. <a href="/privacy/">Adatvédelem</a>', ph:'Az e-mail-címed', send:'Feliratkozom az értesítőre 🎟️', sending:'Küldés…', ok:'Bent vagy 🎉 Üdv a STREETDARE közösségben! Nem maradsz le az indulásról.', bad:'Ez az e-mail-cím nem tűnik jónak.', err:'Nem sikerült csatlakozni. Próbáld újra.', demo:'Demó mód: a feliratkozásokat még nem mentjük.' },
  es:{ ctry:'Tu país (opcional)', ctryNone:'No hay ningún país con ese nombre', ship:'Empezamos en España y Hungría. Pronto enviaremos a más países.', member:'Ya estás en la comunidad STREETDARE ✓', optL:'Escribidme para no perderme camisetas, barajas y funciones nuevas, ni eventos', optOn:'Estás en la lista ✓', optFail:'Tu sesión ha caducado. <a href="{login}">Vuelve a entrar</a> y podrás activarlo.', note:'Un email cuando salgan las camisetas y, de vez en cuando, novedades sobre barajas, funciones y eventos. Sin spam, te das de baja con una respuesta. <a href="/privacy/">Privacidad</a>', ph:'Tu email', send:'Únete y recibe el aviso 🎟️', sending:'Enviando…', ok:'Ya estás dentro 🎉 Te damos la bienvenida a la comunidad STREETDARE. No te vas a perder el lanzamiento.', bad:'Ese email no parece correcto.', err:'No se pudo conectar. Inténtalo otra vez.', demo:'Modo demo - todavía no se guardan los registros.' }
};
/* ----- consent log: every waitlist sign-up and email switch is saved with the exact wording shown ----- */
const plainText = h => { const d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
async function sbRpc(fn, args, token){
  const r = await fetch(SB.url + '/rest/v1/rpc/' + fn, { method:'POST',
    headers: Object.assign({ apikey: SB.key, 'Content-Type':'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: JSON.stringify(args) });
  if (!r.ok) throw new Error('rpc ' + r.status);
  return r.json();
}
function initWaitlist(){
  /* account holders are already members: no email form, just a pointer to the email switch in their profile */
  if (loggedIn() && !window.STAGE){ initMemberOptIn(); return; }
  document.querySelectorAll('form.wl').forEach(form => {
    const input = form.querySelector('input'), btn = form.querySelector('button');
    const err = form.querySelector('.wlerr'), demo = form.parentElement.querySelector('.demo');
    const label = () => form.dataset.send ? t(form.dataset.send) : WL_TEXT[LANG].send;
    const paint = () => { const w = WL_TEXT[LANG]; input.placeholder = w.ph; if (!btn.disabled) btn.textContent = label(); if (demo){ demo.textContent = w.demo; demo.hidden = !!SD.API_URL; } };
    /* optional country, searchable, never pre-filled */
    let ctry = null;
    if (typeof sdCountryCombo === 'function'){
      const box = document.createElement('div'); box.className = 'wlc';
      ctry = document.createElement('select'); ctry.setAttribute('aria-label', 'Country');
      const ship = document.createElement('p'); ship.className = 'wlship';
      box.appendChild(ctry); box.appendChild(ship); input.after(box);
      const cw = () => WL_TEXT[LANG] || WL_TEXT.en;
      sdFillCountries(ctry, LANG, '');
      sdCountryCombo(ctry, { placeholder: () => cw().ctry, none: () => cw().ctryNone });
      const paintC = () => { sdFillCountries(ctry, LANG, ''); ship.textContent = cw().ship; ctry._sdCombo.sync(); };
      document.addEventListener('langchange', paintC); paintC();
    }
    const note = document.createElement('p'); note.className = 'wlnote'; form.after(note);
    const paintNote = () => { note.innerHTML = (WL_TEXT[LANG] || WL_TEXT.en).note; };
    document.addEventListener('langchange', paintNote); paintNote();
    document.addEventListener('langchange', paint); paint();
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const w = WL_TEXT[LANG], v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ err.textContent = w.bad; err.hidden = false; return; }
      err.hidden = true; btn.disabled = true; btn.textContent = w.sending;
      try{
        const src = (window.STAGE ? 'stage-' : '') + (form.dataset.source||'');
        const wording = label() + ' | ' + plainText((WL_TEXT[LANG] || WL_TEXT.en).note);
        const res = await Promise.allSettled([
          window.STAGE ? Promise.reject('stage') : sbRpc('join_waitlist', { p_email: v, p_wording: wording, p_lang: LANG, p_page: location.pathname, p_source: src, p_country: (ctry && ctry.value) || null }),
          api('joinWaitlist', { email:v, source: src, country: (ctry && ctry.value) || '' })
        ]);
        if (!res.some(x => x.status === 'fulfilled')) throw new Error('both failed');
        store.set('sd_joined','1');
        document.querySelectorAll('form.wl').forEach(f => { const p = document.createElement('p'); p.className = 'wlmsg'; p.textContent = w.ok; f.replaceWith(p); });
        document.querySelectorAll('.wlnote').forEach(n => n.remove());
      }catch(x){ err.textContent = w.err; err.hidden = false; btn.disabled = false; btn.textContent = label(); }
    });
  });
}

/* ----- logged-in members: a switch right where the email form would be, saved straight to their profile ----- */
/* login sessions last an hour; outside /me nobody refreshes them, so do it here when needed */
const SB_KEY = 'sb-jlnsqerwiwmbqpzzcskf-auth-token';
async function sbSession(){
  let x = null;
  try{ x = JSON.parse(store.get(SB_KEY) || 'null'); }catch(e){}
  if (!x || !x.user) return null;
  if (x.access_token && (x.expires_at || 0) * 1000 > Date.now() + 60000) return x;
  if (!x.refresh_token) return null;
  try{
    const r = await fetch(SB.url + '/auth/v1/token?grant_type=refresh_token', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' }, body: JSON.stringify({ refresh_token: x.refresh_token }) });
    if (!r.ok) return null;
    const n = await r.json();
    if (!n.expires_at && n.expires_in) n.expires_at = Math.floor(Date.now() / 1000) + n.expires_in;
    store.set(SB_KEY, JSON.stringify(n));
    return n.access_token && n.user ? n : null;
  }catch(e){ return null; }
}
async function initMemberOptIn(){
  const w = () => WL_TEXT[LANG] || WL_TEXT.en;
  let ses = await sbSession();
  const failMsg = () => w().optFail.replace('{login}', '/login/?next=' + encodeURIComponent(location.pathname + location.search));
  let on = false;
  if (ses){
    try{
      const r = await fetch(SB.url + '/rest/v1/profiles?select=marketing_opt_in&id=eq.' + ses.user.id, { headers:{ apikey: SB.key, Authorization: 'Bearer ' + ses.access_token } });
      const d = r.ok ? await r.json() : []; on = !!(d[0] && d[0].marketing_opt_in);
    }catch(e){}
  }
  document.querySelectorAll('form.wl').forEach(form => {
    const box = document.createElement('div'); box.className = 'wlmember';
    box.innerHTML = '<p class="wlmsg"></p><label class="tog optin"><input type="checkbox"><span></span></label><p class="wlnote"></p>';
    form.replaceWith(box);
    const cp = box.parentElement && box.parentElement.querySelector('.coupon'); if (cp) cp.hidden = true;
    const cb = box.querySelector('input'); cb.checked = on;
    const paint = () => { box.querySelector('.wlmsg').textContent = w().member; box.querySelector('span').textContent = cb.checked ? w().optOn : w().optL; box.querySelector('.wlnote').innerHTML = w().note; };
    paint(); document.addEventListener('langchange', paint);
    if (!ses){ box.querySelector('.optin').hidden = true; box.querySelector('.wlnote').innerHTML = failMsg(); return; }
    cb.onchange = async () => {
      const v = cb.checked; paint();
      try{
        ses = await sbSession(); if (!ses) throw 0;
        const ok = await sbRpc('record_consent', { p_granted: v, p_wording: w().optL + ' [' + (v ? 'switched on' : 'switched off') + '] ' + plainText(w().note), p_lang: LANG, p_page: location.pathname, p_source: 'member-switch' }, ses.access_token);
        if (ok !== 'ok') throw 0;
        document.querySelectorAll('.wlmember input').forEach(x => { x.checked = v; });
        document.dispatchEvent(new Event('langchange'));
        if (v) track('optin', {});
      }catch(e){ cb.checked = !v; paint(); box.querySelector('.wlnote').innerHTML = failMsg(); }
    };
  });
}

/* ----- "add your dare to the deck" forms (any <form class="dareform">) -----
   Ideas land in the Events tab of the Sheet with type "dare_idea" (stage: "dare_idea_stage"),
   the dare in the "quest" column and the optional @ after a " | ". No backend change needed. */
function initDareForms(){
  document.querySelectorAll('form.dareform').forEach(form => {
    const ta = form.querySelector('textarea'), ig = form.querySelector('input'), btn = form.querySelector('button'), msg = form.querySelector('.daremsg');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const v = ta.value.trim().replace(/\s+/g,' ').slice(0,170); if (v.length < 6){ ta.focus(); return; }
      const at = (ig.value.trim().replace(/^@/,'').match(/^[\w.]{1,30}$/) || [''])[0];
      btn.disabled = true; btn.textContent = t('dareSending');
      try{
        await api('logEvent', { type: window.STAGE ? 'dare_idea_stage' : 'dare_idea', quest: v + (at ? ' | @' + at : '') });
        ta.value = ''; ig.value = ''; msg.textContent = t('dareOk'); msg.hidden = false; setTimeout(() => { msg.hidden = true; }, 6000);
      }catch(x){ msg.textContent = t('dareErr'); msg.hidden = false; }
      btn.disabled = false; btn.textContent = t('dareSend');
    });
  });
}

/* ----- the hamburger opens AND closes the menu -----
   While it is open the header steps aside (see body.menuopen in the CSS), so the top of the
   screen is just the burger and the menu's own close, with nothing of the page showing
   through behind them. */
(function(){
  const menu = document.getElementById('menu'), burger = document.getElementById('burger');
  if (!menu || !burger) return;
  const head = document.querySelector('header.top');
  function set(on){
    menu.hidden = !on;
    document.body.classList.toggle('menuopen', on);
    if (on && head) head.classList.remove('hid');   /* never open it onto a hidden header */
  }
  window.sdMenu = { open: () => set(true), close: () => set(false), toggle: () => set(menu.hidden) };
  burger.addEventListener('click', () => window.sdMenu.toggle());
  const x = document.getElementById('menuClose');
  if (x) x.addEventListener('click', () => window.sdMenu.close());
  menu.addEventListener('click', e => { if (e.target.closest('a')) window.sdMenu.close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) window.sdMenu.close(); });
})();

/* ----- the background on every page: big soft stars and a few QR pixels ----- */
(function(){
  const NS = 'http://www.w3.org/2000/svg';
  /* the same star as the one in the wordmark: a thick round join is what curves the points */
  const STAR = '44.2,8.4 61.2,29.9 87,33.5 71.8,53.3 79.6,79.1 52.7,73.3 30.3,84.8 29.9,60 9.5,43.6 34.3,33.5';

  /* x, y, size, rotation, red */
  const stars = [
    [ -40,  40, 300, -12, false],
    [ 250, 150, 210,  18, true ],
    [  20, 430, 380,   7, false],
    [ 255, 600, 240, -22, false],
    [ -60, 720, 300,  14, true ],
    [ 170, 300, 120,  -6, false]
  ];
  /* x, y, cell size, the rows of the little QR block */
  const pixels = [
    [ 300,  60, 9, ['1011','0110','1101','0011'], false],
    [  26, 250, 8, ['110','011','101'],           true ],
    [ 320, 470, 9, ['0110','1011','1100'],        false],
    [  40, 820, 8, ['101','110','011','101'],     false]
  ];

  let gfx = '<defs><polygon id="sdst" points="' + STAR + '"/></defs>';
  for (const [x, y, size, rot, red] of stars){
    gfx += '<use href="#sdst" class="st' + (red ? ' red' : '') + '" x="0" y="0" width="100" height="100" ' +
           'transform="translate(' + x + ' ' + y + ') rotate(' + rot + ' 50 50) scale(' + (size / 100) + ')"/>';
  }
  for (const [x, y, cell, rows, red] of pixels){
    let block = '';
    rows.forEach((row, r) => [...row].forEach((on, c) => {
      if (on === '1') block += '<rect x="' + (x + c * cell) + '" y="' + (y + r * cell) + '" width="' + (cell - 1.5) + '" height="' + (cell - 1.5) + '" rx="1"/>';
    }));
    gfx += '<g class="px' + (red ? ' red' : '') + '">' + block + '</g>';
  }

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'bgmap');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 390 844');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.innerHTML = gfx;
  document.body.prepend(svg);
})();

/* ----- tap a profile photo to see it big; small info pop-up ----- */
function sdModal(inner, cls){
  const m = document.createElement('div'); m.className = 'sdmodal ' + (cls || ''); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = '<div class="sdmodal-in">' + inner + '</div>';
  const close = () => { m.remove(); document.removeEventListener('keydown', esc); };
  const esc = e => { if (e.key === 'Escape') close(); };
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', esc);
  document.body.appendChild(m);
  const f = m.querySelector('button'); if (f) f.focus();
  return m;
}
function openPhoto(src, alt){
  if (!src) return;
  const m = sdModal('<img alt=""><button class="sdclose" type="button" data-close aria-label="Close">✕</button>', 'photo');
  const i = m.querySelector('img'); i.src = src; i.alt = alt || '';
}
function openInfo(text){
  const m = sdModal('<p></p><button class="btn red" type="button" data-close></button>', 'info');
  m.querySelector('p').textContent = text; m.querySelector('button').textContent = t('gotIt') || 'OK';
}
document.addEventListener('click', e => { const z = e.target.closest('img.zoomable'); if (z && !z.hidden) openPhoto(z.src, z.alt); });
