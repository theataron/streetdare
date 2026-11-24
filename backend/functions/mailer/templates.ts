// STREETDARE email templates sent by the mailer function: welcome + shirt claimed.
// Same look as the morning recap: cream page, black card, red wordmark, yellow heading.
// Copy rules: warm full sentences, STREETDARE in caps, no prices or discount codes, "Founders' price".

export type L = "en" | "es" | "hu";
export const LANGS: L[] = ["en", "es", "hu"];
export const pickLang = (x: unknown): L => (LANGS.includes(x as L) ? (x as L) : "en");

const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

/* ---------- copy ---------- */
const W: Record<L, Record<string, string | string[]>> = {
  en: {
    subj: "You just made the first step 🔥",
    hi: "Hey {name}, welcome to STREETDARE 👋",
    p1: "Creating an account is a small step, but it’s exactly the kind of step STREETDARE is about: saying yes before you overthink it. We’re really happy you’re here.",
    what: "STREETDARE is a shirt with your own QR code on the back. Whoever scans it gets a dare to do together with you, so starting a conversation with a stranger stops being awkward and starts being fun. We started in Madrid and Budapest.",
    nowH: "Where we are right now:",
    now: [
      "The first shirts are being made, each one to order with its owner’s own QR code.",
      "No shirt yet? With the Shirtless Pass you and your friends can play tonight.",
      "New decks are on the way: Street, Erasmus, Festival and Bachelor Party, plus new dares and features that work with the same shirt.",
    ],
    why: "Being early is worth it: our first members get the Founders’ price when the shirts launch, first access to new decks, and a say in the dares, because you can send us your own ideas.",
    listH: "One more thing",
    list: "The Founders’ price goes to the people on our list. Tap the button to subscribe to STREETDARE emails: we’ll write when the shirts launch, and now and then about new decks, features and events. You can unsubscribe any time.",
    listBtn: "Subscribe to STREETDARE emails",
    listOn: "You’re already on our list ✓ so you won’t miss the launch or the Founders’ price.",
    cta: "Open your profile",
    tip: "Tip: if this landed in Promotions or Updates, drag it to your Primary inbox so the launch email doesn’t get lost.",
    sign: "See you out there,<br>Aron, STREETDARE",
    foot: "You’re getting this one-time email because you just created a STREETDARE account. Questions? Just reply to it.",
  },
  es: {
    subj: "Acabas de dar el primer paso 🔥",
    hi: "Hola {name}, te damos la bienvenida a STREETDARE 👋",
    p1: "Crear una cuenta es un paso pequeño, pero es justo el tipo de paso de lo que va STREETDARE: decir que sí antes de darle demasiadas vueltas. Nos alegra mucho que estés aquí.",
    what: "STREETDARE es una camiseta con tu propio código QR en la espalda. Quien la escanea recibe un reto para hacer contigo, así que empezar a hablar con un desconocido deja de ser incómodo y pasa a ser divertido. Empezamos en Madrid y Budapest.",
    nowH: "Dónde estamos ahora mismo:",
    now: [
      "Ya se están haciendo las primeras camisetas, cada una por encargo con el código QR de su dueño.",
      "¿Aún no tienes camiseta? Con el Shirtless Pass podéis jugar esta noche tú y tus amigos.",
      "Vienen barajas nuevas: Street, Erasmus, Festival y Bachelor Party, además de retos y funciones nuevas que funcionan con la misma camiseta.",
    ],
    why: "Llegar pronto merece la pena: nuestros primeros miembros tendrán el precio de fundador cuando salgan las camisetas, acceso antes que nadie a las barajas nuevas y voz en los retos, porque puedes mandarnos tus propias ideas.",
    listH: "Una cosa más",
    list: "El precio de fundador es para quienes están en nuestra lista. Toca el botón para suscribirte a los emails de STREETDARE: te escribiremos cuando salgan las camisetas y, de vez en cuando, sobre barajas, funciones y eventos nuevos. Puedes darte de baja cuando quieras.",
    listBtn: "Suscribirme a los emails de STREETDARE",
    listOn: "Ya estás en nuestra lista ✓ así que no te perderás el lanzamiento ni el precio de fundador.",
    cta: "Abrir tu perfil",
    tip: "Consejo: si este email te ha llegado a Promociones o Notificaciones, muévelo a Principal para que no se te pierda el del lanzamiento.",
    sign: "Nos vemos por ahí,<br>Aron, STREETDARE",
    foot: "Te llega este único email porque acabas de crear una cuenta en STREETDARE. ¿Dudas? Responde a este email.",
  },
  hu: {
    subj: "Megtetted az első lépést 🔥",
    hi: "Szia {name}, üdv a STREETDARE-ben 👋",
    p1: "Egy fiókot létrehozni kis lépés, de pont az a fajta lépés, amiről a STREETDARE szól: igent mondani, mielőtt túlgondolnád. Nagyon örülünk, hogy itt vagy.",
    what: "A STREETDARE egy póló, aminek a hátán a saját QR-kódod van. Aki beszkenneli, kap egy kihívást, amit veled együtt kell megcsinálnia, így beszélgetést kezdeni egy idegennel nem kínos lesz, hanem szórakoztató. Madridban és Budapesten indultunk.",
    nowH: "Hol tartunk most:",
    now: [
      "Készülnek az első pólók, mindegyik rendelésre, a tulajdonosa saját QR-kódjával.",
      "Még nincs pólód? A Shirtless Passszal a barátaiddal már ma este játszhattok.",
      "Jönnek az új paklik: Street, Erasmus, Festival és Bachelor Party, plusz új kihívások és funkciók, amik ugyanazzal a pólóval működnek.",
    ],
    why: "Megéri korán itt lenni: az első tagjaink alapítói áron kapják meg a pólót induláskor, elsőként férnek hozzá az új paklikhoz, és beleszólhatnak a kihívásokba, mert beküldhetik a saját ötleteiket.",
    listH: "Még egy dolog",
    list: "Az alapítói ár azoknak jár, akik fent vannak a listánkon. A gombbal feliratkozhatsz a STREETDARE e-mailjeire: írunk, amikor kijönnek a pólók, és néha az új paklikról, funkciókról és eseményekről. Bármikor leiratkozhatsz.",
    listBtn: "Feliratkozom a STREETDARE e-mailjeire",
    listOn: "Már fent vagy a listánkon ✓ így nem maradsz le az indulásról és az alapítói árról.",
    cta: "A profilod megnyitása",
    tip: "Tipp: ha ez a levél a Promóciók vagy a Frissítések közé került, húzd át az Elsődleges mappába, hogy az induláskor küldött levél se vesszen el.",
    sign: "Találkozunk odakint,<br>Áron, STREETDARE",
    foot: "Ezt az egyszeri levelet azért kapod, mert most hoztál létre STREETDARE-fiókot. Kérdésed van? Csak válaszolj erre a levélre.",
  },
};

