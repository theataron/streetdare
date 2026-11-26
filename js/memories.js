/* ===== STREETDARE - memories on the scan page =====
   After a code-confirmed yes, a dare can save something for the memory: a photo, who won, a short
   answer. Those have to be filled in before "We did it". Then "Say goodbye" lets the scanner leave
   a photo together, a message for tomorrow and their contacts, and save the encounter for themselves.
   Loaded after js/play.js and uses its globals (current, verified, owner, who, show, practice …). */
(function(){
const MEM = {
  en:{ photoL:'Take the photo for this dare', photoBtn:'Open camera', retake:'Take another', winL:'Who won?', you:'You',
       hintPhoto:'Take the photo to finish.', hintWin:'Tap who won to finish.', hintAns:'Fill this in to finish.',
       ansYou:'You', sayBye:'Say goodbye to {name}',
       byeH:'Say goodbye to {name}', byeP:'{name} gets these tomorrow morning. The more you tick, the better the memory.',
       of:'{n} of 3', perfect:'The perfect goodbye.', nameL:'Your first name, so {name} knows it was you',
       tPhoto:'Take a photo together', camBtn:'Open camera', doneTag:'Already done ✓', tMsg:'Leave {name} a message for tomorrow',
       msgPh:'You were the best part of my night…', tContact:'Swap contacts', contactP:'Add yours and you’ll see {name}’s.',
       contactHint:'One is enough, both is even better.', send:'Send to {name}', skip:'Skip', launch:'Aron and the STREETDARE team can see this during the launch phase.',
       errContact:'That Instagram or number doesn’t look right.', errHurt:'Let’s keep it kind 🙏', errNet:'Couldn’t send it. Try again.',
       sentH:'{name} will see this tomorrow morning', skipH:'That was a good one', sentP:'', skipP:'Your dare with {name} counts for their shirt.',
       swapK:'You swapped contacts', wantIg:'Want {name}’s Instagram?', swapB:'Follow @{ig}',
       saveH:'Save this encounter for you too', savePphoto:'Keep the photo and your night with {name}.', saveP:'Keep the dare you did together, and when and with whom.',
       saveBtn:'Save it', saveNote:'With Google or your email. Takes 20 seconds, no password.', notNow:'Not now, back to my friends',
       youAnd:'You and {name}', dares:'{n} dares together',
       thxH:'Thank you for making the first step', thxP:'Have an amazing night. Scan a STREETDARE shirt again whenever you want another dare.',
       passK:'Still out tonight?', passH:'Play with your friends', passP:'With a Shirtless Pass your group gets its own dares for 24 hours: you go up to strangers, collect points and see who wins the night.', passBtn:'Get a Shirtless Pass',
       shirtH:'Want your own shirt?', shirtP:'Then strangers come to you, like you just did with {name}.', shirtBtn:'Tell me more', thxSave:'Changed your mind? Save this encounter' },
  es:{ photoL:'Haz la foto de este reto', photoBtn:'Abrir la cámara', retake:'Hacer otra', winL:'¿Quién ha ganado?', you:'Tú',
       hintPhoto:'Haz la foto para terminar.', hintWin:'Toca quién ha ganado para terminar.', hintAns:'Rellena esto para terminar.',
       ansYou:'Tú', sayBye:'Despídete de {name}',
       byeH:'Despídete de {name}', byeP:'{name} lo recibe mañana por la mañana. Cuanto más marques, mejor será el recuerdo.',
       of:'{n} de 3', perfect:'La despedida perfecta.', nameL:'Tu nombre, para que {name} sepa que eras tú',
       tPhoto:'Haceos una foto juntos', camBtn:'Abrir la cámara', doneTag:'Ya hecha ✓', tMsg:'Déjale a {name} un mensaje para mañana',
       msgPh:'Has sido lo mejor de mi noche…', tContact:'Intercambiad contactos', contactP:'Añade el tuyo y verás el de {name}.',
       contactHint:'Con uno basta, con los dos mejor.', send:'Enviar a {name}', skip:'Saltar', launch:'Aron y el equipo de STREETDARE pueden ver esto durante la fase de lanzamiento.',
       errContact:'Ese Instagram o número no parece correcto.', errHurt:'Mejor algo bonito 🙏', errNet:'No se pudo enviar. Inténtalo otra vez.',
       sentH:'{name} lo verá mañana por la mañana', skipH:'Ha estado genial', sentP:'', skipP:'Vuestro reto cuenta para la camiseta de {name}.',
       swapK:'Habéis intercambiado contactos', wantIg:'¿Quieres el Instagram de {name}?', swapB:'Sigue a @{ig}',
       saveH:'Guarda este encuentro tú también', savePphoto:'Quédate con la foto y con tu noche con {name}.', saveP:'Quédate con el reto que hicisteis, cuándo y con quién.',
       saveBtn:'Guardarlo', saveNote:'Con Google o tu email. 20 segundos, sin contraseña.', notNow:'Ahora no, vuelvo con mis amigos',
       youAnd:'Tú y {name}', dares:'{n} retos juntos',
       thxH:'Gracias por dar el primer paso', thxP:'Que pases una noche increíble. Escanea otra camiseta STREETDARE cuando quieras otro reto.',
       passK:'¿Sigues de fiesta?', passH:'Juega con tus amigos', passP:'Con un Shirtless Pass tu grupo tiene sus propios retos durante 24 horas: os acercáis a desconocidos, sumáis puntos y veis quién gana la noche.', passBtn:'Quiero un Shirtless Pass',
       shirtH:'¿Quieres tu propia camiseta?', shirtP:'Así es la gente quien viene a ti, como acabas de hacer tú con {name}.', shirtBtn:'Cuéntame más', thxSave:'¿Has cambiado de idea? Guarda este encuentro' },
  hu:{ photoL:'Készítsd el a kihíváshoz a fotót', photoBtn:'Kamera megnyitása', retake:'Új fotó', winL:'Ki nyert?', you:'Te',
       hintPhoto:'A befejezéshez készítsd el a fotót.', hintWin:'A befejezéshez koppints arra, aki nyert.', hintAns:'A befejezéshez töltsd ki.',
       ansYou:'Te', sayBye:'Köszönj el tőle: {name}',
       byeH:'Köszönj el tőle: {name}', byeP:'{name} holnap reggel kapja meg. Minél többet pipálsz be, annál jobb lesz az emlék.',
       of:'{n} / 3', perfect:'A tökéletes búcsú.', nameL:'A keresztneved, hogy {name} tudja, hogy te voltál',
       tPhoto:'Készítsetek egy közös fotót', camBtn:'Kamera megnyitása', doneTag:'Már megvan ✓', tMsg:'Hagyj üzenetet holnapra neki: {name}',
       msgPh:'Te voltál az estém legjobb része…', tContact:'Cseréljetek elérhetőséget', contactP:'Add meg a tiédet, és látni fogod az övét.',
       contactHint:'Egy is elég, kettő még jobb.', send:'Küldés neki: {name}', skip:'Kihagyom', launch:'Áron és a STREETDARE csapata az indulási időszakban ezt is láthatja.',
       errContact:'Ez az Instagram vagy szám nem tűnik jónak.', errHurt:'Legyen inkább kedves 🙏', errNet:'Nem sikerült elküldeni. Próbáld újra.',
       sentH:'{name} holnap reggel látni fogja', skipH:'Ez jó volt', sentP:'', skipP:'A közös kihívásotok beszámít {name} pólójába.',
       swapK:'Elérhetőséget cseréltetek', wantIg:'Kéne {name} Instagramja?', swapB:'Kövesd: @{ig}',
       saveH:'Mentsd el ezt a találkozást te is', savePphoto:'Tartsd meg a fotót és az estédet vele: {name}.', saveP:'Tartsd meg a közös kihívást, hogy mikor és kivel volt.',
       saveBtn:'Elmentem', saveNote:'Google-lel vagy e-maillel. 20 másodperc, jelszó nélkül.', notNow:'Most nem, vissza a barátaimhoz',
       youAnd:'Te és {name}', dares:'{n} közös kihívás',
       thxH:'Köszönjük, hogy megtetted az első lépést', thxP:'Érezd jól magad ma este. Szkennelj be újra egy STREETDARE pólót, ha jöhet a következő kihívás.',
       passK:'Még bulizol?', passH:'Játssz a barátaiddal', passP:'Egy Shirtless Passszal a csapatod 24 órára saját kihívásokat kap: odamentek idegenekhez, pontokat gyűjtötök, és kiderül, ki nyeri az estét.', passBtn:'Kérek egy Shirtless Passt',
       shirtH:'Kéne saját póló?', shirtP:'Akkor hozzád jönnek oda az emberek, ahogy most te mentél oda hozzá: {name}.', shirtBtn:'Mesélj többet', thxSave:'Meggondoltad magad? Mentsd el ezt a találkozást' }
};
const m = k => ((MEM[LANG] || MEM.en)[k] || MEM.en[k] || '').replace(/\{name\}/g, who());
const sh = () => SHIRT.toLowerCase();

/* ----- what this phone has done with this shirt tonight (kept for 8 hours) ----- */
const ENC_MAX = 8 * 3600e3;
const encKey = () => 'sd_enc_' + sh();
function enc(){
  let e = null; try{ e = JSON.parse(store.get(encKey()) || 'null'); }catch(x){}
  if (!e || Date.now() - e.at > ENC_MAX) e = { at: Date.now(), dares: [], photo: null, thumb: null, sent: null };
  return e;
}
function encSave(e){ try{ store.set(encKey(), JSON.stringify(e)); }catch(x){ try{ e.thumb = null; store.set(encKey(), JSON.stringify(e)); }catch(y){} } }

/* ----- photos: shrunk on the phone before upload (low resolution is all we keep) ----- */
function shrink(file, max, q){
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? resolve({ blob: b, thumb: (() => { const t = document.createElement('canvas'), k = Math.min(1, 320 / Math.max(c.width, c.height));
        t.width = Math.round(c.width * k); t.height = Math.round(c.height * k); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); return t.toDataURL('image/jpeg', .7); })() })
        : reject(new Error('blob')), 'image/jpeg', q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
    img.src = url;
  });
}
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
async function upload(blob){
  if (practice()) return null;
  const path = sh() + '/' + deviceId() + '/' + uid() + '.jpg';
  try{
    const r = await fetch(SB.url + '/storage/v1/object/moments/' + path, { method:'POST',
      headers:{ apikey: SB.key, Authorization: 'Bearer ' + SB.key, 'Content-Type':'image/jpeg', 'x-upsert':'false' }, body: blob });
    return r.ok ? path : null;
  }catch(e){ return null; }
}

