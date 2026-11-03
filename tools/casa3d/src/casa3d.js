/* Live 3D scenes for the guides: Casa Patrimonio (the hypothetical home from the Unreal session, exported as glTF).
   One bundle, two modes, picked by the figure's data-scene:
   - flo (flood guide): the visitor raises the water from normal tide to 12 ft above the first floor with the figure's
     own slider, made continuous. The water turns from teal to muddy brown green over the land, the boat floats up,
     debris appears from 3 ft.
   - ren (renovations guide): before, during the work (scaffolding, dumpster, the addition framed in lumber, materials
     under tarps, new pilings) and after (the finished addition, the new dock), driven by the figure's three tabs.
   - lia (umbrella guide): the estate from the drone, turnable, with the figure's numbered pins riding on the real
     objects (pool, boat, PWC, cars, outdoor kitchen, service gate).
   - cnd (condos guide): the condo unit cutaway, turnable; the figure's three coverage toggles tint the real parts in
     3D (the association's structure, railing and windows; the owner's finishes; the owner's belongings).
   - mar (boats): tabs fly the camera between the dock, the boat on its trailer by the gate, and the PWC on its lift.
   - str (short-term rentals): tabs for the guests' arrival at the gate (suitcases, lockbox, welcome mat) and out back
     (towels on the loungers, pool toys, the dock chained off).
   - kr (kidnap and ransom): the gate at night: moonlight, lit windows, headlights inside the gate, cameras on the posts.
   - avi (aviation): a drone hovering and circling over the pool.
   - aut (auto): a generic sports car on a studio floor; the figure's slider turns it through 360 degrees.
   - res (homes and hurricanes guide): the figure's six tabs drive the scene: prepared (shutters closed, furniture
     stored, pool covered, the boat on its trailer), not prepared, tropical storm, Category 1, Category 3 (wind bends
     the palms, rain, surge over the seawall, flying debris, lightning; at Category 3 a torn shutter and lifted tiles),
     and the morning after (calm dawn, the boat on the lawn, debris on the grass).
   It upgrades the figure in place: the rendered frames stay underneath as the fallback, the canvas fades in over them.
   Entry: start({fig, dl, lite, reduced}) from the loader in tools/post/add-scenes.js.
   Rules (same as the homepage hero): one render loop, render only on screen and while the page is visible, cap work
   on phones, a quality guard, release WebGL on pagehide, fall back to the frames on any failure or a lost context.
   Nothing drawn here is text, so nothing here is a claim. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, Mesh, PlaneGeometry, SphereGeometry,
  BoxGeometry, TorusGeometry, CylinderGeometry, ShaderMaterial, MeshStandardMaterial, BackSide, Vector3, Group, SRGBColorSpace,
  ACESFilmicToneMapping, PCFShadowMap, MathUtils, TOUCH, Box3, PointLight, BufferGeometry, Float32BufferAttribute, LineSegments, AdditiveBlending
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODEL = '/img/scenes/3d/casa.glb', PROPS = '/img/scenes/3d/casa-props.glb', CONDO = '/img/scenes/3d/condo.glb', CAR = '/img/scenes/3d/car.glb';
const FT_MAX = 12;
const C = (h) => new Color(h);

/* skies: top, middle and horizon colours, sun strength, hemisphere strength, fog colour and range */
const SKIES = {
  dusk:  { top: C('#173040'), mid: C('#4f6b72'), low: C('#e6a96c'), sun: 2.1, hemi: 1.35, fog: C('#9a8e7c'), near: 60, far: 260 },
  gray:  { top: C('#36424b'), mid: C('#68737b'), low: C('#a49f94'), sun: 0.7, hemi: 1.25, fog: C('#848a8c'), near: 50, far: 230 },
  storm: { top: C('#161c21'), mid: C('#323c42'), low: C('#4d5757'), sun: 0.12, hemi: 0.85, fog: C('#454e51'), near: 18, far: 120 },
  dawn:  { top: C('#3b5873'), mid: C('#9cb2bd'), low: C('#f0c29a'), sun: 1.7, hemi: 1.35, fog: C('#c8b9a6'), near: 60, far: 260 },
  night: { top: C('#04060c'), mid: C('#0c1424'), low: C('#1a2436'), sun: 0.25, hemi: 0.45, fog: C('#0e1626'), near: 40, far: 220 },
  studio:{ top: C('#3c5163'), mid: C('#6d8594'), low: C('#a9bcc6'), sun: 2.2, hemi: 1.6, fog: C('#a9bcc6'), near: 200, far: 900 },
  day:   { top: C('#3d6f95'), mid: C('#8fb6cf'), low: C('#e6dcc8'), sun: 2.5, hemi: 1.45, fog: C('#c3cfd4'), near: 80, far: 320 }
};
const TIDE_DEEP = C('#163c45'), TIDE_SHALLOW = C('#2f6a6a'), FLOOD_DEEP = C('#3b3a24'), FLOOD_SHALLOW = C('#6e6740');
const WIND = new Vector3(0.8, 0, 0.6).normalize();   // across the hero view, so the bend, the rain and the debris read from the camera