const C: Record<L, Record<string, string | string[]>> = {
  en: {
    subj: "Your STREETDARE shirt is officially yours 🎉",
    hi: "It’s official, {name} 🎉",
    p1: "Your shirt is now linked to your account. From now on, whoever scans the QR on your back sees your name and gets a dare to do with you.",
    setH: "Get it ready for its first night out:",
    set: [
      "📸 <b>Add a photo</b>, so people know they found the right person.",
      "🔐 <b>Your dare code is {code}.</b> When you both say yes to a dare, give it to the person who scanned you. That’s what makes the dare count, and it unlocks your Instagram for them.",
      "✍️ <b>Write up to 10 dares of your own.</b> They show up as “Dare by {name}”.",
      "📲 <b>Add your Instagram</b> if you want people to find you again. It only shows up after a dare you’ve done together.",
    ],
    recap: "The morning after a night out we’ll send you a short recap: how many people scanned you, how many dares you did and the last one. You can switch it off in your profile.",
    cta: "Set up your shirt",
    no: "You can always say no to a dare in person, no explanation needed. Have an amazing first night 🙌",
    sign: "Aron, STREETDARE",
    foot: "You’re getting this because a STREETDARE shirt was just linked to your account. If that wasn’t you, reply to this email.",
  },
  es: {
    subj: "Tu camiseta STREETDARE ya es oficialmente tuya 🎉",
    hi: "Ya es oficial, {name} 🎉",
    p1: "Tu camiseta ya está vinculada a tu cuenta. A partir de ahora, quien escanee el QR de tu espalda verá tu nombre y recibirá un reto para hacer contigo.",
    setH: "Déjala lista para su primera noche:",
    set: [
      "📸 <b>Pon una foto</b>, para que sepan que han encontrado a la persona correcta.",
      "🔐 <b>Tu código de reto es {code}.</b> Cuando los dos digáis que sí a un reto, dáselo a quien te ha escaneado. Así el reto cuenta y se le desbloquea tu Instagram.",
      "✍️ <b>Escribe hasta 10 retos propios.</b> Salen como “Reto de {name}”.",
      "📲 <b>Añade tu Instagram</b> si quieres que te vuelvan a encontrar. Solo se muestra después de un reto que hayáis hecho juntos.",
    ],
    recap: "La mañana después de salir te mandaremos un resumen corto: cuánta gente te escaneó, cuántos retos hiciste y el último. Puedes desactivarlo en tu perfil.",
    cta: "Configurar tu camiseta",
    no: "Siempre puedes decir que no a un reto en persona, sin dar explicaciones. Que tengas una primera noche increíble 🙌",
    sign: "Aron, STREETDARE",
    foot: "Te llega porque se acaba de vincular una camiseta STREETDARE a tu cuenta. Si no has sido tú, responde a este email.",
  },
  hu: {
    subj: "A STREETDARE pólód hivatalosan a tiéd 🎉",
    hi: "Hivatalos, {name} 🎉",
    p1: "A pólód mostantól a fiókodhoz tartozik. Aki ezután beszkenneli a hátadon a QR-kódot, a nevedet látja, és kap egy kihívást, amit veled együtt csinálhat meg.",
    setH: "Készítsd fel az első estéjére:",
    set: [
      "📸 <b>Tölts fel egy fotót</b>, hogy tudják, a jó embert találták meg.",
      "🔐 <b>A kihíváskódod: {code}.</b> Amikor mindketten igent mondtok egy kihívásra, add meg annak, aki beszkennelt. Ettől számít a kihívás, és ezzel oldódik fel neki az Instagramod.",
      "✍️ <b>Írj akár 10 saját kihívást.</b> Úgy jelennek meg, hogy „{name} kihívása”.",
      "📲 <b>Add meg az Instagramodat</b>, ha szeretnéd, hogy újra megtaláljanak. Csak egy közösen megcsinált kihívás után jelenik meg.",
    ],
    recap: "Egy esti buli utáni reggelen küldünk egy rövid összefoglalót: hányan szkenneltek be, hány kihívást csináltál meg, és melyik volt az utolsó. A profilodban kikapcsolhatod.",
    cta: "Állítsd be a pólódat",
    no: "Egy kihívásra személyesen mindig mondhatsz nemet, magyarázkodás nélkül. Legyen fantasztikus az első estéd 🙌",
    sign: "Áron, STREETDARE",
    foot: "Azért kapod, mert most egy STREETDARE pólót kapcsoltak a fiókodhoz. Ha nem te voltál, válaszolj erre a levélre.",
  },
};

