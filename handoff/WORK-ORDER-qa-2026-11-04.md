# Work order: QA audit of everything shipped on Nov 4, 2026

For Claude Code on Christian's computer (Windows, repo `chrisrhandier96/Protected-Legacy`, Netlify deploys `main`).
Goal: verify that every change pushed to `main` today is top notch, fix what is not, and report. Work on a branch
(`qa-2026-11-04`), open a PR with the test output in the body. Christian merges. Do not touch PR #7 except as section 7 says.

House rules (every change, every caption): no carrier names, no employer name, no insurer-set limits, no sales lines,
no em dashes, Spanish uses usted, no people in site photos except the approved family plate, no text, logos, badges,
plates, tail numbers, hull names or flags inside images. Never run `tools/flatten.py` alone (it breaks every page); run
the chain check_content, build_library, build_en, flatten, postbuild. `/js/` is immutable-cached: never reuse a JS file
name, bump the version suffix. `/img/` is cached 7 days: a replaced image gets a new file name, never the same name.

## 0. What shipped today (main, in order)

1. `bd2601a` Plates: five homepage plates became Google Flow images (img/plates, 320 and 640, jpg/webp/avif).
2. `452f84d` Myths cue: the "Toque para ver la realidad / Tap to see the reality" button lost its grey box.
3. `b1de6b6` Homepage motion: rAF counters, word by word h1, hero drift on laptops (scroll timeline), domain cards cascade.
4. `9d96d27` handoff/WORK-ORDER-unreal-2026-11.md.
5. `7aefa3e` Headline fix: the gold word ("Extraordinario." / "Extraordinary.") paints again after the word animation.
6. `cd724fb`, `1e7f393` Launch checklist: terminos.html (ES/EN), sitemap entry, footer links on all 40 pages, plate alt text.
7. `8c87972` .. `462c679` Scenes: photoreal Flow frames for the auto, boats and aviation guides; avi became tabs; live3d off
   for those three keys; badge reads "Ilustración / Illustration" on all 28 guide pages.
8. `486e378` .. `c807759` Scenes v2: versioned frame names (aut-orbit-01..12, mar-dock-ph, mar-trailer-ph, mar-lift-ph,
   avi-drone-ph), scenes-check accepts "orbit".
9. `cf15c0c` Plates: clean bytes (a 5.8 KB provenance manifest had been appended to each file in transit; pixels identical).
10. `e6ad44e` Removed the 96 old blockout frames for aut, mar and avi.

Also outside the repo: Hotel Domi artifact v17 (Flow banners) and the scheduled Nov 10 PP ads verdict. Not in scope here.

## 1. Build integrity (the first thing to run)

