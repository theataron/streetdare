/* ===== STREETDARE admin - Copy: approve every word on the site =====
   What this is for: going through the site one string at a time, saying "yes, that's right"
   or fixing the wording, and knowing at a glance which pages are done in which language.

   How it hangs together:
     - copy-scan.js reads the site's own files and tells us every string, which page it's on,
       where in the page, and the heading it sits under. So the review runs top to bottom,
       the way the page actually reads.
     - Each decision is a row in copy_review: the wording as the code has it (base_text),
       Aron's version if he changed it (draft_text), and whether he has approved it.
     - Nothing reaches the site until "Apply approved edits". That calls copy_publish(),
       which turns approved page copy into a live override and writes approved dare edits
       straight back into the dare tables.
     - If a string later changes in the code, its base_text no longer matches and the page
       shows up as "needs another look", so an approval can never go stale quietly.
*/

import { scanSite } from './copy-scan.js';

const LANGS = [
  { code:'en', label:'🇬🇧 English' },
  { code:'hu', label:'🇭🇺 Magyar' },
  { code:'es', label:'🇪🇸 Español' }
];

const DECK_GROUPS = [
  { id:'d-classic',  deck:'classic',  label:'Dares · Party Deck' },
  { id:'d-spicy',    deck:'spicy',    label:'Dares · Devil mode' },
  { id:'d-street',   deck:'street',   label:'Dares · Street Deck' },
  { id:'d-festival', deck:'festival', label:'Dares · Festival' },
  { id:'d-erasmus',  deck:'erasmus',  label:'Dares · Erasmus' },
  { id:'d-madrid',   deck:'madrid',   label:'Dares · Madrid' },
  { id:'d-pass',     deck:'pass',     label:'Dares · Shirtless deck' }
];

const PAGE_URL = {
  home:'/', scan:'/p/?s=demo', textrest:'/p/?s=demo', me:'/me/', pass:'/pass/',
  contact:'/contact/', login:'/login/', e404:'/404.html'
};

