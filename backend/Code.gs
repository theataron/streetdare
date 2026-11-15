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
const SENDER_NAME = 'Aron from Streetdare';
const REPLY_TO    = 'streetdare.official@gmail.com';
const LAUNCH_URL  = '';
const LAUNCH_CODE = 'EARLYDARE';

const MAIL = {
  en: {
    welcomeSubject: 'Welcome to Streetdare 👀',
    welcome: [
      'Hey,',
      'Welcome to the Streetdare community! We\'re really glad you\'re here early.',
      'Most people out at bars and clubs actually want to meet new people, they just don\'t know how to take that first step. That\'s why we\'re creating Streetdare in Madrid: made-to-order streetwear with a live QR code on the back that gives strangers an easy, fun excuse to talk and become friends.',
      'We\'re putting the finishing touches on the first shirts right now. You won\'t get annoying daily emails from us. We\'ll only reach out when the shirts are ready to order, and because you joined the community before launch, we\'ll include an exclusive discount code for you.',
      'See you out there soon,\nAron & the Streetdare crew'
    ],
    launchSubject: 'Streetdare is live - here is your early-community discount 🎟️',
    launch: [
      'Hey,',
      'Thank you for being part of the Streetdare community from the very beginning.',
      'Today, our made-to-order shirts are officially live! Each shirt comes with your personal QR code, your own dashboard to add custom dares, and stats from your nights out.',
      'Because you subscribed before launch, use the code {code} at checkout for €10 off your order. Just make sure to use it within 1 week, before the code expires.',
      'Get your shirt → {url}',
      'See you on the dancefloor,\nAron & the Streetdare crew'
    ]
  },
  es: {
    welcomeSubject: 'Te damos la bienvenida a Streetdare 👀',
    welcome: [
      'Hola:',
      '¡Te damos la bienvenida a la comunidad Streetdare! Nos alegra mucho que hayas llegado tan pronto.',
      'La mayoría de la gente que sale a bares y discotecas en realidad quiere conocer gente nueva, pero no sabe cómo dar el primer paso. Por eso estamos creando Streetdare en Madrid: streetwear hecho por encargo con un QR en la espalda que les da a los desconocidos una excusa fácil y divertida para hablar y hacerse amigos.',
      'Ahora mismo estamos dando los últimos retoques a las primeras camisetas. No vas a recibir emails pesados todos los días. Solo te escribiremos cuando las camisetas se puedan pedir y, como te uniste a la comunidad antes del lanzamiento, incluiremos un código de descuento exclusivo para ti.',
      'Nos vemos pronto por ahí,\nAron y el equipo de Streetdare'
    ],
    launchSubject: 'Streetdare ya está aquí: tu descuento por llegar antes 🎟️',
    launch: [
      'Hola:',
      'Gracias por formar parte de la comunidad Streetdare desde el principio.',
      '¡Hoy salen oficialmente nuestras camisetas hechas por encargo! Cada camiseta viene con tu QR personal, tu propio panel para añadir retos y las estadísticas de tus noches de fiesta.',
      'Como te apuntaste antes del lanzamiento, usa el código {code} al pagar y tendrás 10 € de descuento en tu pedido. Acuérdate de usarlo en el plazo de 1 semana, antes de que caduque.',
      'Consigue tu camiseta → {url}',
      'Nos vemos en la pista,\nAron y el equipo de Streetdare'
    ]
  }
};
function mail(to, lang, kind) {
  const m = MAIL[lang === 'es' ? 'es' : 'en'];
  const body = m[kind].join('\n\n').replace('{code}', LAUNCH_CODE).replace('{url}', LAUNCH_URL);
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
