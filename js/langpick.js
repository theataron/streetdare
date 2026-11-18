/* ===== Language picker: a small button that opens a list. Add a language by adding a line to LANG_LIST. ===== */
const LANG_LIST = [
  { code:'en', name:'English' },
  { code:'es', name:'Español' },
  { code:'hu', name:'Magyar' }
];
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
  list.onclick = e => { const li = e.target.closest('li'); if (!li) return; close(); onPick(li.dataset.code); paint(); };
  list.onkeydown = e => { if (e.key === 'Enter'){ const li = e.target.closest('li'); if (li){ close(); onPick(li.dataset.code); paint(); btn.focus(); } } };
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  paint();
  return paint;
}
