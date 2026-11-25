/* ===== STREETDARE - the header follows you down the page =====
   It stays put while you read, slides away once you are properly scrolling down, and comes
   back on the smallest scroll up, so the menu and Profile are never more than a flick away.
   Only touches header.top: the Shirtless Pass has its own header and is left alone. */
(function () {
  var top = document.querySelector('header.top');
  if (!top) return;

  var last = window.scrollY || 0;
  var up = 0;             /* how far we have travelled up since we last went down */
  var SHOW_AFTER = 24;    /* a flick up this small already brings it back */
  var HIDE_BELOW = 90;    /* never hide it while you are still near the top */
  var ticking = false;

  /* The page scrolls smoothly, so an upward flick arrives as a run of two- and three-pixel
     frames. Comparing one frame against the last never adds up to a gesture, so the upward
     movement is accumulated instead and reset the moment you head back down. */
  function onScroll() {
    var y = window.scrollY || 0, dy = y - last;
    if (dy > 0) up = 0; else up -= dy;

    if (y < HIDE_BELOW) { top.classList.remove('hid'); up = 0; }
    else if (dy > 2) top.classList.add('hid');
    else if (up > SHOW_AFTER) { top.classList.remove('hid'); up = 0; }

    /* The bar is see-through while you are at the top of the page and frosts over once the
       page starts running underneath it, so the wordmark and Profile stay readable. */
    top.classList.toggle('stuck', y > 8);

    last = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });

  /* a menu or dialog that locks the page shouldn't leave the header hidden behind it */
  window.addEventListener('pageshow', function () { top.classList.remove('hid'); onScroll(); });

  onScroll();  /* reloading halfway down a page should already show the frosted bar */
})();
