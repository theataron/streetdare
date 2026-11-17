/* ===== STREETDARE - settings & helpers =====
   API_URL: paste the Google Apps Script web-app link (ending in /exec) between the quotes.
   While it is empty the site runs in DEMO MODE: email sign-ups are NOT collected,
   and wall messages only live on the visitor's own phone. See backend/SETUP.md. */
const SD = { API_URL: 'https://script.google.com/macros/s/AKfycbzJsL0f9hHVi1GYV_vMrzFgDBMkWBeLgugA8oV-zaMIh1sDrTbZ3LN595ZrwVy5eLAt/exec' };

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
const LANG_CHOSEN = !!store.get('sd_lang');
let LANG = store.get('sd_lang') || ((navigator.language||'en').toLowerCase().startsWith('es') ? 'es' : 'en');
function setLang(code){ LANG = code; store.set('sd_lang', code); applyLang(); }
let DICT = { en:{} };
const t = k => (DICT[LANG] && DICT[LANG][k]) ?? (DICT.en[k] ?? k);
/* ----- account links: "Log in" in the header, "Log in" + "Create account" in the menu ----- */
const ACCT = {
  en:{ login:'Log in', me:'Profile', signup:'Create account', loginS:'Your profile, your shirts, your stats', signupS:'Got a shirt? Claim it here', meS:'Your photo, your shirts and your stats' },
  es:{ login:'Entrar', me:'Perfil', signup:'Crear cuenta', loginS:'Tu perfil, tus camisetas, tus estadísticas', signupS:'¿Tienes camiseta? Reclámala aquí', meS:'Tu foto, tus camisetas y tus estadísticas' }
};
const loggedIn = () => !!store.get('sb-jlnsqerwiwmbqpzzcskf-auth-token');
function paintAccount(){
  const a = ACCT[LANG] || ACCT.en, right = document.querySelector('.top .right'), menu = $('menu');
  if (window.STAGE) return;
  if (right && !$('acctBtn')){ const l = document.createElement('a'); l.id = 'acctBtn'; l.className = 'acct'; right.prepend(l); }
  if (menu && !$('mLogin')){
    const foot = menu.querySelector('.foot');
    const mk = id => { const el = document.createElement('a'); el.id = id; el.innerHTML = '<span></span><small></small>'; menu.insertBefore(el, foot); return el; };
    mk('mLogin'); mk('mSignup');
  }
  const btn = $('acctBtn');
  if (btn){
    btn.href = loggedIn() ? '/me/' : '/login/'; btn.textContent = loggedIn() ? a.me : a.login;
    const pic = store.get('sd_avatar');
    if (loggedIn() && pic && /^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(pic)){ const i = document.createElement('img'); i.src = pic; i.alt = ''; btn.prepend(i); btn.classList.add('withpic'); }
  }
  const ml = $('mLogin'), ms = $('mSignup');
  if (ml){ ml.href = loggedIn() ? '/me/' : '/login/'; ml.querySelector('span').textContent = loggedIn() ? a.me : a.login; ml.querySelector('small').textContent = loggedIn() ? a.meS : a.loginS; }
  if (ms){ ms.hidden = loggedIn(); ms.href = '/login/?mode=signup'; ms.querySelector('span').textContent = a.signup; ms.querySelector('small').textContent = a.signupS; }
}
function applyLang(){
  paintAccount();
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const b = $('lang'); if (b) b.innerHTML = LANGS.map(l => '<span' + (l.code === LANG ? ' class="on"' : '') + '>' + l.code.toUpperCase() + '</span>').join('<i>|</i>');
  document.dispatchEvent(new Event('langchange'));
}
function initLang(dict){
  DICT = dict;
  $('lang').addEventListener('click', () => { const i = LANGS.findIndex(l => l.code === LANG); setLang(LANGS[(i+1) % LANGS.length].code); });
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
function track(type, extra){ if (SD.API_URL && !window.STAGE) api('logEvent', Object.assign({ type }, extra||{})).catch(()=>{}); }

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
function sbLog(event, extra){
  const s = SHIRT.toLowerCase();
  if (window.STAGE || !s || s === 'demo') return;
  fetch(SB.url + '/rest/v1/play_events', {
    method:'POST', keepalive:true,
    headers:{ apikey: SB.key, 'Content-Type':'application/json', Prefer:'return=minimal' },
    body: JSON.stringify(Object.assign({ event, shirt_id: s, device_id: deviceId(), lang: LANG }, extra||{}))
  }).catch(()=>{});
}

/* ----- email sign-up forms (any <form class="wl">) ----- */
const WL_TEXT = {
  en:{ ph:'Your email', send:'Join the Community 🎟️', sending:'Sending…', ok:'You’re in 🎉 Welcome to the STREETDARE community - we’ll send you an email as soon as the shirts are ready.', bad:'That email doesn’t look right.', err:'Couldn’t connect. Try again.', demo:'Demo mode - sign-ups are not being saved yet.' },
  es:{ ph:'Tu email', send:'Únete a la comunidad 🎟️', sending:'Enviando…', ok:'Ya estás dentro 🎉 Te damos la bienvenida a la comunidad STREETDARE - te escribiremos en cuanto las camisetas estén listas.', bad:'Ese email no parece correcto.', err:'No se pudo conectar. Inténtalo otra vez.', demo:'Modo demo - todavía no se guardan los registros.' }
};
function initWaitlist(){
  document.querySelectorAll('form.wl').forEach(form => {
    const input = form.querySelector('input'), btn = form.querySelector('button');
    const err = form.querySelector('.wlerr'), demo = form.parentElement.querySelector('.demo');
    const label = () => form.dataset.send ? t(form.dataset.send) : WL_TEXT[LANG].send;
    const paint = () => { const w = WL_TEXT[LANG]; input.placeholder = w.ph; if (!btn.disabled) btn.textContent = label(); if (demo){ demo.textContent = w.demo; demo.hidden = !!SD.API_URL; } };
    document.addEventListener('langchange', paint); paint();
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const w = WL_TEXT[LANG], v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ err.textContent = w.bad; err.hidden = false; return; }
      err.hidden = true; btn.disabled = true; btn.textContent = w.sending;
      try{
        await api('joinWaitlist', { email:v, source:(window.STAGE ? 'stage-' : '') + (form.dataset.source||'') });
        store.set('sd_joined','1');
        document.querySelectorAll('form.wl').forEach(f => { const p = document.createElement('p'); p.className = 'wlmsg'; p.textContent = w.ok; f.replaceWith(p); });
      }catch(x){ err.textContent = w.err; err.hidden = false; btn.disabled = false; btn.textContent = label(); }
    });
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

/* ----- faint side-quest routes in the background of every page ----- */
(function(){
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'bgmap'); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 390 844'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.innerHTML =
    '<path d="M-20 90C60 40 110 150 190 110S310 30 410 80"/>' +
    '<path class="r" d="M410 300C330 340 310 250 240 290S110 380 40 330-20 350-20 350"/>' +
    '<path d="M-20 560C50 500 120 620 200 570S320 480 410 540"/>' +
    '<path class="r" d="M60 870C90 800 170 830 200 760S290 720 330 780 400 820 410 800"/>' +
    '<path class="x" d="M182 102l12 12m0-12-12 12M316 772l12 12m0-12-12 12"/>';
  document.body.prepend(svg);
})();
