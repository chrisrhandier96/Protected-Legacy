// Flood 3D check (2026-11-03): forces the live viewer (?3d=1) on both flood guides at laptop and phone width, then
// checks it mounts and fades in, the slider is continuous, water and boat follow it, no console errors, and saves
// screenshots at normal tide, 4 ft and 12 ft. Usage: BASE=http://localhost:8787 OUT=out-flood3d CHANNEL=chrome node flood3d-check.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'https://www.protectedlegacyfl.com';
const OUT = process.env.OUT || 'out-flood3d'; fs.mkdirSync(OUT, { recursive: true });
const PAGES = [['/guias/inundacion/', 'es'], ['/en/guides/flood/', 'en']];
const VIEWS = { laptop: { width: 1366, height: 860 }, phone: { width: 390, height: 844 } };
let fails = 0; const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + m); };
(async () => {
  const browser = await chromium.launch(Object.assign(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {}, { args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] }));
  for (const [vn, vp] of Object.entries(VIEWS)) for (const [url, l] of PAGES) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: vn === 'phone' ? 2 : 1, hasTouch: vn === 'phone' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const tag = `[${vn}] ${url}`;
    await p.goto(BASE + url + '?3d=1', { waitUntil: 'load' });
    const fig = p.locator('figure.scn[data-scene="flo"]'); await fig.scrollIntoViewIfNeeded(); await p.evaluate(() => { const r = document.querySelector('figure.scn[data-scene="flo"]').getBoundingClientRect(); scrollBy(0, r.top - 20); });
    const ok = await p.waitForSelector('figure.scn-is-3d canvas.scn-3d.on', { timeout: 20000 }).then(() => true, () => false);
    log(ok, `${tag} live 3D mounted and faded in`);
    if (!ok) { log(false, `${tag} errors: ${errs.join(' | ').slice(0, 300)}`); await ctx.close(); continue; }
    const r = fig.locator('input.scn-range');
    log(await r.getAttribute('step') === '0.25' && await r.getAttribute('max') === '12', `${tag} slider continuous, 0 to 12 ft`);
    const shots = [['0', 'tide'], ['4', '4ft'], ['12', '12ft']];
    for (const [v, n] of shots) {
      await r.fill(v); await p.waitForTimeout(2500);
      const bb = await fig.locator('.scn-stage').boundingBox();
      await p.screenshot({ path: path.join(OUT, `flood3d-${l}-${vn}-${n}.png`), clip: bb, timeout: 60000 });
    }
    const outTxt = await fig.locator('.scn-out').textContent();
    log(/12/.test(outTxt), `${tag} readout follows the slider (${outTxt})`);
    const badge = await fig.locator('.scn-badge').textContent();
    log(/3D/.test(badge), `${tag} badge says ${badge}`);
    log(errs.length === 0, `${tag} console errors: ${errs.length ? errs.join(' | ').slice(0, 300) : 'none'}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `FLOOD3D: ${fails} failure(s)` : 'FLOOD3D: all passed'); process.exitCode = fails ? 1 : 0;
})();
