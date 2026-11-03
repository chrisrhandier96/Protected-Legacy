# Interactive 3D scenes, Nov 3 2026

What changed:

1. Five guides now carry one interactive 3D illustration each, both languages, right after the summary box ("En resumen" / "In short"). The frames are Unreal renders of Casa Patrimonio, a hypothetical waterfront home (Unreal session, `Downloads\ue-renders\pp\`). Every scene is labelled "Ilustración 3D / 3D illustration".
   - Flood (`flo`): "How high is the water?" slider, nine frames from normal tide to 12 ft above the first floor.
   - Homes and hurricanes (`res`): six tabs, prepared, not prepared, tropical storm, Category 1, Category 3, after.
   - Condos (`cnd`): cutaway unit with three toggles that tint the association's part, the unit finishes and the owner's belongings. The tints come from the render's ID mask, so they line up with the frame.
   - Umbrella (`lia`): aerial view with six numbered pins (pool, boat, PWC, cars and young drivers, events at home, household staff) linked to numbered notes under the image.
   - Renovations (`ren`): before, during the work, after.
2. Copy: every caption and note repeats a sentence the same guide already says, or a fact listed in `content/BRIEF.md` (FEMA one inch, FWC PWC shares, 768.125, the condo split from 718.111). No selling, no carriers, no limits. Source of all scene copy: `tools/scenes/scenes.json`.
3. Images: `img/scenes/<key>/<frame>-{480,960,1600}.{avif,webp}`, 5 to 18 KB per frame at 960 (1.7 MB for all 27 frames in every size and format; a visitor downloads one size). Built by `tools/scenes/build_scene_images.py` (Pillow 11.3+ with AVIF, numpy), which also writes the condo tint layers and `tools/scenes/hotspots-lia.json` (pin positions from the mask).
4. Markup: `tools/post/add-scenes.js`, a new postbuild step (runs before the lead strip). Static HTML with a fixed 16:9 box, so the scenes add no layout shift. Script: `js/scenes.v1.js` (defer, immutable cache: rename it if it changes). It preloads a scene's frames when the scene is 600 px from the viewport and swaps frames only after the next one is decoded. One `scene_interact` dataLayer event per scene per page view (GTM can count use; nothing is tagged yet).
5. Umbrella guides, layout-shift fix (was live): the guided path filled its slot after the first paint and moved the card above the call-me strip, up to 0.55 CLS on phones when a visitor scrolled early (seen on the live site in about 1 run in 3). `tools/build_library.py` now emits `<style id="gp-reserve">` with the card's order and its measured height per language and width. Measured in Chrome with Playwright from 300 to 760 px. Measure again if the guided path's copy or CSS changes.
6. Tests: `site-tests/scenes-check.js` (each scene, both languages, phone and laptop: placement, first frame, every control, console errors, CLS under 0.02). `verify.js` accepts `CHANNEL=chrome` to use an installed Chrome instead of the Playwright download.

Why only five guides: the other nine sets (boats, garage, gallery, office, kitchen, rentals, drone, travel, boardroom) are blockout renders that would sit next to the guides' photographs without explaining anything. The five above are explainers, where the simple 3D style reads as a diagram.

Build: `python3 tools/check_content.py && python3 tools/build_library.py && python3 tools/flatten.py && node tools/postbuild.js` (images only when the renders change: `python3 tools/scenes/build_scene_images.py`).

Test: `node local-netlify.js .. 8787 &` then `BASE=http://localhost:8787 OUT=out-scenes node scenes-check.js` (add `CHANNEL=chrome` without the Playwright browser download).

Results before the merge (local build, Chrome):
- scenes-check.js: all passed (10 pages, phone and laptop).
- verify.js pages, crawl, img, lang, quiz, contact, tools, nav, expansion, newshots, visual: 53/56, and none of the 3 failures comes from this change. One is the known local-only `netlify.toml` quirk. The other two fail the same way on the live site: stale tests that still expect the old shared card (`/og.png`) on the guides and the old portrait name (`christian-retrato`) on the homepage. The site now uses per-guide share cards and `christian-emerald`; update those two assertions in `verify.js` when convenient.
- verify.js guidecta, leadpath, umbrella, hero: 30/30. The reserve lives in the head (`page(..., head_extra=)`), because the order check wants the guided path as the article's first element.

After the deploy (Nov 3): `/js/scenes.v1.js` answered 404 from Cloudflare on the live domain. A poll made before the deploy finished had stored the 404 under the `/js/*` one-year immutable header. Fix: the pages now load `/js/scenes.v2.js` (same code, new name). `scenes.v1.js` stays for any copy of a page cached with the old name. Rule: never request a new `/js/` URL on www.protectedlegacyfl.com until the HTML that references it is live. Watch the HTML, not the script.

## Live 3D scenes (Nov 3)

Five guides (ES + EN) upgrade their scene to live 3D when the device can take it. The rendered frames stay as the fallback
and come back if anything fails. Laptops can drag to turn; phones get a gentle sway (one finger still scrolls the page).

| Guide | Model | What the visitor does |
|---|---|---|
| Flood (`flo`) | casa.glb | The slider turns continuous, tide to 12 ft. Water eases to the level, teal then muddy brown green over land; the boat floats up; debris from 3 ft. |
| Hurricanes (`res`) | casa.glb + casa-props.glb | The six tabs: prepared (shutters closed, furniture stored, pool covered, boat on the trailer), not prepared, tropical storm, Category 1, Category 3 (wind bends the palms, rain, surge, flying debris, lightning, torn shutter and lifted tiles at Cat 3), the morning after (dawn, boat on the lawn, debris on the grass). |
| Renovations (`ren`) | casa.glb + casa-props.glb | The three tabs, seen from the addition's side: before, during (scaffolding, framed addition, dumpster, materials under tarps, new pilings), after (finished addition, new dock). |
| Umbrella (`lia`) | casa.glb | The drone view, turnable; the six numbered pins ride on the pool, boat, PWC, cars, outdoor kitchen and service gate, and still highlight their notes. |
| Condos (`cnd`) | condo.glb | The unit cutaway, turnable; the three coverage toggles tint the real parts (association: structure, railing, windows; owner: finishes; owner: belongings). |
| Boats (`mar`) | casa.glb + casa-props.glb | Three tabs fly the camera between the dock, the boat on its trailer by the gate, and the PWC on its lift. |
| Short-term rentals (`str`) | casa.glb + casa-props.glb | Two tabs: the guests' arrival at the gate (suitcases, lockbox, welcome mat) and out back (towels, pool toys, the dock chained off). |
| Kidnap and ransom (`kr`) | casa.glb + casa-props.glb | The gate at night: moonlight, lit windows, headlights inside the gate, cameras on the posts. |
| Aviation (`avi`) | casa.glb + casa-props.glb | A drone hovering and circling over the pool (shown larger than life). |
| Auto (`aut`) | car.glb | A generic sports car in a studio; the slider turns it through 360 degrees (the 12 turntable frames are the fallback). |

- Models in `img/scenes/flo3d/`: casa.glb 95 KB, casa-props.glb 50 KB, condo.glb 37 KB (meshopt, quantized). Exported from
  Unreal by `ue-renders/export_casa_glb.py` (custom: the stock glTF exporter skips Geometry Script meshes). Base estate:
  run after `RUN = ["build"]` of full_casa.py. Props: `PROPS = ["prep_on", "prep_off", "storm_ts", "storm_c1", "storm_c3",
  "ren_during", "ren_after"]`. Condo: `LEVEL = "/Game/UE_Renders/L_Condo_Unit"; OUT_NAME = "condo"; CAMS = {"cam_hero": "CAM_cnd_unit"}`.
  Then `npx gltf-transform meshopt in.glb img/scenes/flo3d/<name>.glb --level medium` from `tools/casa3d`.
- Code: `tools/casa3d/src/casa3d.js` (three.js r186, GLTFLoader, OrbitControls, meshopt decoder), one bundle for all five:
  `cd tools/casa3d && npm install && node build.mjs` writes `js/casa3d.v1.js` (174 KB gzip, loaded only near a scene).
  /js/ is immutable: change the content, bump the version (`--version 2`) and `live3d` in `tools/scenes/scenes.json`.
  `js/flood3d.v1.js` (the first flood-only build, live for a few hours on Nov 3) is kept for cached pages; nothing loads it now.
- Loader: inline `pp-scene3d-loader`, written by `tools/post/add-scenes.js` for any scene with `live3d`. Same gates as the
  homepage hero: `?no3d=1`, save-data or 2G/3G, under 4 GB or 4 cores, no WebGL2, software renderer. `?3d=1` forces it.
  Reduced motion gets the models with still water, no sway, no lightning.
- Performance: one render loop (a duplicate-loop bug made it crawl at 1 to 7 fps before the fix), renders only on screen and
  while the page is visible, shadows redrawn only when something moves, a quality guard drops to phone settings if the first
  90 frames average over 28 ms. Measured 60 fps on an Intel HD 530 at full quality.
- dataLayer: `scene3d_ready` (full, lite, or fallback with a reason), `scene3d_level`, `scene3d_tab`, `scene3d_layer`,
  `scene3d_quality`.
- Tests: `BASE=http://localhost:8787 OUT=out-casa3d CHANNEL=chrome node casa3d-check.js` (all five guides, both languages,
  laptop and phone; `ONLY=flo,res,ren,lia,cnd` to narrow). `scenes-check.js` checks the frames path (`?no3d=1`). Long runs on
  a low-memory laptop can hit ERR_INSUFFICIENT_RESOURCES in Chrome; rerun the one guide with ONLY.

v2 (Nov 3, same day): all ten scenes load `js/casa3d.v2.js` and the models in `img/scenes/3d/` (casa, casa-props, condo,
car). New path because /img/ is cached for a week and the models gained cameras (dock, gate, PWC lift, drone). Re-export
every model with `bash tools/export_web3d.sh` in the ue-renders repo. v1 files (`js/casa3d.v1.js`, `img/scenes/flo3d/`) stay
for cached pages. New scene kind `single` (one picture, no controls) and a per-scene `slider` label in scenes.json.

v3 (Nov 3, later): four interiors join, so all 14 guides with a scene now load `js/casa3d.v3.js` (175.8 KB gzip).

| Guide | Model | What the reader sees |
|---|---|---|
| Collections (`col`) | interior.glb | Two tabs: the gallery, then its display case, lit like a museum. |
| Personal cyber (`cyb`) | interior.glb + interior-props.glb | The home office at night with its screens on. |
| Household staff (`emp`) | interior.glb + interior-props.glb | The kitchen at 7 a.m., with signs of the staff's morning. |
| Boards (`brd`) | board.glb | Two tabs: the boardroom, then its table. |

- Indoors the camera stands where the render's camera stood and only looks around: about 26 degrees left or right and 14
  up or down, so it never sees through a wall. Shadows are off indoors because the ceiling would shade the whole room.
  Unreal's lights do not travel in glTF, so each room gets point lights: museum, screens, morning, or lamps.
- Models in `img/scenes/3d/`: interior.glb 153 KB, interior-props.glb 21 KB, board.glb 80 KB. To re-export, run
  `bash tools/export_interiors.sh` in the ue-renders repo. The frames for all four sit in `img/scenes/{col,cyb,emp,brd}`.
- v1 and v2 bundles stay unchanged for cached pages. Never rebuild a deployed version; build the next number.

Layout-shift fixes (Nov 3):
- `tools/post/nav-reserve.js` runs in postbuild after add-lead-strip. Below 430 px the top bar used to flip between two
  lines (93 px) and one (82 px) after first paint, a shift of up to 0.035 on every page. It now reserves 93 px.
- The homepages reserved the call-me strip's box only from 701 px up. On phones the strip arrived about 500 px tall with
  no reserved box, a shift of 0.35 on `/` and `/en/` (the live site had it too). The reserve inside index.html and en.html
  now has phone steps from 300 to 700 px, measured per language. The homepages now measure under 0.006 from 320 to 1280 px.
  Measure again if the strip copy or CSS changes.
- Still open: a font-swap shift of about 0.014 to 0.035 on `/en/guides/private-aviation/` at 390 px. The intro paragraph
  gains a line when Figtree replaces its Arial fallback. Scoring size-adjust from 99% to 103% across 10 pages and 3 phone
  widths showed today's 100.3% is already the best value. Preloading Figtree did not stop the shift on a slow connection and
  made the homepage LCP worse. It stays under Google's 0.1 threshold; scenes-check flags it because its own limit is 0.02.
- verify.js now accepts each guide's own share card (`img/og/<guide>-<lang>.jpg`) and checks those files, and the portrait
  check looks for `christian-emerald`.
