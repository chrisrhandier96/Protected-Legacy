# Speed baseline, 2026-10-05 (before the 3D work)

Branch `work-order-2026-10-3d`, from `main` at `abf5461`. Lighthouse 13.5.0, 3 runs per page and form factor, the table shows the run with the median performance score. Mobile = Lighthouse's mobile preset (Moto G Power class, 4x CPU slowdown, slow 4G). Desktop = the desktop preset. Measured from a cloud sandbox; the live runs go through the sandbox's HTTPS proxy, so network timings on live are a little pessimistic.

- Local: the repo served by `site-tests/local-netlify.js` (gzip, no CDN, no Cloudflare). Google Tag Manager cannot load from the sandbox, so the local "best practices" 96 is the sandbox's own certificate error, not a site issue.
- Live: https://www.protectedlegacyfl.com. Tag scripts load (that is the real cost), but the analytics collection endpoints were blocked so these lab runs register no visits. The live weight (600 to 790 KiB against 270 KiB local) is Tag Manager, GA4, Google Ads and Cloudflare's own scripts; the site's own bytes are the local figure.
- Per-run detail (slim JSON: scores, metrics, long tasks, opportunities) is in `runs/`.

### local

| Page | Form | Perf (median of 3) | LCP | TBT | Speed Index | CLS | Weight | A11y / BP / SEO |
|---|---|---|---|---|---|---|---|---|
| / | mobile | **96** (95 / 96 / 96) | 2.4 s | 0 ms | 3.8 s | 0 | 270 KiB | 100 / 96 / 100 |
| / | desktop | **98** (98 / 98 / 98) | 0.5 s | 0 ms | 1.6 s | 0.009 | 246 KiB | 100 / 96 / 100 |
| /en/ | mobile | **96** (95 / 96 / 96) | 2.4 s | 0 ms | 3.8 s | 0 | 270 KiB | 100 / 96 / 100 |
| /en/ | desktop | **98** (98 / 98 / 98) | 0.6 s | 0 ms | 1.6 s | 0.009 | 246 KiB | 100 / 96 / 100 |
| /guias/umbrella-responsabilidad/ | mobile | **100** (100 / 100 / 100) | 1.3 s | 0 ms | 0.9 s | 0 | 77 KiB | 100 / 96 / 100 |
| /guias/umbrella-responsabilidad/ | desktop | **100** (100 / 100 / 100) | 0.3 s | 0 ms | 0.2 s | 0 | 65 KiB | 100 / 96 / 100 |
| /en/guides/umbrella-liability/ | mobile | **100** (100 / 100 / 100) | 1.3 s | 0 ms | 0.9 s | 0 | 77 KiB | 100 / 96 / 100 |
| /en/guides/umbrella-liability/ | desktop | **100** (100 / 100 / 100) | 0.3 s | 0 ms | 0.2 s | 0 | 65 KiB | 100 / 96 / 100 |
| /en/guides/flood/ | mobile | **100** (100 / 100 / 100) | 1.3 s | 0 ms | 0.9 s | 0 | 78 KiB | 100 / 96 / 100 |
| /en/guides/flood/ | desktop | **100** (100 / 100 / 100) | 0.3 s | 0 ms | 0.2 s | 0.01 | 67 KiB | 100 / 96 / 100 |

Best-practices audits not passing: errors-in-console

Console errors seen: `Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID`

### live

| Page | Form | Perf (median of 3) | LCP | TBT | Speed Index | CLS | Weight | A11y / BP / SEO |
|---|---|---|---|---|---|---|---|---|
| / | mobile | **63** (61 / 63 / 70) | 6.1 s | 389 ms | 5.4 s | 0 | 641 KiB | 100 / 100 / 100 |
| / | desktop | **91** (91 / 91 / 93) | 1.6 s | 56 ms | 1.8 s | 0.009 | 617 KiB | 100 / 100 / 100 |
| /en/ | mobile | **60** (57 / 60 / 61) | 6.9 s | 430 ms | 5.1 s | 0 | 788 KiB | 100 / 77 / 100 |
| /en/ | desktop | **93** (84 / 93 / 95) | 1.2 s | 29 ms | 1.9 s | 0.009 | 617 KiB | 100 / 100 / 100 |
| /guias/umbrella-responsabilidad/ | mobile | **83** (64 / 83 / 83) | 1.9 s | 467 ms | 1.8 s | 0.114 | 445 KiB | 100 / 100 / 100 |
| /guias/umbrella-responsabilidad/ | desktop | **99** (99 / 99 / 100) | 0.7 s | 59 ms | 0.4 s | 0.056 | 433 KiB | 100 / 100 / 100 |
| /en/guides/umbrella-liability/ | mobile | **64** (58 / 64 / 84) | 5.4 s | 477 ms | 4.8 s | 0 | 445 KiB | 100 / 100 / 100 |
| /en/guides/umbrella-liability/ | desktop | **100** (100 / 100 / 100) | 0.5 s | 45 ms | 0.4 s | 0.025 | 433 KiB | 100 / 100 / 100 |
| /en/guides/flood/ | mobile | **62** (59 / 62 / 82) | 5.4 s | 536 ms | 2.8 s | 0.114 | 446 KiB | 100 / 100 / 100 |
| /en/guides/flood/ | desktop | **100** (99 / 100 / 100) | 0.6 s | 50 ms | 0.5 s | 0.039 | 435 KiB | 100 / 100 / 100 |

Best-practices audits not passing: third-party-cookies, inspector-issues

Opportunities Lighthouse lists (median run):
- / mobile: server-response-time (188 ms); unused-javascript (630 ms, 131 KiB)
- / desktop: unused-javascript (60 ms, 130 KiB)
- /en/ mobile: server-response-time (74 ms); unused-javascript (760 ms, 131 KiB)
- /en/ desktop: server-response-time (20 ms); unused-javascript (60 ms, 130 KiB)
- /guias/umbrella-responsabilidad/ mobile: server-response-time (375 ms)
- /guias/umbrella-responsabilidad/ desktop: unused-javascript (40 ms, 131 KiB)
- /en/guides/umbrella-liability/ mobile: server-response-time (71 ms); unused-javascript (710 ms, 131 KiB)
- /en/guides/flood/ mobile: server-response-time (58 ms); unused-javascript (620 ms, 131 KiB)


### Where the home page spends its time on a phone (4x CPU, local, Chromium trace)

Longest main-thread tasks on `/`, mobile viewport, 4x CPU throttle, with what ran inside each:

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

Reading: the three biggest tasks are style and layout of the whole page right after the HTML arrives (the page is one 227 KiB document with every section laid out at once), then the first animation frame of the cinema scripts. Script parse and compile are small. That is what Part B goes after: fewer layout reads in handlers, no blur filters in the entrance, and `content-visibility: auto` on the sections below the domains so their layout waits until they are near the screen.

### Live-only findings for later parts

- Mobile CLS of 0.114 on the guides on live (0 locally): something injected on live shifts the layout; Part G looks at it.
- Best-practices on live: `third-party-cookies` and `inspector-issues` come from the Google tags (account side, not the site's code).
- Lighthouse's only site-side opportunity on live is `unused-javascript` on the home page (about 131 KiB): mostly the tag scripts, part of it the home page's own inline scripts.
