# Speed: lead path branch vs main, 2026-10-08 (local)

Lighthouse 13.5.0, phone preset network (150 ms RTT, 1.6 Mbps), CPU slowdown 1.5x, local server (`site-tests/local-netlify.js`), Google tags blocked.
1.5x is the calibration: on this PC it makes unchanged `main` reproduce the Oct 5 runs (`handoff/perf-2026-10/after.md`).
At the standard 4x, this slower PC scores unchanged `main` at 84 to 92, so 4x numbers are not comparable with Oct 5.
Median run; all runs in brackets. Raw medians are in the `*-summary.json` files next to this one.

| Page | main | branch |
|---|---|---|
| / | 99 [99 99 99 99 99] · LCP 2.0 s · TBT 0 · CLS 0 · 177 KiB | 99 [99 99 99 99 99] · LCP 2.0 s · TBT 0 · CLS 0 · 180 KiB |
| /en/ | 99 [99 99 99 99 99] · LCP 2.0 s · TBT 0 · CLS 0 · 177 KiB | 99 [99 99 99 99 99] · LCP 2.0 s · TBT 0 · CLS 0 · 180 KiB |
| /guias/umbrella-responsabilidad/ | 99 [99 99 99 100 100] · CLS 0 · 77 KiB | 99 [99 99 99 100 100] · CLS 0 · 77 KiB |
| /en/guides/umbrella-liability/ | 100 [99 100 100 100 100] · CLS 0 · 77 KiB | 100 [99 99 100 100 100] · CLS 0 · 77 KiB |
| /guias/inundacion/ | 100 [99 100 100] · CLS 0 · 80 KiB | 100 [99 100 100] · CLS 0 · 80 KiB |
| /en/guides/flood/ | 100 [99 100 100] · CLS 0 · 79 KiB | 100 [99 100 100] · CLS 0 · 79 KiB |

The guides flip between 99 and 100 on this PC from total-blocking-time noise (40 to 140 ms), the same for `main` and the branch; their weight is unchanged.
The +3 KiB on the home page is `/js/lead.v1.js`, deferred, after first paint.

**Home page HTML size matters more than code here.** The first version of the branch put the short form inline: 76,132 bytes on the wire, a fourth simulated round trip, first paint +148 ms, score 98.
Moving it to the deferred file and dropping two unused rules brought the page back to 74,329 bytes (main: 74,096): first paint 1,508 ms vs 1,506 ms on main, score 99.
