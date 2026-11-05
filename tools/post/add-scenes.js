// Interactive 3D scenes (2026-11): puts one Unreal illustration right after the summary box ("En resumen" /
// "In short") on the flood, hurricane, condo, umbrella and renovation guides, both languages, and loads
// /js/scenes.v3.js. Copy and frames come from tools/scenes/scenes.json; images from tools/scenes/build_scene_images.py.
// The scene box has a fixed 16:9 aspect ratio and static controls, so it adds no layout shift.
// Idempotent: a page that already has a scene is left alone. Usage: node tools/post/add-scenes.js <repo root>
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'scenes', 'scenes.json'), 'utf8'));
const SCRIPT = '<script src="/js/scenes.v3.js" defer></script>';
const SIZES = '(min-width:1100px) 720px, (min-width:760px) 66vw, 100vw';

const CSS = '<style id="pp-scenes">'
  + '.scn{margin:28px 0 36px;padding:0;background:var(--blanco,#FDFBF6);border:1px solid var(--arena-oscura,#E7DDC7);border-radius:var(--r,16px);overflow:hidden}'
  + '.scn-head{padding:18px 20px 12px}'
  + '.scn-kick{display:block;font:600 .74rem/1.2 var(--body,sans-serif);letter-spacing:.12em;text-transform:uppercase;color:var(--oro-tx,#7E5F17)}'
  + '.scn-t{margin:6px 0 0;font:400 1.35rem/1.25 var(--display,serif);color:var(--verde,#14352A)}'
  + '.scn-stage{position:relative;aspect-ratio:16/9;background:#1b2a24;overflow:hidden}'
  + '.scn-stage picture,.scn-stage img{display:block;width:100%;height:100%}'
  + '.scn-stage img{object-fit:cover}'
  + '.scn-layer{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .25s ease;pointer-events:none}'
  + '.scn-layer.on{opacity:1}'
  + '.scn-badge{position:absolute;left:10px;top:10px;padding:4px 9px;border-radius:999px;background:rgba(13,36,28,.72);color:#FDFBF6;font:600 .7rem/1.3 var(--body,sans-serif);letter-spacing:.04em}'
  + '.scn-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:14px 20px 4px}'
  + '.scn-ctl label{flex:1 1 100%;font:600 .86rem/1.3 var(--body,sans-serif);color:var(--tinta,#22271F)}'
  + '.scn-range{flex:1 1 220px;accent-color:var(--oro,#C29B40);height:32px;margin:0}'
  + '.scn-out{flex:0 0 auto;min-width:7.5em;text-align:right;font:600 1rem/1.3 var(--body,sans-serif);color:var(--verde,#14352A)}'
  + '.scn-tab,.scn-lbtn{min-height:40px;padding:8px 14px;border-radius:999px;border:1px solid var(--arena-oscura,#E7DDC7);background:#fff;color:var(--tinta,#22271F);font:500 .9rem/1.2 var(--body,sans-serif);cursor:pointer}'
  + '.scn-tab[aria-pressed="true"]{background:var(--verde,#14352A);border-color:var(--verde,#14352A);color:#FDFBF6}'
  + '.scn-lbtn{display:inline-flex;align-items:center;gap:8px;text-align:left}'
  + '.scn-lbtn i{flex:0 0 14px;height:14px;border-radius:4px;background:var(--sw);opacity:.45}'
  + '.scn-lbtn[aria-pressed="true"]{border-color:var(--sw);box-shadow:inset 0 0 0 1px var(--sw)}'
  + '.scn-lbtn[aria-pressed="true"] i{opacity:1}'
  + '.scn-pin{position:absolute;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;border:2px solid #FDFBF6;background:var(--verde,#14352A);color:#FDFBF6;font:700 .9rem/1 var(--body,sans-serif);cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35)}'
  + '.scn-pin[aria-pressed="true"]{background:var(--oro,#C29B40);color:var(--verde-oscuro,#0D241C)}'
  + '.scn-notes{margin:14px 20px 0;padding:0;list-style:none;counter-reset:scn;display:grid;gap:8px}'
  + '.scn-notes li{counter-increment:scn;position:relative;padding:10px 12px 10px 46px;border-radius:var(--r-sm,12px);background:var(--arena,#F5EFE3);font:400 .92rem/1.45 var(--body,sans-serif);color:var(--tinta,#22271F);cursor:pointer}'
  + '.scn-notes li::before{content:counter(scn);position:absolute;left:12px;top:10px;width:24px;height:24px;border-radius:50%;background:var(--verde,#14352A);color:#FDFBF6;font:700 .8rem/24px var(--body,sans-serif);text-align:center}'
  + '.scn-notes li.on{background:var(--oro-palido,#EBD9A8)}'
  + '.scn-notes b{font-weight:600}'
  + '.scn figcaption{padding:12px 20px 18px;font:400 .86rem/1.5 var(--body,sans-serif);color:var(--humo-tx,#5F665A)}'
  + '@media(max-width:560px){.scn-head,.scn-ctl,.scn figcaption{padding-left:14px;padding-right:14px}.scn-notes{margin-left:14px;margin-right:14px}.scn-pin{width:28px;height:28px;font-size:.8rem}.scn-tab,.scn-lbtn{font-size:.84rem;padding:7px 11px}.scn-notes{gap:6px}.scn-notes li{padding:8px 10px 8px 40px;font-size:.84rem;line-height:1.4}.scn-notes li::before{left:10px;top:8px;width:22px;height:22px;line-height:22px;font-size:.75rem}}'
  + '.scn-3d{position:absolute;inset:0;z-index:1;display:block;width:100%;height:100%;opacity:0;transition:opacity .7s ease;cursor:grab}'
  + '.scn-3d.on{opacity:1}.scn-3d:active{cursor:grabbing}'
  + '.scn-badge,.scn-hint,.scn-pin{z-index:2}'
  + '.scn-hint{position:absolute;right:10px;top:10px;padding:4px 9px;border-radius:999px;background:rgba(13,36,28,.72);color:#FDFBF6;font:600 .7rem/1.3 var(--body,sans-serif);pointer-events:none}'
  + '@media(prefers-reduced-motion:reduce){.scn-layer,.scn-3d{transition:none}}'
  + '@media print{.scn{display:none}}'
  + '</style>';

