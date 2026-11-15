/* ===== STREETDARE - STAGE preview (streetdare.com/stage/)
   How the site will look once the shirts are on sale. Nothing links here, and the pages carry
   "noindex", so search engines skip it. Scan stats are not recorded from here.
   Load this file right after js/text.js: it switches on stage mode and swaps in the "live" words. ===== */
window.STAGE = true;

/* ----- prices (euros, IVA included). Change them here and the whole stage site follows. ----- */
const PRICES = {
  shirt: 45,        /* one shirt, free shipping, 3 dare packs included */
  pass: 4.99,       /* Digital Pass: one night of dares on the phone, comes off the shirt later */
  groupStep: 1,     /* every extra person in a group takes this much off EVERY shirt… */
  groupFloor: 35,   /* …but never below this price per shirt */
  groupMin: 2, groupMax: 40, groupStart: 4
};
/* price per shirt for a group of n people */
const groupEach = n => Math.max(PRICES.groupFloor, PRICES.shirt - PRICES.groupStep * (n - 1));

/* ----- checkout: paste Stripe Payment Links here when they exist. Empty = shows a "stage preview" note. ----- */
const CHECKOUT = { shirt: '', pass: '', group: '' };

const SIZES = ['XS','S','M','L','XL','XXL','3XL'];

