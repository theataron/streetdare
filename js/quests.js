/* ===== Dare decks: a SMALL emergency copy, used only if the database can't be reached.
   The real decks live in the database (admin board). Kept short on purpose so the full decks
   are not sitting in a public file. Each dare: [English, Español, 18+ (1 or 0), Magyar].
   The first 5 Party dares also appear as examples on the homepage. ===== */
const QUESTS = {
  classic: [
    ["Swap an item of clothing with each other and take a pic","Intercambiad una prenda de ropa y haceos una foto",0,"Cseréljetek ki egymással egy ruhadarabot, és csináljatok egy képet"],
    ["Find someone from a country neither of you has been to and take a pic with them","Encontrad a alguien de un país en el que ninguno de los dos haya estado y haceos una foto",0,"Keressetek valakit egy olyan országból, ahol egyikőtök sem járt még, és csináljatok vele egy képet"],
    ["Take pics with people in red, blue and green outfits","Haceos fotos con gente vestida de rojo, azul y verde",0,"Csináljatok képet piros, kék és zöld ruhás emberekkel"],
    ["Be each other’s wingman: each of you introduces the other to someone new within 5 minutes","Haced de wingman el uno del otro: cada uno le presenta al otro a alguien nuevo en menos de 5 minutos",0,"Legyetek egymás wingmanjei: mindketten bemutatjátok a másikat valakinek 5 percen belül"],
    ["One of you gets on the other’s shoulders (carefully, at your own risk)","Que uno se suba a los hombros del otro (con cuidado y bajo vuestra responsabilidad)",0,"Az egyikőtök üljön fel a másik nyakába (óvatosan, saját felelősségre)"],
    ["Invent a cool secret handshake","Inventad un saludo secreto",0,"Találjatok ki egy menő titkos kézfogást"],
    ["Ask someone for their email and write them a 4-line love poem together","Pedidle el email a alguien y escribidle juntos un poema de amor de 4 versos",0,"Kérjétek el valakinek az e-mail-címét, és írjatok neki együtt egy négysoros szerelmes verset"],
    ["Find someone with more than 5k Instagram followers and take a selfie with them","Encontrad a alguien con más de 5k seguidores en Instagram y haceos un selfie con esa persona",0,"Keressetek valakit, akinek több mint 5 ezer követője van Instán, és csináljatok vele egy szelfit"],
    ["Get a stranger to teach you both a dance move","Conseguid que un desconocido os enseñe un paso de baile",0,"Tanítson meg nektek egy idegen egy tánclépést"],
    ["Start a conga line of at least 6 people","Montad una conga de al menos 6 personas",0,"Indítsatok egy legalább 6 fős vonatozást"],
    ["Get a stranger to rate both your outfits out of 10","Que un desconocido puntúe vuestros outfits del 1 al 10",0,"Pontozza egy idegen 1-től 10-ig mindkettőtök szettjét"],
    ["Ask a stranger which celebrity each of you looks like","Preguntadle a un desconocido a qué famoso se parece cada uno",0,"Kérdezzétek meg egy idegentől, melyik hírességre hasonlítotok"],
    ["Sing a song with the wrong lyrics, loudly, until at least one person joins in","Cantad una canción con la letra mal, bien alto, hasta que al menos una persona se una",0,"Énekeljetek el hangosan egy dalt rossz szöveggel, amíg legalább egy ember be nem száll"],
    ["Tie your shoelaces together and dance for one song (take it easy, at your own risk)","Ataos los cordones juntos y bailad así una canción (con calma y bajo vuestra responsabilidad)",0,"Kössétek össze a cipőfűzőtöket, és táncoljatok így végig egy számot (lassan, saját felelősségre)"],
    ["Trade something from your pockets with a stranger, then trade that with someone else. You have 10 minutes","Cambiad algo de vuestros bolsillos con un desconocido y luego cambiad eso con otra persona. Tenéis 10 minutos",0,"Cseréljetek el valamit a zsebetekből egy idegennel, aztán azt cseréljétek tovább valaki mással. 10 percetek van"]
  ],
  devil: [
    ["Ask the DJ for the most embarrassing song you can think of","Pedidle al DJ la canción más vergonzosa que se os ocurra",0,"Kérjétek meg a DJ-t, hogy tegye be a legkínosabb számot, ami eszetekbe jut"],
    ["Have a 15-second dance battle, and a nearby stranger picks the winner","Haced una batalla de baile de 15 segundos y que un desconocido que esté cerca elija quién gana",0,"Tartsatok egy 15 másodperces táncpárbajt, és egy közelben álló idegen döntse el, ki nyer"],
    ["Walk up to a group and introduce each other with completely made-up life stories","Acercaos a un grupo y presentaos el uno al otro con vidas totalmente inventadas",0,"Menjetek oda egy társasághoz, és mutassátok be egymást teljesen kitalált életúttal"]
  ]
};
