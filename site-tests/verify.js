// Live-site verification for protectedlegacyfl.com. Every test gets a fresh
// browser context. POSTs to the site are always aborted (no form submissions),
// and analytics/ads beacons are aborted so tests do not pollute the data.
const { chromium, request } = require('playwright');
const fs = require('fs'), path = require('path'), zlib = require('zlib');

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
  // software WebGL so the 3D hero can be exercised headless (harmless for everything else)
  browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
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
      rec('Pages', '/en/ is the English homepage', r.lang === 'en' && r.path === '/en/' && /Insurance in Florida/.test(r.t), `lang=${r.lang} path=${r.path} h1="${r.h1}"`); await p.ctx.close(); }
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
    { // unknown URLs get the site's own bilingual 404 page (status 404), in the visitor's language
      const r = []; for (const [path, lang, h] of [['/no-existe-pp-404', 'es', 'Esta página no existe'], ['/en/not-a-page-pp-404', 'en', 'This page does not exist']]) {
        const p = await freshPage(); const res = await p.goto(BASE + path); await p.waitForTimeout(300);
        const st = res ? res.status() : 0; const h1 = ((await p.textContent('h1').catch(() => '')) || '').trim(); const l = await p.evaluate(() => document.documentElement.lang);
        if (st !== 404 || !h1.includes(h) || l !== lang || p.errors.length) r.push(`${path}: status ${st}, lang ${l}, h1 "${h1.slice(0, 40)}"${p.errors.length ? ', JS errors' : ''}`);
        await p.ctx.close(); }
      rec('Pages', 'Unknown URL shows the bilingual 404 page (status 404, right language)', r.length === 0, r.length ? r.join(' | ') : 'ES and EN OK'); }
  }

  /* ================= CRAWL: links, anchors, GTM, JS errors ================= */
  if (want('crawl')) {
    const pages = {}; const queue = locs.map(u => new URL(u).pathname); const seen = new Set(queue);
    const links = []; // {from, href}
    while (queue.length) {
      const pth = queue.shift(); const p = await freshPage();
      let status = 0, html = '';
      try { const resp = await p.goto(BASE + pth, { waitUntil: 'load' }); status = resp.status(); html = await resp.text(); await settle(p); await sweep(p); await p.waitForTimeout(800);
        // lazy images below the fold only load when scrolled to: load them now so 'not loaded yet' is not reported as broken
        await p.evaluate(() => Promise.all([...document.images].filter(i => !i.complete).map(i => { i.loading = 'eager'; return new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); setTimeout(r, 10000); }); }))); } catch (e) { p.errors.push('nav: ' + e.message); }
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
    await p.locator('img.foto').scrollIntoViewIfNeeded();
    await p.waitForFunction(() => { const i = document.querySelector('img.foto'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 8000 }).catch(() => {}); // lazy image: wait for it, not a fixed delay
    const r = await p.evaluate(() => { const i = document.querySelector('img.foto'); return { src: i.currentSrc, ok: i.complete && i.naturalWidth > 0, w: i.naturalWidth, h: i.naturalHeight }; });
    rec('Pages', 'img/christian-retrato loads on the homepage (AVIF, WebP or JPEG)', r.ok && /christian-retrato(-\d+)?\.(avif|webp|jpg)$/.test(r.src), `${r.src} ${r.w}x${r.h}`); await p.ctx.close();
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
      await cta.click(); await p.waitForTimeout(1200);
      const t = await p.getAttribute('#gForm input[name="tema"]', 'value').catch(() => null); const land = new URL(p.url()); const vis = await inView(p, '#contacto');
      (t === TEMA[key] && land.pathname === g && vis ? ok : bad).push(`${g} [${href}] -> ${land.pathname}${land.hash} tema="${t}" formInView=${vis}`);
      await p.ctx.close();
    }
    rec('Quiz', 'Each guide CTA -> the form on the same page, with its topic set', bad.length === 0 && ok.length === guides.length, `${ok.length}/${guides.length} OK` + (bad.length ? '; ' + bad.join(' | ') : ''));
    { // the guide form sends every field Netlify expects; the POST is answered inside the browser (nothing is sent) and Google tags are blocked (no conversion)
      const r = [];
      for (const [g, lang] of [['/guias/inundacion/', 'es'], ['/en/guides/umbrella-liability/', 'en']]) {
        const p = await freshPage(); let body = '';
        await p.route('**/*', rt => { const q = rt.request(); if (q.method() === 'POST') { if (new URL(q.url()).pathname === '/') body = q.postData() || ''; return rt.fulfill({ status: 200, body: 'ok' }); }
          if (/google|doubleclick|googleadservices/.test(new URL(q.url()).host)) return rt.abort(); return rt.continue(); });
        await p.goto(BASE + g + '?gclid=TESTGCLID&utm_source=google'); await settle(p);
        await p.fill('#gf-name', 'Test Automatizado'); await p.fill('#gf-email', 'test@example.com'); await p.fill('#gf-tel', '3055550000'); await p.check('#gf-consent');
        await p.click('#gf-send'); await p.waitForTimeout(2500);
        const f = new URLSearchParams(body), need = ['form-name', 'tema', 'nombre', 'email', 'telefono', 'gclid', 'origen', 'pagina_entrada', 'idioma_sitio'];
        const miss = need.filter(n => !f.get(n)); const end = new URL(p.url()).pathname;
        if (miss.length || f.get('form-name') !== 'contacto' || f.get('gclid') !== 'TESTGCLID' || f.get('idioma_sitio') !== lang || end !== '/gracias.html') r.push(`${g}: missing [${miss}] landed ${end}`);
        await p.ctx.close();
      }
      rec('Quiz', 'Guide form sends all lead fields and goes to the thank-you page (simulated, nothing sent)', r.length === 0, r.length ? r.join(' | ') : 'ES and EN OK'); }
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
      await p.click('#pplTab');
      // wait for the slide-in to finish (the panel's own transition), not a fixed delay: a busy main thread must not read as a closed panel
      await p.waitForFunction(() => { const pn = document.getElementById('pplPanel'), r = pn.getBoundingClientRect(); return document.getElementById('ppl').classList.contains('ppl-on') && r.right <= innerWidth + 1 && getComputedStyle(pn).visibility === 'visible'; }, null, { timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(150); const s = await panelState(p);
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
      if (eVis) await entry.click();
      await p.waitForFunction(() => { const pn = document.getElementById('pplPanel'), r = pn.getBoundingClientRect(); return document.getElementById('ppl').classList.contains('ppl-on') && r.right <= innerWidth + 1; }, null, { timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(150); const s = await panelState(p);
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

  /* ================= GUIDE CTAs (work order 2026-10): self-check card, phone bar, midnote, scroll depth ================= */
  if (want('guidecta')) {
    const guides = locs.map(u => new URL(u).pathname).filter(x => /^\/(guias|en\/guides)\/[^/]+\/$/.test(x));
    const bad = [], counts = {};
    for (const g of guides) {
      const p = await freshPage(); await p.goto(BASE + g); await settle(p);
      const r = await p.evaluate(() => {
        const q = s => document.querySelector(s), en = document.documentElement.lang === 'en', home = en ? '/en/#mapa' : '/#mapa';
        const k = (q('a[data-cta^="guide_quiz_"]') || { getAttribute: () => 'guide_quiz_?' }).getAttribute('data-cta').replace('guide_quiz_', '');
        const alt = (q('link[rel="alternate"][hreflang="' + (en ? 'es' : 'en') + '"]') || {}).href || '';
        const sum = q('article .sumbox'), card = q('article .topcta'), bar = q('#gbar'), mid = q('.midnote');
        const path = a => a ? new URL(a.getAttribute('href'), location.href).pathname + new URL(a.getAttribute('href'), location.href).hash : '';
        const e = [];
        if (!card) e.push('no .topcta'); else {
          if (!sum || sum.nextElementSibling !== card) e.push('.topcta not directly after .sumbox');
          const tq = card.querySelector(`a[data-cta="guide_top_quiz_${k}"]`);
          if (!tq || path(tq) !== home) e.push(`top quiz link ${tq ? path(tq) : 'missing'} (want ${home})`);
          if (!card.querySelector(`a[data-cta="guide_top_write_${k}"]`)) e.push('top write link missing');
          if (!card.classList.contains('no-print')) e.push('.topcta without no-print');
        }
        if (!bar) e.push('no #gbar'); else {
          const bq = bar.querySelector(`a[data-cta="guide_bar_quiz_${k}"]`);
          if (!bq || path(bq) !== home) e.push('bar quiz link wrong or missing');
          if (!bar.querySelector(`a[data-cta="guide_bar_write_${k}"]`)) e.push('bar write link missing');
          const tel = bar.querySelectorAll('a[href="tel:+17866712171"][data-track="llamada"]');
          const word = en ? 'Call' : 'Llamar', order = [...bar.children].map(a => a.className).join(',');
          if (tel.length !== 1 || tel[0].textContent.trim() !== word) e.push(`bar call links: ${tel.length}, label "${tel[0] ? tel[0].textContent.trim() : '-'}" (want ${word})`);
          if (order !== 'gb-q,gb-c,gb-w') e.push(`bar order ${order} (want self-check, call, write)`);
        }
        if (!mid || !mid.querySelector(`a[data-cta="guide_mid_quiz_${k}"]`) || !mid.querySelector(`a[data-cta="guide_mid_${k}"]`)) e.push('midnote links missing');
        if (document.documentElement.outerHTML.includes('—')) e.push('em dash in page');
        return { k, e, n: document.querySelectorAll('[data-cta]').length, alt: alt ? new URL(alt).pathname : '' };
      });
      counts[g] = r; if (r.e.length) bad.push(`${g}: ${r.e.join('; ')}`); await p.ctx.close();
    }
    rec('GuideCTA', 'Every guide: card after the summary, 3-action phone bar, two-link midnote, no em dash', bad.length === 0 && guides.length === 28, `${guides.length - bad.length}/${guides.length} OK` + (bad.length ? '; ' + bad.join(' | ') : ''));
    const par = guides.filter(g => g.startsWith('/guias/')).map(g => { const en = counts[g].alt, a = counts[g].n, b = counts[en] ? counts[en].n : -1; return a === b ? null : `${g} ${a} vs ${en} ${b}`; }).filter(Boolean);
    rec('GuideCTA', 'ES/EN parity: same number of [data-cta] on each guide pair', par.length === 0, par.length ? par.join(' | ') : '14 pairs match');

    // phones: card near the first screen, bar after the card, hidden over the form, nothing overflows (Google tags blocked, no navigation)
    const mob = [];
    for (const [w, h] of [[360, 740], [390, 844]]) for (const u of ['/guias/umbrella-responsabilidad/', '/en/guides/umbrella-liability/', '/guias/inundacion/', '/en/guides/flood/']) {
      const p = await freshPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await p.goto(BASE + u); await settle(p);
      const on = () => p.evaluate(() => document.getElementById('gbar').classList.contains('on'));
      const go = y => p.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y).then(() => p.waitForTimeout(350));
      await go(0); const s = await p.evaluate(() => { const r = document.querySelector('.topcta').getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, ov: document.documentElement.scrollWidth > innerWidth, labels: [...document.querySelectorAll('#gbar a')].some(a => a.scrollWidth > a.clientWidth + 1) }; });
      const atTop = await on(); await go(s.bottom + 10); const past = await on();
      await p.evaluate(() => document.getElementById('contacto').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(350); const form = await on();
      const ok = s.top < h * 1.35 && !atTop && past && !form && !s.ov && !s.labels;
      if (!ok) mob.push(`${w}x${h} ${u}: cardTop ${Math.round(s.top)}, bar top/past/form ${atTop}/${past}/${form}, overflow ${s.ov}, label overflow ${s.labels}`);
      if (p.errors.length) mob.push(`${u}: ${p.errors.join('; ')}`); await p.ctx.close();
    }
    rec('GuideCTA', 'Phones 360x740 + 390x844: card within one short scroll, bar after it, hidden over the form, no overflow', mob.length === 0, mob.length ? mob.join(' | ') : '8 checks OK');

    // dataLayer: three guide_scroll events, one cta_click per new CTA (clicks are prevented, so nothing navigates or dials)
    const dl = [];
    for (const u of ['/guias/umbrella-responsabilidad/', '/en/guides/umbrella-liability/']) {
      const p = await freshPage(MOBILE); await p.goto(BASE + u); await settle(p);
      for (let i = 0; i < 4; i++) { await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(150); await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(150); }
      const r = await p.evaluate(() => {
        window.addEventListener('click', e => e.preventDefault());
        const sc = dataLayer.filter(x => x && x.event === 'guide_scroll').map(x => x.scroll_pct).join(',');
        const k = document.querySelector('a[data-cta^="guide_quiz_"]').getAttribute('data-cta').replace('guide_quiz_', '');
        const want = ['guide_top_quiz_', 'guide_top_write_', 'guide_bar_quiz_', 'guide_bar_write_', 'guide_mid_quiz_', 'guide_mid_'].map(x => x + k), miss = [];
        for (const c of want) { const before = dataLayer.filter(x => x && x.event === 'cta_click' && x.cta === c).length; document.querySelector(`[data-cta="${c}"]`).click();
          if (dataLayer.filter(x => x && x.event === 'cta_click' && x.cta === c).length !== before + 1) miss.push(c); }
        return { sc, miss };
      });
      if (r.sc !== '25,50,75' || r.miss.length) dl.push(`${u}: guide_scroll [${r.sc}], cta_click missing [${r.miss}]`); await p.ctx.close();
    }
    rec('GuideCTA', 'dataLayer: guide_scroll 25/50/75 exactly once each; each new CTA pushes one cta_click', dl.length === 0, dl.length ? dl.join(' | ') : 'ES and EN OK');
  }


  /* ================= LEAD PATH (work order 2026-10-08): two-field form at the result, phone in the long form, guide bar ================= */
  if (want('leadpath')) {
    const DONE_PICKS = '[2,1,0,-1,2,1,0,-1,2,1,0,-1]'; // a finished self-check, preloaded so each test starts on the result screen
    const POST_ROUTES = async (p, store, delay = 0) => p.route('**/*', async rt => {
      const q = rt.request(), u = new URL(q.url());
      if (q.method() === 'POST') { if (u.pathname === '/') store.push(q.postData() || ''); if (delay) await new Promise(r => setTimeout(r, delay)); return rt.fulfill({ status: 200, body: 'ok' }); } // answered in the browser: nothing reaches Netlify
      if (/google|doubleclick|googleadservices/.test(u.host)) return rt.abort();
      return rt.continue();
    });
    const T = {
      es: { url: '/', h: 'Le envío su mapa con una nota personal', name: 'Nombre', tel: 'Teléfono o WhatsApp', swap: 'o correo', send: 'Enviarme mi mapa',
        line: 'Sin costo y sin compromiso. Uso educativo; no es asesoría de seguros.', done: 'Listo. Le escribo hoy mismo.', more: '¿Prefiere contarme más?', none: 'Escriba su teléfono o su correo, por favor.' },
      en: { url: '/en/', h: 'I will send you your map with a personal note', name: 'Name', tel: 'Phone or WhatsApp', swap: 'or email', send: 'Send me my map',
        line: 'No cost, no obligation. Educational use; not insurance advice.', done: 'Done. I will write to you today.', more: 'Prefer to tell me more?', none: 'Please type your phone or your email.' },
    };
    const openResult = async (lang, query = '') => {
      const p = await freshPage(MOBILE); await p.addInitScript(v => { try { localStorage.setItem('pp.quiz', v); } catch (e) {} }, DONE_PICKS);
      const store = []; await POST_ROUTES(p, store, 400); p.posts = store;
      await p.goto(BASE + T[lang].url + query + '#mapa'); await settle(p);
      await p.locator('#resCapture').scrollIntoViewIfNeeded(); await p.waitForTimeout(500); return p;
    };
    const leads = p => p.evaluate(() => (window.dataLayer || []).filter(o => o && o.event === 'generate_lead').map(o => { const c = { ...o }; delete c.eventCallback; delete c['gtm.uniqueEventId']; return c; }));
    let sample = null;
    for (const lang of ['es', 'en']) {
      const L = T[lang];
      // 1. the result screen shows the two-field form, in the right language, readable at 390 px, tab order name -> phone -> swap -> send
      { const p = await openResult(lang);
        const r = await p.evaluate(() => { const t = s => (document.querySelector(s) || {}).textContent || '', vis = s => { const e = document.querySelector(s); return !!e && !e.hidden && e.offsetParent !== null; };
          return { h: t('#miniT').trim(), name: t('label[for="m-nombre"]').trim(), tel: t('label[for="m-tel"]').trim(), swap: t('#m-swap').trim(), send: t('#m-send').trim(), line: t('.rc-line').trim(), more: t('#rcGo').trim(),
            vis: vis('#miniForm') && vis('#m-nombre') && vis('#m-tel') && !vis('#m-email') && vis('#rcGo'), over: document.documentElement.scrollWidth > innerWidth,
            above: document.getElementById('miniForm').getBoundingClientRect().top < document.getElementById('rcGo').getBoundingClientRect().top }; });
        await p.focus('#m-nombre'); const order = [];
        for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => document.activeElement.id)); }
        await p.locator('#resCapture').screenshot({ path: path.join(OUT, 'shots', `lead-mini-${lang}-390.png`) });
        await p.screenshot({ path: path.join(OUT, 'shots', `lead-result-${lang}-390.png`) });
        const ok = r.vis && !r.over && r.above && r.h === L.h && r.name === L.name && r.tel === L.tel && r.swap === L.swap && r.send === L.send && r.line === L.line && r.more === L.more && order.join(',') === 'm-tel,m-swap,m-send' && !p.errors.length;
        rec('LeadPath', `${L.url} result screen: two-field form, ${lang.toUpperCase()} labels, 390 px, tab order`, ok,
          `heading "${r.h}", labels ${r.name}/${r.tel}, button "${r.send}", line ok=${r.line === L.line}, link "${r.more}" below=${r.above}, overflow=${r.over}, tab ${order.join('>')}` + (p.errors.length ? '; ' + p.errors.join('; ') : ''));
        await p.ctx.close(); }
      // 2. neither phone nor email: blocked with a plain message, nothing sent
      { const p = await openResult(lang);
        await p.fill('#m-nombre', 'Prueba'); await p.click('#m-send'); await p.waitForTimeout(900);
        const msg = (await p.textContent('#m-err')).trim(), shown = await p.isVisible('#m-err'), n = (await leads(p)).length;
        rec('LeadPath', `${L.url} mini form with no phone and no email is blocked with a plain message`, shown && msg === L.none && p.posts.length === 0 && n === 0, `"${msg}", posts ${p.posts.length}, generate_lead ${n}`);
        await p.ctx.close(); }
      // 3. phone and no email: one POST to the same Netlify form with the hidden fields, one generate_lead (form_id mini), in-page success, long form collapses
      { const p = await openResult(lang, '?gclid=TESTGCLID&utm_source=google');
        await p.fill('#m-nombre', 'Test Automatizado'); await p.fill('#m-tel', '305 555 0100');
        await p.click('#m-send'); await p.click('#m-send', { force: true }).catch(() => {}); // a double tap must not send twice
        await p.waitForTimeout(2200);
        const f = new URLSearchParams(p.posts[0] || ''), L2 = await leads(p), url = new URL(p.url());
        const st = await p.evaluate(() => ({ done: !document.getElementById('miniDone').hidden ? document.getElementById('miniDone').textContent.trim() : '', mini: document.getElementById('miniForm').hidden,
          long: document.getElementById('ppForm').hidden && document.getElementById('ppForm').offsetParent === null && document.getElementById('rcGo').offsetParent === null, longDone: (document.getElementById('formDone') || {}).textContent || '' }));
        const need = ['form-name', 'form_id', 'nombre', 'telefono', 'idioma_sitio', 'autoevaluacion_puntaje', 'autoevaluacion_respuestas', 'autoevaluacion_zonas_en_blanco', 'nivel_conciencia', 'gclid', 'origen', 'pagina_entrada'];
        const miss = need.filter(k => !f.get(k)); const g = L2[0] || {};
        const ok = p.posts.length === 1 && !miss.length && f.get('form-name') === 'contacto' && f.get('form_id') === 'mini' && f.get('email') === '' && f.get('idioma_sitio') === lang && f.get('gclid') === 'TESTGCLID'
          && L2.length === 1 && g.form_id === 'mini' && g.lang === lang && ['high', 'medium', 'starting'].includes(g.awareness_level) && Number.isInteger(g.blank_count)
          && st.done === L.done && st.mini && st.long && st.longDone === L.done && url.pathname === T[lang].url && !p.errors.length;
        rec('LeadPath', `${L.url} phone, no email: sends once, generate_lead once (form_id mini), "${L.done}", long form collapses`, ok,
          `posts ${p.posts.length}, missing [${miss}], form_id=${f.get('form_id')}, generate_lead ${L2.length} ${JSON.stringify(g)}, done "${st.done}", mini hidden ${st.mini}, long hidden ${st.long}, stayed on ${url.pathname}` + (p.errors.length ? '; ' + p.errors.join('; ') : ''));
        await p.locator('#resCapture').screenshot({ path: path.join(OUT, 'shots', `lead-mini-done-${lang}-390.png`) });
        if (lang === 'es') sample = g;
        await p.ctx.close(); }
      // 4. the "or email" switch: email only also works
      { const p = await openResult(lang);
        await p.fill('#m-nombre', 'Test Automatizado'); await p.click('#m-swap'); const sw = (await p.textContent('#m-swap')).trim();
        await p.fill('#m-email', 'test@example.com'); await p.click('#m-send'); await p.waitForTimeout(1500);
        const f = new URLSearchParams(p.posts[0] || ''), n = (await leads(p)).length;
        rec('LeadPath', `${L.url} "${L.swap}" switch: email only sends once`, p.posts.length === 1 && f.get('email') === 'test@example.com' && f.get('telefono') === '' && n === 1 && sw === (lang === 'es' ? 'o teléfono' : 'or phone'),
          `swap now "${sw}", posts ${p.posts.length}, email=${f.get('email')}, generate_lead ${n}`);
        await p.ctx.close(); }
      // 5. long form: phone without email is accepted (generate_lead form_id long, thank-you page); neither is blocked
      { const p = await freshPage(); const store = []; await POST_ROUTES(p, store); const alerts = []; p.on('dialog', d => { alerts.push(d.message()); d.dismiss().catch(() => {}); });
        await p.goto(BASE + T[lang].url + '#contacto'); await settle(p);
        const lab = (await p.textContent('label[for="f-tel"]')).trim(), telFirst = await p.evaluate(() => document.getElementById('f-tel').compareDocumentPosition(document.getElementById('f-email')) & Node.DOCUMENT_POSITION_FOLLOWING);
        await p.fill('#f-nombre', 'Test Automatizado'); await p.check('#f-consent'); await p.click('#ppSend'); await p.waitForTimeout(600);
        const blocked = store.length === 0 && alerts.length === 1;
        await p.fill('#f-tel', '3055550100'); await p.click('#ppSend'); await p.waitForTimeout(2600);
        const f = new URLSearchParams(store[0] || ''), end = new URL(p.url()).pathname;
        rec('LeadPath', `${L.url} long form: optional phone above email; phone only is enough; neither is blocked`, lab.startsWith(L.tel) && !!telFirst && blocked && store.length === 1 && f.get('telefono') === '3055550100' && f.get('email') === '' && f.get('form_id') === 'long' && end === '/gracias.html',
          `label "${lab}", phone before email ${!!telFirst}, blocked ${blocked} ("${alerts[0] || ''}"), posts ${store.length}, form_id=${f.get('form_id')}, landed ${end}`);
        await p.ctx.close(); }
    }
    if (sample) { fs.writeFileSync(path.join(OUT, 'lead-mini-datalayer.json'), JSON.stringify(sample, null, 1)); rec('LeadPath', 'Sample mini-form dataLayer push saved', true, JSON.stringify(sample)); }

    // 6. guide phone bar: Self-check, Call, Write to me; the call link shows its word and reports phone_click from the bar (click prevented: nothing dials)
    const bar = [];
    for (const [u, word] of [['/guias/umbrella-responsabilidad/', 'Llamar'], ['/en/guides/umbrella-liability/', 'Call'], ['/guias/inundacion/', 'Llamar'], ['/en/guides/flood/', 'Call']]) {
      const p = await freshPage(MOBILE); await p.goto(BASE + u); await settle(p);
      await p.evaluate(() => { const c = document.querySelector('.topcta'); window.scrollTo({ top: c.getBoundingClientRect().bottom + scrollY + 40, behavior: 'instant' }); }); await p.waitForTimeout(700);
      const r = await p.evaluate(() => { window.addEventListener('click', e => e.preventDefault());
        const b = document.getElementById('gbar'), a = b.querySelector('.gb-c'); const before = dataLayer.length; a.click();
        const ev = dataLayer.slice(before).find(o => o && o.event === 'phone_click');
        return { on: b.classList.contains('on'), order: [...b.children].map(x => x.textContent.trim()).join(' | '), word: a.textContent.trim(), href: a.getAttribute('href'), ev: ev ? ev.link_location : '',
          clip: [...b.children].some(x => x.scrollWidth > x.clientWidth + 1) }; });
      if (u === '/guias/umbrella-responsabilidad/' || u === '/en/guides/umbrella-liability/') await p.screenshot({ path: path.join(OUT, 'shots', `lead-guide-bar-${u.startsWith('/en/') ? 'en' : 'es'}-390.png`) });
      if (!(r.on && r.word === word && r.href === 'tel:+17866712171' && r.ev === 'barra_movil' && !r.clip && r.order.split(' | ')[1] === word)) bar.push(`${u}: ${JSON.stringify(r)}`);
      await p.ctx.close();
    }
    rec('LeadPath', 'Guide phone bar: Self-check, Call, Write to me; Call labelled; phone_click from barra_movil; nothing clipped', bar.length === 0, bar.length ? bar.join(' | ') : '4 guides OK');

    // 7. copy: Spanish accents intact, no em dash, no pressure words in the new strings
    const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'lead.v1.js'), 'utf8'); // the short form's strings live in the script
    const src = { es: fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8') + js, en: fs.readFileSync(path.join(__dirname, '..', 'en.html'), 'utf8') + js };
    const accents = ['Le envío su mapa con una nota personal', 'Teléfono o WhatsApp', 'no es asesoría de seguros', '¿Prefiere contarme más?', 'si no dejó teléfono'];
    const miss = Object.entries(src).flatMap(([k, s]) => accents.filter(a => !s.includes(a)).map(a => `${k}: ${a}`));
    const BAN = /—|\bcall now\b|llame ya|cotice ya|get a quote today|\bguarantee|garantiz|\bbest price|\bcheap|barat[oa]|\burgent|\burgente|last chance|última oportunidad|\blimited time/i;
    // the new pieces only (the whole-site sales-phrase scan lives in the "expansion" group)
    const pieces = s => [s.slice(s.indexOf('id="resCapture"'), s.indexOf('class="restart"')), s.slice(s.indexOf('<label for="f-tel"'), s.indexOf('<label for="f-ciudad"')),
      js].join('\n');
    const ban = Object.entries(src).filter(([, s]) => BAN.test(pieces(s)) || pieces(s).length < 2000).map(([k, s]) => `${k}: ${(pieces(s).match(BAN) || ['(new pieces not found)'])[0]}`);
    rec('LeadPath', 'New copy: Spanish accents intact, no em dash, no pressure or price words', !miss.length && !ban.length, (miss.length ? 'missing ' + miss.join(', ') : 'accents OK') + (ban.length ? '; banned ' + ban.join(', ') : '; scan clean'));
  }

  /* ================= 3D (work order 2026-10): hero, map, layers figures ================= */
  if (want('three')) {
    const ready = p => p.waitForFunction(() => window.ppHero3d && (window.ppHero3d.ready || window.ppHero3d.mode === 'fallback'), null, { timeout: 25000 }).catch(() => {});
    const dlEv = (p, ev) => p.evaluate(e => (window.dataLayer || []).filter(o => o && o.event === e), ev);
    // 1. desktop with ?3d=1: canvas, hero3d_ready webgl, no console errors, text and buttons clickable, no layout shift from the mount
    for (const u of ['/', '/en/']) {
      const p = await freshPage();
      await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
      await p.goto(BASE + u + '?3d=1', { waitUntil: 'load' }); await ready(p); await p.waitForTimeout(1500);
      const r = await p.evaluate(() => {
        const hit = el => { const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!t && (el === t || el.contains(t)); };
        const vis = el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== 'hidden' && parseFloat(getComputedStyle(el).opacity) > .9; };
        const h1 = document.querySelector('.hero h1'), btns = [...document.querySelectorAll('.hero .cta-row .btn')];
        return { canvas: !!document.querySelector('.hero-3d canvas'), on: document.querySelector('.hero').classList.contains('hero-3d-on'), state: window.ppHero3d, cls: +window.__cls.toFixed(4),
          h1: vis(h1), btns: btns.length === 2 && btns.every(b => vis(b) && hit(b)) };
      });
      const ev = await dlEv(p, 'hero3d_ready');
      rec('3D', `${u}?3d=1 desktop: canvas in .hero-3d, hero3d_ready webgl, no errors, H1 and both buttons visible and clickable, CLS <= 0.02`,
        r.canvas && r.on && ev.length === 1 && ev[0].mode === 'webgl' && ev[0].page_type === 'home' && !!ev[0].language && p.errors.length === 0 && r.h1 && r.btns && r.cls <= 0.02,
        `canvas=${r.canvas} on=${r.on} ready=${JSON.stringify(ev[0] || null)} errors=${p.errors.length} h1=${r.h1} buttons=${r.btns} cls=${r.cls} frames=${r.state && r.state.frames}`);
      await p.ctx.close();
    }
    // 2. reduced motion: SVG stays, no canvas, fallback reason reduced-motion
    { const c = await browser.newContext({ ...DESKTOP, reducedMotion: 'reduce', locale: 'es-US' }); await c.route('**/*', rt => BEACONS.test(rt.request().url()) || !['GET', 'HEAD'].includes(rt.request().method()) ? rt.abort() : rt.continue());
      const p = await c.newPage(); await p.goto(BASE + '/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
      const r = await p.evaluate(() => ({ canvas: !!document.querySelector('.hero-3d canvas'), sky: getComputedStyle(document.querySelector('svg.skyline')).opacity, ev: (window.dataLayer || []).filter(o => o && o.event === 'hero3d_ready') }));
      rec('3D', 'Reduced motion: no canvas, SVG skyline visible, hero3d_ready fallback / reduced-motion', !r.canvas && r.sky === '1' && r.ev.length === 1 && r.ev[0].mode === 'fallback' && r.ev[0].reason === 'reduced-motion', JSON.stringify(r)); await c.close(); }
    // 3. ?no3d=1: the bundle is never requested
    { const p = await freshPage(); const hits = []; p.on('request', q => { if (/\/js\/hero3d/.test(q.url())) hits.push(q.url()); });
      await p.goto(BASE + '/?no3d=1', { waitUntil: 'load' }); await p.waitForTimeout(4000); const ev = await dlEv(p, 'hero3d_ready');
      rec('3D', '/?no3d=1: no request for /js/hero3d, fallback reason flag', hits.length === 0 && ev.length === 1 && ev[0].reason === 'flag', `requests=${hits.length} ready=${JSON.stringify(ev[0] || null)}`); await p.ctx.close(); }
    // 4 + 7. every guide and tool page: no 3D bundle, weight inside the budget (77 KiB + 8), layers figure only on umbrella and flood
    { const pages = locs.map(u => new URL(u).pathname).filter(x => /^\/(guias|en\/guides|herramientas|en\/tools)\/[^/]+\/$/.test(x));
      const bad = [], figs = {}, weights = [];
      for (const pth of pages) {
        const p = await freshPage(); const hits = [], sizes = [];
        p.on('request', q => { if (/\/js\/hero3d/.test(q.url())) hits.push(q.url()); });
        const onResp = async rs => { try { const u = rs.request().url(); if (!u.startsWith(BASE)) return; const b = await rs.body(); const ct = rs.headers()['content-type'] || ''; sizes.push(/text|javascript|json|svg|xml/.test(ct) ? zlib.gzipSync(b).length : b.length); } catch (e) {} };
        p.on('response', onResp); await p.goto(BASE + pth, { waitUntil: 'load' }); await p.waitForTimeout(900); p.off('response', onResp);
        const kb = Math.round(sizes.reduce((a, b) => a + b, 0) / 1024); weights.push(kb);
        const f = await p.evaluate(() => { const fs = [...document.querySelectorAll('.fig3d')]; return fs.map(x => { const sec = x.closest('section'); const cl = sec ? sec.cloneNode(true) : null; if (cl) cl.querySelectorAll('sup.fn, .fig3d').forEach(e => e.remove()); const txt = (cl ? cl.textContent : '').replace(/\s+/g, ' '); const lab = (x.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(); return { role: x.getAttribute('role'), labelInSection: txt.includes(lab.replace(/[.]$/, '')) && lab.length > 40 }; }); });
        figs[pth] = f; if (hits.length) bad.push(`${pth}: hero3d requested`); if (kb > 85) bad.push(`${pth}: ${kb} KiB`);
        await p.ctx.close();
      }
      rec('3D', 'Every guide and tool page: no /js/hero3d request, weight within 85 KiB (77 + 8)', bad.length === 0 && pages.length >= 32, `${pages.length} pages, ${Math.min(...weights)} to ${Math.max(...weights)} KiB` + (bad.length ? '; ' + bad.join(' | ') : ''));
      const withFig = Object.entries(figs).filter(([, v]) => v.length); const expect = ['/guias/umbrella-responsabilidad/', '/en/guides/umbrella-liability/', '/guias/inundacion/', '/en/guides/flood/'];
      const okFig = expect.every(e => figs[e] && figs[e].length === 1 && figs[e][0].role === 'img' && figs[e][0].labelInSection) && withFig.length === 4;
      rec('3D', 'Layers figure: once on the umbrella and flood guides (ES + EN), role img, aria-label is the sentence of its section, nowhere else', okFig, withFig.map(([k, v]) => `${k} x${v.length} label-in-section=${v[0].labelInSection}`).join(' | '));
    }
    // 5. phone 390: no horizontal scroll, both hero buttons above the fold, pixel ratio <= 1.5
    for (const u of ['/', '/en/']) {
      const p = await freshPage(MOBILE); await p.goto(BASE + u + '?3d=1', { waitUntil: 'load' }); await ready(p); await p.waitForTimeout(1200);
      const r = await p.evaluate(() => { const c = document.querySelector('.hero-3d canvas'); const btns = [...document.querySelectorAll('.hero .cta-row .btn')].map(b => Math.round(b.getBoundingClientRect().bottom));
        return { sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight, btns, dpr: window.ppHero3d && window.ppHero3d.dpr, ratio: c ? +(c.width / c.clientWidth).toFixed(2) : null, mode: window.ppHero3d && window.ppHero3d.mode, y: scrollY }; });
      rec('3D', `${u} at 390 px: no horizontal scroll, both hero buttons above the fold, canvas pixel ratio <= 1.5`, r.sw <= r.iw && r.btns.length === 2 && r.btns.every(b => b <= r.ih) && r.mode === 'webgl' && r.ratio !== null && r.ratio <= 1.5 && r.dpr <= 1.5, JSON.stringify(r)); await p.ctx.close();
    }
    // 6. the map: answer all twelve (the form is never submitted), tile states match the result, blank tiles link to the right guide, map3d_view once
    for (const [lang, u] of [['es', '/'], ['en', '/en/']]) {
      const p = await freshPage(); await p.goto(BASE + u + '?no3d=1', { waitUntil: 'load' }); await settle(p);
      await p.locator('#mapa').scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
      const btns = ['#a-si', '#a-ns', '#a-no', '#a-na'];
      for (let i = 0; i < 12; i++) { const before = (await p.textContent('#qcount')).trim(); await p.click(btns[i % 4]); if (i < 11) await p.waitForFunction(b => document.getElementById('qcount').textContent.trim() !== b, before, { timeout: 5000 }).catch(() => {}); }
      await p.waitForSelector('#resultado', { state: 'visible', timeout: 5000 }).catch(() => {}); await p.waitForTimeout(1200);
      const r = await p.evaluate(l => {
        const st = qStats(), G2 = { vid: 'str', leg: 'emp' }, tiles = [...document.querySelectorAll('.m3-tile')], probs = [];
        const answered = {}; picks.forEach((pk, i) => { const d = questions[i].d; if (pk >= 0) answered[d] = true; else if (!answered[d]) answered[d] = 'na'; });
        for (const t of tiles) { const k = t.dataset.k, weak = st.weak.includes(k), blank = t.classList.contains('blank'), gold = t.classList.contains('gold');
          if (weak !== blank) probs.push(`${k}: blank=${blank} weak=${weak}`);
          if (!weak && answered[k] === true && !gold) probs.push(`${k}: aware but not gold`);
          if (weak) { const want = (GUIDE_URL[G2[k] || k] || {})[l]; if (t.getAttribute('href') !== want) probs.push(`${k}: href ${t.getAttribute('href')} want ${want}`); }
          else if (t.hasAttribute('href')) probs.push(`${k}: unexpected link`); }
        return { tiles: tiles.length, face: document.getElementById('map3d').classList.contains('face'), weak: st.weak.length, probs, ev: (window.dataLayer || []).filter(o => o && o.event === 'map3d_view') };
      }, lang);
      rec('3D', `${u} map: 10 tiles, states match the result, blank tiles link to their ${lang.toUpperCase()} guides, map3d_view once with blank_count`, r.tiles === 10 && r.face && r.probs.length === 0 && r.ev.length === 1 && r.ev[0].blank_count === r.weak && p.errors.length === 0,
        `tiles=${r.tiles} face=${r.face} blank=${r.weak} event=${JSON.stringify(r.ev[0] || null)}` + (r.probs.length ? '; ' + r.probs.join(' | ') : '') + (p.errors.length ? '; errors: ' + p.errors.join(' / ') : ''));
      await p.ctx.close();
    }
  }

  await http.dispose(); await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  const f = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - f}/${results.length} passed, ${f} failed`);
})().catch(e => { console.error('SUITE CRASH', e); process.exit(2); });
