/* Miami en línea de oro: the hero's SVG skyline rebuilt as a 3D gold line drawing (three.js, fat lines).
   Entry: start({hero, mount, dl, lite, force}) called by the inline loader in index.html / en.html.
   Rules it follows: build over several frames, render on demand, pause off screen, release WebGL on pagehide,
   fall back to the SVG if the context is lost. Nothing here is text, so nothing here is a claim. */
import { Scene, PerspectiveCamera, WebGLRenderer, Color, Vector3, Group, Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

/* ---- palette (the site's tokens) ---- */
const GOLD = new Color('#D9BC72'), GOLD2 = new Color('#C29B40'), GOLD_PALE = new Color('#EBD9A8'), BG = new Color('#12332A');
/* ---- depth planes (world units = SVG units; x is centered, y is up, ground is y = 0 at the tower bases) ---- */
const Z_FRONT = 30, Z_MID = -20, Z_BACK = -60, Z_SUN = -200;
const SVG_W = 1440, SVG_H = 260, SVG_GROUND = 190;

/* The same drawing as svg.skyline: [x, top, right, kind] per tower, with the SVG's rooftop boxes and antenna. */
const TOWERS = [
  { x: 60, r: 94, top: 120, antenna: [78, 102] }, { x: 110, r: 154, top: 96, roof: [120, 144, 82] }, { x: 180, r: 210, top: 140 },
  { x: 230, r: 280, top: 70, roof: [244, 266, 52] }, { x: 300, r: 336, top: 110 }, { x: 356, r: 402, top: 88, roof: [370, 388, 66] },
  { x: 430, r: 462, top: 128 }, { x: 480, r: 536, top: 60, roof: [496, 520, 40] }, { x: 560, r: 600, top: 100 },
  { x: 620, r: 648, top: 136 }, { x: 666, r: 714, top: 78, roof: [680, 700, 58] }
];
const PALM_TRUNK = [[812, 190], [816, 160], [814, 132], [806, 106]];
const PALM_FRONDS = [
  [[806, 106], [790, 96], [772, 94], [754, 98], -8], [[806, 106], [802, 88], [792, 74], [776, 64], 6], [[806, 106], [814, 90], [828, 80], [846, 76], -6],
  [[806, 106], [822, 100], [840, 102], [856, 112], 8], [[806, 106], [808, 92], [816, 80], [830, 72], 0]
];
const YACHT = { hull: [[980, 206], [998, 188], [1118, 188], [1134, 206]], mast: [[1036, 188], [1036, 150]], sail: [[1036, 150], [1088, 188]], jib: [[1036, 150], [1022, 188]], water: [[900, 206], [1160, 206]] };
const SUN = { cx: 1290, cy: 90, r: 34 };
const WAVES = [[1240, 206, 42, 8, 3]];                       /* x0, y, bump width, height, bumps */
const WATER = [[40, 226, 90, 10, 3], [700, 232, 78, 8, 2]];  /* the lines that drift */

/* ---- small geometry helpers ---- */
const W = (x, y) => [x - SVG_W / 2, SVG_GROUND - y];      /* SVG -> world x, y */
function bezier(p, n) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]]); } return o; }

class Lines {
  /* one LineSegments2 per object, so every object draws itself in from its own first stroke */
  constructor(z, depthFade, cam) { this.p = []; this.c = []; this.z = z; this.k = (cam.D - z) / cam.D; this.fade = depthFade; }
  seg(a, b, col, za, zb) {
    const k = this.k, f = this.fade, c = col.clone().lerp(BG, f);
    this.p.push(a[0] * k, a[1] * k, za == null ? this.z : za, b[0] * k, b[1] * k, zb == null ? this.z : zb);
    this.c.push(c.r, c.g, c.b, c.r, c.g, c.b);
  }
  poly(pts, col, closed, zs) { for (let i = 0; i < pts.length - 1; i++) this.seg(pts[i], pts[i + 1], col, zs && zs[i], zs && zs[i + 1]); if (closed) this.seg(pts[pts.length - 1], pts[0], col); }
  build(mat) {
    const g = new LineSegmentsGeometry(); g.setPositions(this.p); g.setColors(this.c);
    const m = new LineSegments2(g, mat); m.computeLineDistances(); m.frustumCulled = false; return m;
  }
}
function fadeFor(z) { return Math.min(0.55, Math.max(0, -z / 320)); }