/* ===== 1. the dare's extra, before "We did it" ===== */
let ex = { blob: null, thumb: null, winner: null };
const xOf = () => (current && current.x) || { extra:'none', photo:false, lab:{}, two:false, win:false };
const wants = () => {
  const x = xOf(), on = verified || practice();
  return { photo: on && x.photo, win: on && (x.extra === 'winner' || x.win), ans: on && x.extra === 'answer' };
};
function paintExtras(){
  const w = wants(), x = xOf(), box = $('extras');
  box.hidden = !(w.photo || w.win || w.ans);
  $('xPhotoBox').hidden = !w.photo; $('xWinBox').hidden = !w.win; $('xAnsBox').hidden = !w.ans;
  $('xPhotoL').textContent = m('photoL'); $('xPhotoBtnT').textContent = m('photoBtn'); $('xRetake').textContent = m('retake');
  $('xThumbWrap').hidden = !ex.thumb; $('xPhotoBtn').hidden = !!ex.thumb; if (ex.thumb) $('xThumb').src = ex.thumb;
  $('xWinL').textContent = m('winL'); $('xWinMe').textContent = m('you'); $('xWinThem').textContent = who();
  $('xWinMe').setAttribute('aria-checked', ex.winner === 'scanner'); $('xWinThem').setAttribute('aria-checked', ex.winner === 'owner');
  $('xWinMe').classList.toggle('red', ex.winner === 'scanner'); $('xWinThem').classList.toggle('red', ex.winner === 'owner');
  const lab = x.lab || {};
  $('xAnsL').textContent = lab[LANG] || lab.en || '';
  $('xA2').hidden = !x.two;
  $('xA1').placeholder = x.two ? m('ansYou') : ''; $('xA2').placeholder = who();
  check();
}
function check(){
  const w = wants(), x = xOf();
  let hint = '';
  if (w.ans && (!$('xA1').value.trim() || (x.two && !$('xA2').value.trim()))) hint = m('hintAns');
  if (w.win && !ex.winner) hint = m('hintWin');
  if (w.photo && !ex.blob) hint = m('hintPhoto');
  $('xHint').textContent = hint; $('xHint').hidden = !hint;
  $('doneBtn').disabled = !!hint;
  return !hint;
}
function resetExtras(){ ex = { blob: null, thumb: null, winner: null }; $('xA1').value = ''; $('xA2').value = ''; $('xPhotoIn').value = ''; }
$('xPhotoIn').onchange = async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  try{ const r = await shrink(f, 1080, .78); ex.blob = r.blob; ex.thumb = r.thumb; }catch(x){}
  paintExtras();
};
$('xRetake').onclick = () => $('xPhotoIn').click();
$('xWinMe').onclick = () => { ex.winner = 'scanner'; paintExtras(); };
$('xWinThem').onclick = () => { ex.winner = 'owner'; paintExtras(); };
$('xA1').oninput = check; $('xA2').oninput = check;
async function collectExtras(){
  const w = wants(), x = xOf(), out = {};
  if (w.win) out.winner = ex.winner;
  if (w.ans){ out.a1 = $('xA1').value.trim(); if (x.two) out.a2 = $('xA2').value.trim(); }
  if (w.photo && ex.blob){
    out.photo = await upload(ex.blob);
    const e = enc(); if (out.photo || practice()){ e.photo = out.photo || 'practice'; e.thumb = ex.thumb; } encSave(e);
  }
  return out;
}

