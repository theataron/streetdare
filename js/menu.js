/* STREETDARE shared menu for pages without the homepage script (contact, login, profile, privacy, terms).
   Adds the hamburger button to the header and the same full-screen menu as the homepage. */
(function(){
  if (document.getElementById('burger')) return;
  /* Same entries, same order and the same wording as the home page menu in index.html
     (plus the ones js/common.js injects there), so the menu does not change shape when you
     walk from the home page into your profile. Keep the two in step when either changes. */
  var T = {
    en: { home:['Home',''], shop:['Shop',''], tr:['Try a dare','See what a scan looks like'],
          about:['What is STREETDARE?','The idea, and who’s behind STREETDARE'],
          club:['Join the community','Get your own shirt & see what else is coming'],
          pass:['Shirtless Pass','No shirt? Play tonight with your friends'],
          signup:['Create account','Got a shirt? Claim it here'],
          wall:['The Wall','Write an anonymous message for the community'],
          contact:['Contact','Questions, collabs, press'], night:'Dark mode' },
    es: { home:['Inicio',''], shop:['Tienda',''], tr:['Prueba un reto','Mira cómo es un escaneo'],
          about:['¿Qué es STREETDARE?','La idea, y quién está detrás de STREETDARE'],
          club:['Únete a la comunidad','Tu propia camiseta, lo que viene y el precio de fundador'],
          pass:['Shirtless Pass','¿Sin camiseta? Juega esta noche con tus amigos'],
          signup:['Crear cuenta','¿Tienes camiseta? Reclámala aquí'],
          wall:['El Muro','Escribe un mensaje anónimo para la comunidad'],
          contact:['Contacto','Preguntas, colaboraciones, prensa'], night:'Modo noche' },
    hu: { home:['Kezdőlap',''], shop:['Bolt',''], tr:['Próbálj ki egy kihívást','Nézd meg, milyen egy szkennelés'],
          about:['Mi az a STREETDARE?','Az ötlet, és aki a STREETDARE mögött áll'],
          club:['Csatlakozz a közösséghez','Szerezd meg a saját pólódat, és nézd meg, mi jön még'],
          pass:['Shirtless Pass','Nincs pólód? Játssz ma este a barátaiddal'],
          signup:['Fiók létrehozása','Van pólód? Itt igényelheted'],
          wall:['A Fal','Írj egy névtelen üzenetet a közösségnek'],
          contact:['Kapcsolat','Kérdések, együttműködés, sajtó'], night:'Éjszakai mód' }
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
    header.insertBefore(b, header.firstChild);
    /* Profile sits in the top right as a highlighted button, on phones too, instead of
       being a row inside the menu. */
    /* ...except on the profile page itself, where it would only point at where you are */
    var onProfile = /^\/me(\/|$)/.test(location.pathname);
    var acct = document.createElement('a');
    acct.className = 'acct'; acct.id = 'acctBtn';
    if (!onProfile) right.appendChild(acct);

    var nav = document.createElement('nav');
    nav.className = 'menu'; nav.id = 'menu'; nav.hidden = true;
    header.parentNode.insertBefore(nav, header.nextSibling);
    function paint(){
      var t = T[lang()], li = loggedIn();
      var items = [['/?home=1', t.home], ['/#shop', t.shop], ['/p/?s=demo', t.tr], ['/#about', t.about],
                   ['/#club', t.club], ['/pass/', t.pass]];
      /* Create account is for people who have not got one yet, exactly as on the home page */
      if (!li) items.push(['/login/?mode=signup', t.signup]);
      items.push(['/#wall', t.wall], ['/contact/', t.contact]);
      nav.innerHTML = '<button class="x" type="button" aria-label="Close">✕</button>' +
        items.map(function(x){ return '<a href="' + x[0] + '"><span>' + x[1][0] + '</span><small>' + x[1][1] + '</small></a>'; }).join('') +
        '<div class="nightrow"><span>' + t.night + '</span>' +
        '<button class="nightbtn" id="nightBtn" type="button" aria-label="Night mode">🌙</button></div>' +
        '<div class="foot">STREETDARE · Madrid · Budapest</div>';
      nav.querySelector('.x').onclick = close;
      if (window.sdNight) window.sdNight.paint();
      if (!onProfile){
        acct.href = li ? '/me/?stay=1' : '/login/';
        acct.textContent = li ? t.me[0] : t.login[0];
      }
    }
    function close(){ nav.hidden = true; document.body.style.overflow = ''; document.body.classList.remove('menuopen'); }
    paint();
    function open(){ paint(); nav.hidden = false; document.body.style.overflow = 'hidden';
      document.body.classList.add('menuopen');
      if (header) header.classList.remove('hid'); }
    /* the burger closes it again when it is already open */
    b.onclick = function(){ nav.hidden ? open() : close(); };
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
