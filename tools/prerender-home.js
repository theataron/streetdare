/* Fills the English text from js/text.js straight into index.html, so search engines and
   AI assistants (which often don't run JavaScript) can read the homepage.
   Run after changing js/text.js:  node tools/prerender-home.js
   Visitors still get their own language: the site's script replaces the text on load. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(root, 'js/text.js'), 'utf8') + ';global.T=T;');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), n = 0;
html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, open, tag, key, inner, close) => {
  const v = T.en[key];
  if (v == null || /<[a-z]+[^>]*data-i18n/.test(inner)) return m;
  n++; return open + v + close;
});
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Filled ' + n + ' texts');
