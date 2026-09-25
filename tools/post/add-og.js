// Put the share-card tags in the static HTML of every content page (link-preview
// bots do not run JavaScript). Spanish pages -> og.png, English pages -> og-en.png.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2], SITE = 'https://www.protectedlegacyfl.com';
const JS_OLD = "    meta('property','og:url',u+pg);\n    meta('property','og:image',u+'/og.png');\n    meta('name','twitter:image',u+'/og.png');\n";
let n = 0;
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const file = path.join(ROOT, f);
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('property="og:title"') || s.includes('property="og:image"')) continue;
  const en = /<html[^>]*\slang="en"/.test(s);
  const img = `${SITE}/${en ? 'og-en.png' : 'og.png'}`;
  const tags = [];
  if (!s.includes('property="og:url"')) {
    const canon = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (canon) tags.push(`<meta property="og:url" content="${canon}">`);
  }
  tags.push(`<meta property="og:image" content="${img}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Patrimonio Protegido · Christian R. González">');
  if (!s.includes('name="twitter:card"')) tags.push('<meta name="twitter:card" content="summary_large_image">');
  tags.push(`<meta name="twitter:image" content="${img}">`);
  // after the last og: meta tag in <head>
  const head = s.slice(0, s.indexOf('</head>'));
  const re = /<meta property="og:[^>]*>/g; let m, last = null;
  while ((m = re.exec(head))) last = m;
  if (!last) { console.log('no og tags in', f); continue; }
  const at = last.index + last[0].length;
  s = s.slice(0, at) + '\n' + tags.join('\n') + s.slice(at);
  if (s.includes(JS_OLD)) s = s.replace(JS_OLD, '');
  fs.writeFileSync(file, s);
  n++;
}
console.log('share tags added to', n, 'pages');
