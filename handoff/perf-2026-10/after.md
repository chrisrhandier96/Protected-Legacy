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

### Live, after the deploy (merge `26bc305`, Netlify published 2026-10-05)

Same runner and conditions as the live baseline (through the sandbox proxy, tag scripts load, collection endpoints blocked). Live phone numbers are dominated by the tag scripts and by the proxy's latency (LCP 5 to 6 s with a 1 to 2 s server round trip), so treat them as a before/after comparison under the same handicap, not as what a visitor in Florida sees.

| Page | Form | Before: score / LCP / TBT / SI / CLS / weight | After |
|---|---|---|---|
| / | mobile | 63 / 6.1 s / 389 ms / 5.4 s / 0 / 641 KiB | 57 / 6.2 s / 530 ms / 4.9 s / 0 / 560 KiB |
| / | desktop | 91 / 1.6 s / 56 ms / 1.8 s / 0.009 / 617 KiB | 95 / 1.4 s / 69 ms / 0.9 s / 0.007 / 532 KiB |
| /en/ | mobile | 60 / 6.9 s / 430 ms / 5.1 s / 0 / 788 KiB | 58 / 6.0 s / 556 ms / 5.1 s / 0 / 548 KiB |
| /en/ | desktop | 93 / 1.2 s / 29 ms / 1.9 s / 0.009 / 617 KiB | 94 / 1.5 s / 64 ms / 1.2 s / 0.014 / 532 KiB |
| /guias/umbrella-responsabilidad/ | mobile | 83 / 1.9 s / 467 ms / 1.8 s / 0.114 / 445 KiB | 63 / 5.4 s / 576 ms / 2.8 s / 0.042 / 448 KiB |
| /guias/umbrella-responsabilidad/ | desktop | 99 / 0.7 s / 59 ms / 0.4 s / 0.056 / 433 KiB | 100 / 0.7 s / 43 ms / 0.5 s / 0.045 / 435 KiB |
| /en/guides/umbrella-liability/ | mobile | 64 / 5.4 s / 477 ms / 4.8 s / 0 / 445 KiB | 65 / 5.4 s / 531 ms / 2.6 s / 0 / 446 KiB |
| /en/guides/umbrella-liability/ | desktop | 100 / 0.5 s / 45 ms / 0.4 s / 0.025 / 433 KiB | 100 / 0.6 s / 38 ms / 0.4 s / 0.019 / 435 KiB |
| /en/guides/flood/ | mobile | 62 / 5.4 s / 536 ms / 2.8 s / 0.114 / 446 KiB | 61 / 5.6 s / 576 ms / 4.4 s / 0 / 450 KiB |
| /en/guides/flood/ | desktop | 100 / 0.6 s / 50 ms / 0.5 s / 0.039 / 435 KiB | 100 / 0.7 s / 44 ms / 0.5 s / 0.031 / 437 KiB |

What moved on live:

- Weight on the home pages: 641 and 788 KiB before, 560 and 548 KiB after (the site's own bytes went from 270 to 178 KiB; the rest is Tag Manager, GA4, Google Ads and Cloudflare).
- Desktop home: 91 and 93 before, 95 and 94 after. Desktop guides stay at 100.
- CLS on the guides on phones: 0.114 before on the umbrella and flood guides, now 0.042 and 0. The fallback fonts did their job; the small remaining shift on the Spanish umbrella guide is the "11 min de lectura" meta line re-wrapping when Figtree arrives.
- Phone performance scores on live are within run-to-run noise of the baseline (single runs on the same page range from 61 to 86), because the blocking time is the tag scripts' and the LCP is the proxy's; the budget rows that depend on the site's own code are the local tables above.
- Best practices 81 on one home mobile run comes from the Google tags' third-party cookies, as in the baseline.

Live checks after the deploy: every main page returns 200, `/js/hero3d.v1.js` is served with `cache-control: public, max-age=31536000, immutable`, the loader keeps the SVG in a GPU-less browser (`hero3d_ready` fallback, low-device) and renders the 3D when forced with `?3d=1`, Tag Manager loaded and consumed the event, no console errors. Live suite: 73 of 73, including "Tag Manager loads exactly once".