/* the hurricane guide's tabs, in the figure's order */
const STORM_STAGES = [
  { key: 'prep_on',  sky: 'gray',  storm: 0.0,  water: 'tide',  boat: 'trailer' },
  { key: 'prep_off', sky: 'gray',  storm: 0.0,  water: 'tide',  boat: 'dock' },
  { key: 'storm_ts', sky: 'storm', storm: 0.42, water: 'ts',    boat: 'dock' },
  { key: 'storm_c1', sky: 'storm', storm: 0.7,  water: 'c1',    boat: 'dock' },
  { key: 'storm_c3', sky: 'storm', storm: 1.0,  water: 'c3',    boat: 'dock' },
  { key: 'after',    sky: 'dawn',  storm: 0.0,  water: 'tide',  boat: 'lawn' }
];
const REN_STAGES = [
  { key: 'before',     sky: 'day', storm: 0, water: 'tide', boat: 'dock' },
  { key: 'ren_during', sky: 'day', storm: 0, water: 'tide', boat: 'dock' },
  { key: 'ren_after',  sky: 'day', storm: 0, water: 'tide', boat: 'dock' }
];
const AERIAL_STAGES = [{ key: 'aerial', sky: 'day', storm: 0, water: 'tide', boat: 'dock' }];
const CONDO_STAGES = [{ key: 'condo', sky: 'studio', storm: 0, water: 'tide', boat: 'dock' }];
const MAR_STAGES = [
  { key: 'mar_dock', show: 'none', sky: 'day', storm: 0, water: 'tide', boat: 'dock', cam: 'cam_dock' },
  { key: 'mar_trailer', show: 'mar_trailer', sky: 'day', storm: 0, water: 'tide', boat: 'trailer', cam: 'cam_gate' },
  { key: 'mar_lift', show: 'none', sky: 'day', storm: 0, water: 'tide', boat: 'dock', cam: 'cam_lift' }
];
const STR_STAGES = [
  { key: 'str_arrival', show: 'str_arrival', sky: 'day', storm: 0, water: 'tide', boat: 'dock', cam: 'cam_gate' },
  { key: 'str_back', show: 'str_back', sky: 'day', storm: 0, water: 'tide', boat: 'dock', cam: 'cam_hero' }
];
const KR_STAGES = [{ key: 'kr_night', show: 'kr_night', sky: 'night', storm: 0, water: 'tide', boat: 'dock', cam: 'cam_gate' }];
const AVI_STAGES = [{ key: 'avi', show: 'avi', sky: 'day', storm: 0, water: 'tide', boat: 'dock', cam: 'cam_avi' }];
const CAR_STAGES = [{ key: 'car', show: 'none', sky: 'studio', storm: 0, water: 'tide', boat: 'dock' }];
const LAYER_GROUPS = { assoc: ['structure', 'railing', 'window'], finish: ['finishes'], contents: ['contents'] };
const PIN_GROUPS = { pool: 'pool', boat: 'boat', pwc: 'pwc', cars: 'car', events: 'kitchen', staff: 'gate' };

