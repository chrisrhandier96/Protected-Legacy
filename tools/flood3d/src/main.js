/* Live 3D flood viewer: Casa Patrimonio (the hypothetical home from the Unreal session, exported as glTF) with a water
   surface the visitor raises from normal tide to 12 ft above the first floor. It upgrades the flood guide's scene
   figure in place: the nine rendered frames stay underneath as the fallback, the canvas fades in over them, and the
   figure's own slider becomes continuous. Entry: start({fig, dl, lite, reduced}) from the loader in add-scenes.js.
   Rules (same as the hero): render only while on screen and visible, cap work on phones, release WebGL on pagehide,
   fall back to the frames if anything fails or the context is lost. Nothing drawn here is text. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, Mesh, PlaneGeometry, SphereGeometry,
  BoxGeometry, TorusGeometry, CylinderGeometry, ShaderMaterial, MeshStandardMaterial, BackSide, Vector3, Group, SRGBColorSpace,
  ACESFilmicToneMapping, PCFShadowMap, MathUtils, TOUCH
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL = '/img/scenes/flo3d/casa.glb';
const FT_MAX = 12;

/* dusk, matched to the renders and the site's palette */
const SKY_TOP = new Color('#173040'), SKY_MID = new Color('#4f6b72'), SKY_LOW = new Color('#e6a96c');
const TIDE_DEEP = new Color('#163c45'), TIDE_SHALLOW = new Color('#2f6a6a'), FLOOD_DEEP = new Color('#3b3a24'), FLOOD_SHALLOW = new Color('#6e6740');

