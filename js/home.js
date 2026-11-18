/* ===== STREETDARE - home page (home, wall, about, club) ===== */
const VIEWS = ['home','wall','about','club'];
function show(v){
  if (!VIEWS.includes(v)) v = 'home';
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  $('menu').hidden = true;
  if (v === 'wall') loadWall();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', () => {
  const v = location.hash.slice(1);
  /* a hash that is a spot on the home page (#join, #shop…) scrolls to it */
  if (!VIEWS.includes(v) && v && $(v)){ show('home'); requestAnimationFrame(() => $(v).scrollIntoView({ behavior:'smooth' })); return; }
  show(v);
});
$('burger').onclick = () => { $('menu').hidden = false; };
$('menuClose').onclick = () => { $('menu').hidden = true; };
document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => { $('menu').hidden = true; }));
/* arrived from a shirt's page: the "spin" link goes back to that shirt */
if (SHIRT) $('tryLink').href = 'p/?s=' + SHIRT;

function chips(){
  const pickText = q => LANG === 'hu' ? (q[3] || q[0]) : LANG === 'es' ? q[1] : q[0];
  $('chips').innerHTML = QUESTS.classic.slice(0,8).map(q => '<span class="chip">'+pickText(q)+'</span>').join('');
}

/* ----- wall ----- */
function ago(ts){
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return t('now'); if (m < 60) return m + t('min');
  const h = Math.floor(m/60); if (h < 24) return h + t('hr'); return Math.floor(h/24) + t('day');
}
let wallData = null;
function paintWall(){
  const box = $('msgs'); box.textContent = '';
  if (!wallData) return;
  if (!wallData.length){ const p = document.createElement('p'); p.className = 'empty'; p.textContent = t('wallEmpty'); box.appendChild(p); return; }
  wallData.forEach(m => { const d = document.createElement('div'); d.className = 'msg'; d.textContent = m.text;
    const s = document.createElement('small');
    if (m.ig){ const a = document.createElement('a'); a.href = 'https://instagram.com/' + encodeURIComponent(m.ig); a.target = '_blank'; a.rel = 'noopener'; a.textContent = '@' + m.ig; s.appendChild(a); s.appendChild(document.createTextNode(' · ')); }
    s.appendChild(document.createTextNode(ago(m.created) + ' · '));
    const r = document.createElement('button'); r.className = 'rep'; r.textContent = t('wallReport');
    r.onclick = async () => { r.disabled = true; try{ await api('reportMessage', { created: m.created, text: m.text }); }catch(e){}
      d.textContent = t('wallReported'); d.classList.add('gone'); };
    s.appendChild(r); d.appendChild(s); box.appendChild(d); });
}
async function loadWall(){ $('wallDemo').hidden = !!SD.API_URL; try{ wallData = await api('getWall'); }catch(e){ wallData = wallData || []; } paintWall(); }
$('wallForm').addEventListener('submit', async e => {
  e.preventDefault();
  const ta = $('wallText'), b = $('wallSend'), v = ta.value.trim(); if (!v) return;
  b.disabled = true; b.textContent = t('wallSending');
  const ig = ($('wallIg').value.trim().replace(/^@/,'').match(/^[\w.]{1,30}$/) || [''])[0];
  $('wallIg').value = ig ? '@' + ig : '';
  try{ await api('postMessage', { text: v, ig }); ta.value = ''; await loadWall(); }
  catch(x){ const p = document.createElement('p'); p.className = 'wlerr'; p.style.color = 'var(--redt)'; p.textContent = t('wallErr'); $('wallForm').appendChild(p); setTimeout(() => p.remove(), 4000); }
  b.disabled = false; b.textContent = t('wallSend');
});

document.addEventListener('langchange', () => { chips(); paintWall(); });
initLang(T);
initWaitlist();
initDareForms();
{ const h = location.hash.slice(1);
  if (h && !VIEWS.includes(h) && $(h)){ show('home'); setTimeout(() => $(h).scrollIntoView(), 50); } else show(h); }
consentInit();
/* founder photo: always the current profile photo of Aron's account */
fetch(SB.url + '/rest/v1/rpc/shirt_card?p_id=aron', { headers:{ apikey: SB.key } })
  .then(r => r.ok ? r.json() : []).then(d => { const u = d[0] && d[0].photo; if (u && /^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(u)){ const i = $('founderPic'); if (i){ i.src = u; i.hidden = false; } } }).catch(() => {});
