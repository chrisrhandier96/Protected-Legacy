// Audit fixes: self-hosted fonts, <main> landmark, logo link names, heading order,
// cache headers. No visible wording changes. Re-runnable.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2];
const tally = {}; const note = (f, k) => (tally[k] = tally[k] || []).push(f);

const FACES = '<style id="pp-fonts">' +
  "@font-face{font-family:'Marcellus';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/marcellus-400.woff2) format('woff2')}" +
  "@font-face{font-family:'Figtree';font-style:normal;font-weight:300 700;font-display:swap;src:url(/fonts/figtree-var.woff2) format('woff2')}" +
  "@font-face{font-family:'Figtree';font-style:italic;font-weight:400;font-display:swap;src:url(/fonts/figtree-italic-400.woff2) format('woff2')}" +
  "@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:500 600;font-display:swap;src:url(/fonts/cormorant-garamond-italic.woff2) format('woff2')}" +
  '.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
  '</style>';
const pre = f => `<link rel="preload" href="/fonts/${f}" as="font" type="font/woff2" crossorigin>`;

for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const file = path.join(ROOT, f); let s = fs.readFileSync(file, 'utf8'); const before = s;
  const home = f === 'index.html' || f === 'en.html';

  // 1. fonts: drop Google Fonts link + preconnects, add local @font-face + preloads
  if (!s.includes('id="pp-fonts"')) {
    const gf = s.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/);
    if (gf) {
      const loads = [pre('marcellus-400.woff2')]; // only the headline font; others load normally (LCP)
      s = s.replace(gf[0], loads.join('\n') + '\n' + FACES);
      s = s.replace(/<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"[^>]*>\n?/g, '');
      note(f, 'fonts');
    }
  }
  // 2. homepage <main> landmark (nav ... footer)
  if (home && !s.includes('<main id="contenido">')) {
    const nav = s.indexOf('</nav>', s.indexOf('<nav>')); const foot = s.indexOf('<footer');
    if (nav > 0 && foot > nav) { s = s.slice(0, nav + 6) + '\n<main id="contenido">' + s.slice(nav + 6, foot) + '</main>\n' + s.slice(foot); note(f, 'main'); }
  }
  // 3. logo link: accessible name = its visible text
  const s3 = s.replace(/(<a class="logo-lockup"[^>]*?) aria-label="[^"]*"/g, '$1');
  if (s3 !== s) { s = s3; note(f, 'logo name'); }
  // 4. heading order: hidden h2 before h3-only groups
  if ((f === 'guias.html' || f === 'en-guides.html') && !s.includes('<h2 class="sr-only">')) {
    const t = f === 'guias.html' ? 'Guías' : 'Guides';
    s = s.replace('<div class="cards">', `<h2 class="sr-only">${t}</h2><div class="cards">`); note(f, 'h2');
  }
  if ((f === 'glosario.html' || f === 'en-glossary.html') && !s.includes('<h2 class="sr-only">')) {
    const t = f === 'glosario.html' ? 'Términos' : 'Terms';
    s = s.replace(/<div id="terms"/, `<h2 class="sr-only">${t}</h2><div id="terms"`); note(f, 'h2');
  }
  if (s !== before) fs.writeFileSync(file, s);
}

// 5. cache headers for fonts and images
const toml = path.join(ROOT, 'netlify.toml'); let t = fs.readFileSync(toml, 'utf8');
if (!t.includes('for = "/fonts/*"')) {
  t = t.replace('# Old English links', `[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/img/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, stale-while-revalidate=86400"

# Old English links`);
  fs.writeFileSync(toml, t); note('netlify.toml', 'cache headers');
}
for (const [k, v] of Object.entries(tally)) console.log(k.padEnd(14), v.length, v.length <= 4 ? v.join(', ') : '');
