# Work order: Unreal Engine for protectedlegacyfl.com and Hotel Domi (Nov 4, 2026)

For Claude Code on Christian's computer (Windows, Unreal Engine 5.8 installed, Claude Code connected to it on Nov 2).
Repo: `chrisrhandier96/Protected-Legacy` (Netlify deploys `main`). Unreal project: the `ue-renders` session project
in `Downloads\ue-renders\pp\`. Read `handoff/HANDOFF-2026-11-scenes.md` and `handoff/HANDOFF-2026-10-3d.md` first:
they describe the pipeline that already works (Unreal -> GLB -> three.js), and this order builds on it.

## 0. Plugin: use Epic's own, already installed

Christian asked for the best free Unreal plugin. The answer is the one that ships inside UE 5.8: **Unreal MCP** plus
its **AllToolsets** companion (both from Epic, free, experimental). Nothing to download.

1. In the editor: Edit > Plugins, search "Model Context Protocol", enable **Unreal MCP** and **AllToolsets**, restart.
2. The editor then runs an MCP server at `http://127.0.0.1:8000/mcp` (loopback only, no auth, which is fine on his
   machine). Also enable **Python Editor Script Plugin** and **Editor Scripting Utilities** (the GLB exporter needs them).
3. In the editor console run `ModelContextProtocol.GenerateClientConfig ClaudeCode`. It writes a `.mcp.json`
   next to the project. Copy that file into the repo root (do not commit it: add `.mcp.json` to `.gitignore`).
4. From a terminal in the repo: `claude` picks up `.mcp.json`; confirm with a tool call that lists actors in
   `/Game/UE_Renders/L_Casa_Patrimonio`.
5. Only if Epic's plugin cannot do a step (it is thin on some Blueprint and Sequencer work), fall back to the free
   community server `aadeshrao123/Unreal-MCP` (MIT/MPL, 288 commands, build it yourself for 5.8). Do not pay for the
   Pro edition.

Verified sources: PixelsDesign, "Unreal Engine MCP Explained" (Jul 6, 2026) for the 5.8 plugin, the loopback server
and the GenerateClientConfig command; the aadeshrao123/Unreal-MCP README for the community fallback.

## 1. What is already live (do not redo)

- 10 of 14 guides carry a live three.js scene built from Unreal GLB exports (flood slider, hurricane tabs, condo
  cutaway, umbrella pins, renovation tabs, boats, short-term rentals, K&R night gate, aviation drone, auto turntable).
- The homepage hero is a three.js scene (`js/hero3d.v1.js`), with a Flow/Veo video behind it on laptops.
- Rendered-frame fallbacks for every scene; gates for save-data, low-end devices, reduced motion; CLS under 0.02.
- Hotel Domi (the artifact) got 13 Google Flow stills on Nov 4; its 3D "worlds" are three.js canvases inside the page.

## 2. Scope of this order (ranked; do 2.1 and 2.2 first, then ask Christian before 2.3 and 2.4)

### 2.1 The four guides with no scene: cyber, household staff, boards, collections
Build one interactive scene each in Unreal, export as GLB (meshopt, under 120 KB), add to `tools/scenes/scenes.json`
and `tools/post/add-scenes.js`, both languages, same placement as the others (after the summary box).
- `cyb`: the home office at night. Toggles: "devices on the home network" (phones, laptops, cameras, thermostat light
  up one by one), "what a breach touches" (the lit devices turn coral). Caption facts only from the cyb guide.
- `emp`: the kitchen and service entrance. Tabs: a normal day; "who is on the property" (housekeeper, nanny, driver,
  gardener as neutral silhouettes, each with a pin to a note that repeats a sentence from the guide).
- `brd`: the boardroom. Toggles that light the chairs: directors, officers, volunteers (617.0834 language only).
- `col`: the gallery wall. Slider "appraisal age" that fades a frame from gold to grey; pins on the case, the wall, the
  safe. No limits, no carrier language, no "10 percent" style numbers (house rule).