function tower(t, cam, lite) {
  const z = t.top <= 100 ? Z_BACK : Z_MID, L = new Lines(z, fadeFor(z), cam);
  const w = t.r - t.x, d = Math.round(w * 0.62), zf = z + d / 2, zb = z - d / 2;
  const [x0, y0] = W(t.x, SVG_GROUND), [x1, y1] = W(t.r, t.top);
  const box = (ax, ay, bx, by, zF, zB, col) => {
    const A = [ax, ay], B = [bx, ay], C = [bx, by], Dp = [ax, by];
    L.poly([A, B, C, Dp], col, true, [zF, zF, zF, zF, zF]);          /* front face */
    L.poly([A, B, C, Dp], col, true, [zB, zB, zB, zB, zB]);          /* back face */
    [A, B, C, Dp].forEach(p => L.seg(p, p, col, zF, zB));             /* the four depth edges */
  };
  box(x0, y0, x1, y1, zf, zb, GOLD);
  if (!lite) { /* a few floor lines on the front and the right side */
    for (let y = y0 + 22; y < y1 - 12; y += 22) { L.seg([x0, y], [x1, y], GOLD2, zf, zf); L.seg([x1, y], [x1, y], GOLD2, zf, zb); }
  }
  if (t.roof) { const [rx0, ry] = W(t.roof[0], t.roof[2]), rx1 = W(t.roof[1], 0)[0], rd = Math.round((rx1 - rx0) * 0.62); box(rx0, y1, rx1, ry, z + rd / 2, z - rd / 2, GOLD); }
  if (t.antenna) { const [ax, ay] = W(t.antenna[0], t.antenna[1]); L.seg([ax, y1], [ax, ay], GOLD2, z, z); }
  return L;
}
function palm(cam) {
  const L = new Lines(-10, fadeFor(-10), cam);
  L.poly(bezier(PALM_TRUNK, 8).map(p => W(p[0], p[1])), GOLD);
  for (const f of PALM_FRONDS) { const pts = bezier(f.slice(0, 4), 6).map(p => W(p[0], p[1])); const zs = pts.map((_, i) => -10 + f[4] * (i / 6)); L.poly(pts, GOLD, false, zs); }
  return L;
}
function yacht(cam) {
  const L = new Lines(Z_FRONT, 0, cam), zf = Z_FRONT + 7, zb = Z_FRONT - 7;
  const hull = YACHT.hull.map(p => W(p[0], p[1]));
  L.poly(hull, GOLD, true, hull.map(() => zf)); L.poly(hull, GOLD, true, hull.map(() => zb));
  hull.forEach(p => L.seg(p, p, GOLD, zf, zb));
  for (const k of ['mast', 'sail', 'jib']) L.poly(YACHT[k].map(p => W(p[0], p[1])), GOLD);
  L.poly(YACHT.water.map(p => W(p[0], p[1])), GOLD2);
  return L;
}
function waveLine(x0, y, bw, h, n, cam, z) {
  const L = new Lines(z, fadeFor(z), cam), pts = [];
  for (let i = 0; i <= n * 8; i++) { const t = i / 8; pts.push(W(x0 + t * bw, y - Math.sin(t * Math.PI) * h * (t % 2 < 1 ? 1 : -1) * 0.5)); }
  L.poly(pts, GOLD2); return L;
}
function sun(cam, lite) {
  const L = new Lines(Z_SUN, 0.25, cam), n = lite ? 36 : 56, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push(W(SUN.cx + Math.cos(a) * SUN.r, SUN.cy + Math.sin(a) * SUN.r)); }
  L.poly(pts, GOLD_PALE, true); return L;
}
function dome(cx, baseY, cz, r, cam) {
  /* faint wireframe dome: three latitude rings and six meridians, scaled from its base */
  const L = new Lines(cz, 0, cam), k = (cam.D - cz) / cam.D, rings = [20, 45, 70], mer = 6, segs = 24;
  for (const lat of rings) { const a = lat * Math.PI / 180, rr = Math.cos(a) * r, yy = Math.sin(a) * r, pts = []; for (let i = 0; i <= segs; i++) { const b = i / segs * Math.PI * 2; pts.push([Math.cos(b) * rr, yy, Math.sin(b) * rr]); } for (let i = 0; i < segs; i++) L.p.push(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]); }
  for (let m = 0; m < mer; m++) { const b = m / mer * Math.PI, pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; pts.push([Math.cos(a) * Math.cos(b) * r, Math.sin(a) * r, Math.cos(a) * Math.sin(b) * r]); } for (let i = 0; i < 12; i++) L.p.push(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]); }
  const n = L.p.length / 3; for (let i = 0; i < n; i++) L.c.push(GOLD2.r, GOLD2.g, GOLD2.b);
  const g = new LineSegmentsGeometry(); g.setPositions(L.p); g.setColors(L.c);
  const mesh = new LineSegments2(g, cam.domeMat); mesh.position.set(cx * k, baseY * k, cz); mesh.scale.setScalar(0.001); mesh.frustumCulled = false; return mesh;
}

