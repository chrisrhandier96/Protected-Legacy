# Hand-off notes: the 3D work order (2026-10-05)

Branch `work-order-2026-10-3d`. Full report in the session's RETURN block; speed numbers in `handoff/perf-2026-10/`.

## What was built

- **Home page speed (Part B).** Scroll and pointer handlers read no layout; the entrance and reveal animations use opacity and transform only; the headline shimmer and the eyebrow pulse run twice and stop; ambient animations pause off screen and in hidden tabs. The preloader keeps its look, is gone within 900 ms, and is skipped on repeat views in the session, on deep links (`#mapa`, `#contacto`) and on ad clicks (`gclid`). Sections after the domains use `content-visibility: auto` with measured sizes; `html.pp-nocv` turns it off for in-page jumps so anchors land exactly. The portrait and the five editorial plates are served from `/img` as AVIF, WebP and JPEG at rendered sizes (the plates were Pexels URLs before).
- **3D hero (Part C).** `tools/hero3d/src/main.js` is the scene; `node tools/hero3d/build.mjs --version N` writes `/js/hero3d.vN.js`. **Whenever the built file changes, bump N here and in both homepages** (`import('/js/hero3d.vN.js')` in the `pp-hero3d-loader` script), because `/js/*` is cached immutable. Install once with `cd tools/hero3d && npm install` (three 0.186.1, esbuild 0.28.2, pinned). The SVG skyline stays in the HTML as first paint and fallback. The inline loader decides: `?no3d=1` off, `?3d=1` forced on; otherwise off for reduced motion, Save-Data, 2g/3g, under 4 GB or 4 cores, no WebGL2, and for software renderers (SwiftShader, llvmpipe), detected in a worker so the main thread never pays for the probe. That last rule means Lighthouse, PageSpeed Insights and headless browsers see the SVG page; real browsers with a GPU get the 3D.
- **Protection map (Part D).** `#map3d` inside `.mapa-shell`, CSS 3D plus inline SVG, built when `#mapa` comes near the screen. It follows the quiz by wrapping `qSave`, `showResult` and `setLang` (the same pattern the conversion layer uses). Tile links use `GUIDE_URL`; the two quiz-only domains map to guides: `vid` (lifestyle) to the short-term rentals guide, `leg` (legacy) to the household staff and legacy guide.
- **Layers figures (Part E).** Optional `figure` field in `content/guides/lia.json` and `flo.json`; rendered by `render_figure()` in `tools/build_library.py`; checked by `tools/check_content.py` (parity, footnotes, banned words, and every caption must be verbatim guide text). To add one to another guide, add the field and rebuild.
- **Depth (Part F).** `.pp-tilt` cards with a `.pp-edge` gold edge light (JS adds the element on fine pointers only); scroll-driven label and headline animations inside `@supports (animation-timeline: view())`, transform only.
- **Fonts (Part G).** `tools/post/apply-fixes.js` now also declares `Marcellus Fallback`, `Figtree Fallback` and `Cormorant Fallback` (local system fonts with `size-adjust` and metric overrides computed from the web fonts), and refreshes the font block in every page on each build. The font stacks name them. This removed the 0.11 mobile layout shift seen on live.

## Tests

`site-tests/verify.js` has a new `three` group (3D hero, map, figures, phone fold, guide weights). The browser is launched with software WebGL flags so the hero can be exercised headless. Known local false failure: `netlify.toml not 200`. The local server (`site-tests/local-netlify.js`) now serves `.js` with a JavaScript MIME type (module imports need it).

## Christian's side (Tag Manager)

New `dataLayer` events: `hero3d_ready` (`mode`, `reason`), `hero3d_interact`, `map3d_view` (`blank_count`). Add them to the "Eventos del sitio" trigger regex and create Data Layer Variables for `mode`, `reason` and `blank_count`; register `mode` as a GA4 custom dimension to compare webgl and fallback visitors.
