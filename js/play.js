/* ===== STREETDARE - the page a shirt's QR code opens ===== */
const VIEWS = ['spin','show','accept','confirm','done','bye','sent','thanks'];
let owner = SHIRTS[SHIRT.toLowerCase()] || null;
const demo = !SHIRT || SHIRT === 'demo';
let current = null, spinning = false, seen = [];

const who = () => (owner && owner.name) ? owner.name : t('thePerson');
const fill = k => t(k).replace('{name}', who());
if (!demo) refSave(SHIRT.toLowerCase());

function show(v){
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  if (window.sdMenu) window.sdMenu.close(); else $('menu').hidden = true;
  document.body.classList.toggle('hot', $('devil').checked && ['spin','accept','confirm','done'].includes(v));
  document.body.style.overflow = v === 'show' ? 'hidden' : '';
  document.body.classList.toggle('showing', v === 'show');
  window.scrollTo(0,0);
}

/* ----- menu ----- */
$('mSpinLink').onclick = e => { e.preventDefault(); if (window.sdMenu) window.sdMenu.close(); };
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
      sbGet('dares?select=id,deck_id,shirt_id,text_en,text_es,text_hu,adult,extra,needs_photo,label_en,label_es,label_hu,two_fields,also_winner&active=eq.true&' + where + '&order=sort,id'),
      s ? sbGet('rpc/shirt_card?p_id=' + encodeURIComponent(s)) : Promise.resolve([])
    ]);
    const live = { classic: [], spicy: [], shirt: [] };
    rows.forEach(r => { const q = [r.text_en, r.text_es]; q.id = r.id; q.adult = !!r.adult; q.hu = r.text_hu || ''; q.deck = r.shirt_id ? 'shirt' : r.deck_id;
      /* what the dare saves for the memory: a photo, who won, a short answer */
      q.x = { extra: r.extra || 'none', photo: !!r.needs_photo, lab: { en: r.label_en || '', es: r.label_es || '', hu: r.label_hu || '' }, two: !!r.two_fields, win: !!r.also_winner };
      (live[q.deck] || []).push(q); });
    if (live.classic.length){ DECKS.classic = live.classic; DECKS.spicy = live.spicy.length ? live.spicy : DECKS.spicy; DECKS.shirt = live.shirt; seen = []; }
    if (shirts[0] && shirts[0].status === 'off'){ shirtOff(); return; }
    if (shirts[0] && shirts[0].status === 'new'){ shirtNew(); return; }
    /* A shirt can be printed and handed over before anyone has claimed it, and then it has no
       name yet. Taking that empty string as a name gave "You just scanned 's shirt" and a
       sentence with a hole in it, so a nameless shirt stays on the anonymous card until its
       owner claims it and their name arrives. */
    if (shirts[0]){
      hasIg = !!shirts[0].has_ig;
      const nm = (shirts[0].name || '').trim();
      if (nm) owner = Object.assign({}, owner, { name: nm, ig: shirts[0].ig || '', photo: shirts[0].photo || '' });
      applyLang(); paintPhoto(); paintExtras();
    }
  }catch(e){ /* offline or database asleep: keep the built-in decks */ }
}
/* a shirt switched off after reports (fair play): no dares through it */
const OFF = {
  en:{ h:'This shirt is taking a break 🌙', p:'STREETDARE shirts have a QR code on the back. It means the person wearing it is up for meeting new people.',
       s1:'Scan the shirt', s2:'Get a random dare', s3:'Do it together',
       p2:'This shirt is inactive right now. Maybe its owner is on a break, or in the middle of another challenge. Two ways to play tonight anyway:',
       t1:'Live now', c1h:'Shirtless Pass', c1p:'No shirt needed. 24 hours of dares on your phone for you and your friends: walk up to strangers, collect points and see who wins.', b:'Play with the Shirtless Pass',
       t2:'Coming soon', c2h:'Your own shirt', c2p:'Your own QR on the back, so people come up to you. New dare decks, your own dares and stats every time you wear it.', b2:'I want my own shirt', lb:'Tonight', you:'You' },
  es:{ h:'Esta camiseta se está tomando un descanso 🌙', p:'Las camisetas STREETDARE llevan un código QR en la espalda. Significa que quien la lleva tiene ganas de conocer gente nueva.',
       s1:'Escanea la camiseta', s2:'Te sale un reto', s3:'Lo hacéis juntos',
       p2:'Esta camiseta está inactiva ahora mismo. Puede que su dueño esté de descanso o en medio de otro reto. Dos formas de jugar esta noche igualmente:',
       t1:'Ya disponible', c1h:'Shirtless Pass', c1p:'Sin camiseta. 24 horas de retos en el móvil para ti y tus amigos: acercaos a desconocidos, sumad puntos y a ver quién gana.', b:'Jugar con el Shirtless Pass',
       t2:'Muy pronto', c2h:'Tu propia camiseta', c2p:'Tu propio QR en la espalda, para que la gente venga a ti. Nuevas barajas de retos, tus propios retos y estadísticas cada vez que la llevas.', b2:'Quiero mi propia camiseta', lb:'Esta noche', you:'Tú' },
  hu:{ h:'Ez a póló most pihen 🌙', p:'A STREETDARE pólók hátán QR-kód van. Ez azt jelenti, hogy aki viseli, szívesen megismer új embereket.',
       s1:'Szkenneld be a pólót', s2:'Kapsz egy kihívást', s3:'Együtt megcsináljátok',
       p2:'Ez a póló most nem aktív. Lehet, hogy a gazdája épp szünetet tart, vagy egy másik kihívás közepén jár. Két mód, hogy ma este így is játssz:',
       t1:'Már elérhető', c1h:'Shirtless Pass', c1p:'Póló nélkül. 24 óra kihívás a telefonodon neked és a barátaidnak: menjetek oda idegenekhez, gyűjtsetek pontokat, és kiderül, ki nyer.', b:'Játék a Shirtless Passszal',
       t2:'Hamarosan', c2h:'Saját póló', c2p:'Saját QR-kód a hátadon, hogy hozzád jöjjenek az emberek. Új kihíváspaklik, saját kihívások és statisztikák minden alkalommal, amikor viseled.', b2:'Saját pólót szeretnék', lb:'Ma este', you:'Te' }
};
let isOff = false;
function shirtOff(){
  isOff = true;
  const paint = () => { const x = OFF[LANG] || OFF.en;
    [['offH','h'],['offP','p'],['offS1','s1'],['offS2','s2'],['offS3','s3'],['offP2','p2'],['offTag1','t1'],['offC1h','c1h'],['offC1p','c1p'],['offBtn','b'],['offTag2','t2'],['offC2h','c2h'],['offC2p','c2p'],['offBtn2','b2'],['offLb','lb'],['offYou','you']]
      .forEach(([id, k]) => { $(id).textContent = x[k]; }); };
  document.querySelectorAll('main > section').forEach(s => { s.hidden = s.id !== 'v-off'; });
  const b = $('spinBtn'); if (b) b.disabled = true;
  paint(); document.addEventListener('langchange', paint);
  new MutationObserver(() => { document.querySelectorAll('main > section').forEach(s => { if (s.id !== 'v-off' && !s.hidden) s.hidden = true; }); $('v-off').hidden = false; })
    .observe(document.querySelector('main'), { subtree:true, attributes:true, attributeFilter:['hidden'] });
}
/* A shirt that has been printed and handed over but that nobody has claimed yet. It is not
   playable: whoever scans it would be spinning dares against an empty profile, and the owner
   would never see them. Instead the page explains STREETDARE and offers the claim code, which
   only the person holding the shirt has. */