/* ---- camera framing: the z = 0 plane shows the same slice of the drawing the SVG shows (xMidYMax slice) ---- */
function frame(cam, cw, ch, bandH) {
  const s = Math.max(cw / SVG_W, bandH / SVG_H), visW = cw / s, groundPx = (SVG_H - SVG_GROUND) * s;
  const tanV = Math.tan(cam.fov / 2 * Math.PI / 180), aspect = cw / ch;
  cam.D = (visW / 2) / (tanV * aspect);
  const ndcGround = -1 + 2 * groundPx / ch;
  cam.Yc = -ndcGround * cam.D * tanV;
  cam.aspect = aspect; cam.updateProjectionMatrix();
}

export function start(o) {
  const hero = o.hero, mount = o.mount, dl = o.dl || function () {}, lite = !!o.lite;
  const sky = hero.querySelector('svg.skyline');
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  let renderer, scene, cam, mat, domeMat, water, domes = [], total = 0, built = false, lost = false;
  let running = false, activeUntil = 0, drawT0 = 0, drawn = false, t0 = performance.now(), waterPhase = 0, lastT = 0;
  let yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, dolly = 0, tDolly = 0, domeK = 0, tDome = 0, visible = true, interacted = false;
  const state = window.ppHero3d = { mode: 'webgl', reason: null, dpr: dpr, lite: lite, frames: 0, ready: false, loop: false };

  function bandH() { return sky ? sky.getBoundingClientRect().height : Math.max(120, mount.clientWidth * SVG_H / SVG_W); }
  function size() {
    const bh = bandH(), cw = Math.max(1, hero.clientWidth), ch = Math.round(bh * 1.3);
    mount.style.height = ch + 'px';
    renderer.setSize(cw, ch, false);
    mat.resolution.set(cw * dpr, ch * dpr); domeMat.resolution.set(cw * dpr, ch * dpr);
    frame(cam, cw, ch, bh);
    wake(600);
  }
  function wake(ms) { activeUntil = Math.max(activeUntil, performance.now() + (ms || 900)); if (!running && visible && !document.hidden && built && !lost) { running = true; state.loop = true; requestAnimationFrame(tick); } }
  function placeCamera() {
    const R = cam.D * (1 + 0.12 * dolly), cy = Math.cos(pitch), T = new Vector3(0, cam.Yc, 0);
    cam.position.set(T.x + Math.sin(yaw) * cy * R, T.y + Math.sin(pitch) * R, T.z + Math.cos(yaw) * cy * R);
    cam.lookAt(T);
  }
  function tick(now) {
    if (!running) return;
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60; lastT = now;
    let moving = false;
    /* draw-in: about 1.6 s, each object from its first stroke */
    if (!drawn) { const p = Math.min(1, (now - drawT0) / 1600); const e = 1 - Math.pow(1 - p, 2); mat.dashOffset = total - e * total; moving = true; if (p >= 1) { drawn = true; mat.dashOffset = 0; activeUntil = Math.max(activeUntil, now + (lite ? 6000 : 1200)); } }
    /* phones: one slow sway after the draw-in; desktop: pointer drift */
    if (lite && drawn && now < activeUntil) tYaw = Math.sin((now - drawT0) / 4000) * 0.035;
    /* ease toward the targets; snap when close so the loop can stop */
    const k = Math.min(1, dt * 4.5), kd = Math.min(1, dt * 6);
    yaw += (tYaw - yaw) * k; pitch += (tPitch - pitch) * k; dolly += (tDolly - dolly) * kd; domeK += (tDome - domeK) * kd;
    if (Math.abs(tYaw - yaw) > 0.0006 || Math.abs(tPitch - pitch) > 0.0006 || Math.abs(tDolly - dolly) > 0.003 || Math.abs(tDome - domeK) > 0.006) moving = true;
    else { yaw = tYaw; pitch = tPitch; dolly = tDolly; domeK = tDome; }
    placeCamera();
    if (domes.length) { const s = Math.max(0.001, domeK); domes.forEach(d => d.scale.set(s, s, s)); domeMat.opacity = 0.42 * domeK; }
    if (water) { waterPhase += dt; water.position.x = Math.sin(waterPhase * Math.PI * 2 / 6) * 14; }
    renderer.render(scene, cam); state.frames++;
    if (moving || now < activeUntil) requestAnimationFrame(tick); else { running = false; state.loop = false; lastT = 0; }
  }
  function fallback(reason) {
    lost = true; running = false; state.mode = 'fallback'; state.reason = reason; state.loop = false;
    hero.classList.remove('hero-3d-on');
    try { renderer && renderer.dispose(); } catch (e) {}
    dl({ event: 'hero3d_ready', mode: 'fallback', reason: reason });
  }
  function interact() { if (interacted || lost || !built) return; interacted = true; dl({ event: 'hero3d_interact' }); }

  /* ---- build over several frames ---- */
  const steps = [
    function () {
      /* no software rendering unless forced for testing: a GPU-less browser keeps the SVG */
      renderer = new WebGLRenderer({ alpha: true, antialias: !lite, powerPreference: 'low-power', premultipliedAlpha: true, failIfMajorPerformanceCaveat: !o.force });
      renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
      renderer.domElement.addEventListener('webglcontextlost', function (e) { e.preventDefault(); fallback('context-lost'); });
      scene = new Scene(); cam = new PerspectiveCamera(28, 2, 10, 2600); cam.fov = 28;
      mat = new LineMaterial({ vertexColors: true, linewidth: lite ? 1.25 : 1.4, transparent: true, opacity: 0.78, dashed: true, dashSize: 1, gapSize: 1, depthWrite: false });
      /* same shader variant as the skyline (dashed, vertex colors) so the whole scene is one program compile; gap 0 means always visible */
      domeMat = cam.domeMat = new LineMaterial({ vertexColors: true, linewidth: 1, transparent: true, opacity: 0, depthWrite: false, dashed: true, dashSize: 1, gapSize: 0 });
      mount.appendChild(renderer.domElement);
      frame(cam, hero.clientWidth, Math.round(bandH() * 1.3), bandH());
    },
    function () { TOWERS.slice(0, 6).forEach(t => scene.add(tower(t, cam, lite).build(mat))); },
    function () { TOWERS.slice(6).forEach(t => scene.add(tower(t, cam, lite).build(mat))); scene.add(palm(cam).build(mat)); },
    function () {
      scene.add(yacht(cam).build(mat)); scene.add(sun(cam, lite).build(mat));
      WAVES.forEach(w => scene.add(waveLine(w[0], w[1], w[2], w[3], w[4], cam, Z_FRONT).build(mat)));
      water = new Group(); WATER.forEach(w => water.add(waveLine(w[0], w[1], w[2], w[3], w[4], cam, Z_FRONT).build(mat))); scene.add(water);
      const k = (cam.D - Z_FRONT) / cam.D, band = new Mesh(new PlaneGeometry(SVG_W * k, 70 * k), new MeshBasicMaterial({ color: GOLD2, transparent: true, opacity: 0.06, depthWrite: false }));
      band.position.set(0, -35 * k, Z_FRONT - 1); scene.add(band);
      if (fine) { domes = [dome(W(135, SVG_GROUND)[0], 0, -40, 95, cam), dome(W(316, SVG_GROUND)[0], 0, -40, 105, cam), dome(W(572, SVG_GROUND)[0], 0, -40, 165, cam), dome(W(1057, SVG_GROUND)[0], -14, Z_FRONT, 92, cam)]; domes.forEach(d => scene.add(d)); }
      /* the longest line distance in the scene drives the shared dash pattern (every object starts at the same moment) */
      scene.traverse(obj => { if (obj.isLineSegments2 && obj.material === mat) { const a = obj.geometry.attributes.instanceDistanceEnd; let mx = 0; for (let i = 0; i < a.count; i++) mx = Math.max(mx, a.getX(i)); total = Math.max(total, mx); } });
      mat.dashSize = total; mat.gapSize = total; mat.dashOffset = total;
    },
    function () {
      size(); placeCamera();
      /* shaders compile in parallel (KHR_parallel_shader_compile) so the first frame is not one long task */
      const first = function () {
        if (lost) return;
        built = true; drawT0 = performance.now(); placeCamera();
        const t = performance.now(); renderer.render(scene, cam); state.frames = 1; state.firstRenderMs = Math.round(performance.now() - t);
        requestAnimationFrame(function () {
          hero.classList.add('hero-3d-on'); state.ready = true;
          dl({ event: 'hero3d_ready', mode: 'webgl', reason: null });
          wake(2400);
        });
      };
      const c = renderer.compileAsync ? renderer.compileAsync(scene, cam) : Promise.resolve();
      c.then(function () { requestAnimationFrame(first); }, function () { requestAnimationFrame(first); });
    }
  ];
  let si = 0; state.ms = [];
  function next() { if (lost) return; const t = performance.now(); try { steps[si++](); } catch (e) { fallback('no-webgl'); return; } state.ms.push(Math.round(performance.now() - t)); if (si < steps.length) requestAnimationFrame(next); }
  requestAnimationFrame(next);

  /* ---- inputs: pointer drift and the protection moment (desktop), scroll dolly, visibility ---- */
  if (fine) {
    let hb = null; const box = () => { const r = hero.getBoundingClientRect(); hb = { l: r.left + scrollX, t: r.top + scrollY, w: r.width, h: r.height }; };
    hero.addEventListener('pointerenter', box);
    hero.addEventListener('pointermove', function (e) { if (!hb) box(); tYaw = ((e.pageX - hb.l) / hb.w - 0.5) * 0.105; tPitch = ((e.pageY - hb.t) / hb.h - 0.5) * -0.05; interact(); wake(700); }, { passive: true });
    hero.addEventListener('pointerleave', function () { tYaw = 0; tPitch = 0; wake(900); });
    hero.querySelectorAll('.btn-oro').forEach(function (b) { b.addEventListener('pointerenter', function () { tDome = 1; wake(900); }); b.addEventListener('pointerleave', function () { tDome = 0; wake(900); }); });
  }
  let sT = false;
  addEventListener('scroll', function () { if (sT) return; sT = true; requestAnimationFrame(function () { sT = false; const h = hero.offsetHeight || 1; tDolly = Math.min(1, Math.max(0, scrollY / h)); if (scrollY > 8) interact(); wake(500); }); }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(400); else running = false; }).observe(hero);
  document.addEventListener('visibilitychange', function () { if (document.hidden) running = false; else wake(400); });
  if ('ResizeObserver' in window && sky) new ResizeObserver(function () { if (built && !lost) size(); }).observe(sky); else addEventListener('resize', function () { if (built && !lost) size(); });
  addEventListener('pagehide', function () { if (!renderer) return; running = false; try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} }, { once: true });
  return state;
}
