/* ===== STREETDARE - the page a shirt's QR code opens ===== */
const VIEWS = ['spin','accept','confirm','done'];
let owner = SHIRTS[SHIRT.toLowerCase()] || null;
const demo = !SHIRT || SHIRT === 'demo';
let current = null, spinning = false, seen = [];

const who = () => owner ? owner.name : t('thePerson');
const fill = k => t(k).replace('{name}', who());
if (!demo) refSave(SHIRT.toLowerCase());

function show(v){
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  $('menu').hidden = true;
  document.body.classList.toggle('hot', $('devil').checked && ['spin','accept','confirm','done'].includes(v));
  window.scrollTo(0,0);
}

/* ----- menu ----- */
$('burger').onclick = () => { $('menu').hidden = false; };
$('menuClose').onclick = () => { $('menu').hidden = true; };
$('mSpinLink').onclick = e => { e.preventDefault(); $('menu').hidden = true; };
document.querySelectorAll('[data-to]').forEach(a => { a.href = '../' + (SHIRT ? '?s=' + SHIRT : '') + '#' + a.dataset.to; });
$('homeLogo').href = '../' + (SHIRT ? '?s=' + SHIRT : '');

/* ----- the dare deck: cards flick off the top until yours lands ----- */
const deckEl = $('deck'), front = $('front'), machine = $('machine'), burst = $('burst');
const still = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function deckReset(){ machine.classList.remove('won','shuffling'); front.classList.remove('flip'); burst.textContent = ''; }
function flick(){
  const g = document.createElement('div'); g.className = 'card ghost'; g.textContent = $('reel').textContent;
  g.style.setProperty('--dir', Math.random() < .5 ? -1 : 1);
  deckEl.appendChild(g); g.addEventListener('animationend', () => g.remove());
}
function confetti(){
  burst.textContent = '';
  const cols = ['var(--red)','#ffc531','var(--ink)','#2a5bd7','var(--blush)'];
  for (let i = 0; i < 18; i++){
    const c = document.createElement('i'), a = (i / 18) * Math.PI * 2, d = 90 + Math.random() * 70;
    c.style.cssText = '--x:' + Math.cos(a) * d + 'px;--y:' + (Math.sin(a) * d - 30) + 'px;--r:' + (Math.random() * 540 - 270) + 'deg;background:' + cols[i % cols.length] + ';animation-delay:' + Math.random() * .08 + 's';
    burst.appendChild(c);
  }
}

/* decks: start with the built-in copy (js/quests.js), swap in the live ones from the database when they arrive */
const DECKS = { classic: QUESTS.classic, spicy: QUESTS.devil, shirt: (owner && owner.quests) || [] };
/* Devil mode adds the bolder dares on top of the Party deck */
const deck = () => DECKS.classic.concat(DECKS.shirt, $('devil').checked ? DECKS.spicy : []);
const isAdult = q => !!(q && (q.adult || q[2]));
async function loadLiveDecks(){
  const s = demo ? '' : SHIRT.toLowerCase();
  const where = s ? 'or=(deck_id.in.(classic,spicy),shirt_id.eq.' + encodeURIComponent(s) + ')' : 'deck_id=in.(classic,spicy)';
  try{
    const [rows, shirts] = await Promise.all([
      sbGet('dares?select=id,deck_id,shirt_id,text_en,text_es,adult&active=eq.true&' + where + '&order=sort,id'),
      s ? sbGet('rpc/shirt_card?p_id=' + encodeURIComponent(s)) : Promise.resolve([])
    ]);
    const live = { classic: [], spicy: [], shirt: [] };
    rows.forEach(r => { const q = [r.text_en, r.text_es]; q.id = r.id; q.adult = !!r.adult; q.deck = r.shirt_id ? 'shirt' : r.deck_id; (live[q.deck] || []).push(q); });
    if (live.classic.length){ DECKS.classic = live.classic; DECKS.spicy = live.spicy.length ? live.spicy : DECKS.spicy; DECKS.shirt = live.shirt; seen = []; }
    if (shirts[0]){ owner = Object.assign({}, owner, { name: shirts[0].name, ig: shirts[0].ig || '', photo: shirts[0].photo || '' }); applyLang(); paintPhoto(); }
  }catch(e){ /* offline or database asleep: keep the built-in decks */ }
}
/* after a completed dare: the wearer's Instagram, if they chose to show it */
const EXTRA = { en:{ ig:'Follow {name} on Instagram', mine:'Is this your shirt? Open your dashboard →' }, es:{ ig:'Sigue a {name} en Instagram', mine:'¿Es tu camiseta? Abre tu panel →' } };
function paintExtras(){
  const x = EXTRA[LANG] || EXTRA.en, ig = $('igReveal');
  if (ig){ ig.hidden = !(owner && owner.ig); if (owner && owner.ig){ ig.href = 'https://instagram.com/' + encodeURIComponent(owner.ig); ig.textContent = x.ig.replace('{name}', who()) + ' · @' + owner.ig; } }
  const m = $('mineLink'); if (m){ m.textContent = x.mine; m.hidden = !(store.get('sb-jlnsqerwiwmbqpzzcskf-auth-token') && !demo && !window.STAGE); }
}
document.addEventListener('langchange', paintExtras);
function logPlay(type){
  const q = current || [];
  if (type === 'spin') track('spin'); else track(type, { quest: q[0] });
  sbLog(type, { dare_id: q.id || null, dare_text: q[0] || null, deck_id: q.deck || (QUESTS.devil.includes(q) ? 'spicy' : 'classic') });
}
const txt = q => q[LANG === 'es' ? 1 : 0];
function paintDare(){
  const a = isAdult(current);
  $('adultTag').hidden = !a; $('accAdult').hidden = !a;
  $('together').hidden = !current; $('together').textContent = owner ? fill('together') : t('togetherAnon');
}
function resetSpin(){ current = null; deckReset(); paintDare(); const r = $('reel'); r.className = 'reel q'; r.textContent = '? ? ?'; $('preSpin').hidden = false; $('postSpin').hidden = true; }
function pick(){
  const d = deck(); let pool = d.filter(q => !seen.includes(q));
  if (!pool.length){ seen = seen.filter(q => !d.includes(q)); pool = d; }
  const q = pool[Math.floor(Math.random()*pool.length)]; seen.push(q); return q;
}
function setReel(text, cls){ const r = $('reel'); r.className = 'reel'; void r.offsetWidth; r.textContent = text; r.className = 'reel ' + cls; }