const NEWS = {
  en:{ h:'This shirt isn\u2019t activated yet \ud83d\udd12', p:'STREETDARE shirts have a QR code on the back. You scan it, you get a dare, and you do it together with the person wearing it. It is the easiest way to start talking to someone new.',
       s1:'Scan the shirt', s2:'Get a random dare', s3:'Do it together',
       boxH:'Is this your shirt?', boxP:'It came with a claim code. Enter it and the shirt becomes yours: your name and photo, your dare code and your own dares.',
       btn:'Activate my shirt \u2192', bad:'That code doesn\u2019t look right. It looks like DARE-XXXXXX.',
       p2:'Not your shirt? Nobody has activated this one yet, so there are no dares on it. Two ways to play tonight anyway:',
       b1:'Play with the Shirtless Pass', b2:'I want my own shirt' },
  es:{ h:'Esta camiseta a\u00fan no est\u00e1 activada \ud83d\udd12', p:'Las camisetas STREETDARE llevan un c\u00f3digo QR en la espalda. Lo escaneas, te sale un reto y lo hac\u00e9is juntos con quien la lleva puesta. Es la forma m\u00e1s f\u00e1cil de empezar a hablar con alguien nuevo.',
       s1:'Escanea la camiseta', s2:'Te sale un reto', s3:'Lo hac\u00e9is juntos',
       boxH:'\u00bfEs tu camiseta?', boxP:'Ven\u00eda con un c\u00f3digo de activaci\u00f3n. Introd\u00facelo y la camiseta pasa a ser tuya: tu nombre y tu foto, tu c\u00f3digo de reto y tus propios retos.',
       btn:'Activar mi camiseta \u2192', bad:'Ese c\u00f3digo no parece correcto. Tiene la forma DARE-XXXXXX.',
       p2:'\u00bfNo es tu camiseta? Nadie ha activado esta todav\u00eda, as\u00ed que no tiene retos. Dos formas de jugar esta noche igualmente:',
       b1:'Jugar con el Shirtless Pass', b2:'Quiero mi propia camiseta' },
  hu:{ h:'Ez a p\u00f3l\u00f3 m\u00e9g nincs aktiv\u00e1lva \ud83d\udd12', p:'A STREETDARE p\u00f3l\u00f3k h\u00e1t\u00e1n QR-k\u00f3d van. Beszkenneled, kapsz egy kih\u00edv\u00e1st, \u00e9s azzal csin\u00e1lod meg, aki a p\u00f3l\u00f3t viseli. Ez a legegyszer\u0171bb m\u00f3d, hogy sz\u00f3ba \u00e1llj valakivel, akit m\u00e9g nem ismersz.',
       s1:'Szkenneld be a p\u00f3l\u00f3t', s2:'Kapsz egy kih\u00edv\u00e1st', s3:'Egy\u00fctt megcsin\u00e1lj\u00e1tok',
       boxH:'A ti\u00e9d ez a p\u00f3l\u00f3?', boxP:'Kaptál hozz\u00e1 egy aktiv\u00e1l\u00f3 k\u00f3dot. \u00cdrd be, \u00e9s a p\u00f3l\u00f3 a ti\u00e9d lesz: a neved \u00e9s a f\u00e9nyk\u00e9ped, a saj\u00e1t kih\u00edv\u00e1sk\u00f3dod \u00e9s a saj\u00e1t kih\u00edv\u00e1said.',
       btn:'Aktiv\u00e1lom a p\u00f3l\u00f3mat \u2192', bad:'Ez a k\u00f3d nem t\u0171nik j\u00f3nak. \u00cdgy n\u00e9z ki: DARE-XXXXXX.',
       p2:'Nem a ti\u00e9d? Ezt m\u00e9g senki nem aktiv\u00e1lta, \u00edgy nincsenek rajta kih\u00edv\u00e1sok. K\u00e9t m\u00f3d, hogy ma este \u00edgy is j\u00e1tssz:',
       b1:'J\u00e1t\u00e9k a Shirtless Passszal', b2:'Saj\u00e1t p\u00f3l\u00f3t szeretn\u00e9k' }
};
let isNew = false;
function shirtNew(){
  isNew = true;
  const paint = () => { const x = NEWS[LANG] || NEWS.en;
    [['newH','h'],['newP','p'],['newS1','s1'],['newS2','s2'],['newS3','s3'],['newBoxH','boxH'],['newBoxP','boxP'],['newBtn','btn'],['newP2','p2'],['newBtn1','b1'],['newBtn2','b2']]
      .forEach(([id, k]) => { const el = $(id); if (el) el.textContent = x[k]; }); };
  document.querySelectorAll('main > section').forEach(sec => { sec.hidden = sec.id !== 'v-new'; });
  const b = $('spinBtn'); if (b) b.disabled = true;
  paint(); document.addEventListener('langchange', paint);
  new MutationObserver(() => { document.querySelectorAll('main > section').forEach(sec => { if (sec.id !== 'v-new' && !sec.hidden) sec.hidden = true; }); $('v-new').hidden = false; })
    .observe(document.querySelector('main'), { subtree:true, attributes:true, attributeFilter:['hidden'] });

  /* The code is checked by claim_shirt, which needs a logged-in account, so the form only
     checks the shape here and hands the code to /me, which claims it after login. */
  const form = $('newForm'), input = $('newCode'), err = $('newErr');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const code = (input.value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!/^DARE-[A-Z0-9]{6}$/.test(code)){
      err.textContent = (NEWS[LANG] || NEWS.en).bad; err.hidden = false; input.focus(); return;
    }
    err.hidden = true;
    location.href = '/me/?claim=' + encodeURIComponent(code);
  });
}
/* preview without a real unclaimed shirt: /p/?s=demo&preview=new */
if (new URLSearchParams(location.search).get('preview') === 'new') setTimeout(shirtNew, 0);
/* preview of the switched-off screen without switching off a real shirt: /p/?s=demo&preview=off */
if (new URLSearchParams(location.search).get('preview') === 'off') setTimeout(shirtOff, 0);
/* after a completed dare: the wearer's Instagram, if they chose to show it */
const EXTRA = {
  en:{ igH:'Don’t lose each other 👀', igP:'You just did a dare with {name}. Follow them now, so you can find each other after tonight.', ig:'Follow @{ig} on Instagram',
       lock:'Want {name}’s Instagram? Ask for their 4-digit dare code.', lockBtn:'I have the code 🔐', leave:'Back to your friends 👋', igLeave:'Follow @{ig} & back to your friends 👋', bye:'Have an amazing time 🙌 Scan again whenever you want another dare.', rateL:'How was this dare?', rateThx:'Thanks! 🙌', star:'{n} out of 5 stars', by:'✍️ Dare by {name}', mine:'Is this your shirt? Open your dashboard →' },
  es:{ igH:'No os perdáis 👀', igP:'Acabas de hacer un reto con {name}. Síguele ahora para encontraros después de esta noche.', ig:'Sigue a @{ig} en Instagram',
       lock:'¿Quieres el Instagram de {name}? Pídele su código de reto de 4 cifras.', lockBtn:'Tengo el código 🔐', leave:'Volver con tus amigos 👋', igLeave:'Sigue a @{ig} y vuelve con tus amigos 👋', bye:'¡Que lo pases genial! 🙌 Escanea otra vez cuando quieras otro reto.', rateL:'¿Qué tal este reto?', rateThx:'¡Gracias! 🙌', star:'{n} de 5 estrellas', by:'✍️ Reto de {name}', mine:'¿Es tu camiseta? Abre tu panel →' },
  hu:{ igH:'Ne veszítsétek el egymást 👀', igP:'Most csináltál meg egy kihívást vele: {name}. Kövesd be most, hogy ma este után is megtaláljátok egymást.', ig:'Kövesd: @{ig} Instagramon',
       lock:'Kéne {name} Instagramja? Kérd el a 4 jegyű kihíváskódját.', lockBtn:'Megvan a kód 🔐', leave:'Vissza a barátaidhoz 👋', igLeave:'Kövesd: @{ig}, és vissza a barátaidhoz 👋', bye:'Érezd jól magad 🙌 Szkenneld be újra, ha jöhet a következő kihívás.', rateL:'Milyen volt ez a kihívás?', rateThx:'Köszönjük! 🙌', star:'{n} csillag az 5-ből', by:'✍️ {name} kihívása', mine:'A te pólód? Nyisd meg a profilodat →' }
};
let verified = false;
/* shirt_card tells us whether the wearer chose to share an Instagram, without giving it away:
   no point asking the scanner for a code to unlock something that isn't there. */
