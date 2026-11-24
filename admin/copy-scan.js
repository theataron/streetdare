/* ===== STREETDARE admin - reading every string on the site =====
   This works out, for each piece of copy on the site:
     - which page it shows up on,
     - whereabouts in that page, so a review can run from the top of the page to the bottom,
     - which part of the page it belongs to (the heading it sits under),
     - what it is: a heading, a button, body text, a placeholder,
     - and the English, Spanish and Hungarian wording.

   It reads the site's own live files rather than a list kept somewhere else, so it can never
   fall out of step with the site and nothing has to be rebuilt after a copy change.

   There are two kinds of page:
     - Home and /p share js/text.js and name their keys in the HTML as data-i18n="key".
       The HTML gives the order and the section, text.js gives the wording.
     - /me, /pass, /contact, /login and 404 each carry their own T block and paint
       themselves from JavaScript. Most of their strings still land in an element whose id
       is the key, so the real page gives us the order there too; the rest (toasts, errors,
       anything built on the fly) come after, noting which function shows them.
*/

/* the pages, in the order they should be reviewed */
export const GROUPS = [
  { id:'home',     source:'text',    label:'Home page',                  path:'/',         kind:'markup' },
  { id:'scan',     source:'text',    label:'Scan page (/p)',             path:'/p/',       kind:'markup' },
  { id:'textrest', source:'text',    label:'Scan flow, shown from code', path:null,        kind:'leftover' },
  { id:'me',       source:'me',      label:'Profile (/me)',              path:'/me/',      kind:'inline' },
  { id:'pass',     source:'pass',    label:'Shirtless Pass (/pass)',     path:'/pass/',    kind:'inline' },
  { id:'contact',  source:'contact', label:'Contact',                    path:'/contact/', kind:'inline' },
  { id:'login',    source:'login',   label:'Log in',                     path:'/login/',   kind:'inline' },
  { id:'e404',     source:'e404',    label:'404 page',                   path:'/404.html', kind:'inline' },
];

/* friendlier names for the functions inside the pages that paint themselves */
const FN_NAMES = {
  paint:'Page text', paintStats:'Your shirt live', paintDares:'Your own dares',
  paintDecks:'Decks', paintProfile:'Your profile', paintLangs:'Language',
  paintLobby:'The lobby', paintCoach:'First-time tips', paintPfPhoto:'Your photo',
  paintCountry:'Country', paintSetup:'Set-up checklist', paintPush:'Notifications',
  renderDare:'The dare', renderNight:'The night', renderMsgs:'The group chat',
  renderPhotos:'Photos', sdBubble:'Chat bubbles', hub:'The hub', loadCode:'Your dare code'
};

/* ---------- reading a T block out of a file ---------- */

/* Pull out the {...} after a declaration by counting braces, so nested objects and braces
   inside strings don't throw it off. */
function objectAfter(src, declRe) {
  const m = declRe.exec(src);
  if (!m) return null;
  let i = src.indexOf('{', m.index + m[0].length - 1);
  if (i < 0) return null;
  const start = i;
  let depth = 0, q = null, esc = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) return src.slice(start, i + 1); }
  }
  return null;
}

/* Our own first-party files, so the object literal can simply be evaluated. That gets
   escapes, HTML and apostrophes right where a regex would quietly mangle them. */
function literal(code) {
  try {
    return new Function('"use strict";return (' + code + ');')();
  } catch (e) { return null; }
}

const T_DECL = /\b(?:const|let|var)\s+T\s*=\s*/;
const threeLangs = o => ({ en:(o && o.en) || {}, es:(o && o.es) || {}, hu:(o && o.hu) || {} });

/* js/text.js: const T = { en:{...}, es:{...}, hu:{...} } */
export function parseTextJs(src) {
  return threeLangs(literal(objectAfter(src, T_DECL)));
}

/* a page carrying its own const T = { en:{...}, ... } inside its script */
export function parseInlinePage(html) {
  return threeLangs(literal(objectAfter(html, T_DECL)));
}

