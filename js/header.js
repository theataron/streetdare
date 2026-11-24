/* ===== STREETDARE - the header follows you down the page =====
   It stays put while you read, slides away once you are properly scrolling down, and comes
   back on the smallest scroll up, so the menu and Profile are never more than a flick away.
   Only touches header.top: the Shirtless Pass has its own header and is left alone. */
(function () {
  var top = document.querySelector('header.top');
  if (!top) return;

  var last = window.scrollY || 0;
  var SHOW_AFTER = 6;     /* a flick up this small already brings it back */
  var HIDE_BELOW = 90;    /* never hide it while you are still near the top */
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    if (y < HIDE_BELOW) top.classList.remove('hid');
    else if (y > last + 4) top.classList.add('hid');
    else if (y < last - SHOW_AFTER) top.classList.remove('hid');
    last = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });

  /* a menu or dialog that locks the page shouldn't leave the header hidden behind it */
  window.addEventListener('pageshow', function () { top.classList.remove('hid'); });
})();