let hasIg = false;
/* the dashboard link is for the person this shirt belongs to, not for anyone who happens to be logged in */
let isMine = false;
async function checkMine(){
  if (demo || window.STAGE || !SHIRT) return;
  try{
    const ses = await sbSession(); if (!ses) return;
    const r = await fetch(SB.url + '/rest/v1/shirts?select=id&id=eq.' + encodeURIComponent(SHIRT.toLowerCase()) + '&owner_id=eq.' + ses.user.id,
      { headers:{ apikey: SB.key, Authorization: 'Bearer ' + ses.access_token } });
    isMine = r.ok && (await r.json()).length > 0;
  }catch(e){ /* logged out or offline: the link just stays hidden */ }
  paintExtras();
}
function paintExtras(){
  const x = EXTRA[LANG] || EXTRA.en, ig = $('igReveal');
  /* the wearer's Instagram only comes back from the server after the right dare code */
  const has = verified && !!(owner && owner.ig);
  $('igCard').hidden = !has;
  $('igLocked').hidden = verified || practice() || demo || !hasIg;
  if (has){
    ig.href = 'https://instagram.com/' + encodeURIComponent(owner.ig); ig.textContent = x.ig.replace('{ig}', owner.ig);
    $('igH').textContent = x.igH;
    const pic = $('igPic'), src = owner.photo; pic.hidden = !(src && /^https:\/\/[a-z0-9.-]+\.supabase\.co\//.test(src)); if (!pic.hidden){ pic.src = src; pic.alt = who(); }
  }
  $('igLockP').textContent = x.lock.replace('{name}', who()); $('igLockBtn').textContent = x.lockBtn;
  $('leaveBtn').textContent = x.leave; $('leaveBtn').hidden = false; $('byeMsg').textContent = x.bye;
  paintStars();
  const m = $('mineLink'); if (m){ m.textContent = x.mine; m.hidden = !isMine; }
}
document.addEventListener('langchange', paintExtras);
function logPlay(type){
  const q = current || [];
  if (type === 'spin') track('spin'); else track(type, { quest: q[0] });
  sbLog(type, { dare_id: q.id || null, dare_text: q[0] || null, deck_id: q.deck || (QUESTS.devil.includes(q) ? 'spicy' : 'classic') });
}
const txt = q => LANG === 'hu' ? (q.hu || q[3] || q[0]) : (q[LANG === 'es' ? 1 : 0] || q[0]);
/* A wearer writing their own dare can leave a language empty. Nobody reading in that language
   should be handed it: they would get a dare in a language they may not read, which is worse
   than one dare fewer in the deck. */
const hasLang = (q, l) => {
  const v = l === 'hu' ? (q.hu || q[3]) : q[l === 'es' ? 1 : 0];
  return !!(v && String(v).trim());
};
const deckFor = () => { const d = deck().filter(q => hasLang(q, LANG)); return d.length ? d : deck(); };
function paintDare(){
  const a = isAdult(current);
  $('adultTag').hidden = !a; $('accAdult').hidden = !a;
  $('together').hidden = !current; $('howRow').hidden = !!current;
  $('nextP').textContent = (owner && owner.name) ? fill('nextP') : t('nextPAnon');
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
  const d = deckFor(); let pool = d.filter(q => !seen.includes(q));
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
  const others = deckFor().filter(q => q !== final).sort(() => Math.random() - .5);
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
    q: { en: current[0], es: current[1], hu: current.hu || current[3] || '', id: current.id || null, adult: isAdult(current), deck: current.deck || null, x: current.x || null } })); }catch(e){}
}
function clearCur(){ try{ localStorage.removeItem(CUR_KEY); }catch(e){} }
function restoreCur(){
  let c = null; try{ c = JSON.parse(store.get(CUR_KEY) || 'null'); }catch(e){}
  if (!c || c.s !== SHIRT.toLowerCase() || Date.now() - c.at > CUR_MAX || !c.q || !c.q.en){ clearCur(); return false; }
  const q = [c.q.en, c.q.es || c.q.en]; q.hu = c.q.hu; q.id = c.q.id; q.adult = !!c.q.adult; q.deck = c.q.deck; q.x = c.q.x || null;
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
function toAccept(){ $('accText').textContent = txtIn(current, shLang); paintDare(); show('accept'); saveCur('accept'); if (window.sdMem) sdMem.paintExtras(); }
$('acceptBtn').onclick = () => { track('accept', { quest: (current || [])[0] }); askCode('accept'); };
$('changeBtn').onclick = () => { clearCur(); verified = false; resetSpin(); show('spin'); };
$('doneBtn').onclick = () => verified ? finishVerified() : finishDare(false);
async function finishVerified(){
  let res = 'error';
  const btn = $('doneBtn'); btn.disabled = true;
  try{
    const q = current || [];
    /* the dare's photo / winner / answer go with it, so they land on the wearer's timeline */
    const ex = window.sdMem ? await sdMem.collectExtras() : {};
    const r = await fetch(SB.url + '/rest/v1/rpc/finish_dare_ex', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
      body: JSON.stringify({ p_shirt: SHIRT.toLowerCase(), p_device: deviceId(), p_dare_id: q.id || null, p_dare_text: q[0] || null, p_deck: q.deck || 'classic', p_lang: LANG,
        p_winner: ex.winner || null, p_a1: ex.a1 || null, p_a2: ex.a2 || null, p_photo: ex.photo || null }) });
    res = r.ok ? await r.json() : 'error';
  }catch(x){}
  btn.disabled = false;
  if (typeof res === 'string' && (res === 'ok' || res.startsWith('ok|'))) return finishDare(true, res.slice(3));
  finishDare(false);
}

