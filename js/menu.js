/* STREETDARE shared menu for pages without the homepage script (contact, login, profile, privacy, terms).
   Adds the hamburger button to the header and the same full-screen menu as the homepage. */
(function(){
  if (document.getElementById('burger')) return;
  var T = {
    en: { home:['Home','What STREETDARE is'], pass:['Shirtless Pass 🎟️','No shirt? Play tonight with your friends'], tr:['Try a dare 🎲','See how scanning a shirt works'], wall:['The Wall','Messages from the community'], me:['Profile','Your shirt, nights and settings'], login:['Log in','Your shirt, nights and stats'], contact:['Contact ✉️','Questions, collabs, press'] },
    es: { home:['Inicio','Qué es STREETDARE'], pass:['Shirtless Pass 🎟️','¿Sin camiseta? Juega esta noche con tus amigos'], tr:['Prueba un reto 🎲','Mira cómo funciona escanear una camiseta'], wall:['El Muro','Mensajes de la comunidad'], me:['Perfil','Tu camiseta, tus noches y tus ajustes'], login:['Entrar','Tu camiseta, tus noches y estadísticas'], contact:['Contacto ✉️','Preguntas, colaboraciones, prensa'] },
    hu: { home:['Főoldal','Mi az a STREETDARE'], pass:['Shirtless Pass 🎟️','Nincs pólód? Játssz ma este a barátaiddal'], tr:['Próbálj ki egy kihívást 🎲','Nézd meg, hogyan működik a szkennelés'], wall:['A Fal','Üzenetek a közösségtől'], me:['Profil','A pólód, az estéid és a beállításaid'], login:['Belépés','A pólód, az estéid és a statisztikáid'], contact:['Kapcsolat ✉️','Kérdések, együttműködés, sajtó'] }
  };
  function lang(){ try{ var l = localStorage.getItem('sd_lang'); if (T[l]) return l; }catch(e){} var n = (navigator.language || 'en').slice(0, 2); return T[n] ? n : 'en'; }
  function loggedIn(){ try{ for (var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if (/^sb-.*-auth-token$/.test(k)) return true; } }catch(e){} return false; }
  function init(){
    var right = document.querySelector('header.top .right'), header = document.querySelector('header.top');
    if (!right || !header) return;
    right.style.display = 'flex'; right.style.gap = '8px'; right.style.alignItems = 'center';
    var b = document.createElement('button');
    b.className = 'burger'; b.id = 'burger'; b.type = 'button'; b.setAttribute('aria-label', 'Menu');
    b.innerHTML = '<i></i><i></i><i></i>';
    right.appendChild(b);
    var nav = document.createElement('nav');
    nav.className = 'menu'; nav.id = 'menu'; nav.hidden = true;
    header.parentNode.insertBefore(nav, header.nextSibling);
    function paint(){
      var t = T[lang()], li = loggedIn();
      var items = [['/?home=1', t.home], ['/pass/', t.pass], ['/p/?s=demo', t.tr], ['/#wall', t.wall], [li ? '/me/?stay=1' : '/login/', li ? t.me : t.login], ['/contact/', t.contact]];
      nav.innerHTML = '<button class="x" type="button" aria-label="Close">✕</button>' +
        items.map(function(x){ return '<a href="' + x[0] + '"><span>' + x[1][0] + '</span><small>' + x[1][1] + '</small></a>'; }).join('') +
        '<div class="foot">STREETDARE · Madrid · Budapest</div>';
      nav.querySelector('.x').onclick = close;
    }
    function close(){ nav.hidden = true; document.body.style.overflow = ''; }
    b.onclick = function(){ paint(); nav.hidden = false; document.body.style.overflow = 'hidden'; };
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
