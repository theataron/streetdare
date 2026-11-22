/**
 * STREETDARE - backend (Google Apps Script, attached to a Google Sheet).
 * Saves email sign-ups, wall messages and scan/quest events into three tabs:
 * "Waitlist", "Wall" and "Events". The tabs are created automatically.
 * To hide a wall message: type anything into its "hidden" column.
 * A message reported by 3 visitors is hidden automatically (hidden = "reported").
 */
/* ----- emails -----
   WELCOME_ON: send the welcome email the moment someone joins the waitlist.
   LAUNCH_URL: the shop link for the launch email. Leave it empty until the shirts are on sale.
   LAUNCH_CODE must also exist as a real code in your checkout that gives the Founders' price (valid 1 week). */
const WELCOME_ON  = true;
const SENDER_NAME = 'Aron from STREETDARE';
const REPLY_TO    = 'streetdare.official@gmail.com';
const LAUNCH_URL  = '';
const LAUNCH_CODE = 'EARLYDARE';

const MAIL = {
  en: {
    welcomeSubject: 'Welcome to STREETDARE 👀',
    welcome: [
      'Hey,',
      'Welcome to the STREETDARE community! We\'re really glad you\'re here early.',
      'Most people out at bars and clubs actually want to meet new people, they just don\'t know how to take that first step. That\'s why we\'re creating STREETDARE in Madrid and Budapest: made-to-order streetwear with a live QR code on the back that gives strangers an easy, fun excuse to talk and become friends.',
      'We\'re putting the finishing touches on the first shirts right now. You won\'t get annoying daily emails from us. We\'ll write when the shirts are ready to order (with the Founders\' price, because you joined before launch), and now and then about new dare decks, features and STREETDARE nights.',
      'See you out there soon,\nAron & the STREETDARE crew'
    ],
    launchSubject: 'STREETDARE is live - your Founders\' price is waiting 🎟️',
    launch: [
      'Hey,',
      'Thank you for being part of the STREETDARE community from the very beginning.',
      'Today, our made-to-order shirts are officially live! Each shirt comes with your personal QR code, your own dashboard to add custom dares, and stats from your nights out.',
      'Because you subscribed before launch, use the code {code} at checkout to get the Founders\' price. It\'s yours for 1 week.',
      'One thing first: we\'re starting in Spain and Hungary, so for now we only ship there. If you live somewhere else, hold on a little longer. You\'re on the list, and we\'ll write to you as soon as we ship to your country.',
      'Get your shirt → {url}',
      'See you on the dancefloor,\nAron & the STREETDARE crew'
    ],
    notyetSubject: 'STREETDARE is live (and we haven\'t forgotten {country}) 🌍',
    notyet: [
      'Hey,',
      'Thank you for being part of the STREETDARE community from the very beginning.',
      'Today our first shirts go live in Spain and Hungary. We can\'t ship to {country} yet, and I didn\'t want you to find that out at checkout.',
      'You\'re on the list, and you\'ll be among the first to know the moment we start shipping to {country}. Your Founders\' price will be waiting for you.',
      'Until then, just reply to this email if you have a question. I read every one.',
      'See you soon,\nAron & the STREETDARE crew'
    ]
  },
  es: {
    welcomeSubject: 'Te damos la bienvenida a STREETDARE 👀',
    welcome: [
      'Hola:',
      '¡Te damos la bienvenida a la comunidad STREETDARE! Nos alegra mucho que hayas llegado tan pronto.',
      'La mayoría de la gente que sale a bares y discotecas en realidad quiere conocer gente nueva, pero no sabe cómo dar el primer paso. Por eso estamos creando STREETDARE en Madrid y Budapest: streetwear hecho por encargo con un QR en la espalda que les da a los desconocidos una excusa fácil y divertida para hablar y hacerse amigos.',
      'Ahora mismo estamos dando los últimos retoques a las primeras camisetas. No vas a recibir emails pesados todos los días. Te escribiremos cuando las camisetas se puedan pedir (con el precio de fundador, porque te uniste antes del lanzamiento) y, de vez en cuando, sobre nuevas barajas de retos, funciones y noches STREETDARE.',
      'Nos vemos pronto por ahí,\nAron y el equipo de STREETDARE'
    ],
    launchSubject: 'STREETDARE ya está aquí: tu precio de fundador te espera 🎟️',
    launch: [
      'Hola:',
      'Gracias por formar parte de la comunidad STREETDARE desde el principio.',
      '¡Hoy salen oficialmente nuestras camisetas hechas por encargo! Cada camiseta viene con tu QR personal, tu propio panel para añadir retos y las estadísticas de tus noches de fiesta.',
      'Como te apuntaste antes del lanzamiento, usa el código {code} al pagar y tendrás el precio de fundador. Es tuyo durante 1 semana.',
      'Una cosa antes: empezamos en España y Hungría, así que de momento solo enviamos allí. Si vives en otro país, espera un poquito más. Sigues en la lista y te escribiremos en cuanto enviemos a tu país.',
      'Consigue tu camiseta → {url}',
      'Nos vemos en la pista,\nAron y el equipo de STREETDARE'
    ],
    notyetSubject: 'STREETDARE ya está aquí (y no nos olvidamos de {country}) 🌍',
    notyet: [
      'Hola:',
      'Gracias por formar parte de la comunidad STREETDARE desde el principio.',
      'Hoy salen nuestras primeras camisetas en España y Hungría. Todavía no podemos enviar a {country}, y no quería que te enteraras al pagar.',
      'Sigues en la lista y serás de los primeros en saberlo en cuanto empecemos a enviar a {country}. Tu precio de fundador te estará esperando.',
      'Mientras tanto, si tienes cualquier pregunta, responde a este email. Los leo todos.',
      'Hasta pronto,\nAron y el equipo de STREETDARE'
    ]
  },
  hu: {
    welcomeSubject: 'Üdv a STREETDARE-ben 👀',
    welcome: [
      'Szia!',
      'Üdv a STREETDARE közösségben! Nagyon örülünk, hogy már az elején itt vagy.',
      'Bulizás közben a legtöbben szívesen megismernének új embereket, csak nem tudják, hogyan tegyék meg az első lépést. Ezért csináljuk a STREETDARE-t: rendelésre készülő streetwear egy QR-kóddal a hátán, ami könnyű és vicces ürügyet ad idegeneknek, hogy szóba álljanak egymással.',
      'Most simítjuk el az utolsó részleteket az első pólókon. Nem fogunk naponta idegesítő e-mailekkel bombázni. Akkor írunk, amikor már rendelhetők a pólók (alapítói áron, mert még az indulás előtt csatlakoztál), és néha az új kihíváspaklikról, funkciókról és STREETDARE estékről.',
      'Hamarosan találkozunk,\nÁron és a STREETDARE csapat'
    ],
    launchSubject: 'Elindult a STREETDARE: vár az alapítói árad 🎟️',
    launch: [
      'Szia!',
      'Köszönjük, hogy a kezdetektől a STREETDARE közösség része vagy.',
      'Ma hivatalosan is elindultak a rendelésre készülő pólóink! Mindegyikhez jár a saját QR-kódod, egy saját felület, ahol kihívásokat adhatsz hozzá, és statisztikák a bulis estéidről.',
      'Mivel még az indulás előtt feliratkoztál, a {code} kóddal alapítói áron rendelhetsz. Egy hétig a tiéd.',
      'Egy fontos dolog: Spanyolországban és Magyarországon indulunk, így egyelőre csak oda szállítunk. Ha máshol élsz, várj még egy kicsit. Fent vagy a listán, és szólunk, amint a te országodba is szállítunk.',
      'Kérem a pólómat → {url}',
      'Találkozunk a táncparketten,\nÁron és a STREETDARE csapat'
    ],
    notyetSubject: 'Elindult a STREETDARE (és nem feledkeztünk meg rólad: {country}) 🌍',
    notyet: [
      'Szia!',
      'Köszönjük, hogy a kezdetektől a STREETDARE közösség része vagy.',
      'Ma indulnak az első pólóink Spanyolországban és Magyarországon. Ide ({country}) még nem tudunk szállítani, és nem akartam, hogy ezt a fizetésnél tudd meg.',
      'Fent maradsz a listán, és az elsők között szólunk, amint ide is szállítunk. Az alapítói árad megvár.',
      'Addig is, ha kérdésed van, csak válaszolj erre a levélre. Mindet elolvasom.',
      'Hamarosan találkozunk,\nÁron és a STREETDARE csapat'
    ]
  }
};
/* every email ends with a one-step way out */
const UNSUB = {
  en: 'Don\'t want these emails any more? Just reply "unsubscribe" and we\'ll take you off the list.',
  es: '¿No quieres recibir más emails? Responde «baja» y te quitamos de la lista.',
  hu: 'Nem szeretnél több e-mailt? Válaszolj erre a levélre azzal, hogy „leiratkozom”, és levesszük a listáról.'
};
/* countries we ship to at launch; everyone else gets the personal "not in your country yet" email */
const SHIP_TO = ['ES', 'HU'];
/* country names for the emails (en/es/hu) */
const COUNTRY_NAMES = {"AD":{"en":"Andorra","es":"Andorra","hu":"Andorra"},"AE":{"en":"United Arab Emirates","es":"Emiratos Árabes Unidos","hu":"Egyesült Arab Emírségek"},"AF":{"en":"Afghanistan","es":"Afganistán","hu":"Afganisztán"},"AG":{"en":"Antigua & Barbuda","es":"Antigua y Barbuda","hu":"Antigua és Barbuda"},"AI":{"en":"Anguilla","es":"Anguila","hu":"Anguilla"},"AL":{"en":"Albania","es":"Albania","hu":"Albánia"},"AM":{"en":"Armenia","es":"Armenia","hu":"Örményország"},"AO":{"en":"Angola","es":"Angola","hu":"Angola"},"AQ":{"en":"Antarctica","es":"Antártida","hu":"Antarktisz"},"AR":{"en":"Argentina","es":"Argentina","hu":"Argentína"},"AS":{"en":"American Samoa","es":"Samoa Americana","hu":"Amerikai Szamoa"},"AT":{"en":"Austria","es":"Austria","hu":"Ausztria"},"AU":{"en":"Australia","es":"Australia","hu":"Ausztrália"},"AW":{"en":"Aruba","es":"Aruba","hu":"Aruba"},"AX":{"en":"Åland Islands","es":"Islas Aland","hu":"Åland-szigetek"},"AZ":{"en":"Azerbaijan","es":"Azerbaiyán","hu":"Azerbajdzsán"},"BA":{"en":"Bosnia & Herzegovina","es":"Bosnia y Herzegovina","hu":"Bosznia-Hercegovina"},"BB":{"en":"Barbados","es":"Barbados","hu":"Barbados"},"BD":{"en":"Bangladesh","es":"Bangladés","hu":"Banglades"},"BE":{"en":"Belgium","es":"Bélgica","hu":"Belgium"},"BF":{"en":"Burkina Faso","es":"Burkina Faso","hu":"Burkina Faso"},"BG":{"en":"Bulgaria","es":"Bulgaria","hu":"Bulgária"},"BH":{"en":"Bahrain","es":"Baréin","hu":"Bahrein"},"BI":{"en":"Burundi","es":"Burundi","hu":"Burundi"},"BJ":{"en":"Benin","es":"Benín","hu":"Benin"},"BL":{"en":"St. Barthélemy","es":"San Bartolomé","hu":"Saint-Barthélemy"},"BM":{"en":"Bermuda","es":"Bermudas","hu":"Bermuda"},"BN":{"en":"Brunei","es":"Brunéi","hu":"Brunei"},"BO":{"en":"Bolivia","es":"Bolivia","hu":"Bolívia"},"BQ":{"en":"Caribbean Netherlands","es":"Caribe neerlandés","hu":"Holland Karib-térség"},"BR":{"en":"Brazil","es":"Brasil","hu":"Brazília"},"BS":{"en":"Bahamas","es":"Bahamas","hu":"Bahama-szigetek"},"BT":{"en":"Bhutan","es":"Bután","hu":"Bhután"},"BW":{"en":"Botswana","es":"Botsuana","hu":"Botswana"},"BY":{"en":"Belarus","es":"Bielorrusia","hu":"Belarusz"},"BZ":{"en":"Belize","es":"Belice","hu":"Belize"},"CA":{"en":"Canada","es":"Canadá","hu":"Kanada"},"CC":{"en":"Cocos (Keeling) Islands","es":"Islas Cocos","hu":"Kókusz (Keeling)-szigetek"},"CD":{"en":"Congo - Kinshasa","es":"República Democrática del Congo","hu":"Kongó – Kinshasa"},"CF":{"en":"Central African Republic","es":"República Centroafricana","hu":"Közép-afrikai Köztársaság"},"CG":{"en":"Congo - Brazzaville","es":"Congo","hu":"Kongó – Brazzaville"},"CH":{"en":"Switzerland","es":"Suiza","hu":"Svájc"},"CI":{"en":"Côte d’Ivoire","es":"Côte d’Ivoire","hu":"Elefántcsontpart"},"CK":{"en":"Cook Islands","es":"Islas Cook","hu":"Cook-szigetek"},"CL":{"en":"Chile","es":"Chile","hu":"Chile"},"CM":{"en":"Cameroon","es":"Camerún","hu":"Kamerun"},"CN":{"en":"China","es":"China","hu":"Kína"},"CO":{"en":"Colombia","es":"Colombia","hu":"Kolumbia"},"CR":{"en":"Costa Rica","es":"Costa Rica","hu":"Costa Rica"},"CU":{"en":"Cuba","es":"Cuba","hu":"Kuba"},"CV":{"en":"Cape Verde","es":"Cabo Verde","hu":"Zöld-foki Köztársaság"},"CW":{"en":"Curaçao","es":"Curazao","hu":"Curaçao"},"CX":{"en":"Christmas Island","es":"Isla de Navidad","hu":"Karácsony-sziget"},"CY":{"en":"Cyprus","es":"Chipre","hu":"Ciprus"},"CZ":{"en":"Czechia","es":"Chequia","hu":"Csehország"},"DE":{"en":"Germany","es":"Alemania","hu":"Németország"},"DJ":{"en":"Djibouti","es":"Yibuti","hu":"Dzsibuti"},"DK":{"en":"Denmark","es":"Dinamarca","hu":"Dánia"},"DM":{"en":"Dominica","es":"Dominica","hu":"Dominika"},"DO":{"en":"Dominican Republic","es":"República Dominicana","hu":"Dominikai Köztársaság"},"DZ":{"en":"Algeria","es":"Argelia","hu":"Algéria"},"EC":{"en":"Ecuador","es":"Ecuador","hu":"Ecuador"},"EE":{"en":"Estonia","es":"Estonia","hu":"Észtország"},"EG":{"en":"Egypt","es":"Egipto","hu":"Egyiptom"},"EH":{"en":"Western Sahara","es":"Sáhara Occidental","hu":"Nyugat-Szahara"},"ER":{"en":"Eritrea","es":"Eritrea","hu":"Eritrea"},"ES":{"en":"Spain","es":"España","hu":"Spanyolország"},"ET":{"en":"Ethiopia","es":"Etiopía","hu":"Etiópia"},"FI":{"en":"Finland","es":"Finlandia","hu":"Finnország"},"FJ":{"en":"Fiji","es":"Fiyi","hu":"Fidzsi"},"FK":{"en":"Falkland Islands","es":"Islas Malvinas","hu":"Falkland-szigetek"},"FM":{"en":"Micronesia","es":"Micronesia","hu":"Mikronézia"},"FO":{"en":"Faroe Islands","es":"Islas Feroe","hu":"Feröer szigetek"},"FR":{"en":"France","es":"Francia","hu":"Franciaország"},"GA":{"en":"Gabon","es":"Gabón","hu":"Gabon"},"GB":{"en":"United Kingdom","es":"Reino Unido","hu":"Egyesült Királyság"},"GD":{"en":"Grenada","es":"Granada","hu":"Grenada"},"GE":{"en":"Georgia","es":"Georgia","hu":"Grúzia"},"GF":{"en":"French Guiana","es":"Guayana Francesa","hu":"Francia Guyana"},"GG":{"en":"Guernsey","es":"Guernesey","hu":"Guernsey"},"GH":{"en":"Ghana","es":"Ghana","hu":"Ghána"},"GI":{"en":"Gibraltar","es":"Gibraltar","hu":"Gibraltár"},"GL":{"en":"Greenland","es":"Groenlandia","hu":"Grönland"},"GM":{"en":"Gambia","es":"Gambia","hu":"Gambia"},"GN":{"en":"Guinea","es":"Guinea","hu":"Guinea"},"GP":{"en":"Guadeloupe","es":"Guadalupe","hu":"Guadeloupe"},"GQ":{"en":"Equatorial Guinea","es":"Guinea Ecuatorial","hu":"Egyenlítői-Guinea"},"GR":{"en":"Greece","es":"Grecia","hu":"Görögország"},"GS":{"en":"South Georgia & South Sandwich Islands","es":"Islas Georgia del Sur y Sandwich del Sur","hu":"Déli-Georgia és Déli-Sandwich-szigetek"},"GT":{"en":"Guatemala","es":"Guatemala","hu":"Guatemala"},"GU":{"en":"Guam","es":"Guam","hu":"Guam"},"GW":{"en":"Guinea-Bissau","es":"Guinea-Bisáu","hu":"Bissau-Guinea"},"GY":{"en":"Guyana","es":"Guyana","hu":"Guyana"},"HK":{"en":"Hong Kong SAR China","es":"RAE de Hong Kong (China)","hu":"Hongkong KKT"},"HN":{"en":"Honduras","es":"Honduras","hu":"Honduras"},"HR":{"en":"Croatia","es":"Croacia","hu":"Horvátország"},"HT":{"en":"Haiti","es":"Haití","hu":"Haiti"},"HU":{"en":"Hungary","es":"Hungría","hu":"Magyarország"},"ID":{"en":"Indonesia","es":"Indonesia","hu":"Indonézia"},"IE":{"en":"Ireland","es":"Irlanda","hu":"Írország"},"IL":{"en":"Israel","es":"Israel","hu":"Izrael"},"IM":{"en":"Isle of Man","es":"Isla de Man","hu":"Man-sziget"},"IN":{"en":"India","es":"India","hu":"India"},"IO":{"en":"British Indian Ocean Territory","es":"Territorio Británico del Océano Índico","hu":"Brit Indiai-óceáni Terület"},"IQ":{"en":"Iraq","es":"Irak","hu":"Irak"},"IR":{"en":"Iran","es":"Irán","hu":"Irán"},"IS":{"en":"Iceland","es":"Islandia","hu":"Izland"},"IT":{"en":"Italy","es":"Italia","hu":"Olaszország"},"JE":{"en":"Jersey","es":"Jersey","hu":"Jersey"},"JM":{"en":"Jamaica","es":"Jamaica","hu":"Jamaica"},"JO":{"en":"Jordan","es":"Jordania","hu":"Jordánia"},"JP":{"en":"Japan","es":"Japón","hu":"Japán"},"KE":{"en":"Kenya","es":"Kenia","hu":"Kenya"},"KG":{"en":"Kyrgyzstan","es":"Kirguistán","hu":"Kirgizisztán"},"KH":{"en":"Cambodia","es":"Camboya","hu":"Kambodzsa"},"KI":{"en":"Kiribati","es":"Kiribati","hu":"Kiribati"},"KM":{"en":"Comoros","es":"Comoras","hu":"Comore-szigetek"},"KN":{"en":"St. Kitts & Nevis","es":"San Cristóbal y Nieves","hu":"Saint Kitts és Nevis"},"KP":{"en":"North Korea","es":"Corea del Norte","hu":"Észak-Korea"},"KR":{"en":"South Korea","es":"Corea del Sur","hu":"Dél-Korea"},"KW":{"en":"Kuwait","es":"Kuwait","hu":"Kuvait"},"KY":{"en":"Cayman Islands","es":"Islas Caimán","hu":"Kajmán-szigetek"},"KZ":{"en":"Kazakhstan","es":"Kazajistán","hu":"Kazahsztán"},"LA":{"en":"Laos","es":"Laos","hu":"Laosz"},"LB":{"en":"Lebanon","es":"Líbano","hu":"Libanon"},"LC":{"en":"St. Lucia","es":"Santa Lucía","hu":"Saint Lucia"},"LI":{"en":"Liechtenstein","es":"Liechtenstein","hu":"Liechtenstein"},"LK":{"en":"Sri Lanka","es":"Sri Lanka","hu":"Srí Lanka"},"LR":{"en":"Liberia","es":"Liberia","hu":"Libéria"},"LS":{"en":"Lesotho","es":"Lesoto","hu":"Lesotho"},"LT":{"en":"Lithuania","es":"Lituania","hu":"Litvánia"},"LU":{"en":"Luxembourg","es":"Luxemburgo","hu":"Luxemburg"},"LV":{"en":"Latvia","es":"Letonia","hu":"Lettország"},"LY":{"en":"Libya","es":"Libia","hu":"Líbia"},"MA":{"en":"Morocco","es":"Marruecos","hu":"Marokkó"},"MC":{"en":"Monaco","es":"Mónaco","hu":"Monaco"},"MD":{"en":"Moldova","es":"Moldavia","hu":"Moldova"},"ME":{"en":"Montenegro","es":"Montenegro","hu":"Montenegró"},"MF":{"en":"St. Martin","es":"San Martín","hu":"Saint Martin"},"MG":{"en":"Madagascar","es":"Madagascar","hu":"Madagaszkár"},"MH":{"en":"Marshall Islands","es":"Islas Marshall","hu":"Marshall-szigetek"},"MK":{"en":"North Macedonia","es":"Macedonia del Norte","hu":"Észak-Macedónia"},"ML":{"en":"Mali","es":"Mali","hu":"Mali"},"MM":{"en":"Myanmar (Burma)","es":"Myanmar (Birmania)","hu":"Mianmar"},"MN":{"en":"Mongolia","es":"Mongolia","hu":"Mongólia"},"MO":{"en":"Macao SAR China","es":"RAE de Macao (China)","hu":"Makaó KKT"},"MP":{"en":"Northern Mariana Islands","es":"Islas Marianas del Norte","hu":"Északi Mariana-szigetek"},"MQ":{"en":"Martinique","es":"Martinica","hu":"Martinique"},"MR":{"en":"Mauritania","es":"Mauritania","hu":"Mauritánia"},"MS":{"en":"Montserrat","es":"Montserrat","hu":"Montserrat"},"MT":{"en":"Malta","es":"Malta","hu":"Málta"},"MU":{"en":"Mauritius","es":"Mauricio","hu":"Mauritius"},"MV":{"en":"Maldives","es":"Maldivas","hu":"Maldív-szigetek"},"MW":{"en":"Malawi","es":"Malaui","hu":"Malawi"},"MX":{"en":"Mexico","es":"México","hu":"Mexikó"},"MY":{"en":"Malaysia","es":"Malasia","hu":"Malajzia"},"MZ":{"en":"Mozambique","es":"Mozambique","hu":"Mozambik"},"NA":{"en":"Namibia","es":"Namibia","hu":"Namíbia"},"NC":{"en":"New Caledonia","es":"Nueva Caledonia","hu":"Új-Kaledónia"},"NE":{"en":"Niger","es":"Níger","hu":"Niger"},"NF":{"en":"Norfolk Island","es":"Isla Norfolk","hu":"Norfolk-sziget"},"NG":{"en":"Nigeria","es":"Nigeria","hu":"Nigéria"},"NI":{"en":"Nicaragua","es":"Nicaragua","hu":"Nicaragua"},"NL":{"en":"Netherlands","es":"Países Bajos","hu":"Hollandia"},"NO":{"en":"Norway","es":"Noruega","hu":"Norvégia"},"NP":{"en":"Nepal","es":"Nepal","hu":"Nepál"},"NR":{"en":"Nauru","es":"Nauru","hu":"Nauru"},"NU":{"en":"Niue","es":"Niue","hu":"Niue"},"NZ":{"en":"New Zealand","es":"Nueva Zelanda","hu":"Új-Zéland"},"OM":{"en":"Oman","es":"Omán","hu":"Omán"},"PA":{"en":"Panama","es":"Panamá","hu":"Panama"},"PE":{"en":"Peru","es":"Perú","hu":"Peru"},"PF":{"en":"French Polynesia","es":"Polinesia Francesa","hu":"Francia Polinézia"},"PG":{"en":"Papua New Guinea","es":"Papúa Nueva Guinea","hu":"Pápua Új-Guinea"},"PH":{"en":"Philippines","es":"Filipinas","hu":"Fülöp-szigetek"},"PK":{"en":"Pakistan","es":"Pakistán","hu":"Pakisztán"},"PL":{"en":"Poland","es":"Polonia","hu":"Lengyelország"},"PM":{"en":"St. Pierre & Miquelon","es":"San Pedro y Miquelón","hu":"Saint-Pierre és Miquelon"},"PN":{"en":"Pitcairn Islands","es":"Islas Pitcairn","hu":"Pitcairn-szigetek"},"PR":{"en":"Puerto Rico","es":"Puerto Rico","hu":"Puerto Rico"},"PS":{"en":"Palestinian Territories","es":"Territorios Palestinos","hu":"Palesztin Autonómia"},"PT":{"en":"Portugal","es":"Portugal","hu":"Portugália"},"PW":{"en":"Palau","es":"Palaos","hu":"Palau"},"PY":{"en":"Paraguay","es":"Paraguay","hu":"Paraguay"},"QA":{"en":"Qatar","es":"Catar","hu":"Katar"},"RE":{"en":"Réunion","es":"Reunión","hu":"Réunion"},"RO":{"en":"Romania","es":"Rumanía","hu":"Románia"},"RS":{"en":"Serbia","es":"Serbia","hu":"Szerbia"},"RU":{"en":"Russia","es":"Rusia","hu":"Oroszország"},"RW":{"en":"Rwanda","es":"Ruanda","hu":"Ruanda"},"SA":{"en":"Saudi Arabia","es":"Arabia Saudí","hu":"Szaúd-Arábia"},"SB":{"en":"Solomon Islands","es":"Islas Salomón","hu":"Salamon-szigetek"},"SC":{"en":"Seychelles","es":"Seychelles","hu":"Seychelle-szigetek"},"SD":{"en":"Sudan","es":"Sudán","hu":"Szudán"},"SE":{"en":"Sweden","es":"Suecia","hu":"Svédország"},"SG":{"en":"Singapore","es":"Singapur","hu":"Szingapúr"},"SH":{"en":"St. Helena","es":"Santa Elena","hu":"Szent Ilona"},"SI":{"en":"Slovenia","es":"Eslovenia","hu":"Szlovénia"},"SJ":{"en":"Svalbard & Jan Mayen","es":"Svalbard y Jan Mayen","hu":"Svalbard és Jan Mayen"},"SK":{"en":"Slovakia","es":"Eslovaquia","hu":"Szlovákia"},"SL":{"en":"Sierra Leone","es":"Sierra Leona","hu":"Sierra Leone"},"SM":{"en":"San Marino","es":"San Marino","hu":"San Marino"},"SN":{"en":"Senegal","es":"Senegal","hu":"Szenegál"},"SO":{"en":"Somalia","es":"Somalia","hu":"Szomália"},"SR":{"en":"Suriname","es":"Surinam","hu":"Suriname"},"SS":{"en":"South Sudan","es":"Sudán del Sur","hu":"Dél-Szudán"},"ST":{"en":"São Tomé & Príncipe","es":"Santo Tomé y Príncipe","hu":"São Tomé és Príncipe"},"SV":{"en":"El Salvador","es":"El Salvador","hu":"Salvador"},"SX":{"en":"Sint Maarten","es":"Sint Maarten","hu":"Sint Maarten"},"SY":{"en":"Syria","es":"Siria","hu":"Szíria"},"SZ":{"en":"Eswatini","es":"Esuatini","hu":"Szváziföld"},"TC":{"en":"Turks & Caicos Islands","es":"Islas Turcas y Caicos","hu":"Turks- és Caicos-szigetek"},"TD":{"en":"Chad","es":"Chad","hu":"Csád"},"TF":{"en":"French Southern Territories","es":"Territorios Australes Franceses","hu":"Francia Déli Területek"},"TG":{"en":"Togo","es":"Togo","hu":"Togo"},"TH":{"en":"Thailand","es":"Tailandia","hu":"Thaiföld"},"TJ":{"en":"Tajikistan","es":"Tayikistán","hu":"Tádzsikisztán"},"TK":{"en":"Tokelau","es":"Tokelau","hu":"Tokelau"},"TL":{"en":"Timor-Leste","es":"Timor-Leste","hu":"Kelet-Timor"},"TM":{"en":"Turkmenistan","es":"Turkmenistán","hu":"Türkmenisztán"},"TN":{"en":"Tunisia","es":"Túnez","hu":"Tunézia"},"TO":{"en":"Tonga","es":"Tonga","hu":"Tonga"},"TR":{"en":"Türkiye","es":"Turquía","hu":"Törökország"},"TT":{"en":"Trinidad & Tobago","es":"Trinidad y Tobago","hu":"Trinidad és Tobago"},"TV":{"en":"Tuvalu","es":"Tuvalu","hu":"Tuvalu"},"TW":{"en":"Taiwan","es":"Taiwán","hu":"Tajvan"},"TZ":{"en":"Tanzania","es":"Tanzania","hu":"Tanzánia"},"UA":{"en":"Ukraine","es":"Ucrania","hu":"Ukrajna"},"UG":{"en":"Uganda","es":"Uganda","hu":"Uganda"},"UM":{"en":"U.S. Outlying Islands","es":"Islas menores alejadas de EE. UU.","hu":"Az USA lakatlan külbirtokai"},"US":{"en":"United States","es":"Estados Unidos","hu":"Egyesült Államok"},"UY":{"en":"Uruguay","es":"Uruguay","hu":"Uruguay"},"UZ":{"en":"Uzbekistan","es":"Uzbekistán","hu":"Üzbegisztán"},"VA":{"en":"Vatican City","es":"Ciudad del Vaticano","hu":"Vatikán"},"VC":{"en":"St. Vincent & Grenadines","es":"San Vicente y las Granadinas","hu":"Saint Vincent és a Grenadine-szigetek"},"VE":{"en":"Venezuela","es":"Venezuela","hu":"Venezuela"},"VG":{"en":"British Virgin Islands","es":"Islas Vírgenes Británicas","hu":"Brit Virgin-szigetek"},"VI":{"en":"U.S. Virgin Islands","es":"Islas Vírgenes de EE. UU.","hu":"Amerikai Virgin-szigetek"},"VN":{"en":"Vietnam","es":"Vietnam","hu":"Vietnám"},"VU":{"en":"Vanuatu","es":"Vanuatu","hu":"Vanuatu"},"WF":{"en":"Wallis & Futuna","es":"Wallis y Futuna","hu":"Wallis és Futuna"},"WS":{"en":"Samoa","es":"Samoa","hu":"Szamoa"},"YE":{"en":"Yemen","es":"Yemen","hu":"Jemen"},"YT":{"en":"Mayotte","es":"Mayotte","hu":"Mayotte"},"ZA":{"en":"South Africa","es":"Sudáfrica","hu":"Dél-afrikai Köztársaság"},"ZM":{"en":"Zambia","es":"Zambia","hu":"Zambia"},"ZW":{"en":"Zimbabwe","es":"Zimbabue","hu":"Zimbabwe"}};
function mail(to, lang, kind, country) {
  const L = MAIL[lang] ? lang : 'en', m = MAIL[L];
  const cn = COUNTRY_NAMES[country] ? (COUNTRY_NAMES[country][L] || COUNTRY_NAMES[country].en) : (country || '');
  const fill = t => t.replace(/\{code\}/g, LAUNCH_CODE).replace(/\{url\}/g, LAUNCH_URL).replace(/\{country\}/g, cn);
  const body = fill(m[kind].join('\n\n')) + '\n\n--\n' + UNSUB[L];
  MailApp.sendEmail(to, fill(m[kind + 'Subject']), body, { name: SENDER_NAME, replyTo: REPLY_TO });
}
/* Run once from the editor after pasting this file: it asks for permission to send email
   and sends the welcome email to yourself so you can see it. */
