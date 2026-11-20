/* ===== STREETDARE - the page a shirt's QR code opens ===== */
const VIEWS = ['spin','show','accept','confirm','done'];
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
  document.body.style.overflow = v === 'show' ? 'hidden' : '';
  document.body.classList.toggle('showing', v === 'show');
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
      sbGet('dares?select=id,deck_id,shirt_id,text_en,text_es,text_hu,adult&active=eq.true&' + where + '&order=sort,id'),
      s ? sbGet('rpc/shirt_card?p_id=' + encodeURIComponent(s)) : Promise.resolve([])
    ]);
    const live = { classic: [], spicy: [], shirt: [] };
    rows.forEach(r => { const q = [r.text_en, r.text_es]; q.id = r.id; q.adult = !!r.adult; q.hu = r.text_hu || ''; q.deck = r.shirt_id ? 'shirt' : r.deck_id; (live[q.deck] || []).push(q); });
    if (live.classic.length){ DECKS.classic = live.classic; DECKS.spicy = live.spicy.length ? live.spicy : DECKS.spicy; DECKS.shirt = live.shirt; seen = []; }
    if (shirts[0]){ owner = Object.assign({}, owner, { name: shirts[0].name, ig: shirts[0].ig || '', photo: shirts[0].photo || '' }); applyLang(); paintPhoto(); }
  }catch(e){ /* offline or database asleep: keep the built-in decks */ }
}
/* after a completed dare: the wearer's Instagram, if they chose to show it */
const EXTRA = {
  en:{ igH:'Don’t lose each other 👀', igP:'You just did a dare with {name}. Follow them now, so you can find each other after tonight.', ig:'Follow @{ig} on Instagram',
       lock:'Want {name}’s Instagram? Ask for their 4-digit dare code. The dare counts and their Instagram unlocks, if they’ve shared it.', lockBtn:'I have the code 🔐', leave:'Back to your friends 👋', igLeave:'Follow @{ig} & back to your friends 👋', bye:'Have an amazing time 🙌 Scan again whenever you want another dare.', by:'✍️ Dare by {name}', mine:'Is this your shirt? Open your dashboard →' },
  es:{ igH:'No os perdáis 👀', igP:'Acabas de hacer un reto con {name}. Síguele ahora para encontraros después de esta noche.', ig:'Sigue a @{ig} en Instagram',
       lock:'¿Quieres el Instagram de {name}? Pídele su código de reto de 4 cifras. El reto cuenta y se desbloquea su Instagram, si lo ha compartido.', lockBtn:'Tengo el código 🔐', leave:'Volver con tus amigos 👋', igLeave:'Sigue a @{ig} y vuelve con tus amigos 👋', bye:'¡Que lo pases genial! 🙌 Escanea otra vez cuando quieras otro reto.', by:'✍️ Reto de {name}', mine:'¿Es tu camiseta? Abre tu panel →' },
  hu:{ igH:'Ne veszítsétek el egymást 👀', igP:'Most csináltál meg egy kihívást vele: {name}. Kövesd be most, hogy ma este után is megtaláljátok egymást.', ig:'Kövesd: @{ig} Instagramon',
       lock:'Kéne {name} Instagramja? Kérd el a 4 jegyű kihíváskódját. A kihívás beszámít, és feloldódik az Instagramja, ha megosztotta.', lockBtn:'Megvan a kód 🔐', leave:'Vissza a barátaidhoz 👋', igLeave:'Kövesd: @{ig}, és vissza a barátaidhoz 👋', bye:'Érezd jól magad 🙌 Szkenneld be újra, ha jöhet a következő kihívás.', by:'✍️ {name} kihívása', mine:'A te pólód? Nyisd meg a profilodat →' }
};
let verified = false;
function paintExtras(){
  const x = EXTRA[LANG] || EXTRA.en, ig = $('igReveal');
  /* the wearer's Instagram only comes back from the server after the right dare code */
  const has = verified && !!(owner && owner.ig);
  $('igCard').hidden = !has;
  $('igLocked').hidden = verified || practice() || demo;
  if (has){
    ig.href = 'https://instagram.com/' + encodeURIComponent(owner.ig); ig.textContent = x.igLeave.replace('{ig}', owner.ig);
    $('igH').textContent = x.igH;
    const pic = $('igPic'), src = owner.photo; pic.hidden = !(src && /^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(src)); if (!pic.hidden){ pic.src = src; pic.alt = who(); }
  }
  $('igLockP').textContent = x.lock.replace('{name}', who()); $('igLockBtn').textContent = x.lockBtn;
  $('leaveBtn').textContent = x.leave; $('leaveBtn').hidden = has; $('byeMsg').textContent = x.bye;
  const m = $('mineLink'); if (m){ m.textContent = x.mine; m.hidden = !(store.get('sb-jlnsqerwiwmbqpzzcskf-auth-token') && !demo && !window.STAGE); }
}
document.addEventListener('langchange', paintExtras);
function logPlay(type){
  const q = current || [];
  if (type === 'spin') track('spin'); else track(type, { quest: q[0] });
  sbLog(type, { dare_id: q.id || null, dare_text: q[0] || null, deck_id: q.deck || (QUESTS.devil.includes(q) ? 'spicy' : 'classic') });
}
const txt = q => LANG === 'hu' ? (q.hu || q[3] || q[0]) : (q[LANG === 'es' ? 1 : 0] || q[0]);
function paintDare(){
  const a = isAdult(current);
  $('adultTag').hidden = !a; $('accAdult').hidden = !a;
  $('together').hidden = !current; $('howRow').hidden = !!current;
  $('nextP').textContent = owner ? fill('nextP') : t('nextPAnon');
  paintBy();
}
/* dares the wearer wrote themselves carry their name */
function paintBy(){
  const mine = !!(current && current.deck === 'shirt'), txt = (EXTRA[LANG] || EXTRA.en).by.replace('{name}', who());
  ['byFront','byShow','byAcc'].forEach(id => { $(id).hidden = !mine; $(id).textContent = txt; });
}
function resetSpin(){ current = null; deckReset(); paintDare(); const r = $('reel'); r.className = 'reel q'; r.textContent = '? ? ?'; $('preSpin').hidden = false; $('postSpin').hidden = true; }
/* dares this shirt's wearer was already shown in the last 30 days still come up, but 5x less often */
let recent = new Set();
const RECENT_WEIGHT = 0.2;
async function loadRecent(){
  if (demo) return;
  try{ const ids = await sbGet('rpc/shirt_recent_dares?p_id=' + encodeURIComponent(SHIRT.toLowerCase())); recent = new Set(ids.map(Number)); }catch(e){}
}
function pick(){
  const d = deck(); let pool = d.filter(q => !seen.includes(q));
  if (!pool.length){ seen = seen.filter(q => !d.includes(q)); pool = d; }
  const w = pool.map(q => q.id && recent.has(Number(q.id)) ? RECENT_WEIGHT : 1);
  let r = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
  while (i < pool.length - 1 && (r -= w[i]) > 0) i++;
  const q = pool[i]; seen.push(q); return q;
}
function setReel(text, cls){ const r = $('reel'); r.className = 'reel'; void r.offsetWidth; r.textContent = text; r.className = 'reel ' + cls; }

