/* ===== STREETDARE - published copy overrides =====
   Every word on the site has a key and lives in the code: js/text.js for the home and scan
   pages, a T block inside each of the other pages. In /admin -> Copy, Aron can approve each
   string or rewrite it; when he presses "Apply approved edits" the new wording lands in
   copy_live, and this file lays it over the text in the code.

   The text in the code always stays the fallback: if this request fails, or the phone is
   offline, or the table is empty, the page reads exactly as it does without this file.

   How it runs: whatever we fetched last time is kept in localStorage and merged straight
   away, so there is never a wait or a flash of old wording. Then, once the page has loaded,
   we quietly re-check for newer wording and repaint if something changed.

   Pages using js/text.js (home, /p, /stage) get picked up on their own, because text.js
   leaves T on window. The other pages call it themselves after their own T:
       sdCopy(T, 'me', paint);
*/
(function () {
  var SB    = 'https://jlnsqerwiwmbqpzzcskf.supabase.co';
  var ANON  = 'sb_publishable_zWPRZvdU4QyCI5hlmAvCWA_Mz7_koXT';
  var STORE = 'sd_copy_1';

  function read()  { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } }
  function write(o){ try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }

  /* lay the rows over the dictionary; returns how many strings actually changed */
  function merge(T, rows) {
    var changed = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!r || !r.lang || !r.ckey || typeof r.text !== 'string') continue;
      if (!T[r.lang]) T[r.lang] = {};
      if (T[r.lang][r.ckey] !== r.text) { T[r.lang][r.ckey] = r.text; changed++; }
    }
    return changed;
  }

  function soon(fn) {
    if (document.readyState === 'complete') setTimeout(fn, 400);
    else window.addEventListener('load', function () { setTimeout(fn, 400); });
  }

  /* T: the page's own dictionary. source: which block of copy this page uses.
     onUpdate: called only if newer wording turns up after the page has already painted. */
  window.sdCopy = function (T, source, onUpdate) {
    if (!T || !source) return;

    var cached = read()[source];
    if (cached && cached.rows) merge(T, cached.rows);

    soon(function () {
      fetch(SB + '/rest/v1/copy_live?select=ckey,lang,text&source=eq.' + encodeURIComponent(source),
            { headers: { apikey: ANON }, cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rows) {
          if (!Array.isArray(rows)) return;
          var all = read();
          all[source] = { at: Date.now(), rows: rows };
          write(all);
          if (merge(T, rows) && typeof onUpdate === 'function') onUpdate();
        })
        .catch(function () {});
    });
  };

  /* Home, /p and /stage: text.js (and stage.js on the stage pages) have already built the
     global T by the time this runs, and common.js hands that very object to initLang, so
     writing into it here is enough. Load this file after text.js and after stage.js. */
  try {
    if (typeof T !== 'undefined' && T && T.en) {
      window.sdCopy(T, 'text', function () {
        if (typeof window.applyLang === 'function') window.applyLang();
      });
    }
  } catch (e) {}
})();
