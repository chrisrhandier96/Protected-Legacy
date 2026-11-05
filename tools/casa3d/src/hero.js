/* Homepage hero, v2 (work order Nov 4, 2026): the Casa Patrimonio estate from the Unreal session (the same casa.glb the
   guides use) at dusk, turning slowly in the band at the foot of the hero where the gold skyline drawing sits.
   Entry: start({hero, mount, dl, lite, force}) called by the inline loader in index.html / en.html (same contract as
   hero3d.v1: the SVG skyline stays as first paint and fallback, .hero-3d-on swaps them, window.ppHero3d reports state,
   dataLayer gets hero3d_ready and hero3d_interact). The three.js core is a shared chunk with the guides' casa3d
   bundle, so a visitor who opens a guide after the homepage does not download it again.
   Rules: one loop, at most 30 frames a second, only while the hero is on screen and the page is visible; phones get a
   lower resolution; WebGL is released on pagehide; any failure keeps the SVG. Nothing drawn here is text. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, Mesh, PlaneGeometry,
  MeshStandardMaterial, Box3, Vector3, SRGBColorSpace, ACESFilmicToneMapping, EdgesGeometry, LineSegments, LineBasicMaterial
} from 'three';
import { loadGlb } from './glb.js';

const MODEL = '/img/scenes/3d/casa.glb';
const C = (h) => new Color(h);
const CORE = ['house', 'roof', 'pool', 'dock', 'gate', 'car', 'kitchen', 'boat', 'porch', 'garagedoor', 'driveway', 'lawn', 'seawall'];
const NO_EDGES = ['palms', 'trampoline', 'skyline', 'surround', 'lawn', 'street', 'driveway', 'glass'];

export function start(o) {
  const hero = o.hero, mount = o.mount, dl = o.dl || function () {}, lite = !!o.lite;
  const sky = hero.querySelector('svg.skyline');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  const state = window.ppHero3d = { mode: 'webgl', reason: null, dpr: dpr, lite: lite, frames: 0, ready: false, loop: false, model: 'casa' };
  let renderer, scene, cam, lost = false, built = false, running = false, visible = true, interacted = false, last = 0;
  const center = new Vector3(), t0 = performance.now();
  let radius = 40, dist = 100, az0 = -0.9;

  function bandH() { return sky ? sky.getBoundingClientRect().height : Math.max(120, mount.clientWidth * 260 / 1440); }
  function size() {
    const bh = bandH(), cw = Math.max(1, hero.clientWidth), ch = Math.round(bh * 1.3);
    mount.style.height = ch + 'px';
    renderer.setSize(cw, ch, false);
    cam.aspect = cw / ch; cam.updateProjectionMatrix();
    // a miniature in the middle of the band: the estate's sphere fits the tighter of the two angles, a little cropped
    const vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    dist = radius / Math.sin(Math.min(vf, hf) / 2) * 0.6;
    cam.far = dist * 4; cam.updateProjectionMatrix();
    scene.fog.near = dist * 0.92; scene.fog.far = dist * 1.55;   // the far lawn and water melt into the page's green
    wake();
  }
  function place(now) {
    const a = az0 + (reduced ? 0 : (now - t0) / 1000 * (lite ? 0.03 : 0.045)), el = 0.38;
    cam.position.set(center.x + Math.sin(a) * Math.cos(el) * dist, center.y + Math.sin(el) * dist, center.z + Math.cos(a) * Math.cos(el) * dist);
    cam.lookAt(center);
  }
  function wake() { if (!running && visible && !document.hidden && built && !lost) { running = true; state.loop = true; requestAnimationFrame(tick); } }
  function tick(now) {
    if (!running || lost) return;
    if (now - last >= 33) { last = now; place(now); renderer.render(scene, cam); state.frames++; }
    if (reduced) { running = false; state.loop = false; return; }   // one still frame
    requestAnimationFrame(tick);
  }
  function fallback(reason) {
    if (lost) return;
    lost = true; running = false; state.mode = 'fallback'; state.reason = reason; state.loop = false;
    hero.classList.remove('hero-3d-on');
    try { renderer && renderer.dispose(); } catch (e) { /* gone */ }
    if (renderer && renderer.domElement.parentNode) renderer.domElement.remove();
    dl({ event: 'hero3d_ready', mode: 'fallback', reason: reason });
  }

  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: !lite, powerPreference: 'low-power', premultipliedAlpha: true, failIfMajorPerformanceCaveat: !o.force });
  } catch (e) { fallback('no-webgl'); return state; }
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  renderer.domElement.addEventListener('webglcontextlost', function (e) { e.preventDefault(); fallback('context-lost'); });
  scene = new Scene();
  scene.fog = new Fog(C('#12332A'), 80, 300);   // the hero's green: the far edges melt into the page
  cam = new PerspectiveCamera(24, 3, 1, 900);
  // dusk: a warm low sun from the bay side, a violet-gold sky fill, the green of the page from below
  scene.add(new HemisphereLight(C('#c9a7c9'), C('#10251f'), 0.75));
  const sun = new DirectionalLight(C('#ff9d55'), 2.1); sun.position.set(-70, 9, 25); scene.add(sun);   // the last of the sun, low over the bay
  mount.appendChild(renderer.domElement);

  loadGlb(MODEL).then(function (gltf) {
    if (lost) return;
    try {
      const root = gltf.scene, ex = gltf.extras;
      const box = new Box3(), gold = new LineBasicMaterial({ color: C('#D9BC72'), transparent: true, opacity: 0.32, fog: true });
      const edges = [];
      root.traverse(function (n) {
        if (!n.isMesh) return;
        const g = (n.userData && n.userData.group) || (n.parent && n.parent.userData && n.parent.userData.group) || '';
        if (g === 'skyline' || g === 'surround' || g === 'street') { n.visible = false; return; }   // the hero has its own city: the video
        n.updateWorldMatrix(true, false);
        if (CORE.indexOf(g) >= 0 && g !== 'lawn' && g !== 'seawall') box.expandByObject(n);
        if (g === 'glass') { n.material = n.material.clone(); n.material.emissive.set(C('#ffc477')); n.material.emissiveIntensity = 1.4; }   // the windows lit at dusk
        if (g === 'lawn') { n.material = n.material.clone(); n.material.color.multiplyScalar(0.55); }
        if (!lite && NO_EDGES.indexOf(g) < 0) edges.push(n);   // a fine gold line on the architecture, like the skyline drawing
      });
      edges.forEach(function (n) { const l = new LineSegments(new EdgesGeometry(n.geometry, 35), gold); n.add(l); });
      scene.add(root);
      const water = new Mesh(new PlaneGeometry(1200, 1200), new MeshStandardMaterial({ color: C('#0c2e2c'), roughness: 0.7, metalness: 0 }));
      water.rotation.x = -Math.PI / 2; water.position.y = ex.tide_m != null ? ex.tide_m : -0.6; scene.add(water);
      if (!box.isEmpty()) { box.getCenter(center); radius = box.getSize(new Vector3()).length() / 2; }
      center.y = Math.max(0, center.y - radius * 0.05);
      size(); place(performance.now());
      const go = function () {
        if (lost) return;
        built = true; renderer.render(scene, cam); state.frames = 1;
        requestAnimationFrame(function () {
          hero.classList.add('hero-3d-on'); state.ready = true;
          dl({ event: 'hero3d_ready', mode: 'webgl', reason: null });
          wake();
        });
      };
      const c = renderer.compileAsync ? renderer.compileAsync(scene, cam) : Promise.resolve();
      c.then(function () { requestAnimationFrame(go); }, function () { requestAnimationFrame(go); });
    } catch (e) { fallback('build-error'); }
  }, function () { fallback('load-error'); });

  let sT = false;
  addEventListener('scroll', function () { if (sT) return; sT = true; requestAnimationFrame(function () { sT = false; if (scrollY > 8 && !interacted && built) { interacted = true; dl({ event: 'hero3d_interact' }); } }); }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); else running = false; }, { rootMargin: '80px 0px' }).observe(mount);
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else wake(); });
  if ('ResizeObserver' in window && sky) new ResizeObserver(function () { if (built && !lost) size(); }).observe(sky); else addEventListener('resize', function () { if (built && !lost) size(); });
  addEventListener('pagehide', function () { if (!renderer) return; running = false; try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) { /* gone */ } }, { once: true });
  return state;
}
