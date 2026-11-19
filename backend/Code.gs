/**
 * STREETDARE - backend (Google Apps Script, attached to a Google Sheet).
 * Saves email sign-ups, wall messages and scan/quest events into three tabs:
 * "Waitlist", "Wall" and "Events". The tabs are created automatically.
 * To hide a wall message: type anything into its "hidden" column.
 * A message reported by 3 visitors is hidden automatically (hidden = "reported").
 */
/* ----- emails -----
   WELCOME_ON: send the welcome email the moment someone joins the waitlist.
   LAUNCH_URL: the shop link for the launch email. Leave it empty until the shirts are on sale.
   LAUNCH_CODE must also exist as a real discount code in your checkout (EUR 10 off, valid 1 week). */
const WELCOME_ON  = true;
const SENDER_NAME = 'Aron from STREETDARE';
const REPLY_TO    = 'streetdare.official@gmail.com';
const LAUNCH_URL  = '';
const LAUNCH_CODE = 'EARLYDARE';

const MAIL = {
  en: {
    welcomeSubject: 'Welcome to STREETDARE 👀',
    welcome: [
      'Hey,',
      'Welcome to the STREETDARE community! We\'re really glad you\'re here early.',
      'Most people out at bars and clubs actually want to meet new people, they just don\'t know how to take that first step. That\'s why we\'re creating STREETDARE in Madrid: made-to-order streetwear with a live QR code on the back that gives strangers an easy, fun excuse to talk and become friends.',
      'We\'re putting the finishing touches on the first shirts right now. You won\'t get annoying daily emails from us. We\'ll write when the shirts are ready to order (with an exclusive discount code, because you joined before launch), and now and then about new dare decks, features and STREETDARE nights.',
      'See you out there soon,\nAron & the STREETDARE crew'
    ],
    launchSubject: 'STREETDARE is live - here is your early-community discount 🎟️',
    launch: [
      'Hey,',
      'Thank you for being part of the STREETDARE community from the very beginning.',
      'Today, our made-to-order shirts are officially live! Each shirt comes with your personal QR code, your own dashboard to add custom dares, and stats from your nights out.',
      'Because you subscribed before launch, use the code {code} at checkout for €10 off your order. Just make sure to use it within 1 week, before the code expires.',
      'Get your shirt → {url}',
      'See you on the dancefloor,\nAron & the STREETDARE crew'
    ]
  },
  es: {
    welcomeSubject: 'Te damos la bienvenida a STREETDARE 👀',
    welcome: [
      'Hola:',
      '¡Te damos la bienvenida a la comunidad STREETDARE! Nos alegra mucho que hayas llegado tan pronto.',
      'La mayoría de la gente que sale a bares y discotecas en realidad quiere conocer gente nueva, pero no sabe cómo dar el primer paso. Por eso estamos creando STREETDARE en Madrid: streetwear hecho por encargo con un QR en la espalda que les da a los desconocidos una excusa fácil y divertida para hablar y hacerse amigos.',
      'Ahora mismo estamos dando los últimos retoques a las primeras camisetas. No vas a recibir emails pesados todos los días. Te escribiremos cuando las camisetas se puedan pedir (con un código de descuento exclusivo, porque te uniste antes del lanzamiento) y, de vez en cuando, sobre nuevas barajas de retos, funciones y noches STREETDARE.',
      'Nos vemos pronto por ahí,\nAron y el equipo de STREETDARE'
    ],
    launchSubject: 'STREETDARE ya está aquí: tu descuento por llegar antes 🎟️',
    launch: [
      'Hola:',
      'Gracias por formar parte de la comunidad STREETDARE desde el principio.',
      '¡Hoy salen oficialmente nuestras camisetas hechas por encargo! Cada camiseta viene con tu QR personal, tu propio panel para añadir retos y las estadísticas de tus noches de fiesta.',
      'Como te apuntaste antes del lanzamiento, usa el código {code} al pagar y tendrás 10 € de descuento en tu pedido. Acuérdate de usarlo en el plazo de 1 semana, antes de que caduque.',
      'Consigue tu camiseta → {url}',
      'Nos vemos en la pista,\nAron y el equipo de STREETDARE'
    ]
  },
  hu: {
    welcomeSubject: 'Üdv a STREETDARE-ben 👀',
    welcome: [
      'Szia!',
      'Üdv a STREETDARE közösségben! Nagyon örülünk, hogy már az elején itt vagy.',
      'Bulizás közben a legtöbben szívesen megismernének új embereket, csak nem tudják, hogyan tegyék meg az első lépést. Ezért csináljuk a STREETDARE-t: rendelésre készülő streetwear egy QR-kóddal a hátán, ami könnyű és vicces ürügyet ad idegeneknek, hogy szóba álljanak egymással.',
      'Most simítjuk el az utolsó részleteket az első pólókon. Nem fogunk naponta idegesítő e-mailekkel bombázni. Akkor írunk, amikor már rendelhetők a pólók (exkluzív kedvezménykóddal, mert még az indulás előtt csatlakoztál), és néha az új kihíváspaklikról, funkciókról és STREETDARE estékről.',
      'Hamarosan találkozunk,\nÁron és a STREETDARE csapat'
    ],
    launchSubject: 'Elindult a STREETDARE: itt a korai közösségi kedvezményed 🎟️',
    launch: [
      'Szia!',
      'Köszönjük, hogy a kezdetektől a STREETDARE közösség része vagy.',
      'Ma hivatalosan is elindultak a rendelésre készülő pólóink! Mindegyikhez jár a saját QR-kódod, egy saját felület, ahol kihívásokat adhatsz hozzá, és statisztikák a bulis estéidről.',
      'Mivel még az indulás előtt feliratkoztál, a {code} kóddal 10 eurót spórolsz a rendelésednél. Egy hétig érvényes, utána lejár.',
      'Kérem a pólómat → {url}',
      'Találkozunk a táncparketten,\nÁron és a STREETDARE csapat'
    ]
  }
};
/* every email ends with a one-step way out */
const UNSUB = {
  en: 'Don\'t want these emails any more? Just reply "unsubscribe" and we\'ll take you off the list.',
  es: '¿No quieres recibir más emails? Responde «baja» y te quitamos de la lista.',
  hu: 'Nem szeretnél több e-mailt? Válaszolj erre a levélre azzal, hogy „leiratkozom”, és levesszük a listáról.'
};
function mail(to, lang, kind) {
  const L = MAIL[lang] ? lang : 'en', m = MAIL[L];
  const body = m[kind].join('\n\n').replace('{code}', LAUNCH_CODE).replace('{url}', LAUNCH_URL) + '\n\n--\n' + UNSUB[L];
  MailApp.sendEmail(to, m[kind + 'Subject'], body, { name: SENDER_NAME, replyTo: REPLY_TO });
}
/* Run once from the editor after pasting this file: it asks for permission to send email
   and sends the welcome email to yourself so you can see it. */