function testWelcome() { mail(Session.getActiveUser().getEmail(), 'en', 'welcome'); }
/* Optional: see the "not in your country yet" launch email (sent to yourself, as if you lived in Germany). */
function testNotYet() { mail(Session.getActiveUser().getEmail(), 'en', 'notyet', 'DE'); }

/* Run from the editor on launch day. Emails everyone on the Waitlist who has not had the launch
   email yet and writes the date in the "launch_sent" column. People who picked a country we don't ship to
   (anything but SHIP_TO) get the personal "not in your country yet" email instead. Gmail allows about 100 emails a day,
   so with a longer list run it again the next day: it carries on where it stopped. */
function sendLaunchEmail() {
  if (!LAUNCH_URL) throw new Error('Set LAUNCH_URL at the top of this file first.');
  const sh = tab('Waitlist'), rows = sh.getDataRange().getValues();
  if (rows[0][5] !== 'country') sh.getRange(1, 6).setValue('country');
  if (rows[0][6] !== 'launch_sent') sh.getRange(1, 7).setValue('launch_sent');
  let sent = 0;
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][1] || rows[i][6]) continue;
    if (MailApp.getRemainingDailyQuota() < 1) break;
    const c = String(rows[i][5] || '').toUpperCase();
    /* outside the countries we ship to: a personal "not in your country yet" email instead */
    mail(String(rows[i][1]), String(rows[i][2]), c && SHIP_TO.indexOf(c) < 0 ? 'notyet' : 'launch', c);
    sh.getRange(i + 1, 7).setValue(new Date()); sent++;
  }
  Logger.log('Launch emails sent: ' + sent);
}

