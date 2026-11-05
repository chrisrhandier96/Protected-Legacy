/* Homepage "Los 14 dominios" map (work order Nov 4, 2026): on laptops, a small Casa Patrimonio (the same casa.glb as
   the hero and the guides, so usually already cached) sits in a sticky panel beside the domain cards. Hovering or
   focusing a card lights the matching part of the estate in gold: the roof for homes, the seawall for flood, the
   dock for boats, the gate for kidnap and ransom, the pool for liability, and so on. The panel's Unreal still stays
   underneath as the first paint and the fallback. Phones never load this (the panel is hidden below 1200 px or
   without a fine pointer). Entry: start({panel, grid, dl}). Nothing drawn here is text. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, HemisphereLight, DirectionalLight, Box3, Vector3, SRGBColorSpace, ACESFilmicToneMapping
} from 'three';
import { loadGlb } from './glb.js';

const MODEL = '/img/scenes/3d/casa.glb';
const GOLD = new Color('#FFC247');
// domain key -> the estate's parts that stand for it
const PARTS = {
  res: ['roof'], flo: ['seawall', 'lawn'], aut: ['car', 'garagedoor', 'driveway'], mar: ['dock', 'boat', 'engine', 'lift', 'pwc'],
  avi: ['pool'], col: ['glass'], lia: ['pool', 'trampoline'], emp: ['porch', 'kitchen'], cyb: ['door', 'gate'],
  kr: ['gate', 'fence'], str: ['kitchen', 'trampoline', 'pool'], ren: ['house'], brd: ['skyline'], cnd: ['skyline']
};

export function start(o) {
  const panel = o.panel, grid = o.grid, dl = o.dl || function () {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer, scene, cam, lost = false, built = false, running = false, visible = false, last = 0, active = null;
  const byGroup = {}, glow = {}, center = new Vector3();
  let dist = 90, ang = -0.6, lastAct = performance.now();
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { dl({ event: 'domains3d_ready', mode: 'fallback', reason: 'no-webgl' }); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const cv = renderer.domElement; cv.className = 'dom-map-3d'; cv.setAttribute('aria-hidden', 'true');
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop('context-lost'); });
  scene = new Scene();
  cam = new PerspectiveCamera(30, 1, 1, 900);
  scene.add(new HemisphereLight(new Color('#f6e2c0'), new Color('#16302a'), 1.6));
  const sun = new DirectionalLight(new Color('#ffd7a0'), 2.0); sun.position.set(-40, 50, 30); scene.add(sun);

  function stop(reason) {
    if (lost) return; lost = true; running = false; panel.classList.remove('on');
    try { renderer.dispose(); } catch (e) { /* gone */ }
    cv.remove();
    dl({ event: 'domains3d_ready', mode: 'fallback', reason: reason });
  }
  function size() {
    const r = panel.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); wake();
  }
  function wake() { if (!running && visible && !document.hidden && built && !lost) { running = true; requestAnimationFrame(tick); } }
  function tick(now) {
    if (!running || lost) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    if (now - last < 33) { requestAnimationFrame(tick); return; }
    last = now;
    const spin = !reduced && now - lastAct < 8000;   // it turns while the visitor is reading the cards, then rests
    let moving = spin;
    Object.keys(byGroup).forEach(function (g) {
      const want = active && active.indexOf(g) >= 0 ? 1 : 0, k = glow[g] || 0, nk = k + (want - k) * Math.min(1, dt * 7);
      glow[g] = Math.abs(want - nk) < 0.01 ? want : nk;
      if (glow[g] !== want) moving = true;
      byGroup[g].forEach(function (n) {
        n.material.color.copy(n.material.userData.base).lerp(GOLD, 0.85 * glow[g]);
        n.material.emissive.copy(GOLD).multiplyScalar(0.8 * glow[g]);
      });
    });
    if (spin) ang += dt * 0.08;
    const a = ang, el = 0.62;
    cam.position.set(center.x + Math.sin(a) * Math.cos(el) * dist, center.y + Math.sin(el) * dist, center.z + Math.cos(a) * Math.cos(el) * dist);
    cam.lookAt(center);
    renderer.render(scene, cam);
    if (moving) requestAnimationFrame(tick); else running = false;
  }
  function pick(k) { active = k ? PARTS[k] || null : null; lastAct = performance.now(); wake(); }
  if (o.debug) window.__domains3d = { get active() { return active; }, glow: glow, get running() { return running; }, get visible() { return visible; }, byGroup: byGroup };   // tests only

  loadGlb(MODEL).then(function (gltf) {
    if (lost) return;
    try {
      const root = gltf.scene, box = new Box3();
      root.traverse(function (n) {
        if (!n.isMesh) return;
        const g = (n.userData && n.userData.group) || (n.parent && n.parent.userData && n.parent.userData.group) || '';
        if (g === 'surround' || g === 'street') { n.visible = false; return; }
        if (g === 'lawn') { n.material = n.material.clone(); n.material.color.multiplyScalar(0.45); }   // a quieter ground, so the lit parts read
        n.material = n.material.clone(); n.material.userData.base = n.material.color.clone();
        (byGroup[g] = byGroup[g] || []).push(n);
        n.updateWorldMatrix(true, false);
        if (g !== 'skyline' && g !== 'lawn' && g !== 'palms' && g !== 'seawall') box.expandByObject(n);
      });
      scene.add(root);
      box.getCenter(center); dist = box.getSize(new Vector3()).length() / 2 / Math.sin(cam.fov * Math.PI / 360) * 0.74;   // the estate fills the square panel (the lawn edges may crop)
      panel.appendChild(cv); size();
      const go = function () {
        if (lost) return;
        built = true; last = 0; visible = true; lastAct = performance.now(); running = true; tick(performance.now());
        requestAnimationFrame(function () { panel.classList.add('on'); dl({ event: 'domains3d_ready', mode: 'webgl', reason: null }); });
      };
      const c = renderer.compileAsync ? renderer.compileAsync(scene, cam) : Promise.resolve();
      c.then(function () { requestAnimationFrame(go); }, function () { requestAnimationFrame(go); });
    } catch (e) { stop('build-error'); }
  }, function () { stop('load-error'); });

  // the cards: hover or keyboard focus lights their part; leaving the grid clears it
  grid.addEventListener('pointerover', function (e) { const d = e.target.closest && e.target.closest('.dom[data-k]'); if (d) pick(d.getAttribute('data-k')); });
  grid.addEventListener('pointerleave', function () { pick(null); });
  grid.addEventListener('focusin', function (e) { const d = e.target.closest && e.target.closest('.dom[data-k]'); if (d) pick(d.getAttribute('data-k')); });
  grid.addEventListener('focusout', function (e) { if (!grid.contains(e.relatedTarget)) pick(null); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); else running = false; }).observe(panel);
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else wake(); });
  addEventListener('resize', function () { if (built && !lost) size(); }, { passive: true });
  addEventListener('pagehide', function () { running = false; try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) { /* gone */ } }, { once: true });
}