1. Fresh clone of `main`. Run the chain: `python tools/check_content.py`, `python tools/build_library.py`,
   `python tools/build_en.py`, `python tools/flatten.py`, `node tools/postbuild.js` (plus whatever `deploy.md` lists).
   After build_en restore the English title, description, og:url, og:image and the honeypot label by hand (known generator
   gap, see FACTCHECK-2026-11.md). Then `git status`: the chain must reproduce `main` with no diff on any guide page except
   the known generator gap. Any other diff means a hand edit today drifted from the generators; fold it back into the
   source (content/*.json, tools/post/*.js) so the next build does not undo it. Report the exact files.
2. `tools/scenes/scenes.json` is the single source for the scene markup: run `node tools/post/add-scenes.js .` on the
   built pages and confirm zero changes (idempotent). Confirm `sizes.json` lists every frame that exists on disk and
   nothing that does not.
3. Every file referenced from `scenes.json` exists on disk in all six variants (480/960/1600 x avif/webp). Every file in
   img/scenes/aut, mar and avi is referenced (no orphans). Expect 108 files across the three folders.

## 2. Images: clean bytes and sizes

1. Add `site-tests/img-clean.js`: walk `img/` and fail if any avif, webp, jpg or png contains the byte string `C2PA` or
   `c2pa` (a provenance manifest that adds about 5.8 KB per file). Wire it into `verify.js` as group `imgclean`.
   Expected today: 0 hits across 534 images. Keep it in the suite; files sent from Claude chat can pick the manifest up.
2. Compare each plate on `main` with its 2K source in `C:\Users\rhand\Downloads` (the Flow downloads from Nov 4, 13:xx):
   same crop, no visible banding at 640, AVIF under 70 KB at 640. Report sizes.
3. Scene frames: 960 AVIF under 65 KB each (mar is the heaviest, about 58 KB). If any 1600 AVIF is above 180 KB,
   re-encode with `tools/scenes/build_scene_images.py` at the same quality settings and report.

## 3. Scenes on the live site (both languages, phone and laptop)

Pages: /guias/autos/, /en/guides/auto/, /guias/embarcaciones/, /en/guides/boats/, /guias/aviacion-privada/,
/en/guides/private-aviation/.
1. `BASE=https://www.protectedlegacyfl.com OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/scenes-check.js`: every line
   PASS (the sandbox network failure does not apply on the laptop). CLS under 0.02 on all six.
2. By eye, screenshots in the PR: car slider at 0°, 90°, 180°, 270° (the orbit must be continuous, car still, no badge or
   plate visible); boat tabs (same house and light in all three); aviation tabs (hangar, ramp, drone; tail clean).
3. No `data-3d` attribute and no `pp-scene3d-loader` script on those six pages. The other 22 guide pages still have both.
4. Captions and tab labels: bilingual parity, every sentence appears in the guide or in content/BRIEF.md
   (`python tools/check_content.py` covers the guide text; check the scene captions by hand). No "3D" wording remains on
   the three replaced scenes. Badge text on all 28 pages is "Ilustración" / "Illustration".
5. Alt text on the current frame updates when the tab or slider changes (scenes.v2.js does this; confirm in the DOM).
6. Old URLs: /img/scenes/aut/aut-spin-01-960.avif and the other 95 removed files must return 404 after the deploy.
   Grep the whole built site for any remaining reference to `aut-spin`, `mar-dock-`, `mar-lift-`, `mar-trailer-` without
   `-ph`, and `avi-drone-` without `-ph`: expect none.

## 4. Homepage: motion, headline, plates, myths

1. Laptop Chrome, Safari and iPhone Safari: the h1 animates word by word once, the gold word is visible at the end
   (count gold pixels in a screenshot of the h1; today's reference was about 4,200 gold pixels at 1280 wide, the bug
   state was 0). `prefers-reduced-motion: reduce` shows everything static with no missing words.
2. Counters (25.9 %, $63 mil+ / $63K+, and the rest) land on the exact figures in both languages; no flicker on language
   switch (setLang re-runs ppWords; confirm no duplicate `.w` wrappers after switching ES to EN to ES).
3. Hero drift: only at 981 px and above, only when `animation-timeline: scroll()` is supported; no layout shift (CLS under
   0.02 on the homepage, phone and laptop).
4. Domain cards cascade in on scroll and are all visible with JS off (no `reveal` left at opacity 0 without JS).
5. Myths: the cue under each myth has no background, border or box in Chrome, Safari and Firefox; tapping flips the card.
6. Plates: five plates render in both languages with the new alt text; the family plate is the only one with people.

## 5. Launch checklist pages

1. /terminos.html and /en/ pages: canonical and hreflang correct, in the sitemap, linked from every footer (40 pages,
   both "Privacidad · Términos" and "Privacy · Terms"). No em dashes, usted throughout, no carrier or employer names.
2. The crawl group in verify.js passes against the live site (no 404s, no redirect loops, the trailing-slash rule holds).
3. Custom 404, robots, sitemap lastmod values, share images for the three ad guides: still correct after today's commits.

## 6. Performance

1. PageSpeed Insights (the public API or the web UI, not local Lighthouse) on the homepage and /guias/autos/, phone:
   must stay at 99. If lower, say which audit dropped and by how much, and whether it is a today change.
2. Transfer size of /guias/autos/ at phone width, first view, before and after dragging the slider across all 12
   steps. Expect about 20 KB per extra frame at 480 AVIF.

## 7. PR #7 (Claude Code's Unreal work, sections 2.1 and 2.2)

Do not merge. Rebase it on today's `main`, drop its headline fix (7aefa3e already fixed it), keep section 0 (plugin
setup), and leave 2.1 and 2.2 on the branch with screenshots of each new scene and of the 3D hero attached to the PR.
Christian decides after seeing them. The direction since this evening is photoreal Flow frames, not blockouts.

## 8. Full suite, last

`node site-tests/local-netlify.js <abs repo path> 8787 &` then
`BASE=http://localhost:8787 OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/verify.js` (every group, no ONLY filter;
the `netlify.toml` served-locally failure is the only accepted failure), `node site-tests/scenes-check.js`,
`node site-tests/casa3d-check.js` for the 11 scenes that still use the shared model, and the new `img-clean` group.

## RETURN FORMAT

Reply with, in this order:
1. BUILD: the chain's diff against main (file list), and the add-scenes idempotence result.
2. IMAGES: img-clean hits (expect 0), plate sizes table, any frame above the size caps.
3. SCENES: scenes-check pass/fail counts per page, CLS per page, the four car angles and six tab screenshots, the 404
   check on the 96 old URLs, the grep for old names.
4. HOMEPAGE: gold pixel count per browser, counters OK/not, CLS, reduced-motion result, myths cue result.
5. LAUNCH: footer link count (expect 40 pages), crawl result, sitemap check.
6. PERF: PageSpeed phone scores for the two pages, transfer sizes.
7. FIXES: every change you made, one line each, with the file.
8. OPEN: anything that needs Christian's call.
9. PR: the branch name and PR link, with all of the above pasted in the PR body.
