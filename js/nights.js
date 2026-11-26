/* ===== STREETDARE - your nights =====
   Shirt owners: their home (live view during a night, last night, stats, the nights list) and
   a timeline per night. Scanners who saved an encounter: their own memories. Everyone: their
   Shirtless Pass nights. Data comes from owner_home(), my_encounters() and my_nights(). */
import { sb, getSession, lang, setLang, esc } from './sb.js?v=6';
const $ = id => document.getElementById(id);
let L = lang();

const T = {
  en:{ loginH:'Your nights', loginP:'Log in to see your STREETDARE nights: the dares you did, the photos and the messages people left you.', loginBtn:'Log in',
       hey:'Hey {n}', live:'LIVE NOW', since:'Your shirt has been out since {t} · {deck}', party:'Party deck', yourCode:'Your dare code',
       codeP:'Tell it to the person you just said yes to.', people:'new people met', dares:'dares done', scans:'scans tonight', igSoFar:'{n} clicks on your Instagram so far', igSoFar1:'1 click on your Instagram so far',
       justNow:'Just now · {t}', sealed:'{n} messages waiting for you', sealed1:'1 message waiting for you', sealedP:'They open tomorrow morning. No peeking.',
       soFar:'Tonight so far', started:'{t} · Your night started with the first scan', openTonight:'Open tonight’s timeline →', fullTomorrow:'Your full night lands here tomorrow',
       fullTomorrowP:'With every photo, answer and message, ready to share.',
       lastNight:'Your last night', openNight:'Open the night →', share:'Share this night', igClicks:'clicks on your Instagram', messages:'messages', msgFor:'{n} messages for you',
       statsH:'Your STREETDARE so far', statsP:'Since your first scan', peopleMet:'people met', peopleMetP:'who did a dare with you and typed your code',
       daresShirt:'dares done with your shirt', scansAll:'scans', msgsAll:'messages received', bestNight:'Best night', bestP:'{d} · {n} dares, your most so far',
       shirtless:'Shirtless dares, counted apart',
       goingH:'Going out tonight?', goingP:'Check if your shirt is ready before you leave.', deck:'Active deck', photo:'Profile photo', photoOk:'Set ✓', photoAdd:'Add it →',
       nightsH:'Your nights', nightsEmpty:'No nights yet. Wear your shirt out and your first night shows up here.', passTag:'Shirtless night', openFeed:'Open the Group Feed →',
       pm:'{p} people met · {d} dares', launch:'During the launch phase, Aron and the STREETDARE team can see your timeline too.',
       back:'← Home', rename:'Rename', renameQ:'Name this night', done:'Done together ✓', ownDare:'Your own dare', partyTag:'Party deck', streetTag:'Street deck', devilTag:'Devil mode',
       photoDare:'photo dare', private:'What happened here stays between you two.', someone:'Someone', youWon:'You won', theyWon:'{n} won',
       msgTomorrow:'Message for tomorrow', sealedOne:'A message is waiting for you. It opens tomorrow morning.', noMsg:'{n} said goodbye without leaving a message.',
       addNote:'Add a note', addPhoto:'Add a photo', notePh:'What do you want to remember?', save:'Save', noteSaved:'Saved', photoUp:'Uploading…',
       hide:'Remove this moment', hideQ:'Remove this encounter from your timeline? You can’t undo this.',
       plainDare:'A dare done together', earlier:'Before memories existed, so only the dare is saved.',
       tooGood:'Too good to keep to yourself', tooGoodP:'We turn this night into a Story image for your Instagram.',
       tagTip:'Tag @street.dare so we can repost you.', shareFail:'Saved the image. Post it as a Story from your photos.',
       welcome:'Welcome, {n}', firstMem:'Your first STREETDARE memory', youAnd:'You and {n}', youTold:'You told {n}: “{m}”', seeNights:'See it in your nights ↓',
       theDare:'The dare you did together', follow:'Follow @{ig}',
       passK:'Still out tonight?', passH:'Play with your friends', passP:'With a Shirtless Pass your group gets its own dares for 24 hours: you go up to strangers, collect points and see who wins the night. Everything lands in your nights, like this one.', passBtn:'Get a Shirtless Pass',
       shirtH:'Want your own shirt?', shirtP:'Then strangers come to you, and every night leaves you memories like this one.', shirtBtn:'Tell me more', backFriends:'Back to my friends',
       memH:'Your memories', memEmpty:'Nothing here yet. Scan a STREETDARE shirt, do a dare and save the encounter.', peopleThrough:'people met through STREETDARE',
       nightOut:'{w} night out', afternoon:'{w} afternoon', day:'{w}', err:'Something went wrong. Try again.', adminH:'Timelines (admin)', adminP:'Every encounter on every shirt, newest first. Only visible to admins.' },
  es:{ loginH:'Tus noches', loginP:'Entra para ver tus noches STREETDARE: los retos que hiciste, las fotos y los mensajes que te dejaron.', loginBtn:'Entrar',
       hey:'Hola, {n}', live:'EN DIRECTO', since:'Tu camiseta está fuera desde las {t} · {deck}', party:'Baraja Party', yourCode:'Tu código de reto',
       codeP:'Díselo a quien le acabas de decir que sí.', people:'personas nuevas', dares:'retos hechos', scans:'escaneos esta noche', igSoFar:'{n} clics en tu Instagram por ahora',
       justNow:'Ahora mismo · {t}', sealed:'{n} mensajes te esperan', sealed1:'1 mensaje te espera', sealedP:'Se abren mañana por la mañana. Nada de espiar.',
       soFar:'Esta noche hasta ahora', started:'{t} · Tu noche empezó con el primer escaneo', openTonight:'Abrir la línea de esta noche →', fullTomorrow:'Mañana tendrás aquí tu noche entera',
       fullTomorrowP:'Con cada foto, respuesta y mensaje, lista para compartir.',
       lastNight:'Tu última noche', openNight:'Abrir la noche →', share:'Compartir esta noche', igClicks:'clics en tu Instagram', messages:'mensajes', msgFor:'{n} mensajes para ti',
       statsH:'Tu STREETDARE hasta ahora', statsP:'Desde tu primer escaneo', peopleMet:'personas conocidas', peopleMetP:'que hicieron un reto contigo y escribieron tu código',
       daresShirt:'retos hechos con tu camiseta', scansAll:'escaneos', msgsAll:'mensajes recibidos', bestNight:'Mejor noche', bestP:'{d} · {n} retos, tu récord',
       shirtless:'Retos Shirtless, contados aparte',
       goingH:'¿Sales esta noche?', goingP:'Comprueba si tu camiseta está lista antes de salir.', deck:'Baraja activa', photo:'Foto de perfil', photoOk:'Puesta ✓', photoAdd:'Añádela →',
       nightsH:'Tus noches', nightsEmpty:'Todavía no hay noches. Sal con tu camiseta y aquí aparecerá la primera.', passTag:'Noche Shirtless', openFeed:'Abrir el Group Feed →',
       pm:'{p} personas · {d} retos', launch:'Durante la fase de lanzamiento, Aron y el equipo de STREETDARE también pueden ver tu línea de tiempo.',
       back:'← Inicio', rename:'Renombrar', renameQ:'Ponle nombre a esta noche', done:'Hecho juntos ✓', ownDare:'Tu propio reto', partyTag:'Baraja Party', streetTag:'Baraja Street', devilTag:'Devil mode',
       photoDare:'reto con foto', private:'Lo que pasó aquí queda entre vosotros dos.', someone:'Alguien', youWon:'Ganaste tú', theyWon:'Ganó {n}',
       msgTomorrow:'Mensaje para mañana', sealedOne:'Te espera un mensaje. Se abre mañana por la mañana.', noMsg:'{n} se despidió sin dejar mensaje.',
       addNote:'Añadir una nota', addPhoto:'Añadir una foto', notePh:'¿Qué quieres recordar?', save:'Guardar', noteSaved:'Guardado', photoUp:'Subiendo…',
       hide:'Quitar este momento', hideQ:'¿Quitar este encuentro de tu línea de tiempo? No se puede deshacer.',
       plainDare:'Un reto hecho juntos', earlier:'De antes de que existieran los recuerdos, así que solo se guardó el reto.',
       tooGood:'Demasiado bueno para quedártelo', tooGoodP:'Convertimos esta noche en una imagen para tu historia de Instagram.',
       tagTip:'Etiqueta a @street.dare para que te compartamos.', shareFail:'Imagen guardada. Súbela como historia desde tus fotos.',
       welcome:'Hola, {n}', firstMem:'Tu primer recuerdo STREETDARE', youAnd:'Tú y {n}', youTold:'Le dijiste a {n}: “{m}”', seeNights:'Míralo en tus noches ↓',
       theDare:'El reto que hicisteis juntos', follow:'Sigue a @{ig}',
       passK:'¿Sigues de fiesta?', passH:'Juega con tus amigos', passP:'Con un Shirtless Pass tu grupo tiene sus propios retos durante 24 horas: os acercáis a desconocidos, sumáis puntos y veis quién gana la noche. Todo acaba en tus noches, como esta.', passBtn:'Quiero un Shirtless Pass',
       shirtH:'¿Quieres tu propia camiseta?', shirtP:'Así es la gente quien viene a ti, y cada noche te deja recuerdos como este.', shirtBtn:'Cuéntame más', backFriends:'Volver con mis amigos',
       memH:'Tus recuerdos', memEmpty:'Aquí aún no hay nada. Escanea una camiseta STREETDARE, haz un reto y guarda el encuentro.', peopleThrough:'personas conocidas con STREETDARE',
       nightOut:'{w} de fiesta', afternoon:'{w} por la tarde', day:'{w}', err:'Algo ha fallado. Inténtalo otra vez.', adminH:'Líneas de tiempo (admin)', adminP:'Todos los encuentros de todas las camisetas, los más nuevos primero. Solo lo ven los admins.' },
  hu:{ loginH:'Az estéid', loginP:'Lépj be, és lásd a STREETDARE estéidet: a kihívásokat, a fotókat és az üzeneteket, amiket neked hagytak.', loginBtn:'Belépés',
       hey:'Szia, {n}', live:'ÉLŐ', since:'A pólód {t} óta kint van · {deck}', party:'Party pakli', yourCode:'A kihíváskódod',
       codeP:'Mondd meg annak, akinek most mondtál igent.', people:'új ember', dares:'kihívás', scans:'szkennelés ma este', igSoFar:'{n} kattintás az Instagramodra eddig',
       justNow:'Épp most · {t}', sealed:'{n} üzenet vár rád', sealed1:'1 üzenet vár rád', sealedP:'Holnap reggel nyílnak meg. Nincs leskelődés.',
       soFar:'A mai este eddig', started:'{t} · Az estéd az első szkenneléssel kezdődött', openTonight:'A mai este idővonala →', fullTomorrow:'Holnap itt lesz az egész estéd',
       fullTomorrowP:'Minden fotóval, válasszal és üzenettel, megosztásra készen.',
       lastNight:'Az utolsó estéd', openNight:'Az este megnyitása →', share:'Este megosztása', igClicks:'kattintás az Instagramodra', messages:'üzenet', msgFor:'{n} üzenet neked',
       statsH:'A STREETDARE-ed eddig', statsP:'Az első szkenneléstől', peopleMet:'megismert ember', peopleMetP:'aki kihívást csinált veled és beírta a kódodat',
       daresShirt:'kihívás a pólóddal', scansAll:'szkennelés', msgsAll:'kapott üzenet', bestNight:'A legjobb estéd', bestP:'{d} · {n} kihívás, az eddigi csúcs',
       shirtless:'Shirtless kihívások, külön számolva',
       goingH:'Ma este mész valahova?', goingP:'Nézd meg, hogy kész-e a pólód, mielőtt elindulsz.', deck:'Aktív pakli', photo:'Profilkép', photoOk:'Megvan ✓', photoAdd:'Add hozzá →',
       nightsH:'Az estéid', nightsEmpty:'Még nincs egy este sem. Vedd fel a pólódat, és itt jelenik meg az első.', passTag:'Shirtless este', openFeed:'A Group Feed megnyitása →',
       pm:'{p} új ember · {d} kihívás', launch:'Az indulási időszakban Áron és a STREETDARE csapata is láthatja az idővonaladat.',
       back:'← Kezdőlap', rename:'Átnevezés', renameQ:'Adj nevet ennek az estének', done:'Együtt megcsináltátok ✓', ownDare:'A saját kihívásod', partyTag:'Party pakli', streetTag:'Street pakli', devilTag:'Devil mode',
       photoDare:'fotós kihívás', private:'Ami itt történt, az kettőtök között marad.', someone:'Valaki', youWon:'Te nyertél', theyWon:'{n} nyert',
       msgTomorrow:'Üzenet holnapra', sealedOne:'Egy üzenet vár rád. Holnap reggel nyílik meg.', noMsg:'{n} üzenet nélkül köszönt el.',
       addNote:'Jegyzet hozzáadása', addPhoto:'Fotó hozzáadása', notePh:'Mire akarsz emlékezni?', save:'Mentés', noteSaved:'Elmentve', photoUp:'Feltöltés…',
       hide:'Pillanat eltávolítása', hideQ:'Eltávolítod ezt a találkozást az idővonaladról? Nem vonható vissza.',
       plainDare:'Egy közös kihívás', earlier:'Még az emlékek előttről, ezért csak a kihívás maradt meg.',
       tooGood:'Túl jó ahhoz, hogy megtartsd magadnak', tooGoodP:'Ebből az estéből Instagram-sztori képet készítünk.',
       tagTip:'Jelöld meg a @street.dare-t, hogy megoszthassunk.', shareFail:'Elmentettük a képet. Tedd ki sztoriba a fotóid közül.',
       welcome:'Szia, {n}', firstMem:'Az első STREETDARE emléked', youAnd:'Te és {n}', youTold:'Ezt írtad neki ({n}): „{m}”', seeNights:'Nézd meg az estéid között ↓',
       theDare:'A közös kihívásotok', follow:'Kövesd: @{ig}',
       passK:'Még bulizol?', passH:'Játssz a barátaiddal', passP:'Egy Shirtless Passszal a csapatod 24 órára saját kihívásokat kap: odamentek idegenekhez, pontokat gyűjtötök, és kiderül, ki nyeri az estét. Minden az estéid közé kerül, mint ez is.', passBtn:'Kérek egy Shirtless Passt',
       shirtH:'Kéne saját póló?', shirtP:'Akkor hozzád jönnek oda az emberek, és minden este ilyen emlékeket hagy.', shirtBtn:'Mesélj többet', backFriends:'Vissza a barátaimhoz',
       memH:'Az emlékeid', memEmpty:'Itt még nincs semmi. Szkennelj be egy STREETDARE pólót, csináljatok meg egy kihívást, és mentsd el a találkozást.', peopleThrough:'ember, akit a STREETDARE-rel ismertél meg',
       nightOut:'{w} esti buli', afternoon:'{w} délután', day:'{w}', err:'Valami hiba történt. Próbáld újra.', adminH:'Idővonalak (admin)', adminP:'Minden találkozás minden pólón, a legújabb elöl. Csak adminok látják.' }
};
const t = (k, v) => { let s = (T[L] || T.en)[k]; if (s == null) s = T.en[k] || ''; if (v) Object.keys(v).forEach(x => { s = s.split('{' + x + '}').join(v[x]); }); return s; };
const STAR = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0C55 35 65 45 100 50C65 55 55 65 50 100C45 65 35 55 0 50C35 45 45 35 50 0Z"/></svg>';
const LOC = () => L === 'hu' ? 'hu-HU' : L === 'es' ? 'es-ES' : 'en-GB';
const TZ = (() => { try{ return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid'; }catch(e){ return 'Europe/Madrid'; } })();
const hm = d => new Date(d).toLocaleTimeString(LOC(), { hour:'2-digit', minute:'2-digit', timeZone: TZ });
const dayMon = d => new Date(d).toLocaleDateString(LOC(), { day:'numeric', month:'short', timeZone: TZ });
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const params = new URLSearchParams(location.search);

let S = null;        /* session */
let D = { home: null, mine: [], pass: [], prof: null };
let NIGHTS = [];     /* shirt nights, newest first */
let urls = {};       /* signed photo urls by path */
let NAMES = {};      /* the owner's own names for their nights, by night key */

/* ---------- loading ---------- */
async function load(){
  S = await getSession();
  if (!S){ renderLogin(); return; }
  const dev = (() => { try{ return localStorage.getItem('sd_device'); }catch(e){ return null; } })();
  if (dev){ try{ await sb.rpc('claim_encounters', { p_device: dev }); }catch(e){} }
  const [h, m, p, pr] = await Promise.all([
    sb.rpc('owner_home'), sb.rpc('my_encounters'), sb.rpc('my_nights'),
    sb.from('profiles').select('name,avatar_url,role').eq('id', S.user.id).maybeSingle()
  ]);
  try{ const { data: nn } = await sb.from('night_names').select('night_key,name'); (nn || []).forEach(r => { NAMES[r.night_key] = r.name; }); }catch(e){}
  D = { home: h.data || null, mine: m.data || [], pass: p.data || [], prof: pr.data || {} };
  if (params.get('admin') !== null && D.prof.role === 'admin'){
    const { data } = await sb.rpc('admin_encounters', { p_shirt: params.get('admin') || null });
    D.admin = data || [];
  }
  try{ localStorage.setItem('sd_owner', isOwner() ? '1' : '0'); }catch(e){}
  NIGHTS = buildNights();
  await signPhotos();
  route();
  /* the owner's live numbers come in as they happen */
  if (isOwner()) setInterval(refreshLive, 45000);
}
async function refreshLive(){
  if (!liveNight()) return;
  const { data } = await sb.rpc('owner_home'); if (!data) return;
  D.home = data; NIGHTS = buildNights(); await signPhotos(); route();
}
const isOwner = () => !!(D.home && D.home.shirts && D.home.shirts.length);

async function signPhotos(){
  const need = new Set();
  const add = p => { if (p && !urls[p]) need.add(p); };
  const encs = [].concat((D.home && D.home.encounters) || [], D.mine || [], D.admin || []);
  encs.forEach(e => { add(e.photo); (e.dares || []).forEach(d => { add(d.photo); add(d.owner_photo); }); });
  if (!need.size) return;
  try{
    const { data } = await sb.storage.from('moments').createSignedUrls([...need], 6 * 3600);
    (data || []).forEach(x => { if (x.signedUrl) urls[x.path] = x.signedUrl; });
  }catch(e){}
}

/* ---------- nights from the events: a new night starts after 6 quiet hours ---------- */
function buildNights(){
  if (!isOwner()) return [];
  const h = D.home, items = [];
  (h.events || []).forEach(e => items.push({ at: +new Date(e.at), k: 'ev', e }));
  (h.encounters || []).forEach(en => (en.dares || []).forEach(d => items.push({ at: +new Date(d.at), k: 'mo', en, d })));
  (h.plain || []).forEach(p => items.push({ at: +new Date(p.at), k: 'plain', p }));
  items.sort((a, b) => a.at - b.at);
  const out = []; let cur = null;
  items.forEach(it => {
    if (!cur || it.at - cur.end > 6 * 3600e3){ cur = { start: it.at, end: it.at, items: [] }; out.push(cur); }
    cur.items.push(it); cur.end = Math.max(cur.end, it.at);
  });
  out.forEach(n => {
    const ev = n.items.filter(i => i.k === 'ev').map(i => i.e);
    n.scans = ev.filter(e => e.e === 'scan').length;
    n.dares = ev.filter(e => e.e === 'done').length;
    n.people = new Set(ev.filter(e => e.e === 'done').map(e => e.d)).size;
    n.ig = ev.filter(e => e.e === 'ig_click').length;
    n.moments = n.items.filter(i => i.k === 'mo' || i.k === 'plain');
    const encs = [...new Set(n.items.filter(i => i.k === 'mo').map(i => i.en))];
    n.encs = encs;
    n.msgs = encs.filter(e => e.message || e.sealed).length;
    n.sealed = encs.filter(e => e.sealed).length;
    n.photos = []; encs.forEach(e => { if (e.photo) n.photos.push(e.photo); (e.dares || []).forEach(d => { if (d.photo) n.photos.push(d.photo); if (d.owner_photo) n.photos.push(d.owner_photo); }); });
    n.best = encs.map(e => e.message).filter(Boolean)[0] || '';
    n.key = new Date(n.start).toISOString().slice(0, 13);
  });
  return out.filter(n => n.scans || n.dares || n.moments.length).reverse();
}
/* "Friday night out · 28 Nov": the evening a night belongs to, even when it ends at 4 in the morning */
function nightName(n){
  if (NAMES[n.key]) return NAMES[n.key];
  const d = new Date(n.start), shifted = new Date(n.start - 6 * 3600e3);
  const hr = +d.toLocaleString('en-GB', { hour:'2-digit', hour12:false, timeZone: TZ });
  const w = cap(shifted.toLocaleDateString(LOC(), { weekday:'long', timeZone: TZ }));
  return hr >= 17 || hr < 6 ? t('nightOut', { w }) : hr >= 12 ? t('afternoon', { w }) : t('day', { w });
}
const nightDate = n => dayMon(n.start - 6 * 3600e3);
const liveNight = () => { const n = NIGHTS[0]; return n && Date.now() - n.end < 3 * 3600e3 ? n : null; };

/* ---------- small pieces ---------- */
const img = (path, cls) => urls[path] ? '<img class="' + (cls || '') + '" src="' + esc(urls[path]) + '" alt="" loading="lazy">' : '';
const dareText = d => (L === 'es' && d.text_es) ? d.text_es : (L === 'hu' && d.text_hu) ? d.text_hu : (d.text || '');
const tag = d => d.own ? t('ownDare') : d.deck === 'spicy' ? t('devilTag') : d.deck === 'street' ? t('streetTag') : t('partyTag');
function answerHtml(d, who, perspective){
  let h = '';
  if (d.winner){ const youWin = (perspective === 'owner') === (d.winner === 'owner'); h += '<div class="ans"><small>🏆</small><b>' + esc(youWin ? t('youWon') : t('theyWon', { n: who })) + '</b></div>'; }
  if (d.a1 || d.a2){
    const lab = d['label_' + L] || d.label_en || '';
    let v;
    if (d.a2){ /* two fields: the scanner typed theirs first, then the owner's */
      const you = L === 'es' ? 'Tú' : L === 'hu' ? 'Te' : 'You';
      const sc = perspective === 'owner' ? who : you, ow = perspective === 'owner' ? you : who;
      v = '<b>' + esc(sc) + ':</b> ' + esc(d.a1 || '–') + '<br><b>' + esc(ow) + ':</b> ' + esc(d.a2);
    } else v = '<b>' + esc(d.a1) + '</b>';
    h += '<div class="ans">' + (lab ? '<small>' + esc(lab) + '</small>' : '') + '<span>' + v + '</span></div>';
  }
  return h;
}
function upsells(){
  return '<div class="upsell yellow"><small>' + esc(t('passK')) + '</small><h2 class="display">' + esc(t('passH')) + '</h2><p>' + esc(t('passP')) + '</p><a class="btn" href="/?home=1#shop">' + esc(t('passBtn')) + '</a></div>' +
         '<div class="upsell blue"><h2 class="display">' + esc(t('shirtH')) + '</h2><p>' + esc(t('shirtP')) + '</p><a class="btn" href="/?home=1#join">' + esc(t('shirtBtn')) + '</a></div>';
}
const stars = () => '<i class="bgstar s1">' + STAR + '</i><i class="bgstar s2">' + STAR + '</i><i class="bgstar s3">' + STAR + '</i>';
function passList(){
  return (D.pass || []).map(p => ({ at: +new Date(p.begun_at || p.created_at || p.started_at || Date.now()), p }));
}

/* ---------- views ---------- */
function route(){
  $('loading').hidden = true; const app = $('app'); app.hidden = false;
  const h = location.hash.match(/^#n=(.+)$/);
  if (D.admin) return renderAdmin(app);
  if (h && isOwner()){ const n = NIGHTS.find(x => x.key === decodeURIComponent(h[1])); if (n) return renderNight(app, n); }
  if (isOwner()) return renderOwner(app);
  renderScanner(app);
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

function renderLogin(){
  $('loading').hidden = true; const app = $('app'); app.hidden = false;
  app.innerHTML = '<h1 class="display">' + esc(t('loginH')) + '</h1><p class="sub">' + esc(t('loginP')) + '</p>' +
    '<a class="btn red" href="/login/?next=' + encodeURIComponent(location.pathname + location.search) + '">' + esc(t('loginBtn')) + '</a>';
}

/* ===== owner home ===== */
function renderOwner(app){
  const h = D.home, st = h.stats || {}, live = liveNight(), name = (D.prof && D.prof.name) || '';
  let html = '';
  if (live) html += liveCard(live, h);
  else {
    const last = NIGHTS[0];
    if (last && Date.now() - last.end < 7 * 864e5) html += lastNightCard(last);
    else html += '<div class="kicker">' + esc(t('hey', { n: name })) + '</div>';
  }
  /* stats */
  const best = NIGHTS.slice().sort((a, b) => b.dares - a.dares)[0];
  html += '<section class="sect"><h2 class="display">' + esc(t('statsH')) + '</h2><p class="sub">' + esc(t('statsP')) + '</p><div class="statgrid">' +
    '<div class="st big red"><b class="display">' + (st.people || 0) + '</b><span>' + esc(t('peopleMet')) + '</span><small>' + esc(t('peopleMetP')) + '</small></div>' +
    '<div class="st"><b class="display">' + (st.dares || 0) + '</b><span>' + esc(t('daresShirt')) + '</span></div>' +
    '<div class="st"><b class="display">' + (st.scans || 0) + '</b><span>' + esc(t('scansAll')) + '</span></div>' +
    '<div class="st"><b class="display">' + (st.ig || 0) + '</b><span>' + esc(t('igClicks')) + '</span></div>' +
    '<div class="st"><b class="display">' + (st.messages || 0) + '</b><span>' + esc(t('msgsAll')) + '</span></div>' +
    (best && best.dares ? '<a class="st wide blue" href="#n=' + encodeURIComponent(best.key) + '"><span class="k">' + esc(t('bestNight')) + '</span><b class="display sm">' + esc(nightName(best)) + '</b><span>' + esc(t('bestP', { d: nightDate(best), n: best.dares })) + '</span><i class="starico">' + STAR + '</i></a>' : '') +
    '<div class="st wide dashed"><span>' + esc(t('shirtless')) + '</span><b class="display sm">' + (st.shirtless || 0) + '</b></div>' +
    '</div></section>';
  /* going out tonight? (evenings, when not already live) */
  const hr = +new Date().toLocaleString('en-GB', { hour:'2-digit', hour12:false, timeZone: TZ });
  if (!live && (hr >= 17 || hr < 3)){
    const ph = !!(D.prof && D.prof.avatar_url);
    html += '<section class="going"><h2 class="display">' + esc(t('goingH')) + '</h2><p>' + esc(t('goingP')) + '</p>' +
      '<a class="gorow dark" href="/me/#decks"><span>' + esc(t('deck')) + '</span><b>' + esc(t('party')) + ' →</b></a>' +
      '<a class="gorow" href="/me/"><span>' + esc(t('photo')) + '</span><b>' + esc(ph ? t('photoOk') : t('photoAdd')) + '</b></a></section>';
  }
  html += nightsList();
  html += '<p class="launchnote">' + esc(t('launch')) + '</p>';
  app.innerHTML = html;
  wireShare(app);
}
function liveCard(n, h){
  const firstScan = n.items.find(i => i.k === 'ev'), mo = n.moments.slice().reverse(), last = mo[0];
  let s = h.code ? '<div class="codecard"><small>' + esc(t('yourCode')) + '</small><b class="display">' + esc(h.code) + '</b><span>' + esc(t('codeP')) + '</span></div>' : '';
  s += '<section class="livecard">' + stars() + '<div class="livek"><i class="dot"></i>' + esc(t('live')) + '</div><h1 class="display">' + esc(nightName(n)) + '</h1>' +
    '<p>' + esc(t('since', { t: hm(n.start), deck: t('party') })) + '</p><div class="tiles3">' +
    '<div><b class="display y">' + n.people + '</b><span>' + esc(t('people')) + '</span></div>' +
    '<div><b class="display">' + n.dares + '</b><span>' + esc(t('dares')) + '</span></div>' +
    '<div><b class="display">' + n.scans + '</b><span>' + esc(t('scans')) + '</span></div></div>' +
    (n.ig ? '<p class="small">' + esc(n.ig === 1 && L === 'en' ? t('igSoFar1') : t('igSoFar', { n: n.ig })) + '</p>' : '') + '</section>';
  if (last) s += '<div class="kicker">' + esc(t('justNow', { t: hm(last.at) })) + '</div>' + momentCard(last, true);
  if (n.sealed) s += '<div class="sealcard"><b class="display">' + esc(n.sealed === 1 ? t('sealed1') : t('sealed', { n: n.sealed })) + '</b><span>' + esc(t('sealedP')) + '</span></div>';
  s += '<section class="sect"><h2 class="display">' + esc(t('soFar')) + '</h2><ol class="mini-tl">' +
    mo.map(i => '<li><i class="d"></i><div>' + (i.k === 'mo' && (i.d.photo || i.en.photo) ? img(i.d.photo || i.en.photo, 'th') : '') +
      '<span><small>' + esc(hm(i.at)) + (i.k === 'mo' && i.en.name ? ' · ' + esc(i.en.name) : '') + '</small><b>' + esc(i.k === 'mo' ? dareText(i.d) : (i.p.text || t('plainDare'))) + '</b></span></div></li>').join('') +
    (firstScan ? '<li class="start"><i class="d"></i><div><span><small>' + esc(t('started', { t: hm(firstScan.at) })) + '</small></span></div></li>' : '') +
    '</ol><a class="btn" href="#n=' + encodeURIComponent(n.key) + '">' + esc(t('openTonight')) + '</a></section>' +
    '<div class="dashedbox"><b>' + esc(t('fullTomorrow')) + '</b><span>' + esc(t('fullTomorrowP')) + '</span></div>';
  return s;
}
function lastNightCard(n){
  const ph = n.photos.slice(0, 3);
  return '<section class="lastnight"><div class="kicker">' + esc(t('lastNight')) + '</div><h1 class="display">' + esc(nightName(n)) + '</h1>' +
    '<p class="sub">' + esc(nightDate(n) + ' · ' + hm(n.start) + ' – ' + hm(n.end)) + '</p>' +
    (ph.length ? '<div class="collage c' + ph.length + '">' + ph.map(p => img(p)).join('') + '</div>' : '<div class="collage none">' + stars() + '</div>') +
    '<div class="tiles3 light"><div><b class="display y">' + n.people + '</b><span>' + esc(t('people')) + '</span></div><div><b class="display r">' + n.dares + '</b><span>' + esc(t('dares')) + '</span></div><div><b class="display">' + n.ig + '</b><span>' + esc(t('igClicks')) + '</span></div></div>' +
    (n.best ? '<div class="msgcard"><small>' + esc(t('msgFor', { n: n.msgs })) + '</small><p class="display">“' + esc(n.best) + '”</p></div>' : '') +
    '<div class="row2"><a class="btn red" href="#n=' + encodeURIComponent(n.key) + '">' + esc(t('openNight')) + '</a><button class="btn yel" type="button" data-share="' + esc(n.key) + '">' + esc(t('share')) + '</button></div></section>';
}
function nightsList(){
  const rows = NIGHTS.map(n => ({ at: n.start, html: '<a class="nrow" href="#n=' + encodeURIComponent(n.key) + '">' + (n.photos[0] ? img(n.photos[0], 'nth') : '<i class="nth ph"></i>') +
    '<span><b class="display">' + esc(nightName(n)) + '</b><small>' + esc(nightDate(n) + ' · ' + t('pm', { p: n.people, d: n.dares })) + '</small></span><em>→</em></a>' }))
    .concat(passList().map(x => ({ at: x.at, html: '<a class="nrow pass" href="/pass/?n=' + esc(x.p.id) + '"><i class="nth pass">PASS</i><span><small class="y">' + esc(t('passTag')) + '</small><b class="display">' + esc(x.p.name || '') + '</b><small>' + esc(dayMon(x.at) + ' · ' + t('openFeed')) + '</small></span></a>' })))
    .sort((a, b) => b.at - a.at);
  return '<section class="sect"><h2 class="display">' + esc(t('nightsH')) + '</h2>' + (rows.length ? '<div class="nlist">' + rows.map(r => r.html).join('') + '</div>' : '<p class="sub">' + esc(t('nightsEmpty')) + '</p>') + '</section>';
}

/* ===== one moment on a timeline ===== */
function momentCard(i, compact){
  if (i.k === 'plain'){
    return '<article class="moment"><div class="mcard"><div class="mtop"><span>' + esc(i.p.own ? t('ownDare') : t('partyTag')) + '</span><em>' + esc(t('done')) + '</em></div>' +
      '<p class="dtext">' + esc(dareText(i.p) || t('plainDare')) + '</p>' + (compact ? '' : '<small class="muted">' + esc(t('earlier')) + '</small>') + '</div></article>';
  }
  const d = i.d, en = i.en, who = en.name || t('someone');
  const pics = [d.photo, d.owner_photo].filter(Boolean);
  let s = '<article class="moment">' + (compact ? '' : '<div class="mwho">' + esc(hm(i.at) + ' · ' + who) + '</div>') +
    '<div class="mcard">' + (pics.length ? '<div class="mpics p' + pics.length + '">' + pics.map(p => img(p)).join('') + '</div>' : '') +
    '<div class="mbody"><div class="mtop"><span>' + esc(tag(d)) + (d.photo ? ' · ' + esc(t('photoDare')) : '') + '</span><em>' + esc(t('done')) + '</em></div>' +
    '<p class="dtext">' + esc(dareText(d)) + '</p>' + (d.extra === 'private' ? '<small class="muted">' + esc(t('private')) + '</small>' : answerHtml(d, who, 'owner')) +
    (d.note ? '<p class="note">' + esc(d.note) + '</p>' : '') + '</div></div>';
  if (!compact){
    /* the encounter's goodbye goes under its last dare */
    const lastOf = (en.dares || [])[en.dares.length - 1];
    if (lastOf && lastOf.id === d.id){
      if (en.photo) s += '<div class="mpics p1 bye">' + img(en.photo) + '</div>';
      if (en.message) s += '<div class="msgbox"><small>' + esc(t('msgTomorrow')) + '</small><p class="display">“' + esc(en.message) + '”</p></div>';
      else if (en.sealed) s += '<div class="msgbox sealed"><small>' + esc(t('msgTomorrow')) + '</small><p>' + esc(t('sealedOne')) + '</p></div>';
      const c = [];
      if (en.instagram) c.push('<a class="cbtn ig" target="_blank" rel="noopener" href="https://instagram.com/' + encodeURIComponent(en.instagram) + '">Instagram @' + esc(en.instagram) + '</a>');
      if (en.whatsapp) c.push('<a class="cbtn wa" target="_blank" rel="noopener" href="https://wa.me/' + esc(en.whatsapp.replace(/\D/g, '')) + '">WhatsApp</a>');
      if (c.length) s += '<div class="crow">' + c.join('') + '</div>';
      if (!en.message && !en.sealed && !c.length && !en.photo && en.name) s += '<small class="muted">' + esc(t('noMsg', { n: en.name })) + '</small>';
    }
    s += '<div class="macts"><button class="mini" type="button" data-note="' + d.id + '">' + esc(t('addNote')) + '</button><button class="mini" type="button" data-photo="' + d.id + '">' + esc(t('addPhoto')) + '</button></div>';
  }
  return s + '</article>';
}

/* ===== a night's timeline ===== */
function renderNight(app, n){
  let s = '<div class="nhead"><a class="mini plain" href="#">' + esc(t('back')) + '</a><button class="mini yel" type="button" data-share="' + esc(n.key) + '">' + esc(t('share')) + '</button></div>' +
    '<h1 class="display">' + esc(nightName(n)) + '</h1><p class="sub">' + esc(nightDate(n) + ' · ' + hm(n.start) + ' – ' + hm(n.end)) + ' <button class="mini" type="button" id="renameBtn">' + esc(t('rename')) + '</button></p>' +
    '<div class="chips"><span><b>' + n.people + '</b> ' + esc(t('people')) + '</span><span><b>' + n.dares + '</b> ' + esc(t('dares')) + '</span><span><b>' + n.ig + '</b> ' + esc(t('igClicks')) + '</span><span><b>' + n.msgs + '</b> ' + esc(t('messages')) + '</span></div>' +
    '<div class="tl">' + n.moments.map(i => momentCard(i, false)).join('') + '</div>' +
    '<section class="sharebox"><h2 class="display">' + esc(t('tooGood')) + '</h2><p>' + esc(t('tooGoodP')) + '</p><button class="btn yel" type="button" data-share="' + esc(n.key) + '">' + esc(t('share')) + '</button></section>' +
    '<p class="launchnote">' + esc(t('launch')) + '</p>';
  app.innerHTML = s;
  $('renameBtn').onclick = async () => {
    const v = prompt(t('renameQ'), nightName(n)); if (v == null) return;
    const name = v.trim().slice(0, 40);
    if (name && window.sdHurtful && sdHurtful(name)) return;
    const q = name ? sb.from('night_names').upsert({ owner_id: S.user.id, night_key: n.key, name, updated_at: new Date().toISOString() })
                   : sb.from('night_names').delete().eq('night_key', n.key);
    const { error } = await q;
    if (error) return toast(t('err'));
    if (name) NAMES[n.key] = name; else delete NAMES[n.key];
    toast(t('noteSaved')); route();
  };
  wireShare(app); wireMoments(app);
}
function wireMoments(app){
  app.querySelectorAll('[data-note]').forEach(b => b.onclick = async () => {
    const id = +b.dataset.note, d = findDare(id);
    const v = prompt(t('notePh'), (d && d.note) || ''); if (v == null) return;
    if (window.sdHurtful && sdHurtful(v)) return;
    const { data, error } = await sb.rpc('owner_moment_edit', { p_dare: id, p_note: v });
    if (error || data !== 'ok') return toast(t('err'));
    if (d) d.note = v.trim() || null; toast(t('noteSaved')); route();
  });
  app.querySelectorAll('[data-photo]').forEach(b => b.onclick = () => { photoFor = +b.dataset.photo; $('ownerPhotoIn').click(); });
}
let photoFor = null;
$('ownerPhotoIn').onchange = async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f || !photoFor) return;
  const d = findDare(photoFor), shirt = D.home.shirts[0];
  toast(t('photoUp'));
  try{
    const blob = await shrink(f, 1080, .8), path = shirt + '/owner/' + crypto.randomUUID() + '.jpg';
    const { error } = await sb.storage.from('moments').upload(path, blob, { contentType:'image/jpeg' });
    if (error) throw error;
    const { data } = await sb.rpc('owner_moment_edit', { p_dare: photoFor, p_photo: path });
    if (data !== 'ok') throw new Error('edit');
    if (d) d.owner_photo = path; await signPhotos(); toast(t('noteSaved')); route();
  }catch(x){ toast(t('err')); }
};
function findDare(id){ for (const en of (D.home.encounters || [])) for (const d of (en.dares || [])) if (d.id === id) return d; return null; }
function shrink(file, max, q){
  return new Promise((resolve, reject) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u); c.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', q); };
    im.onerror = () => { URL.revokeObjectURL(u); reject(new Error('img')); };
    im.src = u;
  });
}

/* ===== the scanner's own memories ===== */
function renderScanner(app){
  const mine = D.mine || [], first = mine[0], name = (D.prof && D.prof.name) || '';
  let s = '';
  if (params.get('saved') && first){
    const d = (first.dares || [])[first.dares.length - 1] || {}, ph = first.photo || d.photo;
    s += '<div class="kicker">' + esc(t('welcome', { n: name })) + '</div><h1 class="display">' + esc(t('firstMem')) + '</h1>' +
      '<article class="memcard' + (ph ? '' : ' nophoto') + '">' + (ph ? img(ph, 'memph') : stars()) +
      '<div class="memb"><div class="who">' + (first.owner_photo ? '<img class="av" src="' + esc(first.owner_photo) + '" alt="">' : '') + '<span><b>' + esc(t('youAnd', { n: first.owner_name || '' })) + '</b><small>' + esc(dayMon(first.at) + ' · ' + hm(first.at)) + '</small></span></div>' +
      (ph ? '' : '<small class="k">' + esc(t('theDare')) + '</small>') + '<p class="' + (ph ? 'dtext' : 'display big') + '">' + esc(dareText(d)) + '</p>' + answerHtml(d, first.owner_name || '', 'scanner') +
      '<em class="donetag">' + esc(t('done')) + '</em>' + (first.message ? '<p class="told">' + esc(t('youTold', { n: first.owner_name || '', m: first.message })) + '</p>' : '') + '</div></article>' +
      (first.owner_ig ? '<a class="swapcard" target="_blank" rel="noopener" href="https://instagram.com/' + encodeURIComponent(first.owner_ig) + '"><b>' + esc(t('follow', { ig: first.owner_ig })) + '</b></a>' : '') +
      upsells() + '<a class="btn plain" href="/p/?s=' + encodeURIComponent(first.shirt) + '">' + esc(t('backFriends')) + '</a>';
  }
  const people = new Set(mine.map(e => e.shirt)).size;
  s += '<section class="sect"><h2 class="display">' + esc(t('memH')) + '</h2>' + (mine.length ? '<p class="sub"><b>' + people + '</b> ' + esc(t('peopleThrough')) + '</p>' : '');
  const rows = mine.map(e => ({ at: +new Date(e.at), html: scannerRow(e) })).concat(passList().map(x => ({ at: x.at,
    html: '<a class="nrow pass" href="/pass/?n=' + esc(x.p.id) + '"><i class="nth pass">PASS</i><span><small class="y">' + esc(t('passTag')) + '</small><b class="display">' + esc(x.p.name || '') + '</b><small>' + esc(dayMon(x.at) + ' · ' + t('openFeed')) + '</small></span></a>' }))).sort((a, b) => b.at - a.at);
  s += rows.length ? rows.map(r => r.html).join('') : '<p class="sub">' + esc(t('memEmpty')) + '</p>';
  s += '</section>';
  if (!params.get('saved')) s += '<div class="upsell blue"><h2 class="display">' + esc(t('shirtH')) + '</h2><p>' + esc(t('shirtP')) + '</p><a class="btn" href="/?home=1#join">' + esc(t('shirtBtn')) + '</a></div>';
  app.innerHTML = s;
}
function scannerRow(e){
  const ph = e.photo || ((e.dares || []).find(d => d.photo) || {}).photo;
  return '<article class="srow">' + (ph ? img(ph, 'sth') : '') + '<div><small class="k">' + esc(t('youAnd', { n: e.owner_name || '' })) + ' · ' + esc(dayMon(e.at) + ' · ' + hm(e.at)) + '</small>' +
    (e.dares || []).map(d => '<p class="dtext">' + esc(dareText(d)) + '</p>' + answerHtml(d, e.owner_name || '', 'scanner')).join('') +
    (e.message ? '<p class="told">' + esc(t('youTold', { n: e.owner_name || '', m: e.message })) + '</p>' : '') +
    (e.owner_ig ? '<a class="cbtn ig" target="_blank" rel="noopener" href="https://instagram.com/' + encodeURIComponent(e.owner_ig) + '">' + esc(t('follow', { ig: e.owner_ig })) + '</a>' : '') + '</div></article>';
}

/* ===== admin: every encounter ===== */
function renderAdmin(app){
  app.innerHTML = '<h1 class="display">' + esc(t('adminH')) + '</h1><p class="sub">' + esc(t('adminP')) + '</p>' +
    (D.admin || []).map(e => '<article class="srow admin">' + (e.photo ? img(e.photo, 'sth') : '') + '<div><small class="k">' + esc((e.owner_name || e.shirt) + ' · ' + (e.name || t('someone')) + ' · ' + dayMon(e.at) + ' ' + hm(e.at)) + '</small>' +
      (e.dares || []).map(d => '<p class="dtext">' + esc(dareText(d)) + '</p>' + (d.photo ? img(d.photo, 'sth') : '') + answerHtml(d, e.name || t('someone'), 'owner')).join('') +
      (e.message ? '<p class="told">“' + esc(e.message) + '”</p>' : '') +
      (e.instagram ? '<small>IG @' + esc(e.instagram) + '</small> ' : '') + (e.whatsapp ? '<small>WA ' + esc(e.whatsapp) + '</small>' : '') + '</div></article>').join('');
}

/* ===== Share this night: a 1080×1920 Story image drawn on the phone ===== */
function wireShare(app){ app.querySelectorAll('[data-share]').forEach(b => b.onclick = () => shareNight(NIGHTS.find(n => n.key === b.dataset.share), b)); }
function loadImg(src){ return new Promise(res => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
function starPath(ctx, cx, cy, r){
  const p = new Path2D('M50 0C55 35 65 45 100 50C65 55 55 65 50 100C45 65 35 55 0 50C35 45 45 35 50 0Z');
  ctx.save(); ctx.translate(cx - r, cy - r); ctx.scale(r / 50, r / 50); ctx.fill(p); ctx.restore();
}
function cover(ctx, im, x, y, w, h, r){
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();
  const k = Math.max(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k;
  ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); ctx.restore();
}
async function shareNight(n, btn){
  if (!n) return;
  if (btn) btn.disabled = true;
  try{
    await Promise.all([document.fonts.load('120px Caprasimo'), document.fonts.load('700 40px "DM Sans"')]).catch(() => {});
    const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#E20000'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#FFE32A'; starPath(x, 940, 180, 330);
    x.fillStyle = '#1534D1'; starPath(x, 90, 1500, 200);
    x.fillStyle = '#000'; [[70,760],[100,760],[70,790],[130,790],[100,820],[130,820]].forEach(([a, b]) => x.fillRect(a, b, 24, 24));
    x.fillStyle = '#fff'; x.font = '700 46px "DM Sans", sans-serif'; x.fillText('STREETDARE', 72, 130);
    x.fillStyle = '#000'; x.font = '700 40px "DM Sans", sans-serif'; x.fillText(nightDate(n), 72, 300);
    x.fillStyle = '#fff'; x.font = '120px Caprasimo, Georgia, serif';
    const words = nightName(n).split(' '); let line = '', y = 430;
    words.forEach(w => { const tl = line ? line + ' ' + w : w; if (x.measureText(tl).width > 900 && line){ x.fillText(line, 72, y); y += 130; line = w; } else line = tl; });
    x.fillText(line, 72, y);
    const pics = (await Promise.all(n.photos.slice(0, 3).map(p => urls[p] ? loadImg(urls[p]) : null))).filter(Boolean);
    const top = y + 70, bw = (W - 144 - 2 * 18) / 3, bh = 380;
    const tilt = [-3, 2, -1], fills = ['#000', '#fff', '#1534D1'];
    for (let i = 0; i < 3; i++){
      const bx = 72 + i * (bw + 18);
      x.save(); x.translate(bx + bw / 2, top + bh / 2); x.rotate(tilt[i] * Math.PI / 180); x.translate(-(bx + bw / 2), -(top + bh / 2));
      if (pics[i]) cover(x, pics[i], bx, top, bw, bh, 28); else { x.fillStyle = fills[i]; x.beginPath(); x.roundRect(bx, top, bw, bh, 28); x.fill(); }
      x.restore();
    }
    let sy = top + bh + 150;
    const stat = (num, label, col) => { x.fillStyle = col; x.font = '150px Caprasimo, Georgia, serif'; x.fillText(String(num), 72, sy);
      const nw = x.measureText(String(num)).width; x.fillStyle = '#fff'; x.font = '700 52px "DM Sans", sans-serif'; x.fillText(label, 72 + nw + 30, sy - 10); sy += 170; };
    stat(n.people, t('people'), '#FFE32A');
    stat(n.dares, t('dares'), '#000');
    x.fillStyle = '#fff'; x.font = '500 40px "DM Sans", sans-serif'; x.fillText(L === 'hu' ? 'A póló, ami megteszi az első lépést.' : L === 'es' ? 'La camiseta que da el primer paso.' : 'The shirt that makes the first step.', 72, H - 110);
    const tagTxt = '@street.dare'; x.font = '700 46px "DM Sans", sans-serif'; const tw = x.measureText(tagTxt).width;
    x.fillStyle = '#000'; x.beginPath(); x.roundRect(W - 72 - tw - 64, H - 260, tw + 64, 90, 45); x.fill();
    x.fillStyle = '#fff'; x.fillText(tagTxt, W - 72 - tw - 32, H - 200);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const file = new File([blob], 'streetdare-night.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })){
      try{ await navigator.share({ files: [file] }); toast(t('tagTip'), 6000); }catch(e){ if (e && e.name !== 'AbortError') download(blob); }
    } else { download(blob); toast(t('shareFail') + ' ' + t('tagTip'), 7000); }
  }catch(e){ toast(t('err')); }
  if (btn) btn.disabled = false;
}
function download(blob){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'streetdare-night.png'; document.body.appendChild(a); a.click(); a.remove(); }
let toastT = null;
function toast(msg, ms){ const el = $('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms || 2600); }

/* ---------- language ---------- */
if (window.langPicker) langPicker($('lang'), () => L, code => { L = code; setLang(L); route(); });
document.documentElement.lang = L;
load().catch(() => { $('loading').textContent = t('err'); });
