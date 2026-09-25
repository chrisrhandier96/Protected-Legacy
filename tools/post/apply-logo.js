// Put the CG crest on every page: nav shield, footer crest, favicons,
// thank-you/privacy top bar, and the logo in structured data. Re-runnable.
const fs = require('fs'), path = require('path');
const ROOT = process.argv[2];
const SITE = 'https://www.protectedlegacyfl.com';

const NAV = '<img class="logo-mark cg-mark" src="/img/cg-escudo-44.png" srcset="/img/cg-escudo-88.png 2x, /img/cg-escudo-132.png 3x" width="33" height="44" alt="">';
const FOOT = '<img class="logo-mark cg-crest" src="/img/cg-crest-64.png" srcset="/img/cg-crest-128.png 2x, /img/cg-crest-192.png 3x" width="84" height="64" alt="">';
const TOPBAR = '<img class="cg-top" src="/img/cg-escudo-44.png" srcset="/img/cg-escudo-88.png 2x, /img/cg-escudo-132.png 3x" width="27" height="36" alt="" style="display:block;width:27px;height:36px">';
const ICONS = '<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">\n<link rel="icon" type="image/png" sizes="192x192" href="/img/favicon-192.png">\n<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">';
const CSS = '<style id="cg-logo">.logo-mark.cg-mark{width:auto;height:44px;transform:none!important}.logo-mark.cg-crest{width:auto;height:64px;transform:none!important}</style>\n';
const PUB_OLD = '"publisher": {"@type": "Organization", "name": "Patrimonio Protegido", "url": "https://www.protectedlegacyfl.com/"}';
const PUB_NEW = `"publisher": {"@type": "Organization", "name": "Patrimonio Protegido", "url": "${SITE}/", "logo": {"@type": "ImageObject", "url": "${SITE}/img/cg-logo-512.png", "width": 512, "height": 512}}`;
const WS_OLD = '"inLanguage":["es","en"],';
const WS_NEW = '"inLanguage":["es","en"],"publisher":{"@type":"Organization","name":"Patrimonio Protegido","url":u+"/","logo":u+"/img/cg-logo-512.png"},';

const tally = {};
const note = (f, k) => { (tally[k] = tally[k] || []).push(f); };
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const file = path.join(ROOT, f);
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  // 1. nav + footer marks
  s = s.replace(/<svg class="logo-mark"[\s\S]*?<\/svg>/g, (m, i) => {
    const pre = s.slice(0, i);
    const inFooter = pre.lastIndexOf('<footer') > pre.lastIndexOf('</footer>');
    note(f, inFooter ? 'footer crest' : 'nav shield');
    return inFooter ? FOOT : NAV;
  });
  if (s.includes('cg-mark') && !s.includes('id="cg-logo"')) { s = s.replace('</head>', CSS + '</head>'); note(f, 'css'); }

  // 2. favicons
  const iconRe = /<link rel="icon"[^>]*?href=(?:'data:image\/svg\+xml,[^']*'|"favicon\.svg")[^>]*>/;
  if (iconRe.test(s)) { s = s.replace(iconRe, ICONS); note(f, 'favicons'); }

  // 3. thank-you / privacy top bar
  if (!s.includes('class="cg-top"') && s.includes('<a href="/" data-home><span class="logo">')) {
    s = s.replace('<a href="/" data-home><span class="logo">', '<a href="/" data-home>' + TOPBAR + '<span class="logo">'); note(f, 'top bar');
  }

  // 4. structured data logo
  if (s.includes(PUB_OLD)) { s = s.split(PUB_OLD).join(PUB_NEW); note(f, 'publisher logo'); }
  if (s.includes(WS_OLD) && !s.includes('"publisher":{"@type":"Organization"')) { s = s.replace(WS_OLD, WS_NEW); note(f, 'website publisher logo'); }

  if (s !== before) fs.writeFileSync(file, s);
}
for (const [k, v] of Object.entries(tally)) console.log(k.padEnd(24), v.length, v.length <= 4 ? v.join(', ') : '');
