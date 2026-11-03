// Scenes check (2026-11): loads each guide that carries an interactive 3D scene, in both languages, on a phone
// and a laptop viewport. Checks: the scene exists after the summary box, its first frame loads, every control
// works (slider/tabs swap the frame, layers show, pins highlight notes), no console errors, layout shift under
// 0.02 over load + scroll + interaction. Saves one screenshot per scene and viewport to OUT.
// Usage: BASE=http://localhost:8787 OUT=out-scenes node scenes-check.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'https://www.protectedlegacyfl.com';
const OUT = process.env.OUT || 'out-scenes'; fs.mkdirSync(OUT, { recursive: true });
const PAGES = [
  ['/guias/inundacion/', 'flo'], ['/en/guides/flood/', 'flo'],
  ['/guias/residencias-huracanes/', 'res'], ['/en/guides/homes-hurricanes/', 'res'],
  ['/guias/condominios-y-hoa/', 'cnd'], ['/en/guides/condos-hoa/', 'cnd'],
  ['/guias/umbrella-responsabilidad/', 'lia'], ['/en/guides/umbrella-liability/', 'lia'],
  ['/guias/remodelaciones/', 'ren'], ['/en/guides/renovations-builders-risk/', 'ren'],
  ['/guias/embarcaciones/', 'mar'], ['/en/guides/boats/', 'mar'], ['/guias/alquiler-vacacional/', 'str'], ['/en/guides/short-term-rentals/', 'str'],
  ['/guias/secuestro-y-extorsion/', 'kr'], ['/en/guides/kidnap-ransom/', 'kr'], ['/guias/aviacion-privada/', 'avi'], ['/en/guides/private-aviation/', 'avi'],
  ['/guias/autos/', 'aut'], ['/en/guides/auto/', 'aut'],
];
const VIEWS = { phone: { width: 390, height: 844 }, laptop: { width: 1366, height: 820 } };
let fails = 0; const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + m); };

(async () => {
  const browser = await chromium.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {});
  for (const [vname, vp] of Object.entries(VIEWS)) {
    for (const [url, key] of PAGES) {
      if (process.env.ONLY && process.env.ONLY.split(',').indexOf(key) < 0) continue;
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vname === 'phone' ? 2 : 1 });
      const page = await ctx.newPage(); const errs = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
          .observe({ type: 'layout-shift', buffered: true });
      });
      const tag = `[${vname}] ${url}`;
      const res = await page.goto(BASE + url + '?no3d=1', { waitUntil: 'load' });   // the frames path (flood3d-check.js covers the live 3D one)
      log(res.status() === 200, `${tag} status ${res.status()}`);
      const fig = page.locator(`figure.scn[data-scene="${key}"]`);
      log(await fig.count() === 1, `${tag} one scene`);
      const placed = await page.evaluate(() => { const f = document.querySelector('figure.scn'); const p = f && f.previousElementSibling; return !!(p && p.classList.contains('sumbox')); });
      log(placed, `${tag} scene sits right after the summary box`);
      await fig.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
      const img = fig.locator('.scn-stage picture img');
      const loaded = await img.evaluate(i => i.complete && i.naturalWidth > 0);
      log(loaded, `${tag} first frame loaded (${await img.evaluate(i => i.currentSrc.split('/').pop())})`);
      const kind = await fig.getAttribute('data-kind');
      const srcOf = () => img.evaluate(i => i.currentSrc);
      if (kind === 'slider') {
        const a = await srcOf(); await fig.locator('input.scn-range').fill('4'); await page.waitForTimeout(700);
        const b = await srcOf(); const out = await fig.locator('.scn-out').textContent();
        log(a !== b && /(water|spin)-0?[45]/.test(b), `${tag} slider to step 4 swaps the frame (${out})`);
        await fig.locator('input.scn-range').fill('8'); await page.waitForTimeout(500);
      } else if (kind === 'tabs') {
        const tabs = fig.locator('.scn-tab'); const n = await tabs.count();
        await tabs.nth(n - 2).click(); await page.waitForTimeout(700);
        const b = await srcOf(); const pressed = await tabs.nth(n - 2).getAttribute('aria-pressed');
        log(pressed === 'true' && !/(prep-on|ren-before)/.test(b), `${tag} tab ${n - 1} of ${n} swaps the frame`);
      } else if (kind === 'layers') {
        const btns = fig.locator('.scn-lbtn'); const n = await btns.count();
        for (let i = 0; i < n; i++) await btns.nth(i).click();
        await page.waitForTimeout(800);
        const on = await fig.locator('img.scn-layer.on').evaluateAll(ls => ls.filter(l => l.complete && l.naturalWidth > 0).length);
        log(on === n, `${tag} all ${n} layers shown and loaded (${on})`);
      } else if (kind === 'hotspots') {
        const pins = fig.locator('.scn-pin'); const n = await pins.count();
        await pins.nth(0).click();
        const hl = await fig.locator('.scn-notes li.on').count();
        const inside = await pins.evaluateAll(ps => ps.every(p => { const s = p.parentElement.getBoundingClientRect(), r = p.getBoundingClientRect(); return r.left >= s.left - 2 && r.right <= s.right + 2 && r.top >= s.top - 2 && r.bottom <= s.bottom + 2; }));
        log(n >= 5 && hl === 1 && inside, `${tag} ${n} pins inside the image, a pin highlights its note`);
      }
      await fig.screenshot({ path: path.join(OUT, `${key}-${url.startsWith('/en') ? 'en' : 'es'}-${vname}.png`) });
      await page.mouse.wheel(0, 2500); await page.waitForTimeout(400);
      const cls = await page.evaluate(() => window.__cls);
      log(cls < 0.02, `${tag} layout shift ${cls.toFixed(4)}`);
      log(errs.length === 0, `${tag} console errors: ${errs.length ? errs.join(' | ').slice(0, 200) : 'none'}`);
      await ctx.close();
    }
  }
  await browser.close();
  console.log(fails ? `SCENES: ${fails} failure(s)` : 'SCENES: all passed');
  process.exitCode = fails ? 1 : 0;
})();