/* Dictionaries nest: the contact page keeps its topic labels in topics:{...}. Flatten those
   to dotted keys ("topics.player") so every string gets reviewed and an override can be
   written back to the same spot. Objects keep their keys in source order, so the flattened
   order is the order they were written in. */
export function flatten(obj, prefix) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const k of Object.keys(obj)) {
    const v = obj[k], key = prefix ? prefix + '.' + k : k;
    if (typeof v === 'string') out[key] = v;
    else if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
  }
  return out;
}

/* which function paints each key, as a hint about where it turns up */
export function usageSections(html) {
  const out = {}, marks = [];
  let m;
  const fnRe = /function\s+([A-Za-z0-9_]+)\s*\(/g;
  while ((m = fnRe.exec(html))) marks.push({ at:m.index, name:m[1] });
  const useRe = /\bt\(\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]/g;
  while ((m = useRe.exec(html))) {
    const key = m[1];
    if (out[key]) continue;
    let name = null;
    for (const mk of marks) if (mk.at < m.index) name = mk.name;
    if (name) out[key] = name;
  }
  return out;
}

/* ---------- where a string sits in a page ---------- */

/* Every container above an element that has an id, nearest first. On /pass the nearest one
   is the screen a string belongs to, which keeps a heading from one screen off another
   screen's strings; the rest of the chain lets a section heading still count. */
function ownerChain(el) {
  const out = [];
  let n = el && el.parentElement;
  while (n && n.tagName) {
    if (n.id) out.push(n.id);
    n = n.parentElement;
  }
  return out;
}
const ownerOf = el => ownerChain(el)[0] || '';

/* a container id used as a label, tidied up: "v-wall" -> "Wall", "shirtArea" -> "Shirt area" */
function prettyId(id) {
  if (!id) return 'Page';
  const s = id.replace(/^v-/, '').replace(/[-_]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Page';
}

function kindOf(el, isPlaceholder) {
  if (isPlaceholder) return 'placeholder';
  const tag = (el.tagName || '').toLowerCase();
  const cls = (el.className && String(el.className)) || '';
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'button') return 'button';
  if (tag === 'a') return /\bbtn\b/.test(cls) ? 'button' : 'link';
  if (tag === 'small') return 'small print';
  if (tag === 'label') return 'label';
  if (/\b(kicker|lbl)\b/.test(cls)) return 'label';
  return 'text';
}

/* One pass down the document: every element's position, every heading, and which container
   each one belongs to. Used by both kinds of page. */
function mapDocument(doc) {
  const headings = [], at = new Map(), byId = new Map();
  let i = 0;
  for (const el of Array.from(doc.querySelectorAll('*'))) {
    i++;
    at.set(el, i);
    const tag = (el.tagName || '').toLowerCase();
    if (/^h[1-3]$/.test(tag)) {
      const txt = (el.textContent || '').trim();
      // /me and /pass leave their headings empty and fill them from JavaScript, where the
      // element's id is the key, so that id names the heading just as well
      headings.push({
        at: i,
        text: txt ? txt.slice(0, 60) : '',
        key: (el.getAttribute && el.getAttribute('data-i18n')) || el.id || '',
        owner: ownerOf(el)
      });
    }
    if (el.id && !byId.has(el.id)) byId.set(el.id, el);
  }
  return { headings, at, byId };
}

/* the heading a string sits under, as long as both are inside the same container */
function sectionFor(map, el) {
  const pos = map.at.get(el) || 0, chain = ownerChain(el);
  let best = null;
  for (const h of map.headings) {
    if (h.at >= pos) break;
    if (!h.owner || chain.indexOf(h.owner) >= 0) best = h;
  }
  if (best && best.text) return { label:best.text, fromKey:false };
  if (best && best.key)  return { label:best.key,  fromKey:true  };
  return { label: prettyId(chain[0]), fromKey:false };
}

/* pages that name their keys in the HTML */
export function scanMarkup(html, parseDom) {
  const doc = parseDom(html);
  const map = mapDocument(doc);
  const items = [];
  let n = 0;
  for (const el of Array.from(doc.querySelectorAll('[data-i18n],[data-i18n-ph]'))) {
    for (const attr of ['data-i18n', 'data-i18n-ph']) {
      const key = el.getAttribute(attr);
      if (!key) continue;
      const sec = sectionFor(map, el);
      items.push({
        key, order:n++,
        kind: kindOf(el, attr === 'data-i18n-ph'),
        section: sec.label, sectionFromKey: sec.fromKey, detail:'',
        hidden: !!(el.closest && el.closest('[hidden]'))
      });
    }
  }
  return items;
}

/* pages that paint themselves: keys with an element of their own go in page order, the
   rest follow in the order the dictionary lists them */
export function placeInline(html, parseDom, keys, fns) {
  const doc = parseDom(html);
  const map = mapDocument(doc);
  const inPage = [], offPage = [];

  keys.forEach((key, n) => {
    const el = map.byId.get(key) || map.byId.get(key.split('.')[0]);
    if (el) {
      const sec = sectionFor(map, el);
      inPage.push({
        key, at: map.at.get(el) || 0,
        kind: kindOf(el, false),
        section: sec.label, sectionFromKey: sec.fromKey, detail:''
      });
    } else {
      const fn = fns[key.split('.')[0]];
      offPage.push({
        key, at: Number.MAX_SAFE_INTEGER - keys.length + n,
        kind:'text',
        section: (fn && FN_NAMES[fn]) || 'Shown from code',
        sectionFromKey: false,
        detail: fn ? 'shown by ' + fn + '()' : ''
      });
    }
  });

  return inPage.sort((a, b) => a.at - b.at).concat(offPage).map((it, n) => ({
    key: it.key, order: n, kind: it.kind,
    section: it.section, sectionFromKey: it.sectionFromKey,
    detail: it.detail, hidden: false
  }));
}

/* ---------- putting it all together ---------- */

/* read: async (path) => the file's text.   parseDom: (html) => Document */
export async function scanSite(read, parseDom) {
  const flat = d => ({ en: flatten(d.en), es: flatten(d.es), hu: flatten(d.hu) });

  const dict = { text: flat(parseTextJs(await read('/js/text.js'))) };

  const groups = [];
  const seen = new Set();     // a key reviewed once isn't asked about again further down

  for (const g of GROUPS) {
    let items = [];

    if (g.kind === 'markup') {
      const html = await read(g.path === '/' ? '/index.html' : g.path + 'index.html');
      for (const it of scanMarkup(html, parseDom)) {
        if (seen.has(it.key)) continue;
        seen.add(it.key);
        items.push(it);
      }
    }

    else if (g.kind === 'leftover') {
      // text.js keys no page spells out in its HTML: js/play.js and friends show these.
      let n = 0;
      for (const key of Object.keys(dict.text.en)) {
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ key, order:n++, kind:'text', section:'Scan flow', sectionFromKey:false, detail:'', hidden:false });
      }
    }

    else {
      const html = await read(g.path.endsWith('.html') ? g.path : g.path + 'index.html');
      const d = flat(parseInlinePage(html));
      dict[g.source] = d;
      items = placeInline(html, parseDom, Object.keys(d.en), usageSections(html));
    }

    const d = dict[g.source] || { en:{}, es:{}, hu:{} };
    for (const it of items) {
      it.en = d.en[it.key] ?? null;
      it.es = d.es[it.key] ?? null;
      it.hu = d.hu[it.key] ?? null;
      it.source = g.source;
      it.group = g.id;
      // a heading carrying only a key was labelled with the key: show its English instead
      if (it.sectionFromKey && d.en[it.section]) {
        it.section = String(d.en[it.section]).replace(/<[^>]*>/g, '').slice(0, 60);
      }
      delete it.sectionFromKey;
    }
    // a key the HTML asks for but no language has wording for is dead markup, not copy
    items = items.filter(it => it.en !== null || it.es !== null || it.hu !== null);

    groups.push({ id:g.id, label:g.label, source:g.source, path:g.path, items });
  }

  return groups;
}