export function start(o) {
  const fig = o.fig, stage = fig.querySelector('.scn-stage');
  const SC = fig.getAttribute('data-scene');
  const MODE = { res: 'storm', ren: 'reno', lia: 'aerial', cnd: 'condo', mar: 'marine', str: 'rental', kr: 'gate', avi: 'drone', aut: 'car' }[SC] || 'flood';
  const STAGES = { reno: REN_STAGES, aerial: AERIAL_STAGES, condo: CONDO_STAGES, marine: MAR_STAGES, rental: STR_STAGES, gate: KR_STAGES, drone: AVI_STAGES, car: CAR_STAGES }[MODE] || STORM_STAGES;
  const SLIDER = MODE === 'flood' || MODE === 'car', FRAMED = ['marine', 'rental', 'gate', 'drone', 'car'].indexOf(MODE) >= 0;
  const lbtns = Array.prototype.slice.call(fig.querySelectorAll('.scn-lbtn'));
  const TABBED = ['storm', 'reno', 'marine', 'rental'].indexOf(MODE) >= 0;
  const pins = Array.prototype.slice.call(fig.querySelectorAll('.scn-pin'));
  const range0 = fig.querySelector('input.scn-range'), out = fig.querySelector('.scn-out');
  const tabs0 = Array.prototype.slice.call(fig.querySelectorAll('.scn-tab'));
  if (!stage || (SLIDER && !range0) || (TABBED && tabs0.length < STAGES.length) || (MODE === 'aerial' && !pins.length) || (MODE === 'condo' && !lbtns.length)) return Promise.reject(new Error('no stage'));
  const L = document.documentElement.lang === 'en' ? 'en' : 'es';
  const lite = !!o.lite, reduced = !!o.reduced, SCENE = SC || 'flo';
  const AA = o.aa != null ? !!o.aa : !lite, SHADOWS = o.shadows != null ? !!o.shadows : !lite;   // o.aa / o.shadows: test overrides

  /* ---- renderer and canvas (absolutely placed in the fixed 16:9 stage: no layout shift) ---- */
  const renderer = new WebGLRenderer({ antialias: AA, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = SHADOWS; renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;   // the estate is static: shadows are redrawn only when something that casts them moves
  const cv = renderer.domElement;
  cv.className = 'scn-3d';
  cv.setAttribute('role', 'img');
  stage.appendChild(cv);

  const scene = new Scene();
  if (o.debug) window.__casa3d = { renderer, scene };   // tests only
  const start0 = MODE === 'flood' ? SKIES.dusk : MODE === 'storm' ? SKIES.gray : (MODE === 'condo' || MODE === 'car') ? SKIES.studio : MODE === 'gate' ? SKIES.night : SKIES.day;
  scene.fog = new Fog(start0.fog.clone(), start0.near, start0.far);
  const look = { top: start0.top.clone(), mid: start0.mid.clone(), low: start0.low.clone(), sun: start0.sun, hemi: start0.hemi };

  /* sky dome: a vertical gradient with a glow toward the low sun; flash brightens it for lightning */
  const SUN_DIR = new Vector3(-0.85, 0.2, 0.45).normalize();
  const sky = new Mesh(new SphereGeometry(400, 32, 16), new ShaderMaterial({
    side: BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: look.top }, mid: { value: look.mid }, low: { value: look.low }, sun: { value: SUN_DIR }, glow: { value: 0.55 }, flash: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform vec3 top, mid, low, sun; uniform float glow, flash; varying vec3 vD;',
      'void main(){ float h = clamp(vD.y, -0.1, 1.0);',
      '  vec3 c = mix(low, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h));',
      '  float g = pow(max(dot(normalize(vD), sun), 0.0), 12.0); c += vec3(1.0, 0.62, 0.32) * g * glow;',
      '  c += vec3(0.75, 0.8, 0.9) * flash; gl_FragColor = vec4(c, 1.0);',
      '  #include <colorspace_fragment>',
      '}'].join('\n')
  }));
  scene.add(sky);

  const hemi = new HemisphereLight(C('#a9bfc4'), C('#6a5640'), look.hemi); scene.add(hemi);
  const sun = new DirectionalLight(C('#ffc58f'), look.sun);
  sun.position.copy(SUN_DIR).multiplyScalar(60); scene.add(sun); scene.add(sun.target);
  if (SHADOWS) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    const sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 160;
  }

  /* ---- water: one surface, teal at the tide line, muddy brown green once it is over the land, rough in a storm ---- */
  const water = new Mesh(new PlaneGeometry(520, 520, 1, 1), new ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,   // the shader applies the scene fog itself
    uniforms: {
      t: { value: 0 }, flood: { value: 0 }, rough: { value: 1 }, sun: { value: SUN_DIR }, skyc: { value: look.low.clone().lerp(look.mid, 0.4) },
      deepA: { value: TIDE_DEEP }, shallowA: { value: TIDE_SHALLOW }, deepB: { value: FLOOD_DEEP }, shallowB: { value: FLOOD_SHALLOW },
      fogColor: { value: scene.fog.color }, fogNear: { value: scene.fog.near }, fogFar: { value: scene.fog.far }, spec: { value: 1 }
    },
    vertexShader: 'varying vec3 vW; varying float vFogDepth; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;' +
      ' vec4 mv = viewMatrix * w; vFogDepth = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: [
      'uniform float t, flood, rough, fogNear, fogFar, spec; uniform vec3 sun, skyc, deepA, shallowA, deepB, shallowB, fogColor; varying vec3 vW; varying float vFogDepth;',
      'vec2 wave(vec2 p, vec2 d, float f, float s){ float ph = dot(p, d) * f + t * s * (0.6 + 0.4 * rough); return d * cos(ph) * f; }',
      'void main(){',
      '  vec2 p = vW.xz; vec2 g = wave(p, normalize(vec2(1.0, 0.3)), 0.9, 1.3) * 0.05 + wave(p, normalize(vec2(-0.4, 1.0)), 1.7, 1.9) * 0.03',
      '    + wave(p, normalize(vec2(0.7, -0.8)), 3.1, 2.6) * 0.015 + wave(p, normalize(vec2(0.2, -1.0)), 5.3, 4.1) * 0.012 * (rough - 1.0);',
      '  g *= mix(1.0, 0.45, flood) * (1.0 + (rough - 1.0) * 0.45);',
      '  vec3 n = normalize(vec3(-g.x, 1.0, -g.y)); vec3 v = normalize(cameraPosition - vW);',
      '  float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);',
      '  vec3 deep = mix(deepA, deepB, flood), shallow = mix(shallowA, shallowB, flood);',
      '  vec3 c = mix(deep, shallow, 0.35 + 0.35 * n.x) * (0.75 + 0.25 * max(dot(n, sun), 0.0));',
      '  c = mix(c, skyc, fres * (0.75 - 0.4 * flood));',
      '  vec3 h = normalize(sun + v); c += vec3(1.0, 0.72, 0.45) * pow(max(dot(n, h), 0.0), 220.0) * (1.4 - flood) * spec;',
      '  c *= 1.0 - (rough - 1.0) * 0.08;',   // storm water reads darker and rougher (no whitecap pattern)
      '  float a = mix(0.9, 0.8, flood);',
      '  float fogF = smoothstep(fogNear, fogFar, vFogDepth); c = mix(c, fogColor, fogF);',
      '  gl_FragColor = vec4(c, a);',
      '  #include <colorspace_fragment>',
      '}'].join('\n')
  }));
  water.rotation.x = -Math.PI / 2; water.renderOrder = 2;
  scene.add(water);

  /* ---- floating debris (flood, from 3 ft up): palm fronds, a cooler, a pool float ---- */
  const floatDebris = new Group(); floatDebris.visible = false; scene.add(floatDebris);
  const frondMat = new MeshStandardMaterial({ color: '#4b6b2e', roughness: 0.9 });
  const floaters = [];
  [[-8, 9, 0.6], [-3, 14, -0.9], [4, 11, 2.1], [-12, 4, 1.2]].forEach(([x, z, r]) => {
    const m = new Mesh(new BoxGeometry(2.4, 0.05, 0.5), frondMat); m.position.set(x, 0, z); m.rotation.y = r; floatDebris.add(m); floaters.push(m);
  });
  const cooler = new Mesh(new BoxGeometry(0.8, 0.5, 0.5), new MeshStandardMaterial({ color: '#e9e4d8', roughness: 0.6 }));
  cooler.position.set(1, 0, 15); cooler.rotation.y = 0.4; floatDebris.add(cooler); floaters.push(cooler);
  const ring = new Mesh(new TorusGeometry(0.55, 0.2, 10, 24), new MeshStandardMaterial({ color: '#d9826c', roughness: 0.5 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(-6, 0, 12); floatDebris.add(ring); floaters.push(ring);
  floaters.forEach((m, i) => { m.userData.ph = i * 1.7; });

  /* ---- storm pieces: rain, flying debris, debris left on the lawn ---- */
  let rain = null, flyers = [], lawnDebris = null;
  const plankMat = new MeshStandardMaterial({ color: '#7a6248', roughness: 0.9 });
  if (MODE === 'storm') {
    const N = lite ? 900 : 2200, pos = [], seed = [];
    for (let i = 0; i < N; i++) {
      const x = (Math.random() - 0.5) * 70, y = Math.random() * 26, z = (Math.random() - 0.5) * 70;
      pos.push(x, y, z, x, y, z); seed.push(0, 1);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('aEnd', new Float32BufferAttribute(seed, 1));
    rain = new LineSegments(g, new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false,
      uniforms: { t: { value: 0 }, amount: { value: 0 }, wind: { value: WIND.clone() } },
      vertexShader: [
        'attribute float aEnd; uniform float t, amount; uniform vec3 wind; varying float vA;',
        'void main(){ vec3 p = position; float sp = 17.0, H = 26.0;',
        '  p.y = mod(position.y - t * sp, H) - 1.0;',
        '  vec3 vel = vec3(wind.x, 0.0, wind.z) * 9.0 * amount - vec3(0.0, sp, 0.0);',
        '  p.xz += wind.xz * 9.0 * amount * (H - p.y) / sp;',
        '  p += vel * 0.035 * aEnd;',
        '  vA = amount * step(fract(position.x * 7.13 + position.z * 3.7), amount * 1.1);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }'].join('\n'),
      fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(0.78, 0.82, 0.86, 0.32 * vA); }'
    }));
    rain.frustumCulled = false; rain.visible = false; scene.add(rain);
    for (let i = 0; i < (lite ? 10 : 22); i++) {
      const m = new Mesh(new BoxGeometry(1.2 + Math.random(), 0.06, 0.25), plankMat);
      m.userData = { ph: Math.random() * 40, h: 2 + Math.random() * 7, side: (Math.random() - 0.5) * 40, sp: 6 + Math.random() * 6, spin: 1 + Math.random() * 3 };
      m.visible = false; scene.add(m); flyers.push(m);
    }
    lawnDebris = new Group(); lawnDebris.visible = false; scene.add(lawnDebris);
    let r0 = 11;
    const rnd = () => { r0 = (r0 * 16807) % 2147483647; return r0 / 2147483647; };
    for (let i = 0; i < 18; i++) {
      const m = new Mesh(new BoxGeometry(0.6 + rnd() * 1.2, 0.08, 0.25), plankMat);
      m.position.set(-14 + rnd() * 26, 0.06, -12 + rnd() * 30); m.rotation.y = rnd() * 3.1; lawnDebris.add(m);
    }
    const c2 = cooler.clone(); c2.position.set(7, 0.25, 16); lawnDebris.add(c2);
    const r2 = ring.clone(); r2.position.set(13, 0.12, 12); lawnDebris.add(r2);
  }

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
  const state = {
    n: 0, sum: 0, prev: 0, degraded: false, shadowKey: '', drag: false, raf: 0, inView: true, t0: performance.now(), lastUser: -1e9,
    extras: null, disposed: false, levelY: 0,
    ft: 0,                                   // flood: feet over the slab (0 = normal tide)
    stage: 0, storm: 0, flash: 0, nextBolt: 0, // storm: tab index, eased storm strength, lightning
    boatPivot: null, boatHome: new Vector3(), boatPos: new Vector3(), props: [], palmMats: [], groups: {}, anchors: [], byGroup: {},
    camGoal: null, deg: 0, degNow: 0, carPivot: null, dronePivot: null, droneHome: new Vector3()
  };

  function levelOf(ft, ex) {   // 0 = normal tide; 0 to 1 ft runs from the tide up to 1 ft over the slab; then feet over the slab
    if (ft <= 1) return MathUtils.lerp(ex.tide_m, ex.slab_m + ex.ft_m, ft);
    return ex.slab_m + ft * ex.ft_m;
  }
  function stormLevel(key, ex) {
    if (key === 'ts') return ex.tide_m + 0.35;
    if (key === 'c1') return -0.02;                   // just over the seawall, spilling onto the lawn's edge
    if (key === 'c3') return ex.slab_m + 2 * ex.ft_m;  // two feet inside the first floor
    return ex.tide_m;
  }
  function label(ft) {
    if (ft <= 0.01) return L === 'es' ? 'Marea normal' : 'Normal tide';
    const v = ft < 1 ? ft.toFixed(2) : ft.toFixed(ft % 1 ? 1 : 0);
    return L === 'es' ? v + (ft === 1 ? ' pie' : ' pies') : v + ' ft';
  }

  /* ---- controls of the figure, taken over (clones drop the frame-swapping listeners; dispose gives them back) ---- */
  const FRAME_FT = [0, 1, 2, 3, 4, 6, 8, 10, 12];
  const range = range0 ? range0.cloneNode(true) : null;
  const tabs = tabs0.map((b) => b.cloneNode(true));
  function wireControls() {
    if (MODE === 'car') {   // the slider turns the car through 360 degrees
      const idx = +range0.value || 0;
      range.min = '0'; range.max = '359'; range.step = '1'; range.value = String(idx * 30);
      range0.replaceWith(range);
      range.addEventListener('input', () => { setDeg(+range.value); kick(); try { o.dl && o.dl({ event: 'scene3d_level', scene: SCENE }); } catch (e) { /* analytics only */ } }, { passive: true });
      setDeg(+range.value);
    } else if (MODE === 'flood') {
      const idx = +range0.value || 0;
      range.min = '0'; range.max = String(FT_MAX); range.step = '0.25'; range.value = String(FRAME_FT[idx] || 0);
      range0.replaceWith(range);
      range.addEventListener('input', () => { setFt(+range.value); kick(); try { o.dl && o.dl({ event: 'scene3d_level', scene: SCENE }); } catch (e) { /* analytics only */ } }, { passive: true });
      setFt(+range.value);
    } else if (MODE === 'aerial' || MODE === 'condo' || MODE === 'gate' || MODE === 'drone') {
      cv.setAttribute('aria-label', fig.getAttribute('data-alt') || '');
      setStage(0);
      if (MODE === 'condo') {   // the figure's own toggles keep working; the scene reads their pressed state after each click
        lbtns.forEach((b) => b.addEventListener('click', () => { setTimeout(() => { applyLayers(); kick(); try { o.dl && o.dl({ event: 'scene3d_layer', scene: SCENE, layer: b.getAttribute('data-layer') }); } catch (e) { /* analytics only */ } }, 0); }));
        applyLayers();
      }
    } else {
      tabs0.forEach((b, i) => b.replaceWith(tabs[i]));
      const cur = Math.max(0, tabs.findIndex((b) => b.getAttribute('aria-pressed') === 'true'));
      tabs.forEach((b, i) => b.addEventListener('click', () => {
        tabs.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        setStage(i); kick();
        try { o.dl && o.dl({ event: 'scene3d_tab', scene: SCENE, tab: STAGES[i].key }); } catch (e) { /* analytics only */ }
      }));
      setStage(cur);
    }
  }
  function setFt(ft) {
    state.ft = ft;
    const txt = label(ft);
    range.setAttribute('aria-valuetext', txt);
    if (out) out.textContent = txt;
    cv.setAttribute('aria-label', (L === 'es' ? 'Casa hipotética en 3D: ' : 'Hypothetical home in 3D: ') + txt);
  }
  function setDeg(d) {
    state.deg = d;
    const txt = Math.round(d) + '\u00b0';
    range.setAttribute('aria-valuetext', txt);
    if (out) out.textContent = txt;
    cv.setAttribute('aria-label', (fig.getAttribute('data-alt') || '').replace('{label}', txt));
  }
  // where a camera from the Unreal scene really looks: its line of sight meets the ground (or the car's height)
  function camGoal(ch, planeY) {
    const cp = new Vector3().fromArray(ch.position), d = new Vector3().fromArray(ch.target).sub(cp).normalize(), py = planeY || 0;
    const dist = d.y < -0.03 ? Math.min(70, (cp.y - py) / -d.y) : 20;
    return { pos: cp, target: cp.clone().addScaledVector(d, dist) };
  }
  function setStage(i) {
    state.stage = i;
    const s = STAGES[i], name = tabs[i] ? tabs[i].textContent : s.key;
    if (TABBED) {
      if (out) out.textContent = name;
      cv.setAttribute('aria-label', (L === 'es' ? 'Casa hipotética en 3D: ' : 'Hypothetical home in 3D: ') + name);
    }
    // props: closed or open shutters, furniture, pool cover, generator, trailer, damage
    const show = s.show || (s.key === 'after' ? 'storm_c3' : s.key);
    if (FRAMED && s.cam && state.extras && state.extras[s.cam] && state.camReady) {   // fly to this tab's camera
      state.camGoal = camGoal(state.extras[s.cam]); state.cam = state.extras[s.cam]; state.lastUser = performance.now();
    }
    state.props.forEach((n) => { n.visible = n.userData.sets.indexOf(show) >= 0; });
    if (lawnDebris) lawnDebris.visible = s.key === 'after';
    renderer.shadowMap.needsUpdate = true;
  }

  /* ---- condo layers: tint the parts each pressed toggle covers, in the toggle's own colour ---- */
  function applyLayers() {
    Object.keys(state.byGroup).forEach((g) => state.byGroup[g].forEach((n) => { n.material.color.copy(n.material.userData.base); n.material.emissive.copy(n.material.userData.baseE); }));
    lbtns.forEach((b) => {
      if (b.getAttribute('aria-pressed') !== 'true') return;
      const tint = new Color((b.style.getPropertyValue('--sw') || '#C29B40').trim());
      (LAYER_GROUPS[b.getAttribute('data-layer')] || []).forEach((g) => (state.byGroup[g] || []).forEach((n) => {
        n.material.color.copy(n.material.userData.base).lerp(tint, 0.55); n.material.emissive.copy(tint).multiplyScalar(0.35);
      }));
    });
  }

  /* ---- palms bend with the wind (vertex shader on the palm materials; the bend grows with height) ---- */
  function windPalms(mat) {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uWind = { value: 0 }; sh.uniforms.uT = { value: 0 }; sh.uniforms.uDir = { value: WIND };
      sh.vertexShader = 'uniform float uWind; uniform float uT; uniform vec3 uDir;\n' + sh.vertexShader.replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        'vec3 wpB = (modelMatrix * vec4(transformed, 1.0)).xyz; float hB = max(wpB.y, 0.0);',
        'float gust = 0.85 + 0.25 * sin(uT * 1.7 + wpB.x * 0.35) + 0.12 * sin(uT * 4.3 + wpB.z);',
        'vec3 dB = uDir * uWind * gust * 0.03 * hB * hB; dB.y = -0.25 * length(dB) * min(1.0, hB / 7.0);',
        'transformed += inverse(mat3(modelMatrix)) * dB;'].join('\n'));
      mat.userData.shader = sh;
    };
    mat.customProgramCacheKey = () => 'palms-wind';
    state.palmMats.push(mat);
  }

  /* ---- loading ---- */
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const loadGltf = (url) => new Promise((res, rej) => loader.load(url, res, undefined, rej));
  function fail(why) {
    if (state.disposed) return;
    dispose();
    try { o.dl && o.dl({ event: 'scene3d_ready', scene: SCENE, mode: 'fallback', reason: why }); } catch (e) { /* analytics only */ }
  }
  function prepare(root, isProps) {
    const boatNodes = [];
    root.traverse((n) => {
      if (!n.isMesh) return;
      const ud = (n.userData && n.userData.group) ? n.userData : (n.parent && n.parent.userData) || {};
      const g = ud.group || '';
      n.geometry = toCreasedNormals(n.geometry, Math.PI / 5);
      const m = n.material;
      if (m) { m.side = 0; if (g === 'glass') { m.roughness = 0.08; m.metalness = 0.0; } }
      if (m && g === 'palms' && MODE === 'storm') { n.material = m.clone(); windPalms(n.material); }   // own copy: only palms bend
      if (m && MODE === 'condo') {   // own copy per part, so a layer can tint its parts only
        n.material = m.clone(); n.material.userData.base = n.material.color.clone(); n.material.userData.baseE = n.material.emissive.clone();
        if (/glass/i.test(m.name || '')) { n.material.transparent = true; n.material.opacity = 0.32; n.material.depthWrite = false; n.castShadow = false; }   // see into the unit
        (state.byGroup[g] = state.byGroup[g] || []).push(n);
      }
      n.castShadow = SHADOWS && g !== 'lawn' && g !== 'street' && g !== 'skyline';
      n.receiveShadow = SHADOWS;
      if (isProps) { n.userData.sets = ud.sets || []; n.userData.grp = g; n.visible = false; state.props.push(n); }
      else {
        if (g === 'boat' || g === 'engine') boatNodes.push(n);
        n.updateWorldMatrix(true, false);
        (state.groups[g] = state.groups[g] || new Box3()).expandByObject(n);
      }
    });
    if (boatNodes.length) {   // one pivot at the boat's centre, so it can ride, rock and move as one piece
      const box = new Box3(); boatNodes.forEach((n) => box.expandByObject(n));
      const c = box.getCenter(new Vector3()); c.y = box.min.y;
      const pivot = new Group(); pivot.position.copy(c); scene.add(pivot);
      boatNodes.forEach((n) => { pivot.attach(n); });
      state.boatPivot = pivot; state.boatHome.copy(c); state.boatPos.copy(c);
    }
  }

  const ready = new Promise((resolve, reject) => {   // returned at the end, after the loop and listeners below exist
    Promise.all([loadGltf(MODE === 'condo' ? CONDO : MODE === 'car' ? CAR : MODEL), (TABBED || MODE === 'gate' || MODE === 'drone') ? loadGltf(PROPS) : Promise.resolve(null)]).then(([gltf, props]) => {
      try {
        const root = gltf.scene, ex = (gltf.scenes[0] && gltf.scenes[0].userData) || {};
        if (ex.tide_m == null) throw new Error('model without metadata');
        state.extras = ex; state.levelY = ex.tide_m;
        prepare(root, false); scene.add(root);
        if (props) { prepare(props.scene, true); scene.add(props.scene); }
        const ch = ex[MODE === 'aerial' ? 'cam_aerial' : (STAGES[0].cam || 'cam_hero')] || ex.cam_hero;
        state.cam = ch;
        camera.position.fromArray(ch.position); controls.target.fromArray(ch.target);
        if (FRAMED) {   // start exactly where the Unreal camera stood, looking where it looked
          const g = camGoal(ch, MODE === 'car' ? 0.55 : 0);
          camera.position.copy(g.pos); controls.target.copy(g.target);
          if (MODE === 'car') {   // a studio: key light from the camera side, a cool rim behind, a brighter exposure
            water.visible = false; controls.minPolarAngle = 0.6; controls.maxPolarAngle = 1.5;
            renderer.toneMappingExposure = 1.5;
            const key = new DirectionalLight(C('#fff2e0'), 2.6); key.position.copy(g.pos).add(new Vector3(0, 6, 0)); key.target.position.copy(g.target); scene.add(key); scene.add(key.target);
            const rim = new DirectionalLight(C('#bcd4ff'), 1.8); rim.position.copy(g.target).sub(g.pos).setY(0).normalize().multiplyScalar(10).add(g.target).add(new Vector3(0, 4, 0)); rim.target.position.copy(g.target); scene.add(rim); scene.add(rim.target);
          }
          if (MODE === 'gate') {   // night: brighter windows, warm light at the gate and porch
            scene.traverse((n) => { if (n.isMesh && n.material && n.material.emissive && n.material.emissive.getHex()) n.material.emissiveIntensity = (n.material.emissiveIntensity || 1) * 1.6; });
            const pl = new PointLight(C('#ffcf8a'), 34, 18, 2); pl.position.copy(g.target).add(new Vector3(0, 3.2, 0)); scene.add(pl);
            const pl2 = new PointLight(C('#ffd9a8'), 18, 14, 2); pl2.position.copy(g.target).lerp(g.pos, 0.35).add(new Vector3(0, 2.5, 0)); scene.add(pl2);
          }
        } else if (MODE === 'condo') {   // the cutaway: aim at the unit's centre from the render's direction
          const c = new Box3(); Object.keys(state.groups).forEach((g) => c.union(state.groups[g]));
          const cp = new Vector3().fromArray(ch.position), ctr = c.getCenter(new Vector3());
          controls.target.copy(ctr);
          camera.position.copy(ctr).add(cp.sub(ctr).multiplyScalar(1.05));
          controls.minPolarAngle = 0.5; controls.maxPolarAngle = 1.5;
          water.visible = false;
        } else if (MODE === 'aerial') {   // the drone view: orbit the estate's centre, a little higher and wider than the still
          const c = new Box3(); ['house', 'pool', 'dock', 'gate', 'car', 'kitchen'].forEach((g) => { if (state.groups[g]) c.union(state.groups[g]); });
          // keep the drone's direction and its true distance: where its line of sight meets the ground
          const cp = new Vector3().fromArray(ch.position), d = new Vector3().fromArray(ch.target).sub(cp).normalize();
          const hit = cp.clone().addScaledVector(d, d.y < -0.05 ? -cp.y / d.y : 80);
          controls.target.copy(c.getCenter(new Vector3())); controls.target.y = 0;
          camera.position.copy(controls.target).add(cp.sub(hit).multiplyScalar(1.08));
          controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.1;
          pins.forEach((pn) => { const b = state.groups[PIN_GROUPS[pn.getAttribute('data-id')]]; if (b) state.anchors.push({ el: pn, p: new Vector3((b.min.x + b.max.x) / 2, b.max.y + 0.6, (b.min.z + b.max.z) / 2), left: pn.style.left, top: pn.style.top }); });
        } else {
          // a little further back than the still, so the whole estate and the waterline fit at 16:9
          controls.target.y -= 1.2;
          camera.position.sub(controls.target).multiplyScalar(1.38).add(controls.target);
          if (MODE === 'reno' && state.groups.house) {   // look from the side where the addition goes up, angled toward the hero view
            if (props) props.scene.updateMatrixWorld(true);
            const add = new Box3(); state.props.forEach((n) => { if (n.userData.grp === 'addition') add.expandByObject(n); });
            if (!add.isEmpty()) {
              const hc = state.groups.house.getCenter(new Vector3()), ac = add.getCenter(new Vector3());
              const hero = camera.position.clone().sub(controls.target), hy = hero.y, flat = Math.sqrt(Math.max(1, hero.lengthSq() - hy * hy));
              const dir = ac.clone().sub(hc).setY(0).normalize().lerp(hero.clone().setY(0).normalize(), 0.4).normalize();
              controls.target.copy(hc).lerp(ac, 0.45); controls.target.y = 1.2;
              camera.position.copy(controls.target).addScaledVector(dir, flat * 1.35); camera.position.y = controls.target.y + hy * 1.25;
              controls.minDistance = controls.maxDistance = camera.position.distanceTo(controls.target);
            }
            state.cam = { position: camera.position.toArray(), target: controls.target.toArray() };
          }
        }
        controls.minDistance = controls.maxDistance = camera.position.distanceTo(controls.target);
        controls.update();
        state.camReady = true;
        const pivotOf = (pick) => {   // one group at the picked nodes' centre, so they turn or fly as one piece
          const nodes = []; scene.traverse((n) => { if (n.isMesh && pick(n)) nodes.push(n); });
          if (!nodes.length) return null;
          const b = new Box3(); nodes.forEach((n) => b.expandByObject(n));
          const pv = new Group(); pv.position.copy(b.getCenter(new Vector3())); scene.add(pv); nodes.forEach((n) => pv.attach(n));
          return pv;
        };
        if (MODE === 'car') state.carPivot = pivotOf((n) => { const g = (n.userData.group || (n.parent && n.parent.userData.group) || ''); return g === 'car' || g === 'spin'; });
        if (MODE === 'drone') {   // shown a little larger than life so it reads as the subject
          state.dronePivot = pivotOf((n) => n.userData.grp === 'drone');
          if (state.dronePivot) { state.droneHome.copy(state.dronePivot.position); state.dronePivot.scale.setScalar(2.4); }
        }
        controls.addEventListener('start', () => { state.drag = true; state.lastUser = performance.now(); kick(); });
        controls.addEventListener('end', () => { state.drag = false; state.lastUser = performance.now(); });
        controls.addEventListener('change', () => { if (state.drag) state.lastUser = performance.now(); kick(); });
        wireControls();
        resize();
        renderer.compile(scene, camera);
        renderer.shadowMap.needsUpdate = true;
        frame(performance.now());
        // fade in over the frames, relabel the badge, add the drag hint on pointer devices, then tell the page
        if (badge) badge.textContent = L === 'es' ? '3D en vivo' : 'Live 3D';
        if (!lite) { hint = document.createElement('span'); hint.className = 'scn-hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = L === 'es' ? 'Arrastre para girar' : 'Drag to turn'; stage.appendChild(hint); }
        requestAnimationFrame(() => { cv.classList.add('on'); fig.classList.add('scn-is-3d'); });
        try { o.dl && o.dl({ event: 'scene3d_ready', scene: SCENE, mode: lite ? 'lite' : 'full' }); } catch (e) { /* analytics only */ }
        resolve({ dispose });
      } catch (e) { fail('build-error'); reject(e); }
    }, (e) => { fail('load-error'); reject(e); });

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
  const ease = (a, b, k) => a + (b - a) * k;
  let lastDraw = 0;
  function frame(now) {
    state.raf = 0;
    if (!want() || !state.extras) return;
    if (lite && !o.uncapped && now - lastDraw < 31) { state.raf = requestAnimationFrame(frame); return; }   // about 30 fps on phones
    const dtS = Math.min(0.1, (now - (lastDraw || now)) / 1000);
    lastDraw = now;
    const t = (now - state.t0) / 1000, ex = state.extras, k = reduced ? 1 : 0.045;
    let target, settled = true;

    if (MODE === 'flood') {
      target = levelOf(state.ft, ex);
    } else {
      const s = STAGES[state.stage], sk = SKIES[s.sky];
      target = stormLevel(s.water, ex);
      state.storm = ease(state.storm, s.storm, k); if (Math.abs(state.storm - s.storm) < 0.002) state.storm = s.storm; else settled = false;
      // the look eases between skies
      ['top', 'mid', 'low'].forEach((c) => { look[c].lerp(sk[c], k); if (Math.abs(look[c].r - sk[c].r) + Math.abs(look[c].g - sk[c].g) + Math.abs(look[c].b - sk[c].b) > 0.004) settled = false; });
      look.sun = ease(look.sun, sk.sun, k); look.hemi = ease(look.hemi, sk.hemi, k);
      scene.fog.color.lerp(sk.fog, k); scene.fog.near = ease(scene.fog.near, sk.near, k); scene.fog.far = ease(scene.fog.far, sk.far, k);
      water.material.uniforms.fogNear.value = scene.fog.near; water.material.uniforms.fogFar.value = scene.fog.far;
      water.material.uniforms.skyc.value.copy(look.low).lerp(look.mid, 0.4);
      // lightning from Category 1 up
      if (!reduced && state.storm > 0.6 && t > state.nextBolt) { state.flash = 1; state.nextBolt = t + 2.5 + Math.random() * 5; }
      state.flash = Math.max(0, state.flash - dtS * 6);
      sun.intensity = look.sun; hemi.intensity = look.hemi + state.flash * 2.2;
      sky.material.uniforms.flash.value = state.flash * 0.45;
      sky.material.uniforms.glow.value = ease(sky.material.uniforms.glow.value, s.sky === 'dawn' ? 0.6 : s.sky === 'gray' ? 0.12 : 0.0, k);
      // the sun swings to the east for the morning after
      const sd = s.sky === 'dawn' ? new Vector3(0.9, 0.18, -0.35).normalize() : (s.sky === 'day' || s.sky === 'studio') ? new Vector3(-0.45, 0.8, 0.4).normalize()
        : s.sky === 'night' ? new Vector3(0.35, 0.55, 0.6).normalize() : SUN_DIR;
      sun.position.lerp(sd.clone().multiplyScalar(60), k);
      water.material.uniforms.sun.value.copy(sun.position).normalize();
      sky.material.uniforms.sun.value.copy(sun.position).normalize();
      water.material.uniforms.rough.value = 1 + 2.2 * state.storm;
      water.material.uniforms.spec.value = 1 - 0.85 * state.storm;
      // wind on the palms, rain, flying debris
      state.palmMats.forEach((m) => { const sh = m.userData.shader; if (sh) { sh.uniforms.uWind.value = state.storm; sh.uniforms.uT.value = reduced ? 0 : t; } });
      if (rain) { rain.visible = state.storm > 0.03; rain.material.uniforms.amount.value = state.storm; rain.material.uniforms.t.value = reduced ? 0 : t; }
      const flyOn = state.storm > 0.55;
      flyers.forEach((m, i) => {
        m.visible = flyOn && i < flyers.length * (state.storm - 0.45) * 2;
        if (!m.visible) return;
        const u = m.userData, d = ((reduced ? 0 : t) * u.sp + u.ph) % 60 - 30;
        m.position.set(WIND.x * d + u.side * Math.abs(WIND.z), u.h + Math.sin(t * 2 + u.ph) * 0.8, WIND.z * d + u.side * Math.abs(WIND.x) * 0.3);
        m.rotation.set(t * u.spin, t * u.spin * 0.7, t * u.spin * 0.4);
      });
      // the boat: on the trailer, at the dock riding the surge, or stranded on the lawn the morning after
      if (state.boatPivot) {
        const dest = s.boat === 'trailer' ? new Vector3(9, 0.86, -41).add(state.boatHome)
          : s.boat === 'lawn' ? new Vector3(15, 0.0, -10).add(state.boatHome) : state.boatHome.clone();
        const rideY = s.boat === 'dock' ? Math.max(0, state.levelY - ex.tide_m) : (s.boat === 'lawn' ? 0.3 - state.boatHome.y : 0);
        dest.y += rideY;
        state.boatPos.lerp(dest, s.boat === 'dock' ? 0.25 : k);
        state.boatPivot.position.copy(state.boatPos);
        const rock = reduced ? 0 : (0.02 + 0.12 * state.storm) * Math.sin(t * (1.1 + state.storm * 1.5));
        state.boatPivot.rotation.set(s.boat === 'lawn' ? 0.22 : rock, s.boat === 'lawn' ? 0.6 : 0, s.boat === 'lawn' ? 0.08 : rock * 0.6);
        if (state.boatPos.distanceTo(dest) > 0.01) settled = false;
      }
    }

    // water eases toward its level (feels like water, not a jump)
    state.levelY += (target - state.levelY) * (reduced ? 1 : MODE === 'flood' ? 0.12 : 0.03);
    if (Math.abs(target - state.levelY) < 0.0005) state.levelY = target; else settled = false;
    const y = state.levelY;
    water.position.y = y;
    const flood = MathUtils.smoothstep(y, ex.tide_m + 0.15, ex.slab_m + ex.ft_m);
    water.material.uniforms.flood.value = flood;
    water.material.uniforms.t.value = reduced ? 0 : t;

    if (MODE === 'flood') {
      // the boat rides the water once it is above its resting line
      if (state.boatPivot) {
        const lift = Math.max(0, y - ex.tide_m);
        state.boatPivot.position.set(state.boatHome.x, state.boatHome.y + lift + (reduced ? 0 : Math.sin(t * 1.1) * 0.03 * (lift > 0.05 ? 1 : 0.4)), state.boatHome.z);
      }
      floatDebris.visible = state.ft >= 3;
      if (floatDebris.visible) floaters.forEach((m) => { m.position.y = y + 0.06 + (reduced ? 0 : Math.sin(t * 0.9 + m.userData.ph) * 0.05); if (!reduced) m.rotation.y += 0.0015; });
    }
    if (state.boatPivot) {   // redraw shadows only when the boat has moved a little
      const key = state.boatPivot.position.toArray().map((v) => v.toFixed(1)).join(',') + state.stage;
      if (key !== state.shadowKey) { state.shadowKey = key; renderer.shadowMap.needsUpdate = true; }
    }

    if (state.camGoal && !state.drag) {   // fly to the tab's camera
      const kc = reduced ? 1 : 0.07;
      camera.position.lerp(state.camGoal.pos, kc); controls.target.lerp(state.camGoal.target, kc);
      controls.minDistance = controls.maxDistance = camera.position.distanceTo(controls.target);
      if (camera.position.distanceTo(state.camGoal.pos) < 0.02 && controls.target.distanceTo(state.camGoal.target) < 0.02) state.camGoal = null; else settled = false;
    }
    if (state.dronePivot) {   // the drone hovers and circles slowly over the pool
      const tt = reduced ? 0 : t;
      state.dronePivot.position.set(state.droneHome.x + Math.sin(tt * 0.35) * 1.4, state.droneHome.y + Math.sin(tt * 1.4) * 0.12, state.droneHome.z + Math.cos(tt * 0.35) * 1.4 - 1.4);
      state.dronePivot.rotation.set(Math.sin(tt * 0.9) * 0.04, tt * 0.35, Math.cos(tt * 0.7) * 0.04);
    }
    if (state.carPivot) {   // the slider's angle, eased
      state.degNow += (state.deg - state.degNow) * (reduced ? 1 : 0.15);
      if (Math.abs(state.deg - state.degNow) < 0.05) state.degNow = state.deg; else settled = false;
      state.carPivot.rotation.y = MathUtils.degToRad(state.degNow);
    }
    // idle sway when nobody is dragging (never with reduced motion); a shake at Category 3
    if (!reduced && !state.drag && !state.camGoal && now - state.lastUser > 4000) {
      const off = Math.sin(t * 0.12) * 0.06;
      const r = controls.minDistance, tg = controls.target, base = Math.atan2(state.cam.position[0] - tg.x, state.cam.position[2] - tg.z);
      const yy = camera.position.y, rr = Math.sqrt(Math.max(1, r * r - (yy - tg.y) * (yy - tg.y)));
      camera.position.set(tg.x + Math.sin(base + off) * rr, yy, tg.z + Math.cos(base + off) * rr);
    }
    controls.update();
    if (!reduced && MODE === 'storm' && state.storm > 0.85) camera.position.y += Math.sin(t * 23) * 0.015 * state.storm;
    renderer.render(scene, camera);
    if (state.anchors.length) {   // the pins ride on their objects
      const v = new Vector3();
      state.anchors.forEach((a) => {
        v.copy(a.p).project(camera);
        const on = v.z < 1 && Math.abs(v.x) < 1.02 && Math.abs(v.y) < 1.02;
        a.el.style.left = ((v.x + 1) * 50).toFixed(2) + '%'; a.el.style.top = ((1 - v.y) * 50).toFixed(2) + '%';
        a.el.style.visibility = on ? '' : 'hidden';
      });
    }

    // quality guard: if the first 90 frames average over 28 ms, drop to the phone settings (no shadows, lower resolution)
    const ft = now - (state.prev || now); state.prev = now;
    if (!state.degraded && state.n < 90) { state.n++; if (state.n > 10) state.sum += ft; }
    if (!state.degraded && state.n === 90 && state.sum / 80 > 28) {
      state.degraded = true; renderer.shadowMap.enabled = false;
      scene.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; if (m.material) [].concat(m.material).forEach((x) => { x.needsUpdate = true; }); } });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)); resize();
      try { o.dl && o.dl({ event: 'scene3d_quality', scene: SCENE, mode: 'degraded' }); } catch (e) { /* analytics only */ }
    }
    const moving = !reduced || !settled;
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
    if (range && range !== range0 && range.parentNode) {   // give the frames back their own slider
      let best = 0; FRAME_FT.forEach((f, i) => { if (Math.abs(f - state.ft) < Math.abs(FRAME_FT[best] - state.ft)) best = i; });
      if (MODE === 'car') best = Math.round(state.deg / 30) % 12;
      range0.value = String(best); range.replaceWith(range0); range0.dispatchEvent(new Event('input'));
    }
    tabs.forEach((b, i) => { if (b.parentNode) b.replaceWith(tabs0[i]); });
    if (TABBED && tabs0[state.stage]) tabs0[state.stage].click();
    state.anchors.forEach((a) => { a.el.style.left = a.left; a.el.style.top = a.top; a.el.style.visibility = ''; });
    if (badge) badge.textContent = badgeText;
    if (hint) hint.remove();
  }
}