/* ----- a dare only counts on the owner's profile when the scanner types the owner's 4-digit code ----- */
const practice = () => demo || !!window.STAGE;
/* ----- rate the dare: 1–5 empty stars, tap one; tapping another star changes it ----- */
let rated = 0, ratedDare = null;
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
function paintStars(){
  const x = EXTRA[LANG] || EXTRA.en;
  $('rateL').textContent = rated ? x.rateThx : x.rateL;
  $('stars').innerHTML = [1,2,3,4,5].map(n => '<button type="button" role="radio" aria-checked="' + (n === rated) + '" aria-label="' + x.star.replace('{n}', n) + '" data-n="' + n + '" class="' + (n <= rated ? 'on' : '') + '">' + STAR + '</button>').join('');
}
$('stars').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  rated = +b.dataset.n; paintStars();
  const q = ratedDare || [];
  track('rate', { quest: q[0], rating: rated });
  if (practice()) return;
  fetch(SB.url + '/rest/v1/rpc/rate_dare', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
    body: JSON.stringify({ p_shirt: SHIRT.toLowerCase(), p_device: deviceId(), p_dare_id: q.id || null, p_dare_text: q[0] || null, p_rating: rated, p_verified: verified, p_lang: LANG }) }).catch(() => {});
};
function finishDare(counted, igHandle){ rated = 0; ratedDare = current; verified = !!counted; $('byeMsg').hidden = true; if (owner && counted) owner.ig = igHandle || ''; paintExtras(); if (window.sdMem) sdMem.afterDone(counted); clearCur(); track('done', { quest: (current || [])[0], verified: counted }); show('done'); }
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
  m.querySelector('p').textContent = (owner && owner.name) ? fill('nameTip') : t('nameTipAnon');
  m.querySelector('button').textContent = t('gotIt') || 'OK';
}
$('ownerPic').onclick = igTip;
$('ownerPic').onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); igTip(); } };
$('igLockBtn').onclick = () => askCode('late');
/* clean way out */
/* after leaving (or following on Instagram) "Another dare" stays, in case they come back */
function byeBye(){ $('leaveBtn').hidden = true; $('igLocked').hidden = true; $('byeMsg').hidden = false; }
/* after a code-confirmed dare, leaving means saying goodbye properly (js/memories.js) */
$('leaveBtn').onclick = () => (window.sdMem && sdMem.canSayBye()) ? sdMem.toGoodbye() : byeBye();
$('igReveal').addEventListener('click', () => sbLog('ig_click'));

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
  if (owner && owner.name){
    const nm = who().replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'), parts = t('found').split('{name}');
    $('foundKicker').innerHTML = parts.map(x => x.replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';')).join('<button type="button" class="namebtn" id="nameBtn">' + nm + '</button>');
    $('nameBtn').onclick = igTip;
  } else $('foundKicker').textContent = t('foundAnon');
  const safeName = who().replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
  $('spinSub').innerHTML = (owner && owner.name) ? t('spinSub').replace('{name}', safeName) : t('spinSubAnon');
  $('how2').textContent = (owner && owner.name) ? fill('how2') : t('how2Anon');
  $('devNote').textContent = fill('devilNote');
  if ($('refLine') && typeof refText === 'function'){ $('refLine').textContent = refText(); $('refLine').hidden = !refText(); }
  $('accNote').textContent = fill('accNote');
  $('showBtn').textContent = (owner && owner.name) ? fill('showBtn') : t('showBtnAnon');
  $('shNote').textContent = (owner && owner.name) ? fill('shNote') : t('shNoteAnon');
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
       p3:'We’re building a community of people who love meeting new people, starting in Madrid and Budapest. The shirts are coming soon: join now and you’ll be the first to know, with the Founders’ price.', own:'Join and get the drop alert 🎟️', about:'What is STREETDARE? →', look:'Just look around', away:'{name} isn’t next to you, so you can’t play together right now.' },
  es:{ h:'¿Estás con {name} ahora mismo? 👀', p:'Parece que lo has escaneado desde otro sitio. ¿{name} está a tu lado?', yes:'Sí, está aquí', no:'No, lo he visto en internet',
       h2:'¿Quieres tu propia camiseta? 👕', p2:'STREETDARE es una camiseta con un código QR en la espalda. En una fiesta, alguien la escanea, saca un reto y lo hace junto a quien la lleva. Es la forma más fácil de conocer a alguien nuevo.',
       p3:'Estamos creando una comunidad de gente a la que le encanta conocer gente nueva, empezando por Madrid y Budapest. Las camisetas llegan pronto: únete ahora y serás de los primeros en saberlo, con el precio de fundador.', own:'Únete y recibe el aviso 🎟️', about:'¿Qué es STREETDARE? →', look:'Solo quiero mirar', away:'{name} no está a tu lado, así que ahora no podéis jugar juntos.' },
  hu:{ h:'Most {name} mellett vagy? 👀', p:'Úgy tűnik, máshonnan szkennelted be. {name} ott van melletted?', yes:'Igen, itt van', no:'Nem, a neten láttam',
       h2:'Kéne neked is egy saját póló? 👕', p2:'A STREETDARE egy póló, aminek QR-kód van a hátán. Egy buliban valaki beszkenneli, kap egy kihívást, és együtt csinálja meg azzal, aki a pólót viseli. Ez a legegyszerűbb módja, hogy megismerj valakit.',
       p3:'Közösséget építünk azokból, akik szeretnek új emberekkel megismerkedni, Madridtól Budapestig. A pólók hamarosan jönnek: csatlakozz most, és elsőként tudod meg, alapítói áron.', own:'Feliratkozom az értesítőre 🎟️', about:'Mi az a STREETDARE? →', look:'Csak nézelődöm', away:'{name} most nincs melletted, így most nem tudtok együtt játszani.' }
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

if (!restoreCur()) show('spin');
try{ if (!demo && !sessionStorage.getItem('sd_scan')){ sessionStorage.setItem('sd_scan','1'); track('scan'); sbLog('scan'); } }catch(e){}
loadLiveDecks();
checkMine();
loadRecent();
consentInit();
