/* ===== STREETDARE - STAGE shop: one shirt (black or white), sizes, or the Digital Pass; plus any-size groups ===== */
(function(){
  if (!$('shop')) return;
  let color = 'black', size = null, n = PRICES.groupStart;

  /* colour */
  document.querySelectorAll('#colors button').forEach(b => b.onclick = () => {
    color = b.dataset.c;
    document.querySelectorAll('#colors button').forEach(x => x.classList.toggle('on', x === b));
    $('teeView').className = 'teeview ' + color;
  });

  /* sizes */
  $('sizes').innerHTML = SIZES.map(s => '<button type="button" data-s="' + s + '">' + s + '</button>').join('');
  document.querySelectorAll('#sizes button').forEach(b => b.onclick = () => {
    size = b.dataset.s; $('sizeErr').hidden = true;
    document.querySelectorAll('#sizes button').forEach(x => x.classList.toggle('on', x === b));
  });

  $('buyShirt').onclick = () => {
    if (!size){ $('sizeErr').hidden = false; $('sizes').classList.remove('nudge'); void $('sizes').offsetWidth; $('sizes').classList.add('nudge'); return; }
    checkout('shirt');
  };
  $('buyPass').onclick = () => checkout('pass');

  /* group: price per shirt drops with every person added */
  function paintGroup(){
    const each = groupEach(n), total = each * n, save = (PRICES.shirt - each) * n;
    $('gN').textContent = n;
    $('gEach').textContent = eur(each);
    $('gTotal').textContent = eur(total);
    $('gSave').textContent = each <= PRICES.groupFloor ? t('grpFloor') + ' · ' + t('grpSave').replace('{s}', eur(save)) : t('grpSave').replace('{s}', eur(save));
    $('buyGroup').textContent = t('grpBuy').replace('{n}', n).replace('{t}', eur(total));
    $('gMinus').disabled = n <= PRICES.groupMin; $('gPlus').disabled = n >= PRICES.groupMax;
    /* a little bar showing how close the crew is to the best price */
    const steps = Math.max(1, (PRICES.shirt - PRICES.groupFloor) / PRICES.groupStep);
    $('gBar').style.setProperty('--p', Math.min(1, (n - 1) / steps));
  }
  const bump = d => { n = Math.min(PRICES.groupMax, Math.max(PRICES.groupMin, n + d)); paintGroup();
    $('gN').classList.remove('pop'); void $('gN').offsetWidth; $('gN').classList.add('pop'); };
  $('gMinus').onclick = () => bump(-1);
  $('gPlus').onclick = () => bump(1);
  $('buyGroup').onclick = () => checkout('group');

  function paint(){ $('shopPrice').textContent = eur(PRICES.shirt); $('buyShirt').textContent = t('shopBuy').replace('{p}', eur(PRICES.shirt)); paintGroup(); }
  document.addEventListener('langchange', paint);
  paint();
})();
