/* ===== STREETDARE - STAGE preview (streetdare.com/stage/)
   How the site will look once the shirts are on sale. Nothing links here, and the pages carry
   "noindex", so search engines skip it. Scan stats are not recorded from here.
   Load this file right after js/text.js: it switches on stage mode and swaps in the "live" words. ===== */
window.STAGE = true;

/* ----- prices (euros, IVA included). The numbers below drive the shop's calculations.
   The same prices are also written inside the sentences further down - change both. ----- */
const PRICES = {
  shirt: 39,          /* one made-to-order shirt, free shipping */
  pass: 5,            /* Shirtless Pass: 24 h of dares on the phone, per person */
  packs: 3,           /* dare packs included with every shirt */
  pack: 3.99,         /* each extra dare pack (placeholder price) */
  refOff: 10,         /* off your own shirt after scanning someone's, for REF_HOURS (js/common.js) */
  /* group tiers: [from this many shirts, price per shirt] (placeholder prices) */
  tiers: [[3, 37], [5, 36], [8, 35]],
  groupMin: 3, groupMax: 40, groupStart: 4
};
/* price per shirt for a group of n people */
const groupEach = n => PRICES.tiers.reduce((p, [from, each]) => n >= from ? each : p, PRICES.shirt);

/* ----- checkout: paste Stripe Payment Links here when they exist. Empty = shows a "stage preview" note. ----- */
const CHECKOUT = { shirt: '', pass: '', group: '' };

const SIZES = ['XS','S','M','L','XL','XXL','3XL'];