function spin(){
  if (spinning) return; spinning = true;
  $('preSpin').hidden = false; $('postSpin').hidden = true; $('spinBtn').disabled = true;
  deckReset(); setReel('? ? ?', 'q'); $('together').hidden = true; $('howRow').hidden = false; $('adultTag').hidden = true;
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
    spinning = false; $('spinBtn').disabled = false; $('preSpin').hidden = true; $('postSpin').hidden = false; logPlay('spin'); document.dispatchEvent(new Event('sd:landed'));
  }
  machine.classList.add('shuffling');
  (function step(){
    if (k >= GAPS.length || !others.length) return land();
    if (k) flick();
    setReel(txt(others[k % others.length]), 'sample tick');
    setTimeout(step, GAPS[k++]);
  })();
}
/* ----- the dare in progress is kept on the phone, so a locked screen or reload doesn't lose it ----- */
const CUR_KEY = 'sd_current', CUR_MAX = 4 * 3600e3;
function saveCur(view){
  if (!current) return;
  try{ store.set(CUR_KEY, JSON.stringify({ s: SHIRT.toLowerCase(), view, at: Date.now(), sl: shLang, devil: $('devil').checked, v: verified, st: codeStage,
    q: { en: current[0], es: current[1], hu: current.hu || current[3] || '', id: current.id || null, adult: isAdult(current), deck: current.deck || null } })); }catch(e){}
}
function clearCur(){ try{ localStorage.removeItem(CUR_KEY); }catch(e){} }
function restoreCur(){
  let c = null; try{ c = JSON.parse(store.get(CUR_KEY) || 'null'); }catch(e){}
  if (!c || c.s !== SHIRT.toLowerCase() || Date.now() - c.at > CUR_MAX || !c.q || !c.q.en){ clearCur(); return false; }
  const q = [c.q.en, c.q.es || c.q.en]; q.hu = c.q.hu; q.id = c.q.id; q.adult = !!c.q.adult; q.deck = c.q.deck;
  current = q; shLang = c.sl || LANG; $('devil').checked = !!c.devil; verified = !!c.v; codeStage = c.st || 'accept';
  if (c.view === 'show'){ paintShow(); show('show'); }
  else { $('accText').textContent = txtIn(current, shLang); paintDare(); show(c.view); }
  return true;
}

