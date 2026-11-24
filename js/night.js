/* STREETDARE night mode: a dark version for clubs and late nights.
   Load in <head> (before the CSS paints) so the page never flashes white.
   Default: dark from 19:00 to 08:00 on the phone's clock; the 🌙/☀️ button overrides it and is remembered. */
(function(){
  var KEY = 'sd_theme', saved = null, h = new Date().getHours();
  try{ saved = localStorage.getItem(KEY); }catch(e){}
  var night = saved ? saved === 'night' : (h >= 19 || h < 8);
  function apply(on){
    document.documentElement.classList.toggle('night', on);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', on ? '#121012' : '#fbf8ef');
    var b = document.getElementById('nightBtn'); if (b){ b.textContent = on ? '☀️' : '🌙'; b.setAttribute('aria-label', on ? 'Day mode' : 'Night mode'); }
  }
  apply(night);
  window.sdNight = {
    on: function(){ return document.documentElement.classList.contains('night'); },
    toggle: function(){ var on = !this.on(); apply(on); try{ localStorage.setItem(KEY, on ? 'night' : 'day'); }catch(e){} return on; },
    paint: function(){ apply(this.on()); }
  };
  /* The toggle lives at the bottom of the hamburger menu, and some menus are rebuilt each
     time they open, so the click is caught on the document rather than bound to the button. */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('#nightBtn');
    if (b){ e.preventDefault(); window.sdNight.toggle(); }
  });
  document.addEventListener('DOMContentLoaded', function(){ window.sdNight.paint(); });
})();