function testWelcome() { mail(Session.getActiveUser().getEmail(), 'en', 'welcome'); }

/* Run from the editor on launch day. Emails everyone on the Waitlist who has not had the launch
   email yet and writes the date in the "launch_sent" column. Gmail allows about 100 emails a day,
   so with a longer list run it again the next day: it carries on where it stopped. */
function sendLaunchEmail() {
  if (!LAUNCH_URL) throw new Error('Set LAUNCH_URL at the top of this file first.');
  const sh = tab('Waitlist'), rows = sh.getDataRange().getValues();
  if (rows[0][5] !== 'launch_sent') sh.getRange(1, 6).setValue('launch_sent');
  let sent = 0;
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][1] || rows[i][5]) continue;
    if (MailApp.getRemainingDailyQuota() < 1) break;
    mail(String(rows[i][1]), String(rows[i][2]), 'launch');
    sh.getRange(i + 1, 6).setValue(new Date()); sent++;
  }
  Logger.log('Launch emails sent: ' + sent);
}

const TABS = {
  Waitlist: ['created', 'email', 'lang', 'source', 'shirt'],
  Wall:     ['created', 'text', 'ig', 'lang', 'shirt', 'hidden', 'reports'],
  Events:   ['created', 'type', 'shirt', 'quest', 'lang']
};

