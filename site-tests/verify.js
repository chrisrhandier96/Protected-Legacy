// Live-site verification for protectedlegacyfl.com. Every test gets a fresh
// browser context. POSTs to the site are always aborted (no form submissions),
// and analytics/ads beacons are aborted so tests do not pollute the data.
const { chromium, request } = require('playwright');
const fs = require('fs'), path = require('path');

const BASE = process.env.BASE || 'https://www.protectedlegacyfl.com';
const OUT = process.env.OUT || path.join(__dirname, 'out');
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });

const results = [];
function rec(group, name, pass, detail = '') {
  results.push({ group, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${group}] ${name}${detail ? ' :: ' + detail : ''}`);
}

const BEACONS = /google-analytics\.com|analytics\.google\.com|googleadservices\.com|doubleclick\.net|google\.com\/(pagead|ccm)|googlesyndication|facebook\.(com|net)/;
const DESKTOP = { viewport: { width: 1440, height: 900 } };
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

let browser;
async function freshContext(opts = DESKTOP) {
  const c = await browser.newContext({ ...opts, locale: 'es-US' });
  await c.route('**/*', route => {
    const r = route.request(), u = r.url();
    if (BEACONS.test(u)) return route.abort();
    if (!['GET', 'HEAD'].includes(r.method()) && (u.includes('protectedlegacyfl.com') || u.startsWith(BASE))) {
      console.log('  !! aborted non-GET request to', u);
      return route.abort();
    }
    return route.continue();
  });
  return c;
}
async function freshPage(opts) {
  const c = await freshContext(opts);
  const p = await c.newPage();
  p.errors = [];
  p.on('pageerror', e => p.errors.push('uncaught: ' + (e.message || e)));
  p.on('console', m => {
    if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::ERR/.test(m.text())) p.errors.push('console: ' + m.text());
  });
  p.ctx = c;
  return p;
}
const settle = p => p.waitForTimeout(1200);
async function sweep(p) { // scroll through so reveal-on-scroll content is shown
  await p.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += Math.round(innerHeight * 0.7)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
}
const want = k => !ONLY || ONLY.includes(k);

// library side panel: 14 guides + all guides + 2 tools + all tools + 2 references
const PANEL_LINKS = 20;
const TEMA = { res: 'Residencias y huracanes', flo: 'Inundación y marejada', aut: 'Autos de uso y colección', mar: 'Embarcaciones y PWC', avi: 'Aviación privada', col: 'Colecciones, arte y joyas', lia: 'Responsabilidad y umbrella', emp: 'Personal del hogar y legado',
  cyb: 'Ciberprotección familiar', kr: 'Secuestro y extorsión', str: 'Alquiler vacacional', ren: 'Remodelaciones y construcción', brd: 'Juntas y fundaciones', cnd: 'Condominios y HOA' };
const selectedTema = p => p.evaluate(() => { const s = document.getElementById('f-tema'); const o = s && s.options[s.selectedIndex]; return o ? (o.getAttribute('data-es') || o.textContent) : null; });
const inView = (p, sel) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, sel);

(async () => {
  browser = await chromium.launch();
  const http = await request.newContext({ baseURL: BASE });
  const smText = await (await http.get('/sitemap.xml')).text();
  // sitemap holds production URLs; test them on BASE (same thing when BASE is production)
  const locs = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => BASE + new URL(m[1].trim()).pathname);

  /* ================= PAGES ================= */
  if (want('pages')) {
    const api = await request.newContext({ baseURL: BASE });
    const bad = [];
    for (const u of locs) { const r = await api.get(u, { maxRedirects: 0 }); if (r.status() !== 200) bad.push(`${new URL(u).pathname}=${r.status()}`); }
    rec('Pages', 'Every sitemap <loc> returns 200', bad.length === 0, `${locs.length} URLs` + (bad.length ? `; ${bad.join(', ')}` : ''));
    await api.dispose();

    { const p = await freshPage(); await p.goto(BASE + '/'); const t = await p.title(); const h1 = (await p.textContent('h1')).trim().slice(0, 60);
      rec('Pages', 'Homepage title starts "Patrimonio Protegido | Christian R. González"', t.startsWith('Patrimonio Protegido | Christian R. González') && !/preguntas/i.test(t), `title="${t}" h1="${h1}"`); await p.ctx.close(); }
    { const p = await freshPage(); await p.goto(BASE + '/en/'); await settle(p);
      const r = await p.evaluate(() => ({ lang: document.documentElement.lang, path: location.pathname, t: document.title, h1: document.querySelector('h1').textContent.trim().slice(0, 60) }));
      rec('Pages', '/en/ is the English homepage', r.lang === 'en' && r.path === '/en/' && /Risk education/.test(r.t), `lang=${r.lang} path=${r.path} h1="${r.h1}"`); await p.ctx.close(); }
    for (const [u, re] of [['/guias/inundacion/', /inundaci/i], ['/en/guides/flood/', /flood/i]]) {
      const p = await freshPage(); const resp = await p.goto(BASE + u); const h1 = (await p.textContent('h1')).trim();
      rec('Pages', `${u} shows the flood guide`, resp.status() === 200 && re.test(h1) && new URL(p.url()).pathname === u, `status=${resp.status()} h1="${h1}"`); await p.ctx.close();
    }
    { const api = await request.newContext({ baseURL: BASE }); const r0 = await api.get('/guias/inundacion', { maxRedirects: 0 });
      const p = await freshPage(); await p.goto(BASE + '/guias/inundacion'); await settle(p); const end = new URL(p.url()).pathname; const h1 = (await p.textContent('h1')).trim();
      rec('Pages', '/guias/inundacion (no slash) redirects to /guias/inundacion/', end === '/guias/inundacion/' && /inundaci/i.test(h1), `HTTP ${r0.status()}${r0.headers().location ? ' -> ' + r0.headers().location : ''}; browser ends at ${end}`);
      await p.ctx.close(); await api.dispose(); }
    { const api = await request.newContext({ baseURL: BASE }); const out = [];
      const all = ['/aut.json', '/build_library.py', '/BRIEF.md', '/avi.json', '/col.json', '/emp.json', '/flo.json', '/lia.json', '/mar.json', '/res.json', '/faq.json', '/glossary.json', '/hurricane.json', '/inventory.json', '/build_en.py', '/favicon.txt', '/deploy.md', '/netlify.toml'];
      for (const u of all) out.push([u, (await api.get(u, { maxRedirects: 0 })).status()]);
      const core = out.filter(([u]) => ['/aut.json', '/build_library.py', '/BRIEF.md'].includes(u));
      rec('Pages', '/aut.json, /build_library.py, /BRIEF.md not 200', core.every(([, s]) => s !== 200), core.map(([u, s]) => `${u}=${s}`).join(' '));
      const extra = out.filter(([, s]) => s === 200);
      rec('Pages', '(extra) all 16 stray files + deploy.md + netlify.toml not 200', extra.length === 0, extra.length ? 'served: ' + extra.map(([u]) => u).join(', ') : `${out.length} paths all non-200`);
      await api.dispose(); }
  }

  /* ================= CRAWL: links, anchors, GTM, JS errors ================= */
  if (want('crawl')) {
    const pages = {}; const queue = locs.map(u => new URL(u).pathname); const seen = new Set(queue);
    const links = []; // {from, href}
    while (queue.length) {
      const pth = queue.shift(); const p = await freshPage();
      let status = 0, html = '';
      try { const resp = await p.goto(BASE + pth, { waitUntil: 'load' }); status = resp.status(); html = await resp.text(); await settle(p); await sweep(p); await p.waitForTimeout(800); } catch (e) { p.errors.push('nav: ' + e.message); }
      const info = await p.evaluate(() => ({
        ids: [...document.querySelectorAll('[id]')].map(e => e.id),
        hrefs: [...document.querySelectorAll('a[href]')].map(a => a.href),
        gtm: !!(window.google_tag_manager && window.google_tag_manager['GTM-P88VGFHR']),
        badImgs: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src')),
        crest: [...document.images].filter(i => /\/img\/cg-/.test(i.currentSrc)).length,
        icons: [...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]')].map(l => l.getAttribute('href')),
        ldErr: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { JSON.parse(s.textContent); return null; } catch (e) { return e.message; } }).filter(Boolean),
        // text or loose SVG shapes sitting directly in <body> = markup that leaked out of <head>
        stray: [...document.body.childNodes].filter(n => (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && /^(rect|g|circle|path)$/i.test(n.tagName))).map(n => (n.textContent || n.tagName).trim().slice(0, 30) || n.tagName),
      })).catch(() => ({ ids: [], hrefs: [], gtm: false, badImgs: ['(eval failed)'], crest: 0, icons: [], ldErr: [], stray: [] }));
      const ogDom = await p.evaluate(() => document.querySelectorAll('meta[property="og:image"]').length).catch(() => -1);
      const share = { hasTitle: /property="og:title"/.test(html), img: (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1] || '', en: /<html[^>]*\slang="en"/.test(html), ogDom };
      pages[pth] = { share, status, ids: new Set(info.ids), gtmHtml: html.includes('GTM-P88VGFHR'), gtmLoaded: info.gtm, errors: p.errors.slice(), final: new URL(p.url()).pathname, badImgs: info.badImgs, crest: info.crest, icons: info.icons, ldErr: info.ldErr, stray: info.stray };
      for (const h of info.hrefs) {
        let u; try { u = new URL(h); } catch { continue; }
        if (u.host !== new URL(BASE).host) continue;
        links.push({ from: pth, href: u.pathname + u.search + u.hash, path: u.pathname, full: u.pathname + u.search, hash: u.hash.slice(1) });
        if (!seen.has(u.pathname) && !/\.(jpg|png|svg|pdf|xml|txt|webp)$/i.test(u.pathname)) { seen.add(u.pathname); queue.push(u.pathname); }
      }
      await p.ctx.close();
    }
    const api = await request.newContext({ baseURL: BASE }); const st = {};
    for (const l of links) if (!(l.full in st)) { const r = await api.get(l.full); st[l.full] = r.status(); }
    await api.dispose();
    const broken = links.filter(l => st[l.full] !== 200).map(l => `${l.from} -> ${l.href} (${st[l.full]})`);
    const badAnchor = links.filter(l => l.hash && pages[l.path] && !pages[l.path].ids.has(decodeURIComponent(l.hash))).map(l => `${l.from} -> ${l.href}`);
    const uniq = a => [...new Set(a)];
    rec('Pages', 'Crawl: every internal link resolves (no 404)', broken.length === 0, `${Object.keys(pages).length} pages, ${uniq(links.map(l => l.full)).length} unique URLs` + (broken.length ? '; ' + uniq(broken).slice(0, 15).join(' | ') : ''));
    rec('Pages', 'Crawl: every #anchor exists on its target page', badAnchor.length === 0, `${uniq(links.filter(l => l.hash).map(l => l.href)).length} unique anchors` + (badAnchor.length ? '; ' + uniq(badAnchor).slice(0, 15).join(' | ') : ''));
    const noGtm = Object.entries(pages).filter(([, v]) => !v.gtmHtml).map(([k]) => k);
    const gtmNotLoaded = Object.entries(pages).filter(([, v]) => !v.gtmLoaded).map(([k]) => k);
    rec('Pages', 'Every page contains GTM-P88VGFHR', noGtm.length === 0, noGtm.length ? 'missing: ' + noGtm.join(', ') : `${Object.keys(pages).length} pages; container loaded on ${Object.keys(pages).length - gtmNotLoaded.length}` + (gtmNotLoaded.length ? ` (not loaded: ${gtmNotLoaded.join(', ')})` : ''));
    const errs = Object.entries(pages).filter(([, v]) => v.errors.length).map(([k, v]) => `${k}: ${v.errors.join(' / ')}`);
    rec('Pages', 'No JavaScript errors on any page', errs.length === 0, errs.length ? errs.join(' | ').slice(0, 1500) : `${Object.keys(pages).length} pages clean`);
    const imgBad = Object.entries(pages).filter(([, v]) => v.badImgs.length).map(([k, v]) => `${k}: ${v.badImgs.join(',')}`);
    const noCrest = Object.entries(pages).filter(([, v]) => v.crest === 0).map(([k]) => k);
    rec('Logo', 'Every image on every page loads; CG crest shown on every page', imgBad.length === 0 && noCrest.length === 0,
      (imgBad.length ? 'broken: ' + imgBad.join(' | ') + ' ' : '') + (noCrest.length ? 'no crest: ' + noCrest.join(', ') : `${Object.keys(pages).length} pages, crest images per page: ${[...new Set(Object.values(pages).map(v => v.crest))].join('/')}`));
    { const api2 = await request.newContext({ baseURL: BASE }); const icons = [...new Set(Object.values(pages).flatMap(v => v.icons))]; const bad = [];
      for (const u of icons) { const r = await api2.get(u); if (r.status() !== 200 || !/image/.test(r.headers()['content-type'] || '')) bad.push(`${u}=${r.status()}`); }
      const missing = Object.entries(pages).filter(([, v]) => !v.icons.length).map(([k]) => k);
      rec('Logo', 'Favicons / home-screen icon resolve on every page', !bad.length && !missing.length, (bad.length ? bad.join(' ') + ' ' : '') + (missing.length ? 'no icon link: ' + missing.join(', ') : icons.join(', ')));
      await api2.dispose(); }
    { // share previews: bots read raw HTML only
      const withTitle = Object.entries(pages).filter(([, v]) => v.share.hasTitle); const bad = [];
      for (const [k, v] of withTitle) {
        const want = v.share.en ? '/og-en.png' : '/og.png';
        if (!v.share.img.endsWith(want)) bad.push(`${k}: og:image="${v.share.img}" (want ${want})`);
        else if (v.share.ogDom !== 1) bad.push(`${k}: ${v.share.ogDom} og:image tags in page`);
      }
      const api3 = await request.newContext({ baseURL: BASE });
      for (const u of ['/og.png', '/og-en.png']) { const r = await api3.get(u); const b = await r.body();
        const dim = b.length > 24 ? `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}` : '?';
        if (r.status() !== 200 || r.headers()['content-type'] !== 'image/png' || dim !== '1200x630' || b.length > 300 * 1024) bad.push(`${u}: ${r.status()} ${r.headers()['content-type']} ${dim} ${Math.round(b.length / 1024)}KB`); }
      await api3.dispose();
      rec('Logo', 'Share preview: every content page has the right-language card in its raw HTML', bad.length === 0 && withTitle.length > 0, bad.length ? bad.join(' | ') : `${withTitle.length} pages; og.png + og-en.png are 1200x630 PNG under 300 KB`);
    }
    const stray = Object.entries(pages).filter(([, v]) => v.stray.length).map(([k, v]) => `${k}: ${JSON.stringify(v.stray)}`);
    rec('Pages', 'No stray text or leaked markup on any page', stray.length === 0, stray.length ? stray.join(' | ') : `${Object.keys(pages).length} pages clean`);
    const ld = Object.entries(pages).filter(([, v]) => v.ldErr.length).map(([k, v]) => `${k}: ${v.ldErr.join(';')}`);
    rec('Logo', 'Structured data (JSON-LD) still valid on every page', ld.length === 0, ld.length ? ld.join(' | ') : 'all parse');
    const non200 = Object.entries(pages).filter(([, v]) => v.status !== 200).map(([k, v]) => `${k}=${v.status}`);
    if (non200.length) rec('Pages', 'Crawl: every crawled page loads 200', false, non200.join(', '));
    fs.writeFileSync(path.join(OUT, 'crawl.json'), JSON.stringify({ pages: Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, { ...v, ids: v.ids.size }])), linkStatus: st }, null, 1));
  }

  if (want('img')) {
    const p = await freshPage(); await p.goto(BASE + '/');
    await p.locator('img.foto').scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const i = document.querySelector('img.foto'); return { src: i.currentSrc, ok: i.complete && i.naturalWidth > 0, w: i.naturalWidth, h: i.naturalHeight }; });
    rec('Pages', 'img/christian-retrato.jpg loads on the homepage', r.ok && /christian-retrato\.jpg$/.test(r.src), `${r.src} ${r.w}x${r.h}`); await p.ctx.close();
  }

  /* ================= LANGUAGE ROUTING ================= */
  if (want('lang')) {
    { const p = await freshPage(); await p.goto(BASE + '/'); await settle(p); await p.click('#btn-en'); await p.waitForTimeout(800);
      const a = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, h1: document.querySelector('h1').textContent.trim().slice(0, 50) }));
      await p.reload(); await settle(p); const b = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang }));
      rec('Language', 'Homepage ES -> EN button goes to /en/', a.path === '/en/' && a.lang === 'en' && b.path === '/en/' && b.lang === 'en', `after click ${a.path} lang=${a.lang} h1="${a.h1}"; after reload ${b.path} lang=${b.lang}`); await p.ctx.close(); }
    { const p = await freshPage(); await p.goto(BASE + '/en/'); await settle(p); await p.click('#btn-es'); await p.waitForTimeout(800);
      const a = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, h1: document.querySelector('h1').textContent.trim().slice(0, 50) }));
      await p.reload(); await settle(p); const b = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang }));
      rec('Language', 'Homepage EN -> ES button goes to /', a.path === '/' && a.lang === 'es' && b.path === '/' && b.lang === 'es', `after click ${a.path} lang=${a.lang} h1="${a.h1}"; after reload ${b.path} lang=${b.lang}`); await p.ctx.close(); }
    for (const [from, to] of [['/guias/inundacion/', '/en/guides/flood/'], ['/en/guides/flood/', '/guias/inundacion/']]) {
      const p = await freshPage(); await p.goto(BASE + from); await settle(p);
      await Promise.all([p.waitForNavigation(), p.click('.nav-links a.lang-link')]); await settle(p);
      const r = await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang }));
      rec('Language', `Guide ${from} lang button -> ${to}`, r.path === to, `landed on ${r.path} lang=${r.lang}`); await p.ctx.close();
    }
    { // every library page: its lang button points at its hreflang twin
      const bad = []; const api = await request.newContext({ baseURL: BASE });
      for (const u of locs) { const pth = new URL(u).pathname; if (pth === '/' || pth === '/en/' || pth.endsWith('.html')) continue;
        const html = await (await api.get(pth)).text(); const isEn = /<html[^>]*lang="en"/.test(html);
        const alt = (html.match(new RegExp(`hreflang="${isEn ? 'es' : 'en'}" href="([^"]+)"`)) || [])[1];
        const btns = [...html.matchAll(/class="lang-link" href="([^"]+)"/g)].map(m => m[1]);
        if (!alt || !btns.length || btns.some(b => b !== new URL(alt).pathname)) bad.push(`${pth}: btn=${btns.join(',')} alt=${alt}`); }
      rec('Language', '(extra) every library page lang button = its other-language twin', bad.length === 0, bad.length ? bad.join(' | ') : `${locs.length - 2} pages`); await api.dispose(); }
    for (const [store, url, expLang, expPath] of [['en', '/?gclid=test', 'es', '/'], ['es', '/en/?gclid=test', 'en', '/en/']]) {
      const p = await freshPage(); await p.goto(BASE + '/robots.txt'); await p.evaluate(v => localStorage.setItem('pp.lang', v), store);
      await p.goto(BASE + url); await settle(p);
      const r = await p.evaluate(() => ({ lang: document.documentElement.lang, path: location.pathname, h1: document.querySelector('h1').textContent.trim().slice(0, 50), gclid: (document.getElementById('f-gclid') || {}).value }));
      rec('Language', `pp.lang="${store}" then ${url} stays ${expLang === 'es' ? 'Spanish' : 'English'}`, r.lang === expLang && r.path === expPath, `lang=${r.lang} path=${r.path} h1="${r.h1}" gclid field="${r.gclid}"`); await p.ctx.close();
    }
  }

  /* ================= QUIZ + FORM (never submitted) ================= */
  async function quiz(lang) {
    const L = lang === 'es' ? { url: '/', q: n => `Pregunta ${n} de 12`, chip: 'se adjuntará' } : { url: '/en/', q: n => `Question ${n} of 12`, chip: 'will be attached' };
    const p = await freshPage(); await p.goto(BASE + L.url); await settle(p);
    await p.locator('#mapa').scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
    const q1 = (await p.textContent('#qtext')).trim();
    const q1Visible = await p.evaluate(t => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.textContent.trim() === t && e.offsetParent !== null).length, q1);
    const seq = [], btns = ['#a-si', '#a-ns', '#a-no', '#a-si'];
    for (let i = 0; i < 12; i++) {
      const before = (await p.textContent('#qcount')).trim(); seq.push(before);
      await p.click(btns[i % 4]);
      if (i < 11) await p.waitForFunction(b => document.getElementById('qcount').textContent.trim() !== b, before, { timeout: 5000 }).catch(() => {});
    }
    await p.waitForSelector('#resultado', { state: 'visible', timeout: 5000 }).catch(() => {});
    const expected = Array.from({ length: 12 }, (_, i) => L.q(i + 1));
    const seqOk = JSON.stringify(seq) === JSON.stringify(expected);
    const res = await p.evaluate(() => ({ vis: getComputedStyle(document.getElementById('resultado')).display !== 'none', title: document.getElementById('resTitle').textContent, quizHidden: getComputedStyle(document.getElementById('quiz')).display === 'none' }));
    rec('Quiz', `${L.url} quiz: Q1 shown once, 12 questions in order, result appears`, q1Visible === 1 && seqOk && res.vis && !!res.title,
      `Q1 visible ${q1Visible}x; sequence ${seqOk ? 'OK 1..12' : JSON.stringify(seq)}; result "${res.title}"`);
    await p.waitForTimeout(1500);
    const y0 = await p.evaluate(() => scrollY);
    await p.click('#rcGo'); await p.waitForTimeout(2200);
    const formIn = await inView(p, '#ppForm'), contIn = await inView(p, '#contacto'), y1 = await p.evaluate(() => scrollY);
    rec('Quiz', `${L.url} "Continue to the form" scrolls to #contacto`, formIn && contIn && y1 > y0, `scrollY ${y0} -> ${y1}; form in view=${formIn}`);
    const f = await p.evaluate(() => ({ score: document.getElementById('f-quiz-score').value, answers: document.getElementById('f-quiz-answers').value, gaps: document.getElementById('f-quiz-gaps').value, chipShown: !document.getElementById('quizChip').hidden && document.getElementById('quizChip').offsetParent !== null, chip: document.getElementById('qcText').textContent, tema: (s => s.options[s.selectedIndex].getAttribute('data-es'))(document.getElementById('f-tema')) }));
    rec('Quiz', `${L.url} hidden quiz fields filled (score/answers)`, !!f.score && !!f.answers, `score="${f.score}" answers=${f.answers.length} chars, gaps="${f.gaps}"`);
    rec('Quiz', `${L.url} "self-assessment will be attached" note visible`, f.chipShown && f.chip.includes(L.chip), `"${f.chip}"; topic preselected="${f.tema}"`);
    await p.screenshot({ path: path.join(OUT, `quiz-form-${lang}.png`) });
    await p.ctx.close();
  }
  if (want('quiz')) {
    await quiz('es'); await quiz('en');
    { const p = await freshPage(); await p.goto(BASE + '/?tema=flo#contacto'); await settle(p); const t = await selectedTema(p);
      rec('Quiz', '/?tema=flo#contacto preselects flood', t === TEMA.flo, `selected="${t}"`); await p.ctx.close(); }
    const guides = locs.map(u => new URL(u).pathname).filter(x => /^\/(guias|en\/guides)\/[^/]+\/$/.test(x));
    const bad = [], ok = [];
    for (const g of guides) {
      const p = await freshPage(); await p.goto(BASE + g); await settle(p);
      const cta = p.locator('a[data-cta^="guide_contact_"]').first(); const key = (await cta.getAttribute('data-cta')).replace('guide_contact_', ''); const href = await cta.getAttribute('href');
      await Promise.all([p.waitForNavigation(), cta.click()]); await p.waitForTimeout(1800);
      const t = await selectedTema(p); const land = new URL(p.url()); const vis = await inView(p, '#contacto');
      const homeOk = g.startsWith('/en/') ? land.pathname === '/en/' : land.pathname === '/';
      (t === TEMA[key] && homeOk && vis ? ok : bad).push(`${g} [${href}] -> ${land.pathname}${land.search}${land.hash} tema="${t}" formInView=${vis}`);
      await p.ctx.close();
    }
    rec('Quiz', 'Each guide CTA -> homepage form with its topic preselected', bad.length === 0 && ok.length === guides.length, `${ok.length}/${guides.length} OK` + (bad.length ? '; ' + bad.join(' | ') : ''));
  }

  /* ================= TOOLS ================= */
  if (want('tools')) {
    { const p = await freshPage(); await p.goto(BASE + '/glosario/'); await settle(p);
      const count = () => p.evaluate(() => { const t = [...document.querySelectorAll('.term')]; return { all: t.length, vis: t.filter(e => !e.hidden && e.offsetParent !== null).length }; });
      const c0 = await count(); await p.fill('#q', 'NFIP'); await p.waitForTimeout(500); const c1 = await count();
      const names = await p.evaluate(() => [...document.querySelectorAll('.term')].filter(e => !e.hidden).map(e => (e.querySelector('h3,h2,dt,strong') || e).textContent.trim().slice(0, 40)));
      rec('Tools', '/glosario/ search "NFIP" filters terms', c1.vis >= 1 && c1.vis < c0.all, `${c0.all} terms -> ${c1.vis} shown: ${names.slice(0, 6).join('; ')}`);
      await p.fill('#q', ''); await p.waitForTimeout(300);
      await p.click('.chip[data-cat="inundacion"]'); await p.waitForTimeout(400);
      const c2 = await count(); const cats = await p.evaluate(() => [...new Set([...document.querySelectorAll('.term')].filter(e => !e.hidden).map(e => e.getAttribute('data-cat')))]);
      await p.click('.chip[data-cat="autos"]'); await p.waitForTimeout(400); const c3 = await count();
      await p.click('.chip[data-cat=""]'); await p.waitForTimeout(400); const c4 = await count();
      rec('Tools', '/glosario/ category chips filter', c2.vis >= 1 && c2.vis < c0.all && cats.length === 1 && cats[0] === 'inundacion' && c3.vis >= 1 && c3.vis < c0.all && c4.vis === c0.all,
        `Inundación ${c2.vis} (cats ${cats.join(',')}), Autos ${c3.vis}, Todos ${c4.vis}/${c0.all}`); await p.ctx.close(); }
    { const p = await freshPage(); await p.goto(BASE + '/herramientas/temporada-de-huracanes/'); await settle(p);
      const w = () => p.evaluate(() => document.getElementById('pg').style.width || getComputedStyle(document.getElementById('pg')).width);
      const w0 = await w();
      for (const id of ['#h1', '#h2']) { const box = p.locator(id); if (await box.isVisible()) await box.check(); else await p.click(`label[for="${id.slice(1)}"], label:has(${id})`); }
      await p.waitForTimeout(500); const w1 = await w();
      await p.reload(); await settle(p);
      const st = await p.evaluate(() => [document.getElementById('h1').checked, document.getElementById('h2').checked, document.getElementById('h3').checked]); const w2 = await w();
      rec('Tools', '/herramientas/temporada-de-huracanes/ checks persist after reload', st[0] && st[1] && !st[2], `h1=${st[0]} h2=${st[1]} h3=${st[2]}`);
      rec('Tools', '/herramientas/temporada-de-huracanes/ progress bar updates', w0 !== w1 && parseFloat(w1) > 0 && w1 === w2, `width ${w0 || '0'} -> ${w1} -> after reload ${w2}`); await p.ctx.close(); }
    { const api = await request.newContext({ baseURL: BASE }); const html = await (await api.get('/preguntas-frecuentes/')).text(); await api.dispose();
      const ids = [...html.matchAll(/<details id="([^"]+)"/g)].map(m => m[1]); const pick = [ids[0], ids[Math.floor(ids.length / 2)], ids[ids.length - 1]]; const out = [];
      for (const id of pick) { const p = await freshPage(); await p.goto(`${BASE}/preguntas-frecuentes/#${id}`); await settle(p);
        out.push([id, await p.evaluate(i => { const d = document.getElementById(i); const r = d.getBoundingClientRect(); return d.open && r.top < innerHeight && r.bottom > 0; }, id)]); await p.ctx.close(); }
      rec('Tools', '/preguntas-frecuentes/#<id> opens that answer', out.every(([, o]) => o), `${ids.length} questions; tested ` + out.map(([i, o]) => `#${i}=${o ? 'open' : 'CLOSED'}`).join(' ')); }
  }

  /* ================= CONTACT-LINK TRACKING ================= */
  if (want('contact')) {
    const all = [...new Set([...locs.map(u => new URL(u).pathname), '/gracias.html', '/privacidad.html'])];
    const rows = [], bad = [];
    for (const u of all) {
      const p = await freshPage(); await p.goto(BASE + u); await settle(p);
      const r = await p.evaluate(() => {
        // block the real action (dialing, mail app, new tab) AFTER the site's own listener has run
        window.addEventListener('click', e => e.preventDefault());
        const want = h => /^tel:/.test(h) ? ['llamada', 'phone_click'] : /^sms:/.test(h) ? ['texto', 'phone_click'] : /^mailto:/.test(h) ? ['email', 'contact_click'] : /linkedin\.com/.test(h) ? ['linkedin', 'contact_click'] : null;
        const links = [...document.querySelectorAll('a[href]')].filter(a => want(a.getAttribute('href')));
        const out = { n: links.length, tagged: 0, fired: 0, problems: [] };
        for (const a of links) {
          const [m, ev] = want(a.getAttribute('href'));
          if (a.getAttribute('data-track') === m) out.tagged++; else { out.problems.push(`untagged ${a.getAttribute('href').slice(0, 30)}`); continue; }
          window.dataLayer = window.dataLayer || []; const before = window.dataLayer.length;
          a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          const pushed = window.dataLayer.slice(before).find(o => o && o.event === ev && o.contact_method === m);
          if (pushed) out.fired++; else out.problems.push(`no ${ev}/${m} for ${a.getAttribute('href').slice(0, 30)}`);
        }
        return out;
      });
      rows.push(`${u} ${r.fired}/${r.n}`); if (r.problems.length || r.tagged !== r.n || r.fired !== r.n) bad.push(`${u}: ${r.problems.join(', ')}`);
      await p.ctx.close();
    }
    rec('Contact', 'Every tel/sms/mailto/LinkedIn link is tagged and pushes its dataLayer event (not dialed)', bad.length === 0, (bad.length ? bad.join(' | ') + ' || ' : '') + rows.join(', '));
  }

  /* ================= HOMEPAGE LAYOUT ================= */
  if (want('hero')) {
    for (const u of ['/', '/en/']) {
      const p = await freshPage(); await p.goto(BASE + u); await settle(p);
      const r = await p.evaluate(() => { const ids = [...document.querySelectorAll('main section[id]')].map(s => s.id); return { card: !!document.querySelector('.hero-visual,#teaser'), order: ids.join('>'), ok: ids.indexOf('sobre') >= 0 && ids.indexOf('mapa') === ids.indexOf('sobre') + 1 && ids.indexOf('contacto') === ids.indexOf('mapa') + 1 }; });
      rec('Hero', `${u} hero has no quiz card; quiz sits after Sobre mí, before Contacto`, !r.card && r.ok, `card=${r.card}; order ${r.order}`);
      await p.ctx.close();
    }
  }

  /* ================= LIBRARY SIDE PANEL ================= */
  if (want('nav')) {
    const panelState = p => p.evaluate(() => {
      const pn = document.getElementById('pplPanel'); const r = pn.getBoundingClientRect();
      const links = [...pn.querySelectorAll('a[href]')];
      return { open: document.getElementById('ppl').classList.contains('ppl-on') && r.left < innerWidth && r.right <= innerWidth + 1 && getComputedStyle(pn).visibility === 'visible',
        n: links.length, first: (links[1] || {}).textContent, hrefs: links.map(a => a.getAttribute('href')), title: document.getElementById('pplTitle').textContent, w: Math.round(r.width) };
    });
    const bad = [], ok = [];
    for (const [u, lang] of [['/', 'es'], ['/en/', 'en'], ['/guias/inundacion/', 'es'], ['/en/guides/flood/', 'en'], ['/glosario/', 'es'], ['/gracias.html', 'es']]) {
      const p = await freshPage(); await p.goto(BASE + u); await settle(p);
      const tabVis = await p.locator('#pplTab').isVisible();
      await p.click('#pplTab'); await p.waitForTimeout(600); const s = await panelState(p);
      await p.keyboard.press('Escape'); await p.waitForTimeout(500); const closed = !(await panelState(p)).open;
      const exp = lang === 'en' ? { t: 'Library', g: '/en/guides/' } : { t: 'Biblioteca', g: '/guias/' };
      const good = tabVis && s.open && s.n === PANEL_LINKS && s.title === exp.t && s.hrefs[0] === exp.g && closed;
      (good ? ok : bad).push(`${u}: tab=${tabVis} open=${s.open} links=${s.n} title=${s.title} closedByEsc=${closed}`);
      if (u === '/') await p.click('#pplTab').then(() => p.waitForTimeout(600)).then(() => p.screenshot({ path: path.join(OUT, 'shots', 'panel-desktop.png') }));
      await p.ctx.close();
    }
    rec('Nav', `Desktop: side tab opens the library panel (${PANEL_LINKS} links, right language), Esc closes`, bad.length === 0, bad.length ? bad.join(' | ') : ok.length + ' pages OK');
    { const p = await freshPage(); await p.goto(BASE + '/'); await settle(p); await p.click('#btn-en'); await p.waitForTimeout(500); await p.click('#pplTab'); await p.waitForTimeout(600); const s = await panelState(p);
      rec('Nav', 'Homepage: panel follows the ES/EN switch', s.title === 'Library' && s.hrefs[0] === '/en/guides/', `after EN switch: title=${s.title}, first link ${s.hrefs[0]}, tab="${await p.textContent('#pplTabTxt')}"`); await p.ctx.close(); }
    const mb = [];
    for (const u of ['/', '/en/', '/guias/inundacion/', '/en/faq/']) {
      const p = await freshPage(MOBILE); await p.goto(BASE + u); await settle(p);
      const tabVis = await p.locator('#pplTab').isVisible();
      await p.click('.hamb'); await p.waitForTimeout(400);
      const entry = p.locator('#mobileMenu .ppl-mm'); const eVis = await entry.isVisible(); const eTxt = eVis ? (await entry.textContent()).trim() : '';
      if (eVis) await entry.click(); await p.waitForTimeout(600); const s = await panelState(p);
      if (u === '/') await p.screenshot({ path: path.join(OUT, 'shots', 'panel-mobile.png') });
      mb.push({ u, ok: !tabVis && eVis && s.open && s.n === PANEL_LINKS && s.w <= 390, d: `${u}: tab hidden=${!tabVis}, menu entry "${eTxt}", panel open=${s.open} width=${s.w}` });
      await p.ctx.close();
    }
    rec('Nav', 'Phone: hamburger menu entry opens the panel (tab hidden)', mb.every(m => m.ok), mb.map(m => m.d).join(' | '));
  }

  /* ================= LOGO CLOSE-UPS ================= */
  if (want('logoshots')) {
    const S = n => path.join(OUT, 'shots', n);
    for (const [dev, opts] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
      const p = await freshPage(opts); await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
      await p.waitForSelector('#ppLoader img.crest', { timeout: 5000 }).then(() => p.waitForTimeout(1250)).then(() => p.screenshot({ path: S(`logo-loader-${dev}.png`) })).catch(() => {});
      await p.waitForSelector('#ppLoader', { state: 'detached', timeout: 8000 }).catch(() => {}); await p.waitForTimeout(300);
      await p.screenshot({ path: S(`logo-nav-home-${dev}.png`), clip: { x: 0, y: 0, width: opts.viewport.width, height: 110 } });
      await p.locator('footer').scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
      await p.locator('footer').screenshot({ path: S(`logo-footer-home-${dev}.png`) });
      await p.ctx.close();
    }
    { const p = await freshPage(); await p.goto(BASE + '/en/guides/flood/'); await settle(p);
      await p.screenshot({ path: S('logo-nav-guide-desktop.png'), clip: { x: 0, y: 0, width: 1440, height: 90 } });
      await p.locator('footer').scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await p.locator('footer').screenshot({ path: S('logo-footer-guide-desktop.png') }); await p.ctx.close(); }
    for (const [dev, opts] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
      const p = await freshPage(opts); await p.goto(BASE + '/gracias.html'); await settle(p); await p.screenshot({ path: S(`logo-gracias-${dev}.png`) }); await p.ctx.close(); }
    rec('Logo', 'Close-up screenshots of nav, footer, thank-you page', true, path.join(OUT, 'shots'));
  }

  /* ================= VISUAL ================= */
  if (want('visual')) {
    const shots = [['gracias', '/gracias.html'], ['home-es', '/'], ['home-en', '/en/'], ['guias', '/guias/'], ['guia-inundacion', '/guias/inundacion/'], ['glosario', '/glosario/'], ['huracanes', '/herramientas/temporada-de-huracanes/']];
    for (const [name, u] of shots) for (const [dev, opts] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
      const p = await freshPage(opts); await p.goto(BASE + u); await settle(p); await sweep(p);
      await p.screenshot({ path: path.join(OUT, 'shots', `${name}-${dev}.png`), fullPage: true });
      await p.screenshot({ path: path.join(OUT, 'shots', `${name}-${dev}-fold.png`) });
      await p.ctx.close();
    }
    rec('Visual', 'Screenshots taken (6 pages x desktop 1440 / mobile 390)', true, path.join(OUT, 'shots'));
    const bad = [];
    const all = [...new Set([...locs.map(u => new URL(u).pathname), '/gracias.html', '/privacidad.html'])];
    for (const u of all) {
      const p = await freshPage(MOBILE); await p.goto(BASE + u); await settle(p); await sweep(p);
      const r = await p.evaluate(() => { const before = scrollX; scrollTo(5000, scrollY); const x = scrollX; scrollTo(before, scrollY);
        const wide = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''));
        return { x, sw: document.documentElement.scrollWidth, iw: innerWidth, wide }; });
      if (r.x > 0 || r.sw > r.iw) bad.push(`${u} (scrollX=${r.x}, scrollWidth=${r.sw}/${r.iw}; ${r.wide.join(',')})`);
      await p.ctx.close();
    }
    rec('Visual', 'Mobile 390px: no page scrolls horizontally', bad.length === 0, bad.length ? bad.join(' | ') : `${all.length} pages checked`);
  }

  /* ================= LIBRARY EXPANSION (work order 2026-09, Part E) ================= */
  if (want('expansion')) {
    // every sitemap URL returns 200, and each page's hreflang pair points back to it
    const html = {}; const bad200 = [];
    for (const u of locs) { const r = await http.get(new URL(u).pathname, { maxRedirects: 0 }); html[new URL(u).pathname] = await r.text(); if (r.status() !== 200) bad200.push(`${u} ${r.status()}`); }
    rec('Expansion', 'Every sitemap URL returns 200', bad200.length === 0, bad200.length ? bad200.join(' | ') : `${locs.length} URLs`);
    const alt = h => Object.fromEntries([...h.matchAll(/<link rel="alternate" hreflang="([a-z-]+)" href="([^"]+)"/g)].map(m => [m[1], new URL(m[2]).pathname]));
    const badHl = [];
    for (const [pth, h] of Object.entries(html)) {
      const a = alt(h); if (!a.es || !a.en) { badHl.push(`${pth}: missing es/en alternate`); continue; }
      if (a.es !== pth && a.en !== pth) badHl.push(`${pth}: alternates do not include itself (${a.es}, ${a.en})`);
      const twin = a.es === pth ? a.en : a.es; const t = html[twin] !== undefined ? alt(html[twin]) : null;
      if (!t) badHl.push(`${pth}: twin ${twin} not in sitemap`); else if (t.es !== a.es || t.en !== a.en) badHl.push(`${pth} <-> ${twin}: pairs differ`);
    }
    rec('Expansion', 'ES/EN pairs exist and hreflang matches both ways', badHl.length === 0, badHl.length ? badHl.join(' | ') : `${Object.keys(html).length} pages`);
    // every guide has its risk-reduction section, and the hub card links to all of them
    const guides = Object.keys(html).filter(p => /^\/(guias|en\/guides)\/[^/]+\/$/.test(p));
    const noMit = guides.filter(p => !new RegExp(`id="${p.startsWith('/en/') ? 'mitigation' : 'mitigacion'}"`).test(html[p]));
    rec('Expansion', 'Every guide has the #mitigacion / #mitigation section', noMit.length === 0 && guides.length === 28, `${guides.length} guides` + (noMit.length ? '; missing: ' + noMit.join(', ') : ''));
    const hubLinks = ['/guias/', '/en/guides/'].map(h => [...html[h].matchAll(/href="([^"]+#mitiga(?:cion|tion))"/g)].length);
    rec('Expansion', 'Hub Mitigation card deep-links to every guide', hubLinks.every(n => n === 14), `ES ${hubLinks[0]}, EN ${hubLinks[1]} links`);
    // ?tema= prefills the contact topic for every key, on both homepages
    const badT = [];
    for (const [k, label] of Object.entries(TEMA)) for (const home of ['/', '/en/']) {
      const p = await freshPage(); await p.goto(`${BASE}${home}?tema=${k}#contacto`); await settle(p);
      const t = await selectedTema(p); if (t !== label) badT.push(`${home}?tema=${k} -> "${t}"`); await p.ctx.close();
    }
    rec('Expansion', `?tema= prefill works for all ${Object.keys(TEMA).length} keys on / and /en/`, badT.length === 0, badT.length ? badT.join(' | ') : 'all selected');
    // copy scans on the raw HTML (includes both languages and the homepage's script data)
    const NAMES = [/\bMarsh\b/, /Chubb/, /\bPURE\b/, /\bAIG\b/, /\bCitizens\b/, /Travelers/, /Nationwide/, /State Farm/, /Allstate/, /Lloyd'?s/, /Hiscox/, /Liberty Mutual/, /GEICO/, /Progressive Insurance/, /Tower Hill/, /Zurich/, /Markel/];
    const PHRASES = [/—/, /call now/i, /get a quote today/i, /cotice ya/i, /quote now/i, /llame ya/i];
    const hits = [];
    for (const [pth, h] of Object.entries({ ...html, '/gracias.html': (await (await http.get('/gracias.html')).text()), '/privacidad.html': (await (await http.get('/privacidad.html')).text()) })) {
      const txt = h.replace(/<script[^>]+src=[^>]*><\/script>/g, '');
      for (const re of [...NAMES, ...PHRASES]) { const m = txt.match(re); if (m) hits.push(`${pth}: ${re} ("${txt.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ')}")`); }
    }
    rec('Expansion', 'No em dashes, carrier names, employer name or banned sales phrases', hits.length === 0, hits.length ? hits.slice(0, 12).join(' | ') : `${Object.keys(html).length + 2} pages scanned`);
    // Tag Manager container loads exactly once
    const gtm = [];
    for (const u of ['/', '/en/', '/guias/condominios-y-hoa/', '/en/guides/personal-cyber/']) {
      const c = await browser.newContext(DESKTOP); const loads = [];
      await c.route('**/*', r => { const x = r.request().url(); if (/gtm\.js\?id=GTM-P88VGFHR/.test(x)) loads.push(x); if (BEACONS.test(x) || !['GET', 'HEAD'].includes(r.request().method())) return r.abort(); return r.continue(); });
      const p = await c.newPage(); await p.goto(BASE + u, { waitUntil: 'load' }); await p.waitForTimeout(3500);
      gtm.push({ u, n: loads.length, hosts: loads.map(x => new URL(x).host + new URL(x).pathname.replace(/\/gtm\.js$/, '')) }); await c.close();
    }
    rec('Expansion', 'Tag Manager (GTM-P88VGFHR) loads exactly once', gtm.every(g => g.n === 1), gtm.map(g => `${g.u}: ${g.n} (${g.hosts.join(', ')})`).join(' | '));
  }

  /* ================= SCREENSHOTS OF THE NEW GUIDES ================= */
  if (want('newshots')) {
    const pairs = [['cyb', '/guias/ciber-proteccion-familiar/', '/en/guides/personal-cyber/'], ['kr', '/guias/secuestro-y-extorsion/', '/en/guides/kidnap-ransom/'],
      ['str', '/guias/alquiler-vacacional/', '/en/guides/short-term-rentals/'], ['ren', '/guias/remodelaciones/', '/en/guides/renovations-builders-risk/'],
      ['brd', '/guias/juntas-y-fundaciones/', '/en/guides/board-service-family-foundations/'], ['cnd', '/guias/condominios-y-hoa/', '/en/guides/condos-hoa/']];
    const errs = [];
    for (const [k, es, en] of pairs) for (const [lang, u] of [['es', es], ['en', en]]) for (const [dev, opts] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
      const p = await freshPage(opts); await p.goto(BASE + u); await settle(p); await sweep(p);
      await p.screenshot({ path: path.join(OUT, 'shots', `new-${k}-${lang}-${dev}.png`), fullPage: true });
      await p.screenshot({ path: path.join(OUT, 'shots', `new-${k}-${lang}-${dev}-fold.png`) });
      if (p.errors.length) errs.push(`${u} ${dev}: ${p.errors.join('; ')}`); await p.ctx.close();
    }
    rec('Visual', 'Screenshots of the 6 new guides (ES + EN, desktop 1440 + mobile 390), no JS errors', errs.length === 0, errs.length ? errs.join(' | ') : path.join(OUT, 'shots', 'new-*.png'));
  }

  await http.dispose(); await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  const f = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - f}/${results.length} passed, ${f} failed`);
})().catch(e => { console.error('SUITE CRASH', e); process.exit(2); });
