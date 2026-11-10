// Clean image bytes (QA Nov 9, section 2.1): fail if any image under img/ (or the share cards at the root) carries a C2PA
// provenance manifest. Files that travel through Claude chat or some editors can pick one up (about 5.8 KB per file,
// pixels unchanged); on Nov 4 the five homepage plates had one (fixed in cf15c0c).
// Usage: node site-tests/img-clean.js [repo root]   (exit 1 on any hit). verify.js runs it as group "imgclean".
const fs = require('fs'), path = require('path');
const EXT = /\.(avif|webp|jpe?g|png)$/i;
const NEEDLES = [Buffer.from('C2PA'), Buffer.from('c2pa')];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

function scan(root) {
  const files = walk(path.join(root, 'img'), []);
  for (const f of fs.readdirSync(root)) if (EXT.test(f)) files.push(path.join(root, f));
  const hits = [];
  for (const f of files) {
    const b = fs.readFileSync(f);
    if (NEEDLES.some((n) => b.indexOf(n) >= 0)) hits.push(path.relative(root, f).replace(/\\/g, '/'));
  }
  return { files: files.length, hits };
}

module.exports = { scan };
if (require.main === module) {
  const r = scan(path.resolve(process.argv[2] || path.join(__dirname, '..')));
  console.log(r.hits.length ? `IMGCLEAN: ${r.hits.length} file(s) with a C2PA manifest:\n  ${r.hits.join('\n  ')}` : `IMGCLEAN: ${r.files} images, 0 with a C2PA manifest`);
  process.exitCode = r.hits.length ? 1 : 0;
}