/* ===== 2. after "We did it" ===== */
function afterDone(counted){
  if (counted || practice()){
    const e = enc(); e.dares.push({ t: (current || [])[0] || '', at: Date.now() }); e.sent = null; encSave(e);
    $('leaveBtn').textContent = m('sayBye');
  }
  resetExtras();
}
const canSayBye = () => practice() || enc().dares.length > 0;

/* ===== 3. say goodbye ===== */
let bye = { blob: null, thumb: null };
/* The three ticks are not buttons: they show what has been done. A photo taken, a message
   typed or a contact filled in ticks its box by itself; nobody ticks or unticks them by hand. */
const hasPhoto = () => { const e = enc(); return !!(bye.blob || e.thumb || e.photo); };
const hasMsg = () => !!$('byeMsgIn').value.trim();
const hasContact = () => !!($('byeIg').value.trim() || $('byeWa').value.trim());
function ticks(){ $('tPhoto').checked = hasPhoto(); $('tMsg').checked = hasMsg(); $('tContact').checked = hasContact(); }
['tPhoto','tMsg','tContact'].forEach(id => { const c = $(id); c.disabled = true; c.tabIndex = -1; c.addEventListener('click', ev => ev.preventDefault()); });
function toGoodbye(){
  bye = { blob: null, thumb: null };
  $('byeErr').hidden = true;
  paintBye(); show('bye'); track('goodbye_open');
}
function paintBye(){
  const e = enc(), had = !!(e.photo || e.thumb);
  ticks();
  $('byeH').textContent = m('byeH'); $('byeP').textContent = m('byeP');
  $('byeNameL').textContent = m('nameL');
  /* photo together: always open, with its own camera button */
  $('tPhotoL').textContent = m('tPhoto');
  const th = bye.thumb || e.thumb;
  $('byeThumbWrap').hidden = !th; if (th) $('byeThumb').src = th;
  $('byeDoneTag').hidden = !(had && !bye.thumb); $('byeDoneTag').textContent = m('doneTag');
  $('byeCamBtn').hidden = had && !bye.thumb;
  $('byeCamT').textContent = bye.thumb ? m('retake') : m('camBtn');
  $('photoBody').hidden = false;
  $('tMsgL').textContent = m('tMsg'); $('byeMsgIn').placeholder = m('msgPh'); $('msgBody').hidden = false;
  $('byeMsgCount').textContent = $('byeMsgIn').value.length + ' / 140';
  $('tContactL').textContent = m('tContact'); $('contactP').textContent = m('contactP'); $('contactHint').textContent = m('contactHint');
  $('contactBody').hidden = false;
  const n = filled();
  $('byeCount').textContent = m('of').replace('{n}', n); $('byeFill').style.width = Math.round(n / 3 * 100) + '%';
  $('byePerfect').hidden = n < 3; $('byePerfect').textContent = m('perfect');
  $('byeSend').textContent = m('send'); $('byeSkip').textContent = m('skip');
  $('byeLaunch').textContent = m('launch');
}
const filled = () => (hasPhoto() ? 1 : 0) + (hasMsg() ? 1 : 0) + (hasContact() ? 1 : 0);
['byeMsgIn','byeIg','byeWa'].forEach(id => $(id).oninput = paintBye);
$('byePhotoIn').onchange = async ev => {
  const f = ev.target.files && ev.target.files[0]; if (!f) return;
  try{ const r = await shrink(f, 1080, .78); bye.blob = r.blob; bye.thumb = r.thumb; }catch(x){}
  ev.target.value = '';
  paintBye();
};
async function sendBye(kind){
  const err = $('byeErr'); err.hidden = true;
  const name = $('byeName').value.trim(), msg = $('byeMsgIn').value.trim();
  const ig = $('byeIg').value.trim().replace(/^@/, ''), wa = $('byeWa').value.trim();
  if (kind === 'sent'){
    if ((ig && !/^[\w.]{1,30}$/.test(ig)) || (wa && (wa.replace(/\D/g, '').length < 6))){ err.textContent = m('errContact'); err.hidden = false; return; }
    const hurt = window.sdHurtful || (() => false);
    if (hurt(msg) || hurt(name)){ err.textContent = m('errHurt'); err.hidden = false; return; }
  }
  const btn = $(kind === 'sent' ? 'byeSend' : 'byeSkip'); btn.disabled = true;
  const e = enc();
  let photo = null;
  if (kind === 'sent' && bye.blob){ photo = await upload(bye.blob); if (photo || practice()){ e.photo = photo || 'practice'; e.thumb = bye.thumb; } }
  let ok = practice();
  if (!practice()){
    try{
      const r = await fetch(SB.url + '/rest/v1/rpc/encounter_goodbye', { method:'POST', headers:{ apikey: SB.key, 'Content-Type':'application/json' },
        body: JSON.stringify({ p_shirt: sh(), p_device: deviceId(), p_kind: kind, p_name: kind === 'sent' ? name : null, p_message: msg || null, p_ig: ig || null, p_wa: wa || null, p_photo: photo }) });
      ok = r.ok;
    }catch(x){}
  }
  btn.disabled = false;
  if (!ok && kind === 'sent'){ err.textContent = m('errNet'); err.hidden = false; return; }
  e.sent = kind; e.swapped = !!(ig || wa); encSave(e);
  track('goodbye_' + kind, { ticked: filled() });
  paintSent(); show('sent');
}
$('byeSend').onclick = () => sendBye(filled() ? 'sent' : 'skip');
$('byeSkip').onclick = () => sendBye('skip');

