// Lead strip (2026-10-26): puts the two-field "call me" card near the top of every guide (both languages) and
// under the hero on both homepages, and loads /js/lead-strip.v1.js. Idempotent: a page that already has the
// slot or the script is left alone. Usage: node tools/post/add-lead-strip.js <repo root>
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const SCRIPT = '<script src="/js/lead-strip.v1.js" defer></script>';
const SLOT = '<div id="leadStrip"></div>';
let touched = 0, skipped = 0;
for (const f of fs.readdirSync(ROOT)) {
  if (!/\.html$/.test(f)) continue;
  const isGuide = /^(guias-|en-guides-)/.test(f) && f !== 'guias.html' && f !== 'en-guides.html';
  const isHome = f === 'index.html' || f === 'en.html';
  if (!isGuide && !isHome) continue;
  const p = path.join(ROOT, f); let h = fs.readFileSync(p, 'utf8'); const before = h;
  if (!h.includes('id="leadStrip"')) {
    if (isGuide) {
      // after the article opens, before the top card
      h = h.replace(/<article>\s*\n?/, m => m + '    ' + SLOT + '\n');
    } else {
      // after the hero's button row
      h = h.replace(/(<div class="cta-row">[\s\S]*?<\/div>\n)/, '$1    ' + SLOT + '\n');
    }
  }
  if (!h.includes('/js/lead-strip.v1.js')) h = h.replace(/<\/body>/, SCRIPT + '\n</body>');
  if (h !== before) { fs.writeFileSync(p, h); touched++; } else skipped++;
}
process.stdout.write(`add-lead-strip: ${touched} page(s) changed, ${skipped} already done\n`);