// Live 3D loader (2026-11-03): upgrades a scene that has data-3d once it is 800 px from the viewport, with the same gates
// as the homepage hero: ?no3d=1, save-data or 2G/3G, under 4 GB memory or 4 cores, no WebGL2, or a software renderer keep
// the rendered frames. ?3d=1 forces it (tests). Reduced motion still gets the model, with still water and no sway.
const LOADER3D = '<script id="pp-scene3d-loader">(function(){var f=document.querySelector("figure.scn[data-3d]");if(!f||!("IntersectionObserver" in window))return;'
  + 'var q=location.search,force=/[?&]3d=1/.test(q),n=navigator,c=n.connection||{};'
  + 'var dl=function(o){o.page_type="guide";o.language=document.documentElement.lang;window.dataLayer=window.dataLayer||[];window.dataLayer.push(o);};'
  + 'function off(r){dl({event:"scene3d_ready",scene:f.getAttribute("data-scene"),mode:"fallback",reason:r});}'
  + 'if(/[?&]no3d=1/.test(q))return off("flag");'
  + 'if(!force){if(c.saveData||/(^|[^4])[23]g$/.test(c.effectiveType||""))return off("save-data");if((n.deviceMemory&&n.deviceMemory<4)||(n.hardwareConcurrency&&n.hardwareConcurrency<4))return off("low-device");}'
  + 'var rm=matchMedia("(prefers-reduced-motion: reduce)").matches,lite=matchMedia("(max-width:820px),(pointer:coarse)").matches;'
  + 'function load(){import(f.getAttribute("data-3d")).then(function(m){return m.start({fig:f,dl:dl,lite:lite,reduced:rm});}).catch(function(){off("load-error");});}'
  + 'function gpu(){if(!window.WebGL2RenderingContext)return off("no-webgl");if(force)return load();var ok=false;'
  + 'try{var w=new Worker(URL.createObjectURL(new Blob(["try{var g=new OffscreenCanvas(1,1).getContext(\'webgl2\'),d=g&&g.getExtension(\'WEBGL_debug_renderer_info\');postMessage(g?String(d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):\'gpu\'):\'\')}catch(e){postMessage(\'\')}"],{type:"text/javascript"})));'
  + 'w.onmessage=function(e){ok=true;w.terminate();var r=e.data;if(!r)return off("no-webgl");if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r))return off("low-device");load();};'
  + 'setTimeout(function(){if(!ok){w.terminate();load();}},3000);}catch(e){load();}}'
  + 'var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();gpu();}},{rootMargin:"800px 0px"});io.observe(f);})();</script>';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrJson = v => esc(JSON.stringify(v));

// slug -> guide key, from the content files
const BY_FILE = {};
for (const f of fs.readdirSync(path.join(ROOT, 'content', 'guides'))) {
  if (!f.endsWith('.json')) continue;
  const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'guides', f), 'utf8'));
  BY_FILE[`guias-${g.slug_es}.html`] = { key: g.key, l: 'es' };
  BY_FILE[`en-guides-${g.slug_en}.html`] = { key: g.key, l: 'en' };
}

function picture(key, frame, alt, eager) {
  const b = `/img/scenes/${key}/${frame}`;
  const set = f => `${b}-480.${f} 480w, ${b}-960.${f} 960w, ${b}-1600.${f} 1600w`;
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${SIZES}">`
    + `<img src="${b}-960.webp" srcset="${set('webp')}" sizes="${SIZES}" alt="${esc(alt)}" width="1600" height="900" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></picture>`;
}