/* ===== 4. save this encounter / not now ===== */
const savedUrl = '/nights/?saved=1';
const saveHref = () => loggedIn() ? savedUrl : '/login/?next=' + encodeURIComponent(savedUrl);
function paintSent(){
  const e = enc(), sent = e.sent === 'sent';
  $('sentH').textContent = m(sent ? 'sentH' : 'skipH'); $('sentP').textContent = sent ? m('sentP') : m('skipP'); $('sentP').hidden = !$('sentP').textContent;
  const ig = owner && owner.ig;
  $('swapCard').hidden = !ig;
  if (ig && e.swapped){ $('swapCard').href = 'https://instagram.com/' + encodeURIComponent(ig); $('swapCard').target = '_blank'; $('swapK').textContent = m('swapK'); $('swapB').textContent = m('swapB').replace('{ig}', ig);
    $('swapCard').onclick = () => sbLog('ig_click'); }
  else if (ig){ $('swapCard').removeAttribute('target'); $('swapCard').href = '#'; $('swapK').textContent = m('wantIg'); $('swapB').textContent = m('contactP');
    $('swapCard').onclick = ev => { ev.preventDefault(); toGoodbye(); setTimeout(() => $('byeIg').focus(), 80); }; }
  const pv = $('savePreview'); pv.textContent = '';
  if (e.thumb){ const i = document.createElement('img'); i.src = e.thumb; i.alt = ''; pv.appendChild(i); }
  const t = document.createElement('div'); t.className = 'savetext';
  const k = document.createElement('small'); k.textContent = m('youAnd') + (e.dares.length > 1 ? ' · ' + m('dares').replace('{n}', e.dares.length) : '');
  const b = document.createElement('b'); b.textContent = (e.dares[e.dares.length - 1] || {}).t || txt(current || ['']);
  t.appendChild(k); t.appendChild(b); pv.appendChild(t);
  $('saveH').textContent = m('saveH'); $('saveP').textContent = e.thumb ? m('savePphoto') : m('saveP');
  $('saveBtn').textContent = m('saveBtn'); $('saveBtn').href = saveHref(); $('saveNote').textContent = loggedIn() ? '' : m('saveNote');
  $('notNowBtn').textContent = m('notNow');
}
$('saveBtn').addEventListener('click', () => track('save_encounter'));
$('notNowBtn').onclick = () => { track('save_not_now'); paintThanks(); show('thanks'); };
function paintThanks(){
  $('thxH').textContent = m('thxH'); $('thxP').textContent = m('thxP');
  $('upPassK').textContent = m('passK'); $('upPassH').textContent = m('passH'); $('upPassP').textContent = m('passP'); $('upPassBtn').textContent = m('passBtn');
  $('upShirtH').textContent = m('shirtH'); $('upShirtP').textContent = m('shirtP'); $('upShirtBtn').textContent = m('shirtBtn');
  $('thxSave').textContent = m('thxSave'); $('thxSave').href = saveHref();
}
$('upPassBtn').addEventListener('click', () => track('upsell_pass'));
$('upShirtBtn').addEventListener('click', () => track('upsell_shirt'));

document.addEventListener('langchange', () => {
  if (!$('v-accept').hidden) paintExtras();
  if (!$('v-bye').hidden) paintBye();
  if (!$('v-sent').hidden) paintSent();
  if (!$('v-thanks').hidden) paintThanks();
  const e = enc(); if (e.dares.length && !$('v-done').hidden) $('leaveBtn').textContent = m('sayBye');
});

window.sdMem = { paintExtras, collectExtras, afterDone, canSayBye, toGoodbye };
/* a dare restored after a reload may already be on the accept screen */
if (!$('v-accept').hidden) paintExtras();
})();