function tab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  return sh;
}
function clean(v, max) { return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, max); }
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  try {
    if ((e.parameter.fn || '') !== 'getWall') return out({ ok: false, error: 'unknown' });
    const rows = tab('Wall').getDataRange().getValues().slice(1);
    const data = rows.filter(r => r[1] && !r[5]).slice(-50).reverse()
      .map(r => ({ text: String(r[1]), ig: String(r[2] || ''), created: new Date(r[0]).getTime() }));
    return out({ ok: true, data: data });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const now = new Date(), lang = clean(d.lang, 5), shirt = clean(d.shirt, 12);
    if (d.fn === 'joinWaitlist') {
      const email = String(d.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return out({ ok: false, error: 'bad email' });
      const sh = tab('Waitlist');
      const known = sh.getRange(1, 2, Math.max(sh.getLastRow(), 1), 1).getValues().some(r => r[0] === email);
      if (!known) {
        sh.appendRow([now, email, lang, clean(d.source, 30), shirt]);
        if (WELCOME_ON && String(d.source || '').indexOf('stage-') !== 0) { try { mail(email, lang, 'welcome'); } catch (err) {} }
      }
      return out({ ok: true, data: true });
    }
    if (d.fn === 'postMessage') {
      const text = clean(String(d.text || '').trim(), 280);
      if (!text) return out({ ok: false, error: 'empty' });
      const ig = (String(d.ig || '').replace(/^@/, '').match(/^[\w.]{1,30}$/) || [''])[0];
      if (sdHurtful(text) || sdHurtful(ig)) return out({ ok: false, error: 'hurtful' });
      tab('Wall').appendRow([now, text, ig, lang, shirt, '']);
      return out({ ok: true, data: true });
    }
    if (d.fn === 'reportMessage') {
      const sh = tab('Wall'), rows = sh.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (new Date(rows[i][0]).getTime() === Number(d.created) && String(rows[i][1]) === String(d.text)) {
          const n = (Number(rows[i][6]) || 0) + 1;
          sh.getRange(i + 1, 7).setValue(n);
          if (n >= 3 && !rows[i][5]) sh.getRange(i + 1, 6).setValue('reported');
          break;
        }
      }
      return out({ ok: true, data: true });
    }
    if (d.fn === 'logEvent') {
      tab('Events').appendRow([now, clean(d.type, 20), shirt, clean(d.quest, 200), lang]);
      return out({ ok: true, data: true });
    }
    return out({ ok: false, error: 'unknown' });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

/* ===== word filter for the Wall (same list as js/wordfilter.js) ===== */
/* Words that can hurt people (EN/ES/HU), used on the Wall and the dare-idea box.
   Built from backend/username-blocklist.txt, minus everyday words (e.g. "negro" is just "black" in Spanish).
   sub = blocked inside any word, tok = blocked only as a whole word. Digits are read as letters (0=o 1=i 3=e 4=a 5=s 7=t). */
var SD_BAD_SUB = ["anyadat", "arsehole", "asshole", "bastard", "baszd", "baszik", "baszni", "bazdmeg", "bazmeg", "beaner", "bestiality", "bitch", "blowjob", "bollera", "boobs", "buzeral", "buzeran", "buzi", "cabron", "cabrona", "chupamela", "cojones", "culero", "cunt", "dildo", "faggot", "fagot", "fasz", "fogyatekos", "follar", "fuck", "fvck", "geci", "gilipollas", "handjob", "heilhitler", "hentai", "hijodeputa", "hijueputa", "hitler", "horny", "incest", "jihadi", "jizz", "joder", "kkk", "kocsog", "kurva", "kurvaanyad", "leszop", "lotyo", "mamon", "maricon", "mariconazo", "mierda", "milf", "mocskos", "molest", "mongolico", "mongolo", "motherf", "negrata", "nigga", "niggah", "nigger", "nsfw", "nyomorek", "paedo", "pedophil", "pendejo", "penis", "picsa", "porn", "punci", "pussy", "putero", "puticlub", "raghead", "rapist", "retard", "retardalt", "retrasado", "ribanc", "seggfej", "segglyuk", "shemale", "shit", "siegheil", "slut", "subnormal", "sudaca", "szopj", "szopo", "terrorist", "tortillera", "towelhead", "tranny", "travelo", "twat", "vagina", "violador", "wanker", "wetback", "whitepower", "whitepride", "whore", "xxx", "zorra", "zsidozo"];
var SD_BAD_TOK = ["anyad", "chink", "chocho", "cigo", "coon", "culo", "dyke", "fag", "fags", "fck", "fuk", "gook", "hdp", "kike", "kys", "mamada", "marica", "nazi", "paki", "pedo", "pene", "pina", "polla", "puta", "putas", "putita", "puto", "putos", "rape", "spaz", "spic", "szar", "szaros", "verga", "violar"];
function sdHurtful(text){
  const norm = String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = norm.split(/[^a-z0-9@]+/).filter(Boolean);
  const leet = w => w.replace(/[0134578@]/g, c => ({ '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a' })[c]);
  const squashed = norm.replace(/[^a-z0-9@]+/g, '');
  for (const raw of words){
    const w = leet(raw);
    if (SD_BAD_TOK.includes(w) || SD_BAD_TOK.includes(raw)) return true;
    if (SD_BAD_SUB.some(b => w.includes(b))) return true;
  }
  /* spaced-out tricks like "f u c k" or "n.i.g.g.e.r" */
  const sq = leet(squashed);
  return words.filter(w => w.length === 1).length >= 3 && SD_BAD_SUB.concat(SD_BAD_TOK).some(b => b.length >= 3 && sq.includes(b));
}
