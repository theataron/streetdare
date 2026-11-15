/* ===== STREETDARE - STAGE shop: one shirt (black or white), sizes, or the Shirtless Pass; plus squad packs ===== */
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
  $('hostUp').onchange = paintShirt;

  /* one shirt: €10 off for a few hours after scanning someone's shirt, plus the optional Host Upgrade */
  function paintShirt(){
    const perk = refPerk(), base = PRICES.shirt - (perk ? PRICES.refOff : 0), total = base + ($('hostUp').checked ? PRICES.host : 0);
    $('refBanner').hidden = !perk; $('refBanner').textContent = refText();
    $('shopPrice').innerHTML = (perk ? '<s>' + eur(PRICES.shirt) + '</s> ' : '') + eur(base);
    $('hostTxt').textContent = t('shopHost').replace('{p}', eur(PRICES.host));
    $('buyShirt').textContent = t('shopBuy').replace('{p}', eur(total));
  }

  /* squad: the price per shirt drops at each tier */
  function paintGroup(){
    const each = groupEach(n), total = each * n, save = (PRICES.shirt - each) * n;
    const next = PRICES.tiers.find(([from]) => from > n), top = PRICES.tiers[PRICES.tiers.length - 1][0];
    $('gN').textContent = n;
    $('gEach').textContent = eur(each);
    $('gTotal').textContent = eur(total);
    $('gSave').textContent = t('grpSave').replace('{s}', eur(save));
    $('gNext').textContent = next ? t('grpNext').replace('{k}', next[0] - n).replace('{p}', eur(next[1])) : t('grpBest');
    $('buyGroup').textContent = t('grpBuy').replace('{n}', n).replace('{t}', eur(total));
    $('gMinus').disabled = n <= PRICES.groupMin; $('gPlus').disabled = n >= PRICES.groupMax;
    $('gBar').style.setProperty('--p', Math.min(1, n / top));
  }
  const bump = d => { n = Math.min(PRICES.groupMax, Math.max(PRICES.groupMin, n + d)); paintGroup();
    $('gN').classList.remove('pop'); void $('gN').offsetWidth; $('gN').classList.add('pop'); };
  $('gMinus').onclick = () => bump(-1);
  $('gPlus').onclick = () => bump(1);
  $('buyGroup').onclick = () => checkout('group');

  function paint(){ paintShirt(); paintGroup(); }
  document.addEventListener('langchange', paint);
  setInterval(paintShirt, 30000);
  paint();
})();
