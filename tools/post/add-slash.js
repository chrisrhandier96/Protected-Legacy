// Netlify cannot 301 "/x" to "/x/" for rewritten flat files (rules match both),
// so each rewritten page sends the no-slash address to its canonical one.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2];
const MARK = '<!-- trailing slash -->';
let n = 0;
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const file = path.join(ROOT, f);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes(MARK)) continue;
  const can = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (!can) continue;
  const p = new URL(can).pathname;
  if (p === '/' || !p.endsWith('/')) continue;
  const bare = p.slice(0, -1);
  const tag = `${MARK}\n<script>if(location.pathname==='${bare}')location.replace('${p}'+location.search+location.hash);</script>\n`;
  const i = s.indexOf('<head>');
  if (i < 0) { console.log('no <head> in', f); continue; }
  s = s.slice(0, i + 6) + '\n' + tag + s.slice(i + 6).replace(/^\r?\n/, '');
  fs.writeFileSync(file, s);
  n++;
  console.log(f, bare, '->', p);
}
console.log('updated', n);