/* ----- show mode: the card opens up big for the person in the shirt, with an English / Spanish flip ----- */
const LANG_NAME = { en:'English', es:'Español', hu:'Magyar' };
let shLang = LANG;
const txtIn = (q, l) => l === 'hu' ? (q.hu || q[3] || q[0]) : (q[l === 'es' ? 1 : 0] || q[0]);
const flipTo = () => shLang !== LANG ? LANG : (LANG === 'en' ? 'es' : 'en');
function paintShow(){
  $('shText').textContent = txtIn(current, shLang);
  $('shText').lang = shLang;
  $('shAdult').hidden = !isAdult(current); paintBy();
  $('shFlip').textContent = '🌐 ' + LANG_NAME[flipTo()];
}
$('showBtn').onclick = () => {
  if (!current) return;
  shLang = LANG; paintShow(); logPlay('show'); show('show'); saveCur('show');
  const c = $('bigCard'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
};
$('shFlip').onclick = () => {
  shLang = flipTo(); paintShow(); saveCur('show');
  const x = $('shText'); x.classList.remove('swap'); void x.offsetWidth; x.classList.add('swap');
};
$('shNo').onclick = () => { clearCur(); show('spin'); spin(); };

$('spinBtn').onclick = spin;
$('againBtn').onclick = spin;
/* the wearer's code is typed the moment you both say yes: it seals the dare, and from then on it counts */
let codeStage = 'accept';
function askCode(stage){ codeStage = stage; $('codeIn').value = ''; $('codeErr').hidden = true; show('confirm'); saveCur('confirm'); setTimeout(() => $('codeIn').focus(), 150); }
function toAccept(){ $('accText').textContent = txtIn(current, shLang); paintDare(); show('accept'); saveCur('accept'); }
$('acceptBtn').onclick = () => { track('accept', { quest: (current || [])[0] }); askCode('accept'); };
$('changeBtn').onclick = () => { clearCur(); verified = false; resetSpin(); show('spin'); };
$('doneBtn').onclick = () => verified ? finishVerified() : finishDare(false);
async function finishVerified(){
  let res = 'error';
  try{
    const q = current || [];
    const r = await fetch(SB.url + '/rest/v1/rpc/finish_dare', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
      body: JSON.stringify({ p_shirt: SHIRT.toLowerCase(), p_device: deviceId(), p_dare_id: q.id || null, p_dare_text: q[0] || null, p_deck: q.deck || 'classic', p_lang: LANG }) });
    res = r.ok ? await r.json() : 'error';
  }catch(x){}
  if (typeof res === 'string' && (res === 'ok' || res.startsWith('ok|'))) return finishDare(true, res.slice(3));
  finishDare(false);
}

/* ----- a dare only counts on the owner's profile when the scanner types the owner's 4-digit code ----- */
const practice = () => demo || !!window.STAGE;
function finishDare(counted, igHandle){ verified = !!counted; $('byeMsg').hidden = true; if (owner && counted) owner.ig = igHandle || ''; paintExtras(); clearCur(); track('done', { quest: (current || [])[0], verified: counted }); show('done'); }
$('codeIn').oninput = () => {
  $('codeIn').value = $('codeIn').value.replace(/\D/g, '').slice(0, 4); $('codeErr').hidden = true;
  if ($('codeIn').value.length === 4 && !$('codeBtn').disabled) $('codeForm').requestSubmit();
};
$('codeForm').onsubmit = async e => {
  e.preventDefault();
  const code = $('codeIn').value, err = $('codeErr'), btn = $('codeBtn');
  if (code.length !== 4){ err.textContent = t('cfShort'); err.hidden = false; return; }
  if (practice()){ if (code === '1234') return codeStage === 'late' ? finishDare(false) : toAccept(); err.textContent = fill('cfWrong'); err.hidden = false; return; }
  btn.disabled = true;
  let res = 'error';
  try{
    const q = current || [];
    const r = await fetch(SB.url + '/rest/v1/rpc/confirm_dare', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
      body: JSON.stringify({ p_shirt: SHIRT.toLowerCase(), p_code: code, p_device: deviceId(), p_dare_id: q.id || null, p_dare_text: q[0] || null, p_deck: q.deck || 'classic', p_lang: LANG }) });
    res = r.ok ? await r.json() : 'error';
  }catch(x){}
  btn.disabled = false;
  if (res === 'ok'){ verified = true; return codeStage === 'late' ? finishVerified() : toAccept(); }
  if (res === 'error') return codeStage === 'late' ? finishDare(false) : toAccept();
  err.textContent = res === 'locked' ? t('cfLocked') : fill('cfWrong'); err.hidden = false;
  $('codeIn').select();
};
$('codeSkip').onclick = () => { verified = false; codeStage === 'late' ? show('done') : toAccept(); };