/* ---------- layout ---------- */
const btn = (href: string, label: string, bg = "#DA3030") =>
  `<p style="text-align:center;margin:22px 0 8px"><a href="${href}" style="display:inline-block;background:${bg};color:${bg === "#FFE32A" ? "#000" : "#fff"};font:700 16px Arial,sans-serif;text-decoration:none;padding:15px 28px;border-radius:99px">${esc(label)}</a></p>`;
const P = (h: string, color = "#eee") => `<p style="font:16px/1.5 Arial,sans-serif;margin:0 0 14px;color:${color}">${h}</p>`;
const list = (items: string[]) =>
  `<ul style="margin:0 0 14px;padding:0 0 0 20px;font:15px/1.5 Arial,sans-serif;color:#eee">${items.map((i) => `<li style="margin:0 0 8px">${i}</li>`).join("")}</ul>`;

function page(heading: string, inner: string, after: string, foot: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f5f1e8">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;font-family:Arial,sans-serif">
    <div style="background:#000;border-radius:26px;padding:28px 22px;color:#fff">
      <div style="font:900 22px Arial,sans-serif;color:#DA3030;letter-spacing:1px">STREETDARE</div>
      <h1 style="font:900 27px/1.18 Arial,sans-serif;color:#FFE32A;margin:18px 0 12px">${heading}</h1>
      ${inner}
    </div>
    ${after}
    <p style="font:12px/1.5 Arial,sans-serif;color:#777;text-align:center;margin-top:18px">${foot}</p>
  </div></body></html>`;
}

export type Mail = { subject: string; html: string; text: string };
const strip = (h: string) => h.replace(/<br>/g, "\n").replace(/<\/(p|li|h1|div)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\n{3,}/g, "\n\n").trim();

export function welcome(lang: L, v: { name: string; optedIn: boolean }): Mail {
  const t = W[lang], name = esc(v.name || "");
  const hi = name ? fill(t.hi as string, { name }) : (t.hi as string).replace(" {name},", ",").replace("{name}", "");
  const inner = P(esc(t.p1 as string)) + P(esc(t.what as string)) +
    `<p style="font:700 15px Arial,sans-serif;margin:18px 0 8px;color:#FFE32A">${esc(t.nowH as string)}</p>` + list((t.now as string[]).map(esc)) +
    P(esc(t.why as string), "#fff");
  const listBox = v.optedIn
    ? `<div style="background:#fff;border-radius:20px;padding:18px 18px;margin:18px 0 0;font:15px/1.5 Arial,sans-serif;color:#111;text-align:center">${esc(t.listOn as string)}</div>`
    : `<div style="background:#FFE32A;border-radius:20px;padding:20px 18px;margin:18px 0 0;color:#000">
        <div style="font:900 18px Arial,sans-serif;margin:0 0 8px">${esc(t.listH as string)}</div>
        <p style="font:15px/1.5 Arial,sans-serif;margin:0">${esc(t.list as string)}</p>
        ${btn("https://streetdare.com/me/#emails", t.listBtn as string, "#000")}
      </div>`;
  const after = listBox + (v.optedIn ? btn("https://streetdare.com/me/", t.cta as string) : "") +
    `<p style="font:14px/1.5 Arial,sans-serif;color:#222;text-align:center;margin:18px 8px 0">${t.sign}</p>
     <p style="font:13px/1.5 Arial,sans-serif;color:#555;text-align:center;margin:14px 8px 0">${esc(t.tip as string)}</p>`;
  const html = page(hi, inner, after, esc(t.foot as string));
  return { subject: t.subj as string, html, text: strip(html) };
}

export function claimed(lang: L, v: { name: string; shirt: string; code: string }): Mail {
  const t = C[lang], name = esc(v.name || "STREETDARE");
  const vals = { name, shirt: esc(v.shirt), code: `<span style="font-family:monospace;font-size:17px;color:#FFE32A;letter-spacing:2px">${esc(v.code || "····")}</span>` };
  const inner = P(fill(t.p1 as string, vals)) +
    `<p style="font:700 15px Arial,sans-serif;margin:18px 0 8px;color:#FFE32A">${esc(t.setH as string)}</p>` +
    list((t.set as string[]).map((s) => fill(s, vals))) + P(esc(t.recap as string), "#ccc");
  const after = btn("https://streetdare.com/me/", t.cta as string) +
    `<p style="font:15px/1.5 Arial,sans-serif;color:#222;text-align:center;margin:10px 8px 0">${esc(t.no as string)}</p>
     <p style="font:14px/1.5 Arial,sans-serif;color:#222;text-align:center;margin:14px 8px 0">${esc(t.sign as string)}</p>`;
  const html = page(fill(t.hi as string, { name }), inner, after, esc(t.foot as string));
  return { subject: t.subj as string, html, text: strip(html) };
}