const TABS = {
  Waitlist: ['created', 'email', 'lang', 'source', 'shirt', 'country', 'launch_sent'],
  Wall:     ['created', 'text', 'ig', 'lang', 'shirt', 'hidden', 'reports'],
  Events:   ['created', 'type', 'shirt', 'quest', 'lang']
};

function tab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  return sh;
}
function clean(v, max) { return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, max); }
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  try {
    if ((e.parameter.fn || '') !== 'getWall') return out({ ok: false, error: 'unknown' });
    const rows = tab('Wall').getDataRange().getValues().slice(1);
    const data = rows.filter(r => r[1] && !r[5]).slice(-50).reverse()
      .map(r => ({ text: String(r[1]), ig: String(r[2] || ''), created: new Date(r[0]).getTime() }));
    return out({ ok: true, data: data });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const now = new Date(), lang = clean(d.lang, 5), shirt = clean(d.shirt, 12);
    if (d.fn === 'joinWaitlist') {
      const email = String(d.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return out({ ok: false, error: 'bad email' });
      const sh = tab('Waitlist');
      const known = sh.getRange(1, 2, Math.max(sh.getLastRow(), 1), 1).getValues().some(r => r[0] === email);
      if (!known) {
        const country = (String(d.country || '').toUpperCase().match(/^[A-Z]{2}$/) || [''])[0];
        if (country && sh.getRange(1, 6).getValue() !== 'country') sh.getRange(1, 6).setValue('country');
        sh.appendRow([now, email, lang, clean(d.source, 30), shirt, country]);
        if (WELCOME_ON && String(d.source || '').indexOf('stage-') !== 0) { try { mail(email, lang, 'welcome', country); } catch (err) {} }
      }
      return out({ ok: true, data: true });
    }
    if (d.fn === 'postMessage') {
      const text = clean(String(d.text || '').trim(), 280);
      if (!text) return out({ ok: false, error: 'empty' });
      const ig = (String(d.ig || '').replace(/^@/, '').match(/^[\w.]{1,30}$/) || [''])[0];
      if (sdHurtful(text) || sdHurtful(ig)) return out({ ok: false, error: 'hurtful' });
      tab('Wall').appendRow([now, text, ig, lang, shirt, '']);
      return out({ ok: true, data: true });
    }
    if (d.fn === 'reportMessage') {
      const sh = tab('Wall'), rows = sh.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (new Date(rows[i][0]).getTime() === Number(d.created) && String(rows[i][1]) === String(d.text)) {
          const n = (Number(rows[i][6]) || 0) + 1;
          sh.getRange(i + 1, 7).setValue(n);
          if (n >= 3 && !rows[i][5]) sh.getRange(i + 1, 6).setValue('reported');
          break;
        }
      }
      return out({ ok: true, data: true });
    }
    if (d.fn === 'logEvent') {
      tab('Events').appendRow([now, clean(d.type, 20), shirt, clean(d.quest, 200), lang]);
      return out({ ok: true, data: true });
    }
    return out({ ok: false, error: 'unknown' });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

/* ===== word filter for the Wall (same list as js/wordfilter.js) ===== */
/* Words that can hurt people (EN/ES/HU), used on the Wall and the dare-idea box.
   Built from backend/username-blocklist.txt, minus everyday words (e.g. "negro" is just "black" in Spanish).
   sub = blocked inside any word, tok = blocked only as a whole word. Digits are read as letters (0=o 1=i 3=e 4=a 5=s 7=t). */
var SD_BAD_SUB = ["anyadat", "arsehole", "asshole", "bastard", "baszd", "baszik", "baszni", "bazdmeg", "bazmeg", "beaner", "bestiality", "bitch", "blowjob", "bollera", "boobs", "buzeral", "buzeran", "buzi", "cabron", "cabrona", "chupamela", "cojones", "culero", "cunt", "dildo", "faggot", "fagot", "fasz", "fogyatekos", "follar", "fuck", "fvck", "geci", "gilipollas", "handjob", "heilhitler", "hentai", "hijodeputa", "hijueputa", "hitler", "horny", "incest", "jihadi", "jizz", "joder", "kkk", "kocsog", "kurva", "kurvaanyad", "leszop", "lotyo", "mamon", "maricon", "mariconazo", "mierda", "milf", "mocskos", "molest", "mongolico", "mongolo", "motherf", "negrata", "nigga", "niggah", "nigger", "nsfw", "nyomorek", "paedo", "pedophil", "pendejo", "penis", "picsa", "porn", "punci", "pussy", "putero", "puticlub", "raghead", "rapist", "retard", "retardalt", "retrasado", "ribanc", "seggfej", "segglyuk", "shemale", "shit", "siegheil", "slut", "subnormal", "sudaca", "szopj", "szopo", "terrorist", "tortillera", "towelhead", "tranny", "travelo", "twat", "vagina", "violador", "wanker", "wetback", "whitepower", "whitepride", "whore", "xxx", "zorra", "zsidozo"];
var SD_BAD_TOK = ["anyad", "chink", "chocho", "cigo", "coon", "culo", "dyke", "fag", "fags", "fck", "fuk", "gook", "hdp", "kike", "kys", "mamada", "marica", "nazi", "paki", "pedo", "pene", "pina", "polla", "puta", "putas", "putita", "puto", "putos", "rape", "spaz", "spic", "szar", "szaros", "verga", "violar"];
function sdHurtful(text){
  const norm = String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = norm.split(/[^a-z0-9@]+/).filter(Boolean);
  const leet = w => w.replace(/[0134578@]/g, c => ({ '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a' })[c]);
  const squashed = norm.replace(/[^a-z0-9@]+/g, '');
  for (const raw of words){
    const w = leet(raw);
    if (SD_BAD_TOK.includes(w) || SD_BAD_TOK.includes(raw)) return true;
    if (SD_BAD_SUB.some(b => w.includes(b))) return true;
  }
  /* spaced-out tricks like "f u c k" or "n.i.g.g.e.r" */
  const sq = leet(squashed);
  return words.filter(w => w.length === 1).length >= 3 && SD_BAD_SUB.concat(SD_BAD_TOK).some(b => b.length >= 3 && sq.includes(b));
}
