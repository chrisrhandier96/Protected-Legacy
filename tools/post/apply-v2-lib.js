const fs = require('fs'), path = require('path'); const ROOT = process.argv[2];
const CSS = fs.readFileSync(path.join(__dirname, 'v2-lib.css'), 'utf8'); let n = 0;
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'en.html')) {
  const file = path.join(ROOT, f); let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/<style id="pp-v2-lib">[\s\S]*?<\/style>\n?/, '');
  s = s.replace('</head>', `<style id="pp-v2-lib">\n${CSS}</style>\n</head>`);
  fs.writeFileSync(file, s); n++;
}
console.log('library layer in', n, 'pages');