export function start(o) {
  const fig = o.fig, stage = fig.querySelector('.scn-stage');
  const range0 = fig.querySelector('input.scn-range'), out = fig.querySelector('.scn-out');
  if (!stage || !range0) return Promise.reject(new Error('no stage'));
  const L = document.documentElement.lang === 'en' ? 'en' : 'es';
  const lite = !!o.lite, reduced = !!o.reduced;
  const AA = o.aa != null ? !!o.aa : !lite, SHADOWS = o.shadows != null ? !!o.shadows : !lite;   // o.aa / o.shadows: test overrides

  /* ---- renderer and canvas (absolutely placed in the fixed 16:9 stage: no layout shift) ---- */
  const renderer = new WebGLRenderer({ antialias: AA, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = SHADOWS; renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;   // the estate is static: shadows are redrawn only when the boat moves
  const cv = renderer.domElement;
  cv.className = 'scn-3d';
  cv.setAttribute('role', 'img');
  stage.appendChild(cv);

  const scene = new Scene();
  if (o.debug) window.__flood3d = { renderer, scene };   // tests only
  scene.fog = new Fog(SKY_LOW.clone().lerp(SKY_MID, 0.5), 60, 260);

  /* sky dome: a vertical dusk gradient with a warm glow toward the low sun */
  const SUN_DIR = new Vector3(-0.85, 0.2, 0.45).normalize();   // low dusk sun raking across the facade, its glow at the frame's edge
  const sky = new Mesh(new SphereGeometry(400, 32, 16), new ShaderMaterial({
    side: BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: SKY_TOP }, mid: { value: SKY_MID }, low: { value: SKY_LOW }, sun: { value: SUN_DIR } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform vec3 top, mid, low, sun; varying vec3 vD;',
      'void main(){ float h = clamp(vD.y, -0.1, 1.0);',
      '  vec3 c = mix(low, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h));',
      '  float g = pow(max(dot(normalize(vD), sun), 0.0), 12.0); c += vec3(1.0, 0.62, 0.32) * g * 0.55; gl_FragColor = vec4(c, 1.0);',
      '  #include <colorspace_fragment>',
      '}'].join('\n')
  }));
  scene.add(sky);

  const hemi = new HemisphereLight(new Color('#a9bfc4'), new Color('#6a5640'), 1.35); scene.add(hemi);
  const sun = new DirectionalLight(new Color('#ffc58f'), 2.1);
  sun.position.copy(SUN_DIR).multiplyScalar(60); scene.add(sun); scene.add(sun.target);
  if (SHADOWS) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    const sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 160;
  }

  /* ---- water: one surface, teal at the tide line, muddy brown green once it is over the land ---- */
  const water = new Mesh(new PlaneGeometry(520, 520, 1, 1), new ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,   // the shader applies the scene fog itself
    uniforms: {
      t: { value: 0 }, flood: { value: 0 }, sun: { value: SUN_DIR }, skyc: { value: SKY_LOW.clone().lerp(SKY_MID, 0.4) },
      deepA: { value: TIDE_DEEP }, shallowA: { value: TIDE_SHALLOW }, deepB: { value: FLOOD_DEEP }, shallowB: { value: FLOOD_SHALLOW },
      fogColor: { value: scene.fog.color }, fogNear: { value: scene.fog.near }, fogFar: { value: scene.fog.far }
    },
    vertexShader: 'varying vec3 vW; varying float vFogDepth; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;' +
      ' vec4 mv = viewMatrix * w; vFogDepth = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: [
      'uniform float t, flood, fogNear, fogFar; uniform vec3 sun, skyc, deepA, shallowA, deepB, shallowB, fogColor; varying vec3 vW; varying float vFogDepth;',
      'vec2 wave(vec2 p, vec2 d, float f, float s){ float ph = dot(p, d) * f + t * s; return d * cos(ph) * f; }',
      'void main(){',
      '  vec2 p = vW.xz; vec2 g = wave(p, normalize(vec2(1.0, 0.3)), 0.9, 1.3) * 0.05 + wave(p, normalize(vec2(-0.4, 1.0)), 1.7, 1.9) * 0.03',
      '    + wave(p, normalize(vec2(0.7, -0.8)), 3.1, 2.6) * 0.015;',
      '  g *= mix(1.0, 0.45, flood);',
      '  vec3 n = normalize(vec3(-g.x, 1.0, -g.y)); vec3 v = normalize(cameraPosition - vW);',
      '  float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);',
      '  vec3 deep = mix(deepA, deepB, flood), shallow = mix(shallowA, shallowB, flood);',
      '  vec3 c = mix(deep, shallow, 0.35 + 0.35 * n.x) * (0.75 + 0.25 * max(dot(n, sun), 0.0));',
      '  c = mix(c, skyc, fres * (0.75 - 0.4 * flood));',
      '  vec3 h = normalize(sun + v); c += vec3(1.0, 0.72, 0.45) * pow(max(dot(n, h), 0.0), 220.0) * (1.4 - flood);',
      '  float a = mix(0.9, 0.8, flood);',
      '  float fogF = smoothstep(fogNear, fogFar, vFogDepth); c = mix(c, fogColor, fogF);',
      '  gl_FragColor = vec4(c, a);',
      '  #include <colorspace_fragment>',
      '}'].join('\n')
  }));
  water.rotation.x = -Math.PI / 2; water.renderOrder = 2;
  scene.add(water);

  /* ---- debris (from 3 ft up, the same pieces in the same places): palm fronds, a cooler, a pool float ---- */
  const debris = new Group(); debris.visible = false; scene.add(debris);
  const frondMat = new MeshStandardMaterial({ color: '#4b6b2e', roughness: 0.9 });
  const pieces = [];
  [[-8, 9, 0.6], [-3, 14, -0.9], [4, 11, 2.1], [-12, 4, 1.2]].forEach(([x, z, r]) => {
    const m = new Mesh(new BoxGeometry(2.4, 0.05, 0.5), frondMat); m.position.set(x, 0, z); m.rotation.y = r; debris.add(m); pieces.push(m);
  });
  const cooler = new Mesh(new BoxGeometry(0.8, 0.5, 0.5), new MeshStandardMaterial({ color: '#e9e4d8', roughness: 0.6 }));
  cooler.position.set(1, 0, 15); cooler.rotation.y = 0.4; debris.add(cooler); pieces.push(cooler);
  const ring = new Mesh(new TorusGeometry(0.55, 0.2, 10, 24), new MeshStandardMaterial({ color: '#d9826c', roughness: 0.5 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(-6, 0, 12); debris.add(ring); pieces.push(ring);
  pieces.forEach((m, i) => { m.userData.ph = i * 1.7; m.userData.y0 = m.position.y; });

  /* ---- camera and controls ---- */
  const camera = new PerspectiveCamera(22, 16 / 9, 0.5, 900);
  const controls = new OrbitControls(camera, cv);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
  controls.enableZoom = false;                      // the page keeps the wheel
  controls.rotateSpeed = 0.45; controls.minPolarAngle = 0.55; controls.maxPolarAngle = 1.42;
  controls.touches.ONE = null; controls.touches.TWO = TOUCH.DOLLY_ROTATE;   // one finger scrolls the page
  cv.style.touchAction = 'pan-y';

  const badge = fig.querySelector('.scn-badge'), badgeText = badge ? badge.textContent : '';
  let hint = null;
  const state = { n: 0, sum: 0, prev: 0, degraded: false, shadowLift: -1, drag: false, ft: 0, levelY: 0, shown: false, raf: 0, inView: true, t0: performance.now(), lastUser: -1e9, extras: null, boat: [], disposed: false };

  function levelOf(ft, ex) {   // 0 = normal tide; 0 to 1 ft runs from the tide up to 1 ft over the slab; then feet over the slab
    if (ft <= 1) return MathUtils.lerp(ex.tide_m, ex.slab_m + ex.ft_m, ft);
    return ex.slab_m + ft * ex.ft_m;
  }
  function label(ft) {
    if (ft <= 0.01) return L === 'es' ? 'Marea normal' : 'Normal tide';
    const v = ft < 1 ? ft.toFixed(2) : ft.toFixed(ft % 1 ? 1 : 0);
    return L === 'es' ? v + (ft === 1 ? ' pie' : ' pies') : v + ' ft';
  }

  /* ---- the slider: the figure's own control, made continuous (a clone drops the frame-swapping listener) ---- */
  const FRAME_FT = [0, 1, 2, 3, 4, 6, 8, 10, 12];
  const range = range0.cloneNode(true);
  function wireRange() {
    const idx = +range0.value || 0;
    range.min = '0'; range.max = String(FT_MAX); range.step = '0.25'; range.value = String(FRAME_FT[idx] || 0);
    range0.replaceWith(range);
    range.addEventListener('input', () => { setFt(+range.value); kick(); try { o.dl && o.dl({ event: 'scene3d_level', scene: 'flo' }); } catch (e) { /* analytics only */ } }, { passive: true });
  }
  function setFt(ft) {
    state.ft = ft;
    const txt = label(ft);
    range.setAttribute('aria-valuetext', txt);
    if (out) out.textContent = txt;
    cv.setAttribute('aria-label', (L === 'es' ? 'Casa hipotética en 3D: ' : 'Hypothetical home in 3D: ') + txt);
  }

  /* ---- loading ---- */
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  function fail(why) {
    if (state.disposed) return;
    dispose();
    try { o.dl && o.dl({ event: 'scene3d_ready', scene: 'flo', mode: 'fallback', reason: why }); } catch (e) { /* analytics only */ }
  }

  const ready = new Promise((resolve, reject) => {   // returned at the end, after the loop and listeners below exist
    loader.load(MODEL, (gltf) => {
      try {
        const root = gltf.scene, ex = (gltf.scenes[0] && gltf.scenes[0].userData) || {};
        if (ex.tide_m == null) throw new Error('model without metadata');
        state.extras = ex;
        root.traverse((n) => {
          if (!n.isMesh) return;
          const g = (n.userData && n.userData.group) || (n.parent && n.parent.userData && n.parent.userData.group) || '';
          n.geometry = toCreasedNormals(n.geometry, Math.PI / 5);
          const m = n.material;
          if (m) { m.side = 0; m.envMapIntensity = 0.6; if (g === 'glass') { m.roughness = 0.08; m.metalness = 0.0; } }
          n.castShadow = SHADOWS && g !== 'lawn' && g !== 'street' && g !== 'skyline';
          n.receiveShadow = SHADOWS;
          if (g === 'boat' || g === 'engine') { n.userData.y0 = n.position.y; state.boat.push(n); }
        });
        scene.add(root);
        const ch = ex.cam_hero;
        camera.position.fromArray(ch.position); controls.target.fromArray(ch.target);
        // a little further back than the still, so the whole estate and the waterline fit at 16:9
        controls.target.y -= 1.2;
        camera.position.sub(controls.target).multiplyScalar(1.38).add(controls.target);
        controls.minDistance = controls.maxDistance = camera.position.distanceTo(controls.target);
        controls.update();
        controls.addEventListener('start', () => { state.drag = true; state.lastUser = performance.now(); kick(); });
        controls.addEventListener('end', () => { state.drag = false; state.lastUser = performance.now(); });
        controls.addEventListener('change', () => { if (state.drag) state.lastUser = performance.now(); kick(); });
        wireRange();
        setFt(+range.value);
        resize();
        renderer.compile(scene, camera);
        renderer.shadowMap.needsUpdate = true;
        frame(performance.now());
        // fade in over the frames, relabel the badge, add the drag hint on pointer devices, then tell the page
        if (badge) badge.textContent = L === 'es' ? '3D en vivo' : 'Live 3D';
        if (!lite) { hint = document.createElement('span'); hint.className = 'scn-hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = L === 'es' ? 'Arrastre para girar' : 'Drag to turn'; stage.appendChild(hint); }
        requestAnimationFrame(() => { cv.classList.add('on'); fig.classList.add('scn-is-3d'); });
        try { o.dl && o.dl({ event: 'scene3d_ready', scene: 'flo', mode: lite ? 'lite' : 'full' }); } catch (e) { /* analytics only */ }
        resolve({ dispose });
      } catch (e) { fail('build-error'); reject(e); }
    }, undefined, (e) => { fail('load-error'); reject(e); });

    cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail('context-lost'); }, false);
    addEventListener('pagehide', dispose, { once: true });
  });

  /* ---- sizing, visibility, loop ---- */
  function resize() {
    const r = stage.getBoundingClientRect(); if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  function onResize() { resize(); kick(); }
  addEventListener('resize', onResize, { passive: true });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { state.inView = es[0].isIntersecting; if (state.inView) kick(); }, { rootMargin: '120px 0px' }) : null;
  if (io) io.observe(stage);
  document.addEventListener('visibilitychange', kick);

  function want() { return !state.disposed && state.inView && !document.hidden; }
  function kick() { if (!state.raf && want()) state.raf = requestAnimationFrame(frame); }
  let lastDraw = 0;
  function frame(now) {
    state.raf = 0;
    if (!want() || !state.extras) return;
    if (lite && !o.uncapped && now - lastDraw < 31) { state.raf = requestAnimationFrame(frame); return; }   // about 30 fps on phones
    lastDraw = now;
    const t = (now - state.t0) / 1000, ex = state.extras;
    // water eases toward the slider (feels like water, not a jump)
    const target = levelOf(state.ft, ex);
    state.levelY += (target - state.levelY) * (reduced ? 1 : 0.12);
    if (Math.abs(target - state.levelY) < 0.0005) state.levelY = target;
    const y = state.levelY;
    water.position.y = y;
    const flood = MathUtils.smoothstep(y, ex.tide_m + 0.15, ex.slab_m + ex.ft_m);
    water.material.uniforms.flood.value = flood;
    water.material.uniforms.t.value = reduced ? 0 : t;
    // the boat rides the water once the water is above its resting line
    const lift = Math.max(0, y - ex.tide_m);
    state.boat.forEach((n) => { n.position.y = n.userData.y0 + lift + (reduced ? 0 : Math.sin(t * 1.1) * 0.03 * (lift > 0.05 ? 1 : 0.4)); });
    if (Math.abs(lift - state.shadowLift) > 0.05) { state.shadowLift = lift; renderer.shadowMap.needsUpdate = true; }
    // debris from 3 ft up
    debris.visible = state.ft >= 3;
    if (debris.visible) pieces.forEach((m) => { m.position.y = y + 0.06 + (reduced ? 0 : Math.sin(t * 0.9 + m.userData.ph) * 0.05); if (!reduced) m.rotation.y += 0.0015; });
    // idle sway when nobody is dragging (never with reduced motion)
    if (!reduced && !state.drag && now - state.lastUser > 4000) {
      const off = Math.sin(t * 0.12) * 0.06;
      const r = controls.minDistance, tg = controls.target, base = Math.atan2(ex.cam_hero.position[0] - tg.x, ex.cam_hero.position[2] - tg.z);
      const yy = camera.position.y;
      camera.position.set(tg.x + Math.sin(base + off) * Math.sqrt(Math.max(1, r * r - (yy - tg.y) * (yy - tg.y))), yy, tg.z + Math.cos(base + off) * Math.sqrt(Math.max(1, r * r - (yy - tg.y) * (yy - tg.y))));
    }
    controls.update();
    renderer.render(scene, camera);
    // quality guard: if the first 90 frames average over 28 ms, drop to the phone settings (no shadows, lower resolution)
    const ft = now - (state.prev || now); state.prev = now;
    if (!state.degraded && state.n < 90) { state.n++; if (state.n > 10) state.sum += ft; }
    if (!state.degraded && state.n === 90 && state.sum / 80 > 28) {
      state.degraded = true; renderer.shadowMap.enabled = false; scene.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; if (m.material) [].concat(m.material).forEach((x) => { x.needsUpdate = true; }); } });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)); resize();
      try { o.dl && o.dl({ event: 'scene3d_quality', scene: 'flo', mode: 'degraded' }); } catch (e) { /* analytics only */ }
    }
    const moving = !reduced || Math.abs(target - state.levelY) > 0.0005;
    if (moving && !state.raf) state.raf = requestAnimationFrame(frame);   // one loop only: a kick during this frame already queued it
  }

  return ready;

  function dispose() {
    if (state.disposed) return;
    state.disposed = true;
    if (state.raf) cancelAnimationFrame(state.raf);
    removeEventListener('resize', onResize);
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', kick);
    try { controls.dispose(); } catch (e) { /* already gone */ }
    scene.traverse((n) => { if (n.geometry) n.geometry.dispose(); if (n.material) [].concat(n.material).forEach((m) => m.dispose()); });
    renderer.dispose();
    try { renderer.forceContextLoss(); } catch (e) { /* not supported */ }
    cv.remove();
    fig.classList.remove('scn-is-3d');
    if (range !== range0 && range.parentNode) {   // give the frames back their own slider
      let best = 0; FRAME_FT.forEach((f, i) => { if (Math.abs(f - state.ft) < Math.abs(FRAME_FT[best] - state.ft)) best = i; });
      range0.value = String(best); range.replaceWith(range0); range0.dispatchEvent(new Event('input'));
    }
    if (badge) badge.textContent = badgeText;
    if (hint) hint.remove();
  }
}
