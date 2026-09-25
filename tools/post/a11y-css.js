// Inject WCAG AA colour corrections for text on light backgrounds (all pages). Re-runnable.
const fs = require('fs'), path = require('path'); const ROOT = process.argv[2];
const CSS = `<style id="pp-a11y">
/* WCAG AA: gold and grey text on the light sand backgrounds (gold stays bright on dark green) */
:root{--oro-tx:#7E5F17;--oro-tx-lg:#9A7424;--humo-tx:#5F665A}
.term .alt,.term>a,.band label.kicker,details p>a[style*="--oro"],main .card .go,sup.fn a,.sumbox h2,.srcs h2,.toc h2,
#datos .eyebrow,#biblioteca .eyebrow,#mapa .eyebrow,#contacto .eyebrow,#datos a.fn,#mapa .answers .k,#qdomain,.direct .d-t,
body>.wrap>.eyebrow,#pmail{color:var(--oro-tx)!important}
#contacto .accent-i{color:var(--oro-tx-lg)!important}
.toc a,.srcs li,.tip,#pgt,#a-na,.mapa-note,#contacto p[style*="--humo"],body>.wrap .fin,body>.wrap .fin span{color:var(--humo-tx)!important}
.m-cue{color:#AFC1B4!important}
#mapa .answers .k{opacity:1!important}
</style>
`;
let n = 0;
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const file = path.join(ROOT, f); let s = fs.readFileSync(file, 'utf8');
  const re = /<style id="pp-a11y">[\s\S]*?<\/style>\n?/;
  s = re.test(s) ? s.replace(re, CSS) : s.replace('</head>', CSS + '</head>'); // update in place, keep CSS order
  fs.writeFileSync(file, s); n++;
}
console.log('a11y colours in', n, 'pages');