Every caption must be a sentence the guide already says or a fact in `content/BRIEF.md`. Run `tools/check_content.py`.

### 2.2 Homepage: the hero becomes the estate, and the 14 domains get a map
- Replace the abstract hero scene with the Casa Patrimonio estate (the same `casa.glb`) at dusk, slow orbit, gated the
  same way as today. Keep the Veo video as the laptop fallback and the still for reduced motion. Bundle budget: the
  current `hero3d.v1.js` is 141 KB gzip; stay at or under it (share the three.js core with casa3d).
- "Los 14 dominios" section: on laptops, hovering a domain card lights the matching part of a small estate model next
  to the grid (roof for `res`, dock for `mar`, gate for `kr`, pool for `lia`, and so on). Phones keep the plain list.
  Target: no layout shift, under 60 KB of new assets.

### 2.3 Casa Patrimonio becomes one shared model with "coverage layers"
One GLB, one loader, used by every guide and the homepage. Each guide picks a camera and a layer set. This replaces
the per-scene variants and cuts the total download when a visitor reads several guides. Deliverable: a `layers`
block in `scenes.json` and a 1-page note on how to add a layer.

### 2.4 Hotel Domi worlds, rebuilt from Unreal
Christian said on Nov 3 the room worlds "look pointless and render badly" and feel disconnected. Build one tower in
Unreal (match the Nov 4 Flow banners: black stone, gold #ffc247 windows, one coral #ff8f6b neon edge), export:
- a 2048x1024 equirect sky and a 1024x512 night-city band for the page's existing `HotelArt` loader, and
- one `hotel.glb` (under 200 KB) with named nodes per room (`desk`, `brain`, `staff`, `library`, `domi`, `music`,
  `play`, `orders`, `contractors`, `rollout`, `first`) so the page can fly the camera from room to room instead of
  swapping disconnected worlds.
Hand the files to Claude (chat) to wire into the artifact; the page's code is in the artifact, not in this repo.

## 3. What NOT to do
- No Pixel Streaming and no HTML5 export: UE5 has no browser target, and streaming needs GPU servers per visitor.
  The path stays Unreal -> GLB -> three.js (static files on Netlify).
- No carrier names, no employer name, no insurer-set limits, no sales lines in any caption (`content/BRIEF.md`).
- No new JS file names reused: `/js/` is immutable-cached; bump the version suffix on every change.
- No em dashes anywhere. Spanish uses usted.
- Never run `tools/flatten.py` alone (it breaks every page). Run the chain: check_content, build_library, build_en,
  flatten, postbuild. After build_en, restore the English title, description, og:url, og:image and the honeypot label
  by hand (known generator gap, see FACTCHECK-2026-11.md).

## 4. Tests and the Inspector
- `node site-tests/local-netlify.js <abs repo path> 8787 &`
- `BASE=http://localhost:8787 OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/scenes-check.js` (all pages, both
  widths, CLS under 0.02, no console errors)
- `ONLY=pages,img,crawl,hero,visual,nav,lang BASE=... node site-tests/verify.js` (the `netlify.toml` served-locally
  failure is a known local artifact; everything else must pass)
- `node site-tests/casa3d-check.js` for every scene that uses the shared model
- Phone PageSpeed on the homepage and one guide must stay at 99
- Work on a branch, open a PR, and paste the test output in the PR body. Christian merges.

## RETURN FORMAT
Reply with, in this order:
1. PLUGIN: which plugin is enabled and the output of the first MCP tool call (actor list), or the error.
2. SCENES: a table, one row per new scene: guide key, GLB size, bundle delta, frames fallback (yes/no), both languages.
3. HOMEPAGE: hero bundle size before and after; domains map asset size; CLS numbers from scenes-check.
4. TESTS: the three test commands with pass/fail counts, and the PageSpeed phone scores.
5. OPEN: anything that needs Christian's call (copy that is not in a guide, a limit that would need a source).
6. PR: the branch name and PR link.
