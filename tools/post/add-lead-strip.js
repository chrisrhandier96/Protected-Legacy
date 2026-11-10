// Lead strip (2026-10-26): puts the two-field "call me" card near the top of every guide (both languages) and
// under the hero on both homepages, and loads /js/lead-strip.v1.js. Idempotent: a page that already has the
// slot or the script is left alone. On the umbrella guides the slot goes under the guided path (guide-path.v1.js).
// Runs as the last step of tools/postbuild.js. Usage: node tools/post/add-lead-strip.js <repo root>
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const SCRIPT = '<script src="/js/lead-strip.v1.js" defer></script>';
const SLOT = '<div id="leadStrip"></div>';
// Layout-shift guard for the guides (2026-11-01): the strip is injected after the first paint, so its box is
// reserved here. Heights measured with Playwright on the v1 copy, per language and viewport width (the card is
// 268px once the content column caps at 720px, and wraps on narrower screens). The reserve collapses once the
// thank-you replaces the form. Measure again if the strip copy or its CSS changes. The homepages keep their own
// reserve in index.html and en.html.
// QA Nov 9: re-measured with the web fonts loaded, every width from 300 to 760 (the copy had moved the steps: on
// /guias/inundacion/ the card was 488 px tall at 336-340 px for a 470 px box, PSI CLS 0.088). Each step now starts
// 20 px later than measured, so a desktop scrollbar never leaves the box short; on phones that is at most a few
// px of extra space under the card in those 20 px. Natural heights (ES): 300 535, 328 509, 335 488, 341 470,
// 476 449, 566 423, 641 405, 701 268; (EN): 300 509, 302 488, 362 470, 416 449, 453 423, 669 405, 701 268.
const RESERVE = '<style id="ls-reserve-guide">'
  + '#leadStrip{order:-2;margin:0 0 24px;box-sizing:border-box;min-height:535px}'
  + 'html[lang="en"] #leadStrip{min-height:509px}'
  + '@media(min-width:322px){html[lang="en"] #leadStrip{min-height:488px}}'
  + '@media(min-width:348px){#leadStrip{min-height:509px}}'
  + '@media(min-width:355px){#leadStrip{min-height:488px}}'
  + '@media(min-width:361px){#leadStrip{min-height:470px}}'
  + '@media(min-width:382px){html[lang="en"] #leadStrip{min-height:470px}}'
  + '@media(min-width:436px){html[lang="en"] #leadStrip{min-height:449px}}'
  + '@media(min-width:473px){html[lang="en"] #leadStrip{min-height:423px}}'
  + '@media(min-width:496px){#leadStrip{min-height:449px}}'
  + '@media(min-width:586px){#leadStrip{min-height:423px}}'
  + '@media(min-width:661px){#leadStrip{min-height:405px}}'
  + '@media(min-width:689px){html[lang="en"] #leadStrip{min-height:405px}}'
  + '@media(min-width:721px){#leadStrip{min-height:268px}html[lang="en"] #leadStrip{min-height:268px}}'
  + 'html[lang] #leadStrip:has(.ls-done){min-height:0}'   // beats the English rules too (they carry html[lang="en"])
  + '</style>';
let touched = 0, skipped = 0;
for (const f of fs.readdirSync(ROOT)) {
  if (!/\.html$/.test(f)) continue;
  const isGuide = /^(guias-|en-guides-)/.test(f) && f !== 'guias.html' && f !== 'en-guides.html';
  const isHome = f === 'index.html' || f === 'en.html';
  if (!isGuide && !isHome) continue;
  const p = path.join(ROOT, f); let h = fs.readFileSync(p, 'utf8'); const before = h;
  if (!h.includes('id="leadStrip"')) {
    if (isGuide && h.includes('/js/guide-path.v1.js')) {
      // the umbrella guides: under the guided path, so the path comes first on every screen size
      h = h.replace(/(<script src="\/js\/guide-path\.v1\.js" defer><\/script>\n)/, '$1    ' + SLOT + '\n');
    } else if (isGuide) {
      // after the article opens, before the top card
      h = h.replace(/<article>\s*\n?/, m => m + '    ' + SLOT + '\n');
    } else {
      // after the hero's button row
      h = h.replace(/(<div class="cta-row">[\s\S]*?<\/div>\n)/, '$1    ' + SLOT + '\n');
    }
  }
  if (!h.includes('/js/lead-strip.v1.js')) h = h.replace(/<\/body>/, SCRIPT + '\n</body>');
  if (isGuide && !h.includes('id="ls-reserve-guide"')) h = h.replace(/<\/head>/, RESERVE + '\n</head>');
  else if (isGuide) h = h.replace(/<style id="ls-reserve-guide">[\s\S]*?<\/style>/, (m) => (m === RESERVE ? m : RESERVE));   // an older reserve is replaced
  if (h !== before) { fs.writeFileSync(p, h); touched++; } else skipped++;
}
process.stdout.write(`add-lead-strip: ${touched} page(s) changed, ${skipped} already done\n`);
