/* ===== Language picker: a small button that opens a list. Add a language by adding a line to LANG_LIST. ===== */
const LANG_LIST = [
  { code:'en', name:'English' },
  { code:'es', name:'Español' },
  { code:'hu', name:'Magyar' }
];
/* English is the default and the only reviewed language. Switching to any other one asks first. */
function langConfirm(code, go, currentName){
  if (code === 'en') return go();
  const name = (LANG_LIST.find(l => l.code === code) || {}).name || code;
  if (!document.getElementById('langConfirmCss')){
    const st = document.createElement('style'); st.id = 'langConfirmCss';
    st.textContent = '.lcm{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px}'
      + '.lcm div{background:var(--card,#fffdf7);color:var(--ink,#1b1412);border:2px solid var(--ink,#1b1412);border-radius:18px;box-shadow:4px 4px 0 var(--ink,#1b1412);max-width:360px;width:100%;padding:22px 20px;font-family:inherit}'
      + '.lcm p{margin:0 0 8px;line-height:1.45;font-size:1rem}.lcm p b{font-weight:800}'
      + '.lcm .row{display:flex;flex-direction:column;gap:10px;margin-top:16px}'
      + '.lcm button{font:inherit;font-weight:700;border-radius:99px;padding:12px 18px;cursor:pointer;border:2px solid var(--ink,#1b1412)}'
      + '.lcm .go{background:var(--red,#e20000);color:#fff}.lcm .stay{background:transparent;color:var(--ink,#1b1412)}';
    document.head.appendChild(st);
  }
  const ov = document.createElement('div'); ov.className = 'lcm'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  const box = document.createElement('div');
  box.innerHTML = '<p><b>Heads up.</b> The ' + name + ' version is auto-generated, so it might translate badly.</p><p>Do you still want to switch?</p>'
    + '<div class="row"><button type="button" class="go">Yes, switch to ' + name + '</button><button type="button" class="stay">No, keep ' + (currentName || 'English') + '</button></div>';
  ov.appendChild(box); document.body.appendChild(ov);
  const prev = document.activeElement;
  const done = ok => { document.removeEventListener('keydown', onKey, true); ov.remove(); if (prev && prev.focus) try{ prev.focus(); }catch(e){} if (ok) go(); };
  const onKey = e => { if (e.key === 'Escape'){ e.stopPropagation(); done(false); } };
  document.addEventListener('keydown', onKey, true);
  box.querySelector('.go').onclick = () => done(true);
  box.querySelector('.stay').onclick = () => done(false);
  ov.onclick = e => { if (e.target === ov) done(false); };
  box.querySelector('.stay').focus();
}
function langPicker(btn, getCurrent, onPick){
  if (!btn || btn.dataset.picker) return;
  btn.dataset.picker = '1';
  btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
  const wrap = document.createElement('div'); wrap.className = 'langwrap';
  btn.replaceWith(wrap); wrap.appendChild(btn);
  const list = document.createElement('ul'); list.className = 'langlist'; list.setAttribute('role', 'listbox'); list.hidden = true;
  wrap.appendChild(list);
  const close = () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const paint = () => {
    const cur = getCurrent();
    btn.innerHTML = '<span class="globe" aria-hidden="true">🌐</span><b>' + cur.toUpperCase() + '</b><span class="caret" aria-hidden="true">▾</span>';
    list.innerHTML = LANG_LIST.map(l => '<li role="option" tabindex="0" data-code="' + l.code + '"' + (l.code === cur ? ' aria-selected="true" class="on"' : '') + '><span>' + l.name + '</span>' + (l.code === cur ? '<span aria-hidden="true">✓</span>' : '') + '</li>').join('');
  };
  btn.onclick = e => { e.stopPropagation(); const open = list.hidden; list.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  const pick = code => {
    close();
    if (code === getCurrent()) return;
    const cur = (LANG_LIST.find(l => l.code === getCurrent()) || {}).name;
    langConfirm(code, () => { onPick(code); paint(); }, cur);
  };
  list.onclick = e => { const li = e.target.closest('li'); if (li) pick(li.dataset.code); };
  list.onkeydown = e => { if (e.key === 'Enter'){ const li = e.target.closest('li'); if (li){ pick(li.dataset.code); btn.focus(); } } };
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  paint();
  return paint;
}
