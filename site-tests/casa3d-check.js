// Live 3D check (2026-11-03): forces the viewer (?3d=1) on the flood and hurricane guides, both languages, laptop and
// phone. Flood: mounts, slider continuous 0 to 12 ft, readout follows, screenshots at tide / 4 ft / 12 ft.
// Hurricane: mounts, every tab drives the scene (readout = tab name, pressed state), screenshots of all six stages.
// Both: badge relabelled, no console errors. Usage: BASE=http://localhost:8787 OUT=out-casa3d CHANNEL=chrome node casa3d-check.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'https://www.protectedlegacyfl.com';
const OUT = process.env.OUT || 'out-casa3d'; fs.mkdirSync(OUT, { recursive: true });
const PAGES = [['/guias/inundacion/', 'es', 'flo'], ['/en/guides/flood/', 'en', 'flo'], ['/guias/residencias-huracanes/', 'es', 'res'], ['/en/guides/homes-hurricanes/', 'en', 'res'],
  ['/guias/condominios-y-hoa/', 'es', 'cnd'], ['/en/guides/condos-hoa/', 'en', 'cnd'],
  ['/guias/remodelaciones/', 'es', 'ren'], ['/en/guides/renovations-builders-risk/', 'en', 'ren'], ['/guias/umbrella-responsabilidad/', 'es', 'lia'], ['/en/guides/umbrella-liability/', 'en', 'lia']];
const TABS = { res: 6, ren: 3, mar: 3, str: 2 };
PAGES.push(['/guias/embarcaciones/', 'es', 'mar'], ['/en/guides/boats/', 'en', 'mar'], ['/guias/alquiler-vacacional/', 'es', 'str'], ['/en/guides/short-term-rentals/', 'en', 'str'],
  ['/guias/secuestro-y-extorsion/', 'es', 'kr'], ['/en/guides/kidnap-ransom/', 'en', 'kr'], ['/guias/aviacion-privada/', 'es', 'avi'], ['/en/guides/private-aviation/', 'en', 'avi'],
  ['/guias/autos/', 'es', 'aut'], ['/en/guides/auto/', 'en', 'aut']);
