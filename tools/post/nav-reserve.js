// Nav reserve (2026-11-03): on narrow screens the top bar's content sits right at the edge of one line, so a late width
// change (the logo face settling) flipped it between two lines (93 px) and one (82 px) after the first paint: a layout
// shift of up to 0.035 on every page. Reserving the two-line height below 430 px keeps the bar from shrinking under the
// reader. Measured with Playwright at 320 to 1440 px (wider screens never change height). Idempotent.
// Usage: node tools/post/nav-reserve.js <repo root>
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const CSS = '<style id="pp-nav-reserve">@media(max-width:429px){body>nav{min-height:93px;box-sizing:border-box}}</style>';
let touched = 0, skipped = 0;
for (const f of fs.readdirSync(ROOT)) {
  if (!/\.html$/.test(f)) continue;
  const p = path.join(ROOT, f); let h = fs.readFileSync(p, 'utf8');
  if (h.includes('id="pp-nav-reserve"') || !/<nav[\s>]/.test(h)) { skipped++; continue; }   // the CSS only touches a nav that is a direct child of body
  h = h.replace(/<\/head>/, CSS + '\n</head>');
  fs.writeFileSync(p, h); touched++;
}
process.stdout.write(`nav-reserve: ${touched} page(s) changed, ${skipped} skipped\n`);
