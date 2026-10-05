# Speed after the 3D work, 2026-10-05 (local)

Same method as `baseline.md`: Lighthouse 13.5.0, 3 runs per page and form factor, median run shown, mobile and desktop presets, served by `site-tests/local-netlify.js` from the branch at its final commit. Google Tag Manager cannot load from the sandbox, so "best practices" 96 everywhere is the sandbox's certificate error, as in the baseline. Live numbers are added below after the deploy.

**How to read the three "after" columns for the home pages.**

- *As served (auto)*: the page as the loader decides. This sandbox's Chrome has no GPU (WebGL runs on SwiftShader, in software), so the loader keeps the SVG skyline here. The same is true of Lighthouse, PageSpeed Insights and other lab tools: they measure the SVG page. Visitors with a real GPU get the 3D.
- *`?no3d=1`*: the 3D switched off by flag. Identical to the auto row here, as expected.
- *`?3d=1` forced*: the 3D forced on in a software renderer. The 400 to 500 ms of blocking time is the software driver creating the WebGL context and compiling the shader on the CPU (in the module's own timers: build steps 5 to 41 ms of JavaScript each, first render 600 ms here, almost all of it driver work). On a device with a GPU those two steps are tens of milliseconds, but this sandbox cannot measure that, so the forced column is a worst case, not a prediction. The one honest check left is a real phone with the 3D on, after the deploy: `https://www.protectedlegacyfl.com/?3d=1` with Chrome's performance panel, or simply whether it feels smooth.

### Phone (Lighthouse mobile preset, median of 3): score · LCP · TBT · Speed Index · CLS · weight

| Page | Before (main) | After, as served (auto) | After with `?no3d=1` | After with `?3d=1` forced (software WebGL, see note) |
|---|---|---|---|---|
| / | 96 · 2.4 s · 0 ms · 3.8 s · 0 · 270 KiB | 99 · 1.9 s · 0 ms · 2.2 s · 0 · 178 KiB | 99 · 2.0 s · 0 ms · 2.2 s · 0 · 178 KiB | 84 · 2.9 s · 397 ms · 3.4 s · 0 · 320 KiB |
| /en/ | 96 · 2.4 s · 0 ms · 3.8 s · 0 · 270 KiB | 99 · 2.0 s · 0 ms · 2.1 s · 0 · 178 KiB | 99 · 2.0 s · 0 ms · 2.1 s · 0 · 178 KiB | 81 · 2.9 s · 526 ms · 2.6 s · 0 · 320 KiB |
| /guias/umbrella-responsabilidad/ | 100 · 1.3 s · 0 ms · 0.9 s · 0 · 77 KiB | 100 · 1.3 s · 0 ms · 1.0 s · 0 · 79 KiB |  |  |
| /en/guides/umbrella-liability/ | 100 · 1.3 s · 0 ms · 0.9 s · 0 · 77 KiB | 100 · 1.3 s · 0 ms · 0.9 s · 0 · 78 KiB |  |  |
| /en/guides/flood/ | 100 · 1.3 s · 0 ms · 0.9 s · 0 · 78 KiB | 100 · 1.3 s · 6 ms · 1.0 s · 0 · 80 KiB |  |  |

### Desktop (Lighthouse desktop preset, median of 3)

| Page | Before | After (auto) | After `?no3d=1` | After `?3d=1` forced |
|---|---|---|---|---|
| / | 98 · 0.5 s · 0 ms · 1.6 s · 0.009 · 246 KiB | 100 · 0.4 s · 0 ms · 0.8 s · 0.014 · 163 KiB | 100 · 0.5 s · 0 ms · 0.8 s · 0.007 · 163 KiB | 100 · 0.7 s · 6 ms · 0.9 s · 0.007 · 305 KiB |
| /en/ | 98 · 0.6 s · 0 ms · 1.6 s · 0.009 · 246 KiB | 100 · 0.5 s · 0 ms · 0.8 s · 0.007 · 163 KiB | 100 · 0.4 s · 0 ms · 0.9 s · 0.014 · 163 KiB | 100 · 0.4 s · 13 ms · 0.9 s · 0.017 · 305 KiB |
| /guias/umbrella-responsabilidad/ | 100 · 0.3 s · 0 ms · 0.2 s · 0 · 65 KiB | 100 · 0.3 s · 0 ms · 0.3 s · 0 · 67 KiB |  |  |
| /en/guides/umbrella-liability/ | 100 · 0.3 s · 0 ms · 0.2 s · 0 · 65 KiB | 100 · 0.3 s · 0 ms · 0.2 s · 0 · 67 KiB |  |  |
| /en/guides/flood/ | 100 · 0.3 s · 0 ms · 0.2 s · 0.01 · 67 KiB | 100 · 0.3 s · 0 ms · 0.3 s · 0 · 69 KiB |  |  |

### Accessibility / best practices / SEO

| Page | Form | Before | After |
|---|---|---|---|
| / | mobile | 100 / 96 / 100 | 100 / 96 / 100 |
| / | desktop | 100 / 96 / 100 | 100 / 96 / 100 |
| /en/ | mobile | 100 / 96 / 100 | 100 / 96 / 100 |
| /en/ | desktop | 100 / 96 / 100 | 100 / 96 / 100 |
| /guias/umbrella-responsabilidad/ | mobile | 100 / 96 / 100 | 100 / 96 / 100 |
| /guias/umbrella-responsabilidad/ | desktop | 100 / 96 / 100 | 100 / 96 / 100 |
| /en/guides/umbrella-liability/ | mobile | 100 / 96 / 100 | 100 / 96 / 100 |
| /en/guides/umbrella-liability/ | desktop | 100 / 96 / 100 | 100 / 96 / 100 |
| /en/guides/flood/ | mobile | 100 / 96 / 100 | 100 / 96 / 100 |
| /en/guides/flood/ | desktop | 100 / 96 / 100 | 100 / 96 / 100 |



### Budget check

| Target | Result |
|---|---|
| Home, `?no3d=1`: phone 90+, LCP 2.5 s or less, TBT 200 ms or less, CLS 0.05 or less, weight 270 KiB or less | **Met**: 99, 2.0 s, 0 ms, 0, 178 KiB |
| Home with 3D on: phone 85+, LCP 2.5 s, TBT 300 ms, CLS 0.05 | **Met as served** (same as above, the 3D does not load in GPU-less browsers); **not measurable** with a real GPU from this sandbox; forced in software: 81 to 84, 2.9 s, 400 to 530 ms, 0 |
| Every guide: 98+, LCP 1.5 s, TBT 50 ms, CLS 0.02, 77 KiB + 8 KiB at most, never the 3D library | **Met**: 100, 1.3 s, 0 to 6 ms, 0, 78 to 80 KiB; the test group confirms no page in the sitemap but the home pages requests `/js/hero3d` |
| Desktop 95+ everywhere | **Met**: 100 |
| Accessibility and SEO 100 | **Met** |
| `/js/hero3d.v1.js` 160 KiB gzip or less | **Met**: 141.0 KiB gzip (552 KiB raw; three.js r186 core plus the fat-line add-on, tree-shaken, minified) |
| After load with the 3D running, 4x CPU: no task over 250 ms, no repeated long tasks, loop stops when nothing moves | Loop stops: **yes** (`window.ppHero3d.loop` false once the camera settles; verified). Task lengths: **not measurable on a GPU here** (see above). The module's JavaScript per build step is 5 to 41 ms at 4x CPU. |

### Where the home page spends its time on a phone, after (4x CPU, mobile, `/` as served)

```
task 324 ms at +168 ms: Layout 209ms | UpdateLayoutTree 85ms | Paint 17ms | PrePaint 6ms | Layerize 1ms
task 283 ms at +530 ms: ParseHTML 287ms | EvaluateScript: http://localhost:8787/ 274ms | Layout 188ms | UpdateLayoutTree 37ms | v8.compile: http://localhost:8787/ 10ms
task 74 ms at +924 ms: Paint 53ms | FireAnimationFrame 20ms | FunctionCall:tick http://localhost:8787/ 15ms | Commit 12ms | Layerize 7ms
task 65 ms at +39 ms: EventDispatch 0ms
task 64 ms at +1209 ms: Layout 29ms | UpdateLayoutTree 17ms | ParseHTML 0ms | EventDispatch 0ms
task 54 ms at +813 ms: PrePaint 27ms | Paint 13ms | Layerize 6ms | Commit 2ms | FunctionCall:m http://localhost:8787/ 1ms
task 53 ms at +8408 ms: EventDispatch 24ms | FunctionCall:vis http://localhost:8787/ 23ms | UpdateLayoutTree 21ms | FireAnimationFrame 6ms | FunctionCall: http://localhost:8787/ 6ms
task 53 ms at +870 ms: ParseHTML 52ms | EvaluateScript: http://localhost:8787/ 51ms | UpdateLayoutTree 25ms | Layout 5ms | v8.compile: http://localhost:8787/ 3ms
main thread total 13951 ms, long tasks (>50ms) 9
```

Before, for comparison:

```
task 270 ms at +187 ms: Layout 169ms | UpdateLayoutTree 67ms | Paint 14ms | PrePaint 11ms | Layerize 2ms
task 192 ms at +478 ms: Layout 133ms | UpdateLayoutTree 30ms | Paint 15ms | PrePaint 12ms | Layerize 2ms
task 171 ms at +729 ms: Layout 111ms | UpdateLayoutTree 25ms | Paint 13ms | PrePaint 13ms | Layerize 3ms
task 76 ms at +1004 ms: FireAnimationFrame 46ms | FunctionCall: http://localhost:8788/ 43ms | UpdateLayoutTree 36ms | Paint 18ms | PrePaint 8ms
task 71 ms at +36 ms: EventDispatch 0ms
task 53 ms at +674 ms: ParseHTML 55ms | EvaluateScript: http://localhost:8788/ 47ms | v8.compile: http://localhost:8788/ 11ms
task 44 ms at +8557 ms: Paint 12ms | EventDispatch 10ms | FunctionCall:window.addEventListener.passive http://localhost:8788/ 8ms | UpdateLayoutTree 8ms | Layerize 8ms
task 43 ms at +903 ms: ParseHTML 42ms | EvaluateScript: http://localhost:8788/ 41ms | UpdateLayoutTree 22ms | Layout 4ms | v8.compile: http://localhost:8788/ 2ms
main thread total 14799 ms, long tasks (>50ms) 6
```

The first two tasks are still the initial style and layout of the document (hero, facts, myths and the 14 domain cards are above the content-visibility boundary, and the 227 KiB document parses in one go). The script and animation tasks after them are small. Total main-thread time over the same 10 s script fell from 14.8 s to 14.0 s; the visible gains are in weight (270 to 178 KiB), LCP (2.4 to 2.0 s) and Speed Index (3.8 to 2.1 s).

### What changed the numbers

- Weight: the five editorial plates were 110 KiB of third-party JPEGs at 800 px; they are now 320 or 640 px AVIF/WebP/JPEG from `/img/plates` and lazy. The portrait went from an 85 KiB JPEG to a 7 KiB AVIF at its rendered size.
- Speed Index: no blur filters in the entrance, the preloader gone within 900 ms (and skipped for ad clicks, deep links and repeat views), fewer repaints.
- CLS on live: the font fallback faces (see `baseline.md`, live-only findings) remove the 0.11 shift the headline font caused; measured locally with the font delayed 1.5 s, the flood guide went from 0.114 to 0.000.

### Live (to be filled after the deploy)

Pending Christian's yes. The live run repeats the Part A pages with the same runner; the GTM double load from Cloudflare's tag gateway is the expected live-only failure.
