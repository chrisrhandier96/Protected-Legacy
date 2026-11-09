// QA Nov 9, section 4 probe (temporary): the homepage in Chrome, WebKit (Safari engine, desktop and iPhone) and Firefox.
const { chromium, webkit, firefox, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8788';
const OUT = process.env.OUT || 'out-home'; fs.mkdirSync(OUT, { recursive: true });

async function gold(page, file) {
  const buf = await page.locator('.hero h1').screenshot({ path: file });
  // count gold pixels in the PNG through the browser itself (no image library needed)
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (r > 150 && g > 105 && b < 140 && r - b > 70 && r >= g) n++; }
    return { n, w: img.width };
  }, buf.toString('base64'));
}

(async () => {
  const runs = [

                ['webkit-iphone', webkit, {}, devices['iPhone 13']],
                ['firefox', firefox, {}, { viewport: { width: 1280, height: 800 } }]];
  for (const [name, type, launch, ctxOpts] of runs) {
    const b = await type.launch(launch);
    for (const lang of ['', 'en/']) {
      const c = await b.newContext(ctxOpts); const p = await c.newPage(); const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      await p.addInitScript(() => { window.__cls = 0; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) { window.__cls = -1; } });
      await p.goto(BASE + '/' + lang + '?no3d=1', { waitUntil: 'load' }); await p.waitForTimeout(4500);
      const g = await gold(p, path.join(OUT, `h1-${name}-${lang ? 'en' : 'es'}.png`));
      const info = await p.evaluate(() => {
        const cue = document.querySelector('.m-cue'), cs = cue && getComputedStyle(cue);
        const ph = document.querySelector('.hero-ph video, .hero-ph img');
        return {
          words: document.querySelectorAll('.hero h1 .w').length, nested: document.querySelectorAll('.hero h1 .w .w').length,
          cue: cs ? [cs.backgroundColor, cs.borderTopStyle + ' ' + cs.borderTopWidth, cs.boxShadow].join(' / ') : 'none',
          drift: ph ? getComputedStyle(ph).animationName : 'no hero media', timeline: CSS.supports('animation-timeline: scroll()'), width: innerWidth,
          plates: [...document.querySelectorAll('img[src*="/img/plates/"]')].map((i) => i.alt.slice(0, 40)),
          title: document.title,
        };
      });
      // counters: bring the stats in, let them land
      await p.evaluate(() => document.querySelector('.num[data-count]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(3500);
      const nums = await p.evaluate(() => [...document.querySelectorAll('.num[data-count]')].map((n) => n.textContent.trim()));
      // myth cue: tap flips the card
      let flipped = null;
      const cue = p.locator('.m-cue').first();
      if (await cue.count()) { await cue.scrollIntoViewIfNeeded(); await cue.click(); await p.waitForTimeout(400); flipped = await p.evaluate(() => !!document.querySelector('.mito.revealed, .revealed')); }
      // language round trip on the Spanish page: no duplicate word wrappers, and what the tab title says
      let trip = '';
      if (!lang && (await p.locator('#btn-en').count())) {
        await p.evaluate(() => scrollTo(0, 0));
        await p.click('#btn-en'); await p.waitForTimeout(800); const tEn = await p.title(); const wEn = await p.evaluate(() => [document.querySelectorAll('.hero h1 .w').length, document.querySelectorAll('.hero h1 .w .w').length]);
        await p.click('#btn-es'); await p.waitForTimeout(800); const wEs = await p.evaluate(() => [document.querySelectorAll('.hero h1 .w').length, document.querySelectorAll('.hero h1 .w .w').length]);
        trip = `after EN: words ${wEn[0]} nested ${wEn[1]}, tab "${tEn.slice(0, 50)}"; back to ES: words ${wEs[0]} nested ${wEs[1]}`;
      }
      await p.evaluate(() => scrollBy(0, 3000)); await p.waitForTimeout(600);
      const cls = await p.evaluate(() => window.__cls);
      console.log(`[${name} ${lang ? 'EN' : 'ES'}] gold ${g.n} px (h1 ${g.w} px wide) | words ${info.words} nested ${info.nested} | counters ${nums.join(' , ')} | cue ${info.cue} | flips ${flipped} | drift ${info.drift} (timeline ${info.timeline}, ${info.width}px) | CLS ${cls.toFixed ? cls.toFixed(4) : cls} | errors ${errs.length}`);
      console.log(`   plates: ${info.plates.join(' | ')}`);
      if (trip) console.log('   ' + trip);
      await c.close();
    }
    // reduced motion (one language): every word shown at once, the gold word present
    const c = await b.newContext({ ...ctxOpts, reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(BASE + '/?no3d=1', { waitUntil: 'load' }); await p.waitForTimeout(600);
    const hidden = await p.evaluate(() => [...document.querySelectorAll('.hero h1 .w')].filter((w) => getComputedStyle(w).opacity !== '1').length);
    const g = await gold(p, path.join(OUT, `h1-${name}-reduced.png`));
    console.log(`[${name} reduced motion] hidden words ${hidden}, gold ${g.n} px`);
    await c.close();
    await b.close();
  }
  // JavaScript off (Chrome): nothing that reveals on scroll stays invisible
  const b = await chromium.launch({ channel: 'chrome' });
  const c = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } }); const p = await c.newPage();
  await p.goto(BASE + '/', { waitUntil: 'load' });
  const nojs = await p.evaluate(() => ({ reveal: document.querySelectorAll('.reveal').length, hidden: [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity === '0').length, doms: document.querySelectorAll('.dom').length, domGrid: (document.getElementById('domGrid') || {}).innerHTML ? 'filled' : 'empty' }));
  console.log(`[JS off] reveal elements ${nojs.reveal}, invisible ${nojs.hidden}, domain cards ${nojs.doms}, domain grid ${nojs.domGrid}`);
  await b.close();
})();
