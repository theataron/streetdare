/* Words that can hurt people (EN/ES/HU), used on the Wall and the dare-idea box.
   Built from backend/username-blocklist.txt, minus everyday words (e.g. "negro" is just "black" in Spanish).
   sub = blocked inside any word, tok = blocked only as a whole word. Digits are read as letters (0=o 1=i 3=e 4=a 5=s 7=t). */
const SD_BAD_SUB = ["anyadat", "arsehole", "asshole", "bastard", "baszd", "baszik", "baszni", "bazdmeg", "bazmeg", "beaner", "bestiality", "bitch", "blowjob", "bollera", "boobs", "buzeral", "buzeran", "buzi", "cabron", "cabrona", "chupamela", "cojones", "culero", "cunt", "dildo", "faggot", "fagot", "fasz", "fogyatekos", "follar", "fuck", "fvck", "geci", "gilipollas", "handjob", "heilhitler", "hentai", "hijodeputa", "hijueputa", "hitler", "horny", "incest", "jihadi", "jizz", "joder", "kkk", "kocsog", "kurva", "kurvaanyad", "leszop", "lotyo", "mamon", "maricon", "mariconazo", "mierda", "milf", "mocskos", "molest", "mongolico", "mongolo", "motherf", "negrata", "nigga", "niggah", "nigger", "nsfw", "nyomorek", "paedo", "pedophil", "pendejo", "penis", "picsa", "porn", "punci", "pussy", "putero", "puticlub", "raghead", "rapist", "retard", "retardalt", "retrasado", "ribanc", "seggfej", "segglyuk", "shemale", "shit", "siegheil", "slut", "subnormal", "sudaca", "szopj", "szopo", "terrorist", "tortillera", "towelhead", "tranny", "travelo", "twat", "vagina", "violador", "wanker", "wetback", "whitepower", "whitepride", "whore", "xxx", "zorra", "zsidozo"];
const SD_BAD_TOK = ["anyad", "chink", "chocho", "cigo", "coon", "culo", "dyke", "fag", "fags", "fck", "fuk", "gook", "hdp", "kike", "kys", "mamada", "marica", "nazi", "paki", "pedo", "pene", "pina", "polla", "puta", "putas", "putita", "puto", "putos", "rape", "spaz", "spic", "szar", "szaros", "verga", "violar"];
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