function scene(key, l) {
  const sc = CFG.scenes[key]; const t = sc[l]; const ui = CFG.ui[l];
  const frames = sc.frames.map(f => f.name); const labels = sc.frames.map(f => f[l]);
  const alt0 = t.alt.replace('{label}', labels[0]);
  const id = `scn-${key}`;
  let stage = picture(key, frames[0], alt0, false), ctl = '', notes = '';
  if (sc.kind === 'slider') {
    ctl = `<div class="scn-ctl"><label for="${id}-r">${esc(t.slider || ui.slider)}</label>`
      + `<input class="scn-range" id="${id}-r" type="range" min="0" max="${frames.length - 1}" step="1" value="0" aria-valuetext="${esc(labels[0])}">`
      + `<output class="scn-out" for="${id}-r" aria-live="polite">${esc(labels[0])}</output></div>`;
  } else if (sc.kind === 'single') {
    // one picture, no controls (the live 3D scene, when it loads, is the interaction)
  } else if (sc.kind === 'tabs') {
    ctl = `<div class="scn-ctl" role="group" aria-label="${esc(t.title)}">`
      + labels.map((x, i) => `<button type="button" class="scn-tab" data-i="${i}" aria-pressed="${i ? 'false' : 'true'}">${esc(x)}</button>`).join('')
      + `<output class="scn-out" aria-live="polite" hidden>${esc(labels[0])}</output></div>`;
  } else if (sc.kind === 'layers') {
    stage += sc.layers.map(y => `<img class="scn-layer" data-layer="${y.id}" data-src="/img/scenes/${key}/${sc.layers_frame}-${y.id}-960.webp" alt="" width="960" height="540" decoding="async">`).join('');
    ctl = `<div class="scn-ctl" role="group" aria-label="${esc(ui.layers)}">`
      + sc.layers.map(y => `<button type="button" class="scn-lbtn" data-layer="${y.id}" aria-pressed="false" style="--sw:${y.tint}"><i aria-hidden="true"></i>${esc(y[l])}</button>`).join('')
      + '</div>';
  } else if (sc.kind === 'hotspots') {
    const pos = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'scenes', `hotspots-${key}.json`), 'utf8'));
    const spots = sc.hotspots.filter(s => pos[s.id]);
    stage += spots.map((s, i) => `<button type="button" class="scn-pin" data-id="${s.id}" aria-pressed="false" style="left:${pos[s.id].x}%;top:${pos[s.id].y}%" aria-label="${i + 1}. ${esc(s[l][0])}">${i + 1}</button>`).join('');
    notes = `<ol class="scn-notes" aria-label="${esc(ui.spots)}">`
      + spots.map(s => `<li data-id="${s.id}"><b>${esc(s[l][0])}.</b> ${esc(s[l][1])}</li>`).join('') + '</ol>';
  }
  return `<figure class="scn scn-${sc.kind} no-print" id="${id}" data-scene="${key}" data-kind="${sc.kind}"${sc.live3d ? ` data-3d="${sc.live3d}"` : ''} data-frames="${attrJson(frames)}" data-labels="${attrJson(labels)}" data-alt="${esc(t.alt)}">`
    + `<div class="scn-head"><span class="scn-kick">${esc(ui.kicker)}</span><p class="scn-t">${esc(t.title)}</p></div>`
    + `<div class="scn-stage">${stage}<span class="scn-badge" aria-hidden="true">${esc(ui.badge)}</span></div>`
    + ctl + notes + `<figcaption>${esc(t.caption)}</figcaption></figure>`;
}

function afterSumbox(h) {
  // index just past the </div> that closes <div class="sumbox">
  const start = h.indexOf('<div class="sumbox">'); if (start < 0) return -1;
  const re = /<div\b|<\/div>/g; re.lastIndex = start; let depth = 0, m;
  while ((m = re.exec(h))) { depth += m[0] === '</div>' ? -1 : 1; if (depth === 0) return re.lastIndex; }
  return -1;
}

let touched = 0, skipped = 0, missing = [];
for (const f of fs.readdirSync(ROOT)) {
  const info = BY_FILE[f]; if (!info || !CFG.scenes[info.key]) continue;
  const p = path.join(ROOT, f); let h = fs.readFileSync(p, 'utf8'); const before = h;
  if (!h.includes('data-scene=')) {
    const at = afterSumbox(h);
    if (at < 0) { missing.push(f); continue; }
    h = h.slice(0, at) + '\n    ' + scene(info.key, info.l) + h.slice(at);
  }
  if (!h.includes('/js/scenes.v3.js')) h = h.replace(/<\/body>/, SCRIPT + '\n</body>');
  if (CFG.scenes[info.key].live3d && !h.includes('id="pp-scene3d-loader"')) h = h.replace(/<\/body>/, LOADER3D + '\n</body>');
  if (!h.includes('id="pp-scenes"')) h = h.replace(/<\/head>/, CSS + '\n</head>');
  if (h !== before) { fs.writeFileSync(p, h); touched++; } else skipped++;
}
process.stdout.write(`add-scenes: ${touched} page(s) changed, ${skipped} already done${missing.length ? ', NO SUMMARY BOX: ' + missing.join(' ') : ''}\n`);
if (missing.length) process.exitCode = 1;