const VIEWS = { laptop: { width: 1366, height: 860 }, phone: { width: 390, height: 844 } };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
let fails = 0; const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + m); };
(async () => {
  const browser = await chromium.launch(Object.assign(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {}, { args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] }));
  for (const [vn, vp] of Object.entries(VIEWS)) for (const [url, l, key] of PAGES) {
    if (ONLY && !ONLY.includes(key)) continue;
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vn === 'phone' ? 2 : 1, hasTouch: vn === 'phone' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const tag = `[${vn}] ${url}`;
    await p.goto(BASE + url + '?3d=1', { waitUntil: 'load' });
    const fig = p.locator(`figure.scn[data-scene="${key}"]`);
    await fig.scrollIntoViewIfNeeded();
    await p.evaluate((k) => { const r = document.querySelector(`figure.scn[data-scene="${k}"]`).getBoundingClientRect(); scrollBy(0, r.top - 20); }, key);
    const ok = await p.waitForSelector('figure.scn-is-3d canvas.scn-3d.on', { timeout: 25000 }).then(() => true, () => false);
    log(ok, `${tag} live 3D mounted and faded in`);
    if (!ok) { log(false, `${tag} errors: ${errs.join(' | ').slice(0, 300)}`); await ctx.close(); continue; }
    const shot = async (n) => { const bb = await fig.locator('.scn-stage').boundingBox(); await p.screenshot({ path: path.join(OUT, `${key}-${l}-${vn}-${n}.png`), clip: bb, timeout: 60000 }); };
    if (key === 'flo') {
      const r = fig.locator('input.scn-range');
      log(await r.getAttribute('step') === '0.25' && await r.getAttribute('max') === '12', `${tag} slider continuous, 0 to 12 ft`);
      for (const [v, n] of [['0', 'tide'], ['4', '4ft'], ['12', '12ft']]) { await r.fill(v); await p.waitForTimeout(2500); await shot(n); }
      log(/12/.test(await fig.locator('.scn-out').textContent()), `${tag} readout follows the slider`);
    } else if (key === 'kr' || key === 'avi') {
      await p.waitForTimeout(2500); await shot('view');
      log(true, `${tag} single live view rendered`);
    } else if (key === 'aut') {
      const r = fig.locator('input.scn-range');
      log(await r.getAttribute('max') === '359' && await r.getAttribute('step') === '1', `${tag} slider turns 0 to 359 degrees`);
      for (const v of ['0', '120', '240']) { await r.fill(v); await p.waitForTimeout(1500); await shot('deg' + v); }
      log(/240/.test(await fig.locator('.scn-out').textContent()), `${tag} readout follows the angle`);
    } else if (key === 'cnd') {
      await p.waitForTimeout(1500); await shot('unit');
      const btns = fig.locator('.scn-lbtn'); const n = await btns.count();
      for (let i = 0; i < n; i++) await btns.nth(i).click();
      await p.waitForTimeout(1500); await shot('unit-layers');
      const on = await btns.evaluateAll(bs => bs.filter(b => b.getAttribute('aria-pressed') === 'true').length);
      const a = fs.readFileSync(path.join(OUT, `${key}-${l}-${vn}-unit.png`)), b2 = fs.readFileSync(path.join(OUT, `${key}-${l}-${vn}-unit-layers.png`));
      log(n === 3 && on === 3 && !a.equals(b2), `${tag} the 3 coverage toggles press and tint the 3D unit`);
    } else if (key === 'lia') {
      await p.waitForTimeout(2000);
      const pins = fig.locator('.scn-pin'); const n = await pins.count();
      const inside = await pins.evaluateAll(ps => ps.filter(x => x.style.visibility !== 'hidden').every(x => { const s = x.parentElement.getBoundingClientRect(), r = x.getBoundingClientRect(); return r.left >= s.left - 4 && r.right <= s.right + 4 && r.top >= s.top - 4 && r.bottom <= s.bottom + 4; }));
      const vis = await pins.evaluateAll(ps => ps.filter(x => x.style.visibility !== 'hidden').length);
      await shot('aerial');
      const before = await pins.first().evaluate(x => x.style.left);
      if (vn === 'laptop') { const bb = await fig.locator('.scn-stage').boundingBox(); await p.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.6); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * 0.75, bb.y + bb.height * 0.6, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(1500); await shot('aerial-turned'); }
      const after = await pins.first().evaluate(x => x.style.left);
      await pins.nth(0).click({ force: true }); const hl = await fig.locator('.scn-notes li.on').count();
      log(n >= 5 && vis >= 5 && inside && hl === 1 && (vn !== 'laptop' || before !== after), `${tag} ${vis}/${n} pins on their objects, inside the frame, follow a drag (${before} -> ${after}), a pin highlights its note`);
    } else {
      const tabs = fig.locator('.scn-tab'); const n = await tabs.count();
      let good = 0;
      for (let i = 0; i < n; i++) {
        const name = (await tabs.nth(i).textContent()).trim();
        await tabs.nth(i).click(); await p.waitForTimeout(3500);
        const pressed = await tabs.nth(i).getAttribute('aria-pressed'), outTxt = (await fig.locator('.scn-out').textContent()).trim();
        if (pressed === 'true' && outTxt === name) good++;
        await shot(String(i + 1) + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      }
      log(good === n && n === TABS[key], `${tag} all ${n} tabs drive the scene (${good} ok)`);
    }
    log(/3D/.test(await fig.locator('.scn-badge').textContent()), `${tag} badge relabelled`);
    log(errs.length === 0, `${tag} console errors: ${errs.length ? errs.join(' | ').slice(0, 300) : 'none'}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `CASA3D: ${fails} failure(s)` : 'CASA3D: all passed'); process.exitCode = fails ? 1 : 0;
})();
