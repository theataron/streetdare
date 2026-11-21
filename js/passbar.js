/* STREETDARE live-group bar: while you're in a live Shirtless Pass night, every page shows a bar
   under the header with the countdown and a link back into the group. (Not on /pass itself.) */
(function(){
  if (location.pathname.indexOf('/pass') === 0 || window.STAGE) return;
  var T = { en: ['Your group is live', 'Open'], es: ['Tu grupo está en marcha', 'Abrir'], hu: ['A csapatod játékban van', 'Megnyitás'] };
  function lang(){ try{ var l = localStorage.getItem('sd_lang'); if (T[l]) return l; }catch(e){} var n = (navigator.language || 'en').slice(0, 2); return T[n] ? n : 'en'; }
  function live(){
    try{
      var logged = false;
      for (var i = 0; i < localStorage.length; i++){ if (/^sb-.*-auth-token$/.test(localStorage.key(i))){ logged = true; break; } }
      var p = JSON.parse(localStorage.getItem('sd_pass') || 'null');
      return logged && p && p.ends > Date.now() ? p : null;
    }catch(e){ return null; }
  }
  var bar, t;
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function tick(){
    var p = live();
    if (!p){ if (bar){ bar.remove(); bar = null; } clearInterval(t); return; }
    if (!bar){
      bar = document.createElement('a'); bar.className = 'livebar'; bar.id = 'liveBar';
      var h = document.querySelector('header.top');
      if (h && h.parentNode) h.parentNode.insertBefore(bar, h.nextSibling); else document.body.prepend(bar);
    }
    bar.href = '/pass/?n=' + encodeURIComponent(p.id);
    var s = Math.max(0, Math.floor((p.ends - Date.now()) / 1000)), w = T[lang()];
    bar.innerHTML = '<span class="lbdot"></span><span class="lbtxt"><b></b><small>' + w[0] + '</small></span><span class="lbclock">' + pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + '</span><span class="lbgo">' + w[1] + ' →</span>';
    bar.querySelector('b').textContent = p.name;
  }
  function init(){ tick(); if (live()) t = setInterval(tick, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