Object.assign(T.en, {
  hKicker: "Drop 01 · Live in Madrid",
  ctaList: "Get your shirt - €45",
  ctaQ: "Want to be the one daring people?",
  mClub: "Get your shirt 👕",
  mClubS: "The shirt, the Digital Pass and group prices",
  clKicker: "What’s live, what’s next",
  clTitle: "The Streetdare drop",
  clIntro: "The shirt, the Digital Pass and group packs of any size are live. Dare packs are next.",
  tagFirst: "Live now",
  c2h: "Digital Pass",
  c2t: "No shirt? No problem.",
  c2p: "€4.99 for one night of dares on your phone, for you and your friends. Walk up to strangers, do them, and compare who did the most. Buy a shirt later and the €4.99 comes off.",
  c3p: "Shirts for a crew of any size - festivals, trips, birthdays, bachelor parties. Every extra person takes €1 off everyone’s shirt, down to €35 each.",
  g4h: "3 dare packs included",
  g4p: "Erasmus, Spicy, Festival or Madrid - pick your three. More packs on the way.",
  seePlan: "Shirt, Pass and group prices →",
  abCta: "Get your shirt 👕",
  fComing: "Shop",
  q4: "Can I play without the shirt?",
  a4: "Yes. The Digital Pass is €4.99 for a night of dares on your phone - and it comes off the shirt if you buy one later.",
  q5: "How much is it?",
  a5: "The shirt is €45 with free shipping, ships in 3-5 working days and comes with 3 dare packs. Groups pay less: every extra person takes €1 off everyone’s shirt, down to €35 each.",
  pitchP: "Get your own Streetdare shirt: your QR, your dares, your night. €45, free shipping, 3 dare packs included.",
  pitchCta: "Get your own shirt - €45 →",
  passCta: "Or play tonight: Digital Pass €4.99",
  shopKicker: "Drop 01",
  shopH: "Get your Streetdare",
  shopColor: "Colour",
  shopBlack: "Black",
  shopWhite: "White",
  shopSize: "Size",
  shopShip: "Free shipping · ships in 3-5 working days",
  shopIncl: "Oversized unisex tee · your own QR on the back · 3 dare packs included",
  shopBuy: "Buy the shirt - {p}",
  shopPickSize: "Pick your size first ☝️",
  shopOr: "or",
  passH: "No shirt? Digital Pass",
  passP: "One night of dares on your phone, for you and your crew. The €4.99 comes off your shirt if you buy one later.",
  passBuy: "Get the pass - €4.99",
  grpH: "Bringing the whole crew?",
  grpP: "Every friend you add takes €1 off everyone’s shirt - down to €35 each.",
  grpPeople: "people",
  grpEach: "per shirt",
  grpTotal: "total",
  grpSave: "Your crew saves {s} 🔥",
  grpFloor: "Best price unlocked 👑",
  grpBuy: "Buy {n} shirts - {t}",
  grpNote: "You pick everyone’s colour and size at checkout.",
  shopToast: "Stage preview - checkout isn’t connected yet.",
  stageTag: "stage preview"
});
Object.assign(T.es, {
  hKicker: "Drop 01 · Ya en Madrid",
  ctaList: "Consigue tu camiseta - 45 €",
  ctaQ: "¿Quieres ser quien reta a la gente?",
  mClub: "Consigue tu camiseta 👕",
  mClubS: "La camiseta, el Digital Pass y precios para grupos",
  clKicker: "Lo que ya está y lo que viene",
  clTitle: "El drop de Streetdare",
  clIntro: "La camiseta, el Digital Pass y los packs para grupos de cualquier tamaño ya están aquí. Lo siguiente: packs de retos.",
  tagFirst: "Ya disponible",
  c2h: "Digital Pass",
  c2t: "¿Sin camiseta? Sin problema.",
  c2p: "4,99 € por una noche de retos en tu móvil, para ti y tus amigos. Acercaos a desconocidos, hacedlos y comparad quién ha hecho más. Si luego compras la camiseta, te descontamos los 4,99 €.",
  c3p: "Camisetas para un grupo del tamaño que sea - festivales, viajes, cumpleaños, despedidas. Cada persona extra quita 1 € a la camiseta de todos, hasta 35 € cada una.",
  g4h: "3 packs de retos incluidos",
  g4p: "Erasmus, Picante, Festival o Madrid - elige tres. Vienen más packs.",
  seePlan: "Camiseta, Pass y precios para grupos →",
  abCta: "Consigue tu camiseta 👕",
  fComing: "Tienda",
  q4: "¿Puedo jugar sin la camiseta?",
  a4: "Sí. El Digital Pass cuesta 4,99 € por una noche de retos en tu móvil - y te lo descontamos si luego compras la camiseta.",
  q5: "¿Cuánto cuesta?",
  a5: "La camiseta cuesta 45 € con envío gratis, se envía en 3-5 días laborables e incluye 3 packs de retos. Los grupos pagan menos: cada persona extra quita 1 € a la camiseta de todos, hasta 35 € cada una.",
  pitchP: "Consigue tu propia camiseta Streetdare: tu QR, tus retos, tu noche. 45 €, envío gratis, 3 packs de retos incluidos.",
  pitchCta: "Consigue tu camiseta - 45 € →",
  passCta: "O juega esta noche: Digital Pass 4,99 €",
  shopKicker: "Drop 01",
  shopH: "Hazte con tu Streetdare",
  shopColor: "Color",
  shopBlack: "Negra",
  shopWhite: "Blanca",
  shopSize: "Talla",
  shopShip: "Envío gratis · se envía en 3-5 días laborables",
  shopIncl: "Camiseta oversized unisex · tu propio QR en la espalda · 3 packs de retos incluidos",
  shopBuy: "Comprar la camiseta - {p}",
  shopPickSize: "Elige tu talla primero ☝️",
  shopOr: "o",
  passH: "¿Sin camiseta? Digital Pass",
  passP: "Una noche de retos en tu móvil, para ti y tu grupo. Si luego compras la camiseta, te descontamos los 4,99 €.",
  passBuy: "Conseguir el pass - 4,99 €",
  grpH: "¿Venís todo el grupo?",
  grpP: "Cada amigo que añades quita 1 € a la camiseta de todos - hasta 35 € cada una.",
  grpPeople: "personas",
  grpEach: "por camiseta",
  grpTotal: "total",
  grpSave: "Tu grupo se ahorra {s} 🔥",
  grpFloor: "Mejor precio desbloqueado 👑",
  grpBuy: "Comprar {n} camisetas - {t}",
  grpNote: "Eliges el color y la talla de cada persona al pagar.",
  shopToast: "Vista previa (stage) - el pago aún no está conectado.",
  stageTag: "vista previa"
});

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