Object.assign(T.en, {
  devilNote: "Adds the bolder dares on top of the party deck. Free on every shirt.",
  hKicker: "Now live · Madrid",
  ctaList: "Get your shirt - €39",
  ctaQ: "Want your own shirt and dares?",
  mClub: "Get your shirt 👕",
  mClubS: "The shirt, the Shirtless Pass and squad packs",
  clIntro: "We’re building a community of people who actually want to connect, on a night out and in everyday life. The shirt, dare packs, the Shirtless Pass and squad packs are live in Madrid, and real-world meetups and local events come next.",
  tagFirst: "Live now",
  g4h: "Free shipping",
  g4p: "Every shirt is printed for you and ships in 3-5 working days.",
  seePlan: "Shirt, Pass and squad prices →",
  abCta: "Get your shirt 👕",
  fComing: "Shop",
  a4: "Yes. The Shirtless Pass is a €5 pass for 24 hours that lets you and your friends play from your phones and compete on a live leaderboard.",
  q5: "How much is it?",
  a5: "A shirt is €39 with free shipping, and it’s made to order with your own QR, so it ships in 3-5 working days. Groups of 3 or more pay less per shirt, and the Shirtless Pass is €5 if you’d rather play without one.",
  q7: "What do I get for scanning someone’s shirt?",
  a7: "If you scan a STREETDARE shirt, you get €10 off your own for the next 6 hours. And when someone who scanned your shirt buys one, you get an extra dare pack for free.",
  c4p: "Themed decks for every kind of day and night: Street, Erasmus, Festival and Madrid, with more on the way. Every shirt comes with your pick of three, and extra packs are €3.99 each.",
  pitchP: "Every shirt is made to order with your own QR and your own dares. It’s €39 with free shipping.",
  pitchCta: "Get your own shirt →",
  passCta: "Or play today with the Shirtless Pass for €5",
  refLine: "Because you scanned {name}’s shirt, you get €10 off your own for the next {time}.",
  refAnon: "a STREETDARE",
  shopKicker: "Made to order",
  shopH: "Get your STREETDARE",
  shopColor: "Colour",
  shopBlack: "Black",
  shopWhite: "White",
  shopSize: "Size",
  shopShip: "Free shipping · ships in 3-5 working days",
  shopIncl: "An oversized unisex tee, printed just for you with your own QR. It comes with your pick of three dare packs (Street, Erasmus, Festival or Madrid), and you can add your own dares.",
  shopBuy: "Buy the shirt - {p}",
  shopPickSize: "Pick your size first ☝️",
  shopOr: "or",
  passH: "No shirt? Shirtless Pass",
  passP: "A day pass on your phone, so you and your friends can approach strangers and compete on a live leaderboard.",
  passBuy: "Get the Shirtless Pass - €5",
  grpH: "Squad packs",
  grpP: "Group discounts start at 3 shirts and get better as the group grows: €37 each for 3 or more, €36 for 5 or more and €35 for 8 or more. Every group gets a shared scoreboard.",
  grpPeople: "people",
  grpEach: "per shirt",
  grpTotal: "total",
  grpSave: "Your squad saves {s} 🔥",
  grpNext: "Add {k} more and everyone pays {p}.",
  grpBest: "That’s the best squad price 👑",
  grpBuy: "Buy {n} shirts - {t}",
  grpNote: "You pick everyone’s colour and size at checkout.",
  shopToast: "Stage preview - checkout isn’t connected yet.",
  stageTag: "stage preview"
});
Object.assign(T.es, {
  devilNote: "Añade los retos más atrevidos a la baraja de fiesta. Gratis en todas las camisetas.",
  hKicker: "Ya disponible · Madrid",
  ctaList: "Consigue tu camiseta - 39 €",
  ctaQ: "¿Quieres tu propia camiseta y retos?",
  mClub: "Consigue tu camiseta 👕",
  mClubS: "La camiseta, el Shirtless Pass y los squad packs",
  clIntro: "Estamos creando una comunidad de gente que de verdad quiere conectar, de fiesta y en el día a día. La camiseta, los packs de retos, el Shirtless Pass y los squad packs ya están disponibles en Madrid, y después vendrán quedadas reales y eventos locales.",
  tagFirst: "Ya disponible",
  g4h: "Envío gratis",
  g4p: "Cada camiseta se imprime para ti y se envía en 3-5 días laborables.",
  seePlan: "Precios de camiseta, Pass y squad →",
  abCta: "Consigue tu camiseta 👕",
  fComing: "Tienda",
  a4: "Sí. El Shirtless Pass es un pase de 24 horas por 5 € para que tú y tus amigos juguéis desde el móvil y compitáis en un marcador en directo.",
  q5: "¿Cuánto cuesta?",
  a5: "La camiseta cuesta 39 € con envío gratis y se hace por encargo con tu propio QR, así que se envía en 3-5 días laborables. Los grupos de 3 o más pagan menos por camiseta, y el Shirtless Pass cuesta 5 € si prefieres jugar sin camiseta.",
  q7: "¿Qué gano por escanear la camiseta de alguien?",
  a7: "Si escaneas una camiseta STREETDARE, tienes 10 € de descuento en la tuya durante las 6 horas siguientes. Y cuando alguien que escaneó tu camiseta compra una, te llevas gratis un pack de retos extra.",
  c4p: "Barajas temáticas para cada momento, de día y de noche: Street, Erasmus, Festival y Madrid, con más en camino. Cada camiseta incluye los tres que tú elijas, y los packs extra cuestan 3,99 € cada uno.",
  pitchP: "Cada camiseta se hace por encargo con tu propio QR y tus propios retos. Cuesta 39 € con envío gratis.",
  pitchCta: "Consigue tu camiseta →",
  passCta: "O juega hoy con el Shirtless Pass por 5 €",
  refLine: "Por haber escaneado la camiseta de {name}, tienes 10 € de descuento en la tuya durante {time}.",
  refAnon: "STREETDARE",
  shopKicker: "Hecha por encargo",
  shopH: "Hazte con tu STREETDARE",
  shopColor: "Color",
  shopBlack: "Negra",
  shopWhite: "Blanca",
  shopSize: "Talla",
  shopShip: "Envío gratis · se envía en 3-5 días laborables",
  shopIncl: "Una camiseta oversized unisex, impresa solo para ti con tu propio QR. Incluye los tres packs de retos que tú elijas (Street, Erasmus, Festival o Madrid), y puedes añadir tus propios retos.",
  shopBuy: "Comprar la camiseta - {p}",
  shopPickSize: "Elige tu talla primero ☝️",
  shopOr: "o",
  passH: "¿Sin camiseta? Shirtless Pass",
  passP: "Un pase de un día en tu móvil, para que tú y tus amigos os acerquéis a desconocidos y compitáis en un marcador en directo.",
  passBuy: "Conseguir el Shirtless Pass - 5 €",
  grpH: "Squad packs",
  grpP: "Los descuentos de grupo empiezan con 3 camisetas y mejoran según crece el grupo: 37 € cada una a partir de 3, 36 € a partir de 5 y 35 € a partir de 8. Cada grupo tiene un marcador compartido.",
  grpPeople: "personas",
  grpEach: "por camiseta",
  grpTotal: "total",
  grpSave: "Tu squad se ahorra {s} 🔥",
  grpNext: "Añade {k} más y todos pagáis {p}.",
  grpBest: "Ese es el mejor precio de squad 👑",
  grpBuy: "Comprar {n} camisetas - {t}",
  grpNote: "Eliges el color y la talla de cada persona al pagar.",
  shopToast: "Vista previa (stage) - el pago aún no está conectado.",
  stageTag: "vista previa"
});

/* the scanner's perk: who they scanned and how long the discount still lasts (null when there is none) */
function refPerk(){
  const r = refGet(); if (!r || r.left <= 0) return null;
  const m = Math.ceil(r.left / 60000), h = Math.floor(m / 60);
  const name = (typeof SHIRTS !== 'undefined' && SHIRTS[r.id] && SHIRTS[r.id].name) || null;
  return { name, time: (h ? h + ' h ' : '') + (m % 60) + ' min' };
}
function refText(){
  const p = refPerk(); if (!p) return '';
  return p.name ? t('refLine').replace('{name}', p.name).replace('{time}', p.time)
                : t('refLine').replace(LANG === 'es' ? 'la camiseta de {name}' : '{name}’s shirt', LANG === 'es' ? 'una camiseta STREETDARE' : 'a STREETDARE shirt').replace('{time}', p.time);
}

/* euros, written the way each language writes them */
function eur(v){
  const r = Math.round(v * 100) / 100, s = Number.isInteger(r) ? String(r) : r.toFixed(2);
  return LANG === 'es' ? s.replace('.', ',') + ' €' : '€' + s;
}
/* a small message at the bottom of the screen */
function toast(msg){
  let el = document.getElementById('toast');
  if (!el){ el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 3200);
}
function checkout(kind){
  const url = CHECKOUT[kind];
  if (url){ location.href = url; return; }
  toast(t('shopToast'));
}
