// Insert (or refresh) the library side panel before </body> on every page.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2];
const snip = fs.readFileSync(path.join(__dirname, 'library-panel.html'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const re = /<!-- PP LIBRARY PANEL -->[\s\S]*?<!-- \/PP LIBRARY PANEL -->\n?/;
let n = 0;
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const file = path.join(ROOT, f);
  let s = fs.readFileSync(file, 'utf8');
  if (re.test(s)) s = s.replace(re, snip + '\n');
  else {
    const i = s.lastIndexOf('</body>');
    if (i < 0) { console.log('no </body>:', f); continue; }
    s = s.slice(0, i) + snip + '\n' + s.slice(i);
  }
  fs.writeFileSync(file, s);
  n++;
}
console.log('panel in', n, 'pages');
