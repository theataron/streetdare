/* ===== STREETDARE - the page a shirt's QR code opens ===== */
const VIEWS = ['spin','accept','done'];
const owner = SHIRTS[SHIRT.toLowerCase()] || null;
const demo = !SHIRT || SHIRT === 'demo';
let current = null, spinning = false, seen = [];

const who = () => owner ? owner.name : t('thePerson');
const fill = k => t(k).replace('{name}', who());

function show(v){
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  $('menu').hidden = true;
  document.body.classList.toggle('hot', $('devil').checked && ['spin','accept','done'].includes(v));
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

const deck = () => $('devil').checked ? QUESTS.devil : QUESTS.classic.concat((owner && owner.quests) || []);
const txt = q => q[LANG === 'es' ? 1 : 0];
function resetSpin(){ current = null; deckReset(); const r = $('reel'); r.className = 'reel q'; r.textContent = '? ? ?'; $('preSpin').hidden = false; $('postSpin').hidden = true; }
function pick(){
  const d = deck(); let pool = d.filter(q => !seen.includes(q));
  if (!pool.length){ seen = seen.filter(q => !d.includes(q)); pool = d; }
  const q = pool[Math.floor(Math.random()*pool.length)]; seen.push(q); return q;
}
function setReel(text, cls){ const r = $('reel'); r.className = 'reel'; void r.offsetWidth; r.textContent = text; r.className = 'reel ' + cls; }

function spin(){
  if (spinning) return; spinning = true;
  $('preSpin').hidden = false; $('postSpin').hidden = true; $('spinBtn').disabled = true;
  deckReset(); setReel('? ? ?', 'q');
  const final = pick();
  /* other dares flick past first, so people see how deep the deck is */
  const others = deck().filter(q => q !== final).sort(() => Math.random() - .5);
  const GAPS = still() ? [] : [70,75,80,90,100,115,135,160,195,240,300,380];
  let k = 0;
  function land(){
    machine.classList.remove('shuffling');
    if (GAPS.length) flick();
    current = final; setReel(txt(final), 'land');
    front.classList.remove('flip'); void front.offsetWidth; front.classList.add('flip');
    machine.classList.add('won'); if (!still()) confetti();
    if (navigator.vibrate) navigator.vibrate([30,40,60]);
    spinning = false; $('spinBtn').disabled = false; $('preSpin').hidden = true; $('postSpin').hidden = false; track('spin');
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
$('acceptBtn').onclick = () => { $('accText').textContent = txt(current); track('accept', { quest: current[0] }); show('accept'); };
$('changeBtn').onclick = () => { resetSpin(); show('spin'); };
$('doneBtn').onclick = () => { track('done', { quest: current[0] }); show('done'); };
$('anotherBtn').onclick = () => { resetSpin(); show('spin'); };
$('devil').onchange = () => { document.body.classList.toggle('hot', $('devil').checked); if (!spinning) resetSpin(); };

/* ----- words that depend on the language and on whose shirt it is ----- */
document.addEventListener('langchange', () => {
  $('foundKicker').textContent = owner ? fill('found') : t('foundAnon');
  $('spinSub').textContent = fill('spinSub');
  $('how2').textContent = fill('how2');
  $('accNote').textContent = fill('accNote');
  if (current && !spinning){ $('reel').textContent = txt(current); $('accText').textContent = txt(current); }
});

initLang(T);
initWaitlist();
initDareForms();
show('spin');
try{ if (!demo && !sessionStorage.getItem('sd_scan')){ sessionStorage.setItem('sd_scan','1'); track('scan'); } }catch(e){}