function spin(){
  if (spinning) return; spinning = true;
  $('preSpin').hidden = false; $('postSpin').hidden = true; $('spinBtn').disabled = true;
  deckReset(); setReel('? ? ?', 'q'); $('together').hidden = true; $('adultTag').hidden = true;
  const final = pick();
  /* other dares flick past first, so people see how deep the deck is */
  const others = deck().filter(q => q !== final).sort(() => Math.random() - .5);
  const GAPS = still() ? [] : [70,75,80,90,100,115,135,160,195,240,300,380];
  let k = 0;
  function land(){
    machine.classList.remove('shuffling');
    if (GAPS.length) flick();
    current = final; setReel(txt(final), 'land'); paintDare();
    front.classList.remove('flip'); void front.offsetWidth; front.classList.add('flip');
    machine.classList.add('won'); if (!still()) confetti();
    if (navigator.vibrate) navigator.vibrate([30,40,60]);
    spinning = false; $('spinBtn').disabled = false; $('preSpin').hidden = true; $('postSpin').hidden = false; logPlay('spin');
  }
  machine.classList.add('shuffling');
  (function step(){
    if (k >= GAPS.length || !others.length) return land();
    if (k) flick();
    setReel(txt(others[k % others.length]), 'sample tick');
    setTimeout(step, GAPS[k++]);
  })();
}
$('spinBtn').onclick = spin;
$('againBtn').onclick = spin;
$('acceptBtn').onclick = () => { $('accText').textContent = txt(current); paintDare(); logPlay('accept'); show('accept'); };
$('changeBtn').onclick = () => { resetSpin(); show('spin'); };
$('doneBtn').onclick = () => { $('codeIn').value = ''; $('codeErr').hidden = true; show('confirm'); setTimeout(() => $('codeIn').focus(), 150); };

/* ----- a dare only counts on the owner's profile when the scanner types the owner's 4-digit code ----- */
const practice = () => demo || !!window.STAGE;
function finishDare(counted){ track('done', { quest: (current || [])[0], verified: counted }); show('done'); }
$('codeIn').oninput = () => { $('codeIn').value = $('codeIn').value.replace(/\D/g, '').slice(0, 4); $('codeErr').hidden = true; };
$('codeForm').onsubmit = async e => {
  e.preventDefault();
  const code = $('codeIn').value, err = $('codeErr'), btn = $('codeBtn');
  if (code.length !== 4){ err.textContent = t('cfShort'); err.hidden = false; return; }
  if (practice()){ if (code === '1234') return finishDare(false); err.textContent = fill('cfWrong'); err.hidden = false; return; }
  btn.disabled = true;
  let res = 'error';
  try{
    const q = current || [];
    const r = await fetch(SB.url + '/rest/v1/rpc/confirm_dare', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
      body: JSON.stringify({ p_shirt: SHIRT.toLowerCase(), p_code: code, p_device: deviceId(), p_dare_id: q.id || null, p_dare_text: q[0] || null, p_deck: q.deck || 'classic', p_lang: LANG }) });
    res = r.ok ? await r.json() : 'error';
  }catch(x){}
  btn.disabled = false;
  if (res === 'ok') return finishDare(true);
  if (res === 'error') return finishDare(false);
  err.textContent = res === 'locked' ? t('cfLocked') : fill('cfWrong'); err.hidden = false;
  $('codeIn').select();
};
$('codeSkip').onclick = () => finishDare(false);

/* ----- the owner's photo next to their name ----- */
function paintPhoto(){
  const img = $('ownerPic'), src = owner && owner.photo;
  if (!src || !/^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(src)){ img.hidden = true; return; }
  img.src = src; img.alt = who(); img.hidden = false;
}
$('anotherBtn').onclick = () => { resetSpin(); show('spin'); };
$('devil').onchange = () => { document.body.classList.toggle('hot', $('devil').checked); if (!spinning) resetSpin(); };

/* ----- words that depend on the language and on whose shirt it is ----- */
document.addEventListener('langchange', () => {
  $('foundKicker').textContent = owner ? fill('found') : t('foundAnon');
  const safeName = who().replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  $('spinSub').innerHTML = owner ? t('spinSub').replace('{name}', safeName) : t('spinSubAnon');
  $('how2').textContent = owner ? fill('how2') : t('how2Anon');
  $('devNote').textContent = fill('devilNote');
  if ($('refLine') && typeof refText === 'function'){ $('refLine').textContent = refText(); $('refLine').hidden = !refText(); }
  $('accNote').textContent = fill('accNote');
  $('cfSub').textContent = fill('cfSub'); $('codeDemo').hidden = !practice();
  if (current && !spinning){ $('reel').textContent = txt(current); $('accText').textContent = txt(current); }
  paintDare();
});

initLang(T);
initWaitlist();
initDareForms();
show('spin');
try{ if (!demo && !sessionStorage.getItem('sd_scan')){ sessionStorage.setItem('sd_scan','1'); track('scan'); sbLog('scan'); } }catch(e){}
loadLiveDecks();