/* ----- tapping the wearer's photo or name: how to get their Instagram ----- */
function igTip(){
  const src = owner && owner.photo, ok = src && /^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(src);
  const m = sdModal((ok ? '<img class="tippic" alt="">' : '') + '<p></p><button class="btn red" type="button" data-close></button>', 'info');
  if (ok){ const i = m.querySelector('img'); i.src = src; i.alt = who(); }
  m.querySelector('p').textContent = owner ? fill('nameTip') : t('nameTipAnon');
  m.querySelector('button').textContent = t('gotIt') || 'OK';
}
$('ownerPic').onclick = igTip;
$('ownerPic').onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); igTip(); } };
$('igLockBtn').onclick = () => askCode('late');
/* clean way out */
/* after leaving (or following on Instagram) "Another dare" stays, in case they come back */
function byeBye(){ $('leaveBtn').hidden = true; $('igLocked').hidden = true; $('byeMsg').hidden = false; }
$('leaveBtn').onclick = byeBye;
$('igReveal').addEventListener('click', () => setTimeout(byeBye, 400));

/* ----- the owner's photo next to their name ----- */
function paintPhoto(){
  const img = $('ownerPic'), src = owner && owner.photo;
  if (!src || !/^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(src)){ img.hidden = true; return; }
  img.src = src; img.alt = who(); img.hidden = false;
}
$('anotherBtn').onclick = () => { clearCur(); verified = false; resetSpin(); show('spin'); };
$('devil').onchange = () => { document.body.classList.toggle('hot', $('devil').checked); if (!spinning) resetSpin(); };

/* ----- words that depend on the language and on whose shirt it is ----- */
document.addEventListener('langchange', () => {
  if (owner){
    const nm = who().replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'), parts = t('found').split('{name}');
    $('foundKicker').innerHTML = parts.map(x => x.replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';')).join('<button type="button" class="namebtn" id="nameBtn">' + nm + '</button>');
    $('nameBtn').onclick = igTip;
  } else $('foundKicker').textContent = t('foundAnon');
  const safeName = who().replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  $('spinSub').innerHTML = owner ? t('spinSub').replace('{name}', safeName) : t('spinSubAnon');
  $('how2').textContent = owner ? fill('how2') : t('how2Anon');
  $('devNote').textContent = fill('devilNote');
  if ($('refLine') && typeof refText === 'function'){ $('refLine').textContent = refText(); $('refLine').hidden = !refText(); }
  $('accNote').textContent = fill('accNote');
  $('showBtn').textContent = owner ? fill('showBtn') : t('showBtnAnon');
  $('shNote').textContent = owner ? fill('shNote') : t('shNoteAnon');
  if (current && !$('v-show').hidden) paintShow();
  $('cfSub').textContent = fill('cfSub'); $('codeDemo').hidden = !practice();
  if (current && !spinning){ $('reel').textContent = txt(current); $('accText').textContent = txtIn(current, shLang); }
  paintDare();
});