export function initCopy({ sb, $, esc, toast }) {
  let lang = 'en';
  let groups = [];                 // every group, each with its items
  let rows = new Map();            // 'source|key|lang' -> row from copy_review
  let gid = null;                  // the group being reviewed
  let idx = 0;                     // where we are inside it
  let onlyTodo = true;
  let me = null;
  let loading = false;

  const id  = (it, l) => it.source + '|' + it.key + '|' + l;
  const base = (it, l) => it[l];
  const row  = (it, l) => rows.get(id(it, l));

  /* what we'd show in the box for this string right now */
  function current(it, l) {
    const r = row(it, l);
    return (r && r.draft_text != null) ? r.draft_text : (base(it, l) ?? '');
  }

  /* pending: not looked at yet. approved: signed off, and the code still says the same
     thing. changed: approved once, but the wording in the code has moved on since. */
  function state(it, l) {
    const r = row(it, l);
    if (!r || r.status !== 'approved') return 'pending';
    return r.base_text === (base(it, l) ?? '') ? 'approved' : 'changed';
  }
  const edited = (it, l) => {
    const r = row(it, l);
    return !!(r && r.draft_text != null && r.draft_text !== r.base_text);
  };
  /* is this string waiting to go live? */
  function unpublished(it, l) {
    const r = row(it, l);
    if (!r || r.status !== 'approved') return false;
    const want = (r.draft_text != null && r.draft_text !== r.base_text) ? r.draft_text : null;
    return (r.published_text ?? null) !== want;
  }

  /* strings this language actually has wording for */
  const listed = g => g.items.filter(it => base(it, lang) != null);

  /* ---------- the shell ---------- */

  function shell() {
    $('t-copy').innerHTML = `
      <div class="tiles" id="cpTiles"></div>

      <div class="card">
        <div class="chips" id="cpLangs"></div>
        <div class="cpbar">
          <button class="btn red" id="cpPublish" type="button">Apply approved edits</button>
          <button class="btn sm" id="cpRescan" type="button">Re-read the site</button>
          <small class="muted" id="cpPubNote"></small>
        </div>
      </div>

      <div class="card" id="cpOverview">
        <h3>Where every page stands</h3>
        <p class="muted" style="margin:-6px 0 12px;font-size:.9rem">
          Pick a page and go through it from the top. Nothing shows up on the site until you
          press “Apply approved edits”.
        </p>
        <table><thead><tr>
          <th>Page</th><th class="n">Strings</th><th class="n">Approved</th>
          <th class="n">Edited</th><th class="n">Needs another look</th><th>Progress</th><th></th>
        </tr></thead><tbody id="cpRows"></tbody></table>
      </div>

      <div id="cpReview" hidden>
        <div class="cpgrid">
          <div class="card" id="cpCard"></div>
          <div class="card cplistcard">
            <h3 id="cpListH">All strings</h3>
            <label class="cptodo"><input type="checkbox" id="cpOnly"> Only the ones left to do</label>
            <div class="cplist" id="cpList"></div>
          </div>
        </div>
      </div>`;

    $('cpRescan').onclick = () => load(true);
    $('cpPublish').onclick = publish;
    $('cpOnly').onchange = e => { onlyTodo = e.target.checked; paintReview(); };
  }

  /* ---------- loading ---------- */

  async function load(fresh) {
    if (loading) return;
    loading = true;
    $('cpRows').innerHTML = '<tr><td colspan="7" class="empty">Reading the site…</td></tr>';

    try {
      if (fresh || !groups.length) {
        const read = async path => {
          const r = await fetch(path, { cache:'reload' });
          if (!r.ok) throw new Error('Could not read ' + path);
          return r.text();
        };
        const parseDom = html => new DOMParser().parseFromString(html, 'text/html');
        const site = await scanSite(read, parseDom);
        groups = site.concat(await loadDares());
      }
      await loadRows();
    } catch (e) {
      $('cpRows').innerHTML = '<tr><td colspan="7" class="empty">' + esc(e.message || 'Something went wrong.') + '</td></tr>';
      loading = false;
      return;
    }

    loading = false;
    paintLangs();
    paintTiles();
    paintOverview();
    if (gid) paintReview();
  }

  /* the dares live in the database rather than in a file */
  async function loadDares() {
    const [d, p, decks] = await Promise.all([
      sb.from('dares').select('id,deck_id,text_en,text_es,text_hu,adult,sort').is('shirt_id', null).order('sort'),
      sb.from('pass_dares').select('id,en,es,hu,ask_en,ask_es,ask_hu,feed_en,feed_es,feed_hu,sort,active').order('sort'),
      sb.from('decks').select('id,name_en')
    ]);
    const deckName = {};
    for (const x of (decks.data || [])) deckName[x.id] = x.name_en;

    const out = [];
    for (const g of DECK_GROUPS) {
      const items = [];
      if (g.deck === 'pass') {
        for (const r of (p.data || [])) {
          const add = (suffix, en, es, hu, what) => {
            if (en == null && es == null && hu == null) return;
            items.push({
              key: suffix ? r.id + '.' + suffix : String(r.id),
              order: items.length, kind: what, section: 'Shirtless deck',
              detail: r.active ? '' : 'switched off', hidden: false,
              en, es, hu, source: 'passdare', group: g.id
            });
          };
          add('', r.en, r.es, r.hu, 'dare');
          add('ask', r.ask_en, r.ask_es, r.ask_hu, 'the question it asks');
          add('feed', r.feed_en, r.feed_es, r.feed_hu, 'how it reads in the feed');
        }
      } else {
        for (const r of (d.data || []).filter(x => x.deck_id === g.deck)) {
          items.push({
            key: String(r.id), order: items.length, kind: 'dare',
            section: deckName[g.deck] || g.label,
            detail: r.adult ? '18+' : '', hidden: false,
            en: r.text_en, es: r.text_es, hu: r.text_hu,
            source: 'dare', group: g.id
          });
        }
      }
      if (items.length) out.push({ id:g.id, label:g.label, source:items[0].source, path:null, items });
    }
    return out;
  }

  async function loadRows() {
    if (!me) {
      const { data } = await sb.auth.getUser();
      me = data && data.user ? data.user.id : null;
    }
    rows = new Map();
    // read in pages so a few thousand rows never get cut off
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from('copy_review')
        .select('id,source,ckey,lang,base_text,draft_text,status,published_text,note')
        .range(from, from + 999);
      if (error) throw error;
      for (const r of data) rows.set(r.id, r);
      if (data.length < 1000) break;
    }
  }

  /* ---------- the overview ---------- */

  function paintLangs() {
    $('cpLangs').innerHTML = LANGS.map(l =>
      '<button type="button" data-l="' + l.code + '"' + (l.code === lang ? ' class="on"' : '') + '>' +
      l.label + '</button>').join('');
    $('cpLangs').querySelectorAll('button').forEach(b => b.onclick = () => {
      lang = b.dataset.l; idx = 0;
      paintLangs(); paintTiles(); paintOverview(); if (gid) paintReview();
    });
  }

  function tally(g) {
    const items = listed(g);
    let ok = 0, chg = 0, ed = 0;
    for (const it of items) {
      const s = state(it, lang);
      if (s === 'approved') ok++;
      else if (s === 'changed') chg++;
      if (edited(it, lang)) ed++;
    }
    return { total: items.length, ok, chg, ed, left: items.length - ok };
  }

  function paintTiles() {
    let total = 0, ok = 0, waiting = 0;
    for (const g of groups) {
      const t = tally(g);
      total += t.total; ok += t.ok;
      for (const it of listed(g)) if (unpublished(it, lang)) waiting++;
    }
    const pages = groups.filter(g => tally(g).total && tally(g).left === 0).length;
    $('cpTiles').innerHTML = [
      ['Approved', ok + ' / ' + total, Math.round(100 * ok / (total || 1)) + '% of this language'],
      ['Pages finished', pages + ' / ' + groups.length, 'every string signed off'],
      ['Waiting to go live', waiting, waiting ? 'press Apply approved edits' : 'nothing pending'],
    ].map(([k, v, sub]) => '<div class="tile"><span>' + k + '</span><b>' + v + '</b><small>' + sub + '</small></div>').join('');

    const n = countToPublish();
    $('cpPublish').textContent = n ? 'Apply approved edits (' + n + ')' : 'Apply approved edits';
    $('cpPublish').disabled = !n;
    $('cpPubNote').textContent = n
      ? n + ' approved ' + (n === 1 ? 'change' : 'changes') + ' not on the site yet, across all languages.'
      : 'Everything you have approved is already on the site.';
  }

  /* across every language, not just the one on screen */
  function countToPublish() {
    let n = 0;
    for (const g of groups) for (const it of g.items) for (const l of ['en','es','hu']) {
      if (base(it, l) != null && unpublished(it, l)) n++;
    }
    return n;
  }

  function bar(ok, total) {
    const pct = Math.round(100 * ok / (total || 1));
    return '<div class="cpbarwrap"><i style="width:' + pct + '%"></i></div>';
  }

  function paintOverview() {
    $('cpRows').innerHTML = groups.map(g => {
      const t = tally(g);
      if (g.error) {
        return '<tr><td><b>' + esc(g.label) + '</b></td><td colspan="6" class="cpwarn">' +
               esc(g.error) + ' \u2014 press \u201cRe-read the site\u201d, and hard-reload ' +
               'the page if it keeps saying this (Ctrl + Shift + R).</td></tr>';
      }
      if (!t.total) {
        return '<tr><td><b>' + esc(g.label) + '</b></td><td colspan="6" class="muted">' +
               'nothing in ' + lang.toUpperCase() + ' yet</td></tr>';
      }
      return '<tr><td><b>' + esc(g.label) + '</b></td>' +
        '<td class="n">' + t.total + '</td>' +
        '<td class="n">' + t.ok + '</td>' +
        '<td class="n">' + (t.ed || '') + '</td>' +
        '<td class="n">' + (t.chg ? '<b class="cpwarn">' + t.chg + '</b>' : '') + '</td>' +
        '<td>' + bar(t.ok, t.total) + '</td>' +
        '<td><button class="btn sm" data-g="' + g.id + '">' + (t.left ? 'Review' : 'Look again') + '</button></td></tr>';
    }).join('');
    $('cpRows').querySelectorAll('button[data-g]').forEach(b => b.onclick = () => openGroup(b.dataset.g));
  }

  /* ---------- the review, one string at a time ---------- */

  function openGroup(nextGid) {
    gid = nextGid; idx = 0;
    $('cpReview').hidden = false;
    paintReview();
    $('cpReview').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  const group = () => groups.find(g => g.id === gid);

  /* the strings we're walking through: the whole page, or only what's left */
  function queue() {
    const all = listed(group());
    if (!onlyTodo) return all;
    const left = all.filter(it => state(it, lang) !== 'approved');
    return left.length ? left : all;
  }

  function paintReview() {
    const g = group();
    if (!g) return;
    const q = queue();
    if (idx >= q.length) idx = Math.max(0, q.length - 1);
    const it = q[idx];
    $('cpOnly').checked = onlyTodo;
    $('cpListH').textContent = g.label;

    if (!it) {
      $('cpCard').innerHTML = '<p class="empty">Nothing to show here in ' + lang.toUpperCase() + '.</p>';
      $('cpList').innerHTML = '';
      return;
    }

    // what sits above and below it on the page, so the run of copy makes sense
    const all = listed(g);
    const at = all.indexOf(it);
    const prev = at > 0 ? all[at - 1] : null;
    const next = at < all.length - 1 ? all[at + 1] : null;
    const st = state(it, lang);
    const txt = current(it, lang);
    const url = PAGE_URL[g.id];

    const pill = st === 'approved' ? '<span class="cppill ok">approved</span>'
      : st === 'changed' ? '<span class="cppill warn">the code changed since you approved this</span>'
      : '<span class="cppill">not approved yet</span>';

    $('cpCard').innerHTML =
      '<div class="cphead">' +
        '<div><b>' + esc(g.label) + '</b> <span class="muted">· ' + (at + 1) + ' of ' + all.length +
          (onlyTodo && q.length !== all.length ? ' · ' + q.length + ' left' : '') + '</span></div>' +
        (url ? '<a class="btn sm" href="' + url + '" target="_blank" rel="noopener">Open the page ↗</a>' : '') +
      '</div>' +

      '<div class="cpsection">' + esc(it.section) + '</div>' +

      '<div class="cpneighbour">' + (prev
        ? '<span class="lbl">just above</span>' + esc(plain(base(prev, lang)))
        : '<span class="lbl">top of the page</span>') + '</div>' +

      '<div class="cpnow">' +
        '<div class="cpmeta">' +
          '<span class="cpkind">' + esc(it.kind) + '</span>' +
          '<code>' + esc(it.key) + '</code>' +
          (it.detail ? '<span class="muted">· ' + esc(it.detail) + '</span>' : '') +
          (it.hidden ? '<span class="muted">· only shows in a menu or pop-up</span>' : '') +
          pill +
        '</div>' +

        (lang !== 'en'
          ? '<div class="cpref"><span class="lbl">English</span>' + esc(plain(base(it, 'en'))) + '</div>'
          : '') +

        '<textarea id="cpText" rows="4" spellcheck="true">' + esc(txt) + '</textarea>' +
        (/[<>]/.test(txt) ? '<div class="cpprev"><span class="lbl">how it reads</span><span id="cpPrev"></span></div>' : '') +
        '<input type="text" id="cpNote" maxlength="300" placeholder="A note to yourself about this one (optional)">' +

        '<div class="cpacts">' +
          '<button class="btn sm" id="cpBack" type="button">← Back</button>' +
          '<button class="btn sm" id="cpSkip" type="button">Skip →</button>' +
          '<button class="btn red" id="cpOk" type="button">Approve ✓</button>' +
          '<button class="btn sm ghost" id="cpSection" type="button">Approve this whole section as is</button>' +
        '</div>' +
        '<small class="muted">Ctrl + Enter approves and moves on.</small>' +
      '</div>' +

      '<div class="cpneighbour">' + (next
        ? '<span class="lbl">just below</span>' + esc(plain(base(next, lang)))
        : '<span class="lbl">end of the page</span>') + '</div>';

    const box = $('cpText'), note = $('cpNote'), okBtn = $('cpOk');
    const r = row(it, lang);
    if (r && r.note) note.value = r.note;

    const prevBox = $('cpPrev');
    const renderPrev = () => { if (prevBox) prevBox.innerHTML = box.value; };
    renderPrev();

    const dirty = () => box.value !== (base(it, lang) ?? '');
    const paintBtn = () => { okBtn.textContent = dirty() ? 'Save & approve ✓' : 'Approve ✓'; };
    box.oninput = () => { renderPrev(); paintBtn(); };
    paintBtn();

    box.onkeydown = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); approve(it); }
    };
    okBtn.onclick = () => approve(it);
    $('cpSkip').onclick = () => { idx++; paintReview(); };
    $('cpBack').onclick = () => { idx = Math.max(0, idx - 1); paintReview(); };
    $('cpSection').onclick = () => approveSection(it);

    paintList(all, it);
  }

  const plain = s => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  function paintList(all, cur) {
    let html = '', section = null;
    all.forEach((it, i) => {
      if (it.section !== section) {
        section = it.section;
        html += '<div class="cplistsec">' + esc(section) + '</div>';
      }
      const st = state(it, lang);
      const dot = st === 'approved' ? 'ok' : st === 'changed' ? 'warn' : '';
      html += '<button type="button" data-i="' + i + '" class="' + (it === cur ? 'on' : '') + '">' +
        '<i class="cpdot ' + dot + '"></i>' +
        '<span>' + esc(plain(base(it, lang)).slice(0, 70) || '—') + '</span>' +
        (edited(it, lang) ? '<em title="you changed this">✎</em>' : '') +
        '</button>';
    });
    $('cpList').innerHTML = html;
    $('cpList').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => {
      const target = all[Number(b.dataset.i)];
      const q = queue();
      const at = q.indexOf(target);
      if (at >= 0) { idx = at; }
      else { onlyTodo = false; idx = listed(group()).indexOf(target); }
      paintReview();
    });
    const on = $('cpList').querySelector('button.on');
    if (on) on.scrollIntoView({ block:'nearest' });
  }

  /* ---------- saving ---------- */

  function record(it, l, text, note) {
    const b = base(it, l) ?? '';
    const draft = (text != null && text !== b) ? text : null;
    return {
      id: id(it, l), source: it.source, ckey: it.key, lang: l,
      base_text: b, draft_text: draft, status: 'approved',
      note: note || null, reviewed_at: new Date().toISOString(),
      reviewed_by: me, updated_at: new Date().toISOString()
    };
  }

  async function push(payload) {
    const { error } = await sb.from('copy_review').upsert(payload);
    if (error) { toast('Could not save: ' + error.message); return false; }
    for (const p of [].concat(payload)) {
      const old = rows.get(p.id) || {};
      rows.set(p.id, Object.assign({}, old, p));
    }
    return true;
  }

  async function approve(it) {
    const payload = record(it, lang, $('cpText').value, $('cpNote').value.trim());
    if (!(await push(payload))) return;
    idx++;
    paintTiles(); paintOverview(); paintReview();
  }

  /* everything under the same heading, exactly as the code has it */
  async function approveSection(it) {
    const mates = listed(group()).filter(x => x.section === it.section && state(x, lang) !== 'approved');
    if (!mates.length) { toast('This section is already approved.'); return; }
    if (!confirm('Approve all ' + mates.length + ' strings under “' + it.section + '” exactly as they are?')) return;
    if (!(await push(mates.map(x => record(x, lang, base(x, lang), null))))) return;
    toast(mates.length + ' approved as is.');
    paintTiles(); paintOverview(); paintReview();
  }

  async function publish() {
    const n = countToPublish();
    if (!confirm('Put ' + n + ' approved ' + (n === 1 ? 'change' : 'changes') + ' live on the site now?')) return;
    const btn = $('cpPublish');
    btn.disabled = true; btn.textContent = 'Applying…';
    const { data, error } = await sb.rpc('copy_publish');
    if (error) { toast('Could not apply: ' + error.message); btn.disabled = false; paintTiles(); return; }
    const out = data || {};
    toast('Live now: ' + (out.copy || 0) + ' page strings, ' + (out.dares || 0) + ' dares.');
    await load(true);
  }

  shell();
  return { load: () => load(false) };
}