initLang(T);
initWaitlist();
initDareForms();
/* ----- scanned from far away (a photo or video)? Ask once, and explain STREETDARE if they're not with the wearer ----- */
const FAR = {
  en:{ h:'Are you with {name} right now? 👀', p:'Looks like you scanned this from somewhere else. Is {name} right next to you?', yes:'Yes, they’re right here', no:'No, I saw it online',
       h2:'Want your own shirt? 👕', p2:'STREETDARE is a shirt with a QR code on the back. At a party, a stranger scans it, gets a dare and does it together with the person wearing it. It’s the easiest way to meet someone new.',
       p3:'We’re building a community of people who love meeting new people, starting in Madrid and Budapest. The shirts are coming soon: join now and you’ll be the first to know, with a launch discount.', own:'Join and get the drop alert 🎟️', about:'What is STREETDARE? →', look:'Just look around', away:'{name} isn’t next to you, so you can’t play together right now.' },
  es:{ h:'¿Estás con {name} ahora mismo? 👀', p:'Parece que lo has escaneado desde otro sitio. ¿{name} está a tu lado?', yes:'Sí, está aquí', no:'No, lo he visto en internet',
       h2:'¿Quieres tu propia camiseta? 👕', p2:'STREETDARE es una camiseta con un código QR en la espalda. En una fiesta, alguien la escanea, saca un reto y lo hace junto a quien la lleva. Es la forma más fácil de conocer a alguien nuevo.',
       p3:'Estamos creando una comunidad de gente a la que le encanta conocer gente nueva, empezando por Madrid y Budapest. Las camisetas llegan pronto: únete ahora y serás de los primeros en saberlo, con descuento de lanzamiento.', own:'Únete y recibe el aviso 🎟️', about:'¿Qué es STREETDARE? →', look:'Solo quiero mirar', away:'{name} no está a tu lado, así que ahora no podéis jugar juntos.' },
  hu:{ h:'Most {name} mellett vagy? 👀', p:'Úgy tűnik, máshonnan szkennelted be. {name} ott van melletted?', yes:'Igen, itt van', no:'Nem, a neten láttam',
       h2:'Kéne neked is egy saját póló? 👕', p2:'A STREETDARE egy póló, aminek QR-kód van a hátán. Egy buliban valaki beszkenneli, kap egy kihívást, és együtt csinálja meg azzal, aki a pólót viseli. Ez a legegyszerűbb módja, hogy megismerj valakit.',
       p3:'Közösséget építünk azokból, akik szeretnek új emberekkel megismerkedni, Madridtól Budapestig. A pólók hamarosan jönnek: csatlakozz most, és elsőként tudod meg, indulási kedvezménnyel.', own:'Feliratkozom az értesítőre 🎟️', about:'Mi az a STREETDARE? →', look:'Csak nézelődöm', away:'{name} most nincs melletted, így most nem tudtok együtt játszani.' }
};
const farKey = () => 'sd_far_' + SHIRT.toLowerCase();
function farText(k){ const x = FAR[LANG] || FAR.en; return x[k].replace(/\{name\}/g, who()); }
function farInfo(m){
  const home = '../' + (SHIRT ? '?s=' + encodeURIComponent(SHIRT) : '');
  m.querySelector('.sdmodal-in').innerHTML = '<h2 class="display"></h2><p></p><p class="far3"></p><div class="stack">' +
    '<a class="btn red" href="' + home + '#join"></a><a class="btn" href="' + home + '#about"></a><button class="btn plain" type="button" data-close></button></div><p class="faraway"></p>';
  const q = m.querySelectorAll('h2,p,a,button');  /* h2, p, p.far3, a, a, button, p.faraway */
  q[0].textContent = farText('h2'); q[1].textContent = farText('p2'); q[2].textContent = farText('p3');
  q[3].textContent = farText('own'); q[4].textContent = farText('about'); q[5].textContent = farText('look'); q[6].textContent = farText('away');
}
function farAsk(){
  const m = sdModal('<h2 class="display"></h2><p></p><div class="stack"><button class="btn red" type="button" data-a="yes"></button><button class="btn" type="button" data-a="no"></button></div>', 'info far');
  m.querySelector('h2').textContent = farText('h'); m.querySelector('p').textContent = farText('p');
  m.querySelector('[data-a=yes]').textContent = farText('yes'); m.querySelector('[data-a=no]').textContent = farText('no');
  m.querySelector('[data-a=yes]').onclick = () => { try{ sessionStorage.setItem(farKey(), 'yes'); }catch(e){} sbLog('here'); m.remove(); };
  m.querySelector('[data-a=no]').onclick = () => {
    try{ sessionStorage.setItem(farKey(), 'no'); }catch(e){}
    sbLog('remote'); window.SD_REMOTE = true; track('remote'); farInfo(m);
  };
}
async function farCheck(){
  if (demo || window.STAGE) return;
  let ans = null; try{ ans = sessionStorage.getItem(farKey()); }catch(e){}
  if (ans === 'no'){ window.SD_REMOTE = true; return; }
  if (ans === 'yes') return;
  try{
    const r = await fetch(SB.url + '/rest/v1/rpc/scan_far', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
      body: JSON.stringify({ p_id: SHIRT.toLowerCase(), p_tz: phoneTz(), p_device: deviceId() }) });
    if (r.ok && (await r.json()) === true) farAsk();
  }catch(e){}
}

if (!restoreCur()){ show('spin'); farCheck(); }
try{ if (!demo && !sessionStorage.getItem('sd_scan')){ sessionStorage.setItem('sd_scan','1'); track('scan'); sbLog('scan'); } }catch(e){}
loadLiveDecks();
loadRecent();
consentInit();
