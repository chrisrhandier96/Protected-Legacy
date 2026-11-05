# Work order: QA audit of everything shipped on Nov 4 and 5, 2026 (final)

For Claude Code on Christian's computer (Windows, repo `chrisrhandier96/Protected-Legacy`, Netlify deploys `main`).
Goal: verify that every change pushed to `main` on Nov 4 and 5 is top notch, fix what is not, and report. Work on a
branch (`qa-2026-11-05`), open a PR with the test output in the body. Christian merges. Do not touch PR #7 except as
section 8 says. This replaces the Nov 4 draft of this file: the scope grew from 3 scenes to all 14.

House rules (every change, every caption): no carrier names, no employer name, no insurer-set limits, no sales lines,
no em dashes, Spanish uses usted, no people in site photos except the approved family plate, no text, logos, badges,
plates, tail numbers, hull names or flags inside images. Never run `tools/flatten.py` alone (it breaks every page); run
the chain check_content, build_library, build_en, flatten, postbuild. `/js/` is immutable-cached: never reuse a JS file
name, bump the version suffix. `/img/` is cached 7 days: a replaced image gets a new file name, never the same name.

## 0. What shipped (main, in order)

Nov 4:
1. `bd2601a` Plates: five homepage plates became Google Flow images (img/plates, 320 and 640, jpg/webp/avif).
2. `452f84d` Myths cue: the "Toque para ver la realidad / Tap to see the reality" button lost its grey box.
3. `b1de6b6` Homepage motion: rAF counters, word by word h1, hero drift on laptops (scroll timeline), domain cards cascade.
4. `9d96d27` handoff/WORK-ORDER-unreal-2026-11.md.
5. `7aefa3e` Headline fix: the gold word ("Extraordinario." / "Extraordinary.") paints again after the word animation.
6. `cd724fb`, `1e7f393` Launch checklist: terminos.html (one bilingual page, ES and EN), sitemap entry, footer links on
   the 40 pages that have a footer, plate alt text.
7. `8c87972` .. `462c679` Scenes round 1: photoreal Flow frames for the auto, boats and aviation guides; avi became tabs.
8. `486e378` .. `c807759` Scenes v2: versioned frame names (aut-orbit-01..12, mar-dock-ph, mar-trailer-ph, mar-lift-ph,
   avi-drone-ph), scenes-check accepts "orbit".
9. `cf15c0c` Plates: clean bytes (a 5.8 KB provenance manifest had been appended to each file in transit; pixels identical).
10. `e6ad44e` Removed the 96 old blockout frames for aut, mar and avi.
11. `71b9069` First draft of this work order.

Nov 5, scenes round 2 (the other 11 guides move from the shared 3D blockout to photoreal Flow stills):
12. `e34ebe2` .. `6bf14b2` (1 of 14 .. 11 of 14): 186 new frame files, one commit per guide: flo (54), res (36), ren (18),
    str (12), col (12), brd (12), kr (6), cyb (6), emp (6), cnd (18), lia (6). Every file byte-identical to the local
    encode, 0 provenance manifests.
13. `662656a` (12 of 14): tools/scenes/scenes.json rewritten (live3d removed from every key, cnd is a 3-tab scene instead
    of mask layers, captions and alts open with "Imagen ilustrativa / Illustrative image", legal sentences unchanged,
    zero "3D" strings), sizes.json merged to 49 entries, tools/scenes/hotspots-lia.json placed by hand,
    build_scene_images.py only reads ID masks when `<frame>-ids.png` exists.
14. `fbce8e6` (13 of 14): site-tests/scenes-check.js covers all 14 guides (28 pages), handles 2-tab scenes, accepts
    "rise" frames, no `?no3d=1`.
15. `e45d25c` (14 of 14): the 22 guide pages regenerated with the new frames. No page carries `data-3d` or
    `pp-scene3d-loader` any more (aut, mar, avi pages unchanged).
16. `f333099` Removed the 177 old frames for the 11 guides (flo-water-00..12, res-after/prep-off/prep-on/storm-c1/
    storm-c3/storm-ts, cnd-unit and the three cnd-unit-* layer webps, lia-aerial, ren-after/before/during, str-arrival/back,
    kr-gate-night, col-case/gallery, cyb-office, emp-kitchen, brd-room, brd-table). Netlify deploy 6aec6bac at 11:42 UTC.

How the flood slider was built (so you can judge it, not redo it): Veo clips move the camera, so the 9 steps are stills.
flo-rise-00 is the Flow base still; 1 ft to 12 ft above the floor are numpy composites of one Flow "3 ft" still
(`scratchpad/flowaudit/flood_comp.py`: mirror reflection, wave displacement, blur, tint, noise, a faint water line),
so the camera never moves between steps. The composites are not in the repo; the frames are.

Also outside the repo: Hotel Domi artifact (Flow banners) and the scheduled Nov 10 PP ads verdict. Not in scope here.

## 1. Build integrity (the first thing to run)

1. Fresh clone of `main`. Run the chain: `python tools/check_content.py`, `python tools/build_library.py`,
   `python tools/build_en.py`, `python tools/flatten.py`, `node tools/postbuild.js` (plus whatever `deploy.md` lists).
   After build_en restore the English title, description, og:url, og:image and the honeypot label by hand (known generator
   gap, see FACTCHECK-2026-11.md). Then `git status`: the chain must reproduce `main` with no diff on any guide page except
   the known generator gap. Any other diff means a hand edit drifted from the generators; fold it back into the source
   (content/*.json, tools/post/*.js) so the next build does not undo it. Report the exact files.
2. `tools/scenes/scenes.json` is the single source for the scene markup: run `node tools/post/add-scenes.js .` on the
   built pages and confirm zero changes (idempotent). Confirm `sizes.json` lists every frame that exists on disk and
   nothing that does not (49 entries expected).
3. Every frame referenced from `scenes.json` (frames plus `hotspots_frame`) exists on disk in all six variants
   (480/960/1600 x avif/webp): 49 frames, 294 files. Every avif/webp in img/scenes is referenced (no orphans).
   Expected per folder: aut 72, mar 18, avi 18, flo 54, res 36, ren 18, str 12, col 12, brd 12, kr 6, cyb 6, emp 6,
   cnd 18, lia 6. Plus the 10 glb files (img/scenes/3d 7, img/scenes/flo3d 3), see section 8.

## 2. Images: clean bytes and sizes

1. Add `site-tests/img-clean.js`: walk `img/` and fail if any avif, webp, jpg or png contains the byte string `C2PA` or
   `c2pa` (a provenance manifest that adds about 5.8 KB per file). Wire it into `verify.js` as group `imgclean`.
   Expected today: 0 hits across about 449 images. Keep it in the suite; files sent from Claude chat can pick the
   manifest up.
2. Compare each plate on `main` with its 2K source in `C:\Users\rhand\Downloads` (the Flow downloads from Nov 4, 13:xx):
   same crop, no visible banding at 640, AVIF under 70 KB at 640. Report sizes.
3. Scene frames: every 960 AVIF at or under 65 KB (heaviest now: kr-gate-dusk-night 64.6 KB, res-sun-shut 63.6 KB);
   every 1600 AVIF at or under 180 KB (heaviest: kr-gate-dusk-night 176.8 KB, flo-rise-00 167.2 KB). If any file is
   above, re-encode with `tools/scenes/build_scene_images.py` at a lower quality and report. The flood composites
   (flo-rise-01..12) carry film grain by design; do not "clean" them.

## 3. Scenes on the live site (both languages, phone and laptop)

All 28 guide pages (14 guides x ES/EN). The PAGES table in `site-tests/scenes-check.js` is the list.
1. `BASE=https://www.protectedlegacyfl.com OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/scenes-check.js`: every line
   PASS. CLS under 0.02 on all 28. (Nov 5 spot check from Chrome: all 28 pages serve the new frames, the flood slider
   swaps flo-rise-00 to flo-rise-08 at step 6 with the label "8 pies", the condo tabs swap shell/finishes/furnished.)
2. By eye, screenshots in the PR:
   - aut: slider at 0°, 90°, 180°, 270° (orbit continuous, car still, no badge or plate).
   - mar and avi tabs: same house and light in all frames; tail clean.
   - flo: the 9 slider steps. The water must rise in place with the camera fixed; the house, palms and sky must not
     shift between steps. Flag any step where the reflection or the water line looks wrong at 1600.
   - res: the 6 tabs (Preparada / Sin preparar / Tormenta tropical / Categoría 1 / Categoría 3 / Después) are the same
     house and angle; shutters closed on "Preparada", open on "Sin preparar"; no readable text, flags or plates.
   - ren: before / during / after are the same house and angle; no readable text on the dumpster or signs.
   - str, col, brd: 2 tabs each. kr, cyb, emp: one frame each. cnd: 3 tabs (shell, finishes, furnished) of one unit.
   - lia: the estate aerial with the 6 hotspot pins; each pin must sit on its feature (pool, boat, PWC, cars, event
     terrace, staff quarters). The pins are hand-placed percentages in tools/scenes/hotspots-lia.json, not mask-derived.
3. No `data-3d` attribute and no `pp-scene3d-loader` script on any of the 28 pages (grep the built HTML: expect 0).
4. Captions and tab labels: bilingual parity, every sentence appears in the guide or in content/BRIEF.md
   (`python tools/check_content.py` covers the guide text; check the scene captions by hand). Every caption opens with
   "Imagen ilustrativa" / "Illustrative image". No "3D" wording anywhere in scenes.json or the built pages. Badge text on
   all 28 pages is "Ilustración" / "Illustration".
5. Alt text on the current frame updates when the tab or slider changes (scenes.v2.js does this; confirm in the DOM).
6. Old URLs: the 96 round-1 files (aut-spin-*, mar-dock-/mar-lift-/mar-trailer- without -ph, avi-drone- without -ph)
   and the 177 round-2 files listed in item 16 of section 0 must be gone from the deploy. Caveat: Netlify's edge still
   served stale copies of some of them on Nov 5 (age about 45 h, from the 7-day /img/ cache). Nothing links to them, so
   this is harmless; check again after Nov 12 and expect 404. Grep the whole built site for any remaining reference to
   the old names: expect none.
7. `/js/scenes.v2.js` is the only scene script loaded on guide pages; `scenes.v1.js` must not be referenced anywhere.

## 4. Homepage: motion, headline, plates, myths

1. Laptop Chrome, Safari and iPhone Safari: the h1 animates word by word once, the gold word is visible at the end
   (count gold pixels in a screenshot of the h1; the Nov 4 reference was about 4,200 gold pixels at 1280 wide, the bug
   state was 0). `prefers-reduced-motion: reduce` shows everything static with no missing words.
2. Counters (25.9 %, $63 mil+ / $63K+, and the rest) land on the exact figures in both languages; no flicker on language
   switch (setLang re-runs ppWords; confirm no duplicate `.w` wrappers after switching ES to EN to ES).
3. Hero drift: only at 981 px and above, only when `animation-timeline: scroll()` is supported; no layout shift (CLS under
   0.02 on the homepage, phone and laptop).
4. Domain cards cascade in on scroll and are all visible with JS off (no `reveal` left at opacity 0 without JS).
5. Myths: the cue under each myth has no background, border or box in Chrome, Safari and Firefox; tapping flips the card.
6. Plates: five plates render in both languages with the new alt text; the family plate is the only one with people.

## 5. Launch checklist pages

1. /terminos.html (one bilingual page; hreflang es and en both point at it): canonical and hreflang correct, in the
   sitemap, linked from every footer (40 pages, both "Privacidad · Términos" and "Privacy · Terms"; 404, gracias,
   privacidad and terminos have no footer). No em dashes, usted throughout, no carrier or employer names. Gap found on
   Nov 5: privacidad.html and terminos.html do not link to each other or back to the site. Add a small footer or a
   "Volver / Back" line with both legal links to each, same markup in both, and keep the generators in sync.
2. The crawl group in verify.js passes against the live site (no 404s, no redirect loops, the trailing-slash rule holds).
3. Custom 404, robots, sitemap lastmod values, share images for the three ad guides: still correct after the Nov 5 commits.

## 6. The pre-launch reel, item by item

Christian's reference: https://www.instagram.com/reel/Dc9jxR_PuFg/ ("20 things to have Claude do before launching your
website", millee.md). On Nov 4 the status was: 16 already in place, 2 added that day (terms page, alt text on the
plates), 1 skipped on purpose (cookie banner), 1 is the form validation that already existed. Re-check all 20 against
the live site, one line each in the RETURN FORMAT, with the evidence (file, header, screenshot or test line).

1. Privacy policy page: /privacidad.html (bilingual), linked from every footer (40 pages).
2. Terms and conditions page: /terminos.html (bilingual, added Nov 4), linked from every footer, in the sitemap.
   Both legal pages: fix the cross-link gap in section 5.1.
3. Secrets off the frontend: grep the built site and js/ for keys, tokens, Netlify or Google credentials; the only IDs
   allowed in the HTML are the GTM container id and public form names.
4. Force HTTPS: http:// and the apex redirect to https://www.protectedlegacyfl.com with one hop; HSTS header present
   (netlify.toml sets max-age=31536000, includeSubDomains, preload).
5. Cookie consent banner: skipped on purpose. US audience, first-party cookies only, disclosed on the privacy page.
   Confirm no third-party cookies are set before consent on a fresh profile (list every cookie the homepage sets and its
   origin). If any third-party cookie appears, report it under OPEN; do not add a banner without Christian's call.
6. Meta titles and descriptions: unique per page, both languages, within 60 / 155 characters; report any page over.
7. Social preview image: og:image and twitter:image on every page resolve (200, correct size); the three ad guides keep
   their own share images.
8. Favicon: favicon.svg plus the 32 and 192 PNGs resolve; apple-touch-icon present.
9. Sitemap and robots.txt: every indexable page in the sitemap (both languages, terms pages included), lastmod sane,
   robots allows the site and points at the sitemap.
10. Alt text on images: every `<img>` on all 44 pages has a non-empty alt (the scene frames update theirs per frame,
    section 3.5); the plate alts added Nov 4 are bilingual.
11. Compress your images: section 2 covers it (size caps, clean bytes, avif/webp first in every `<picture>`).
12. Check page load speed: section 7.
13. Fix color contrast: run axe or Lighthouse accessibility on the homepage, one ES guide, one EN guide and terminos:
    every text/background pair at or above 4.5:1 (3:1 for large text), the gold on green included.
14. Mobile friendly: iPhone Safari and Android Chrome at 360 and 390 wide: no horizontal scroll on any of the 44 pages,
    tap targets at least 44 px, the scene slider usable with a thumb.
15. Custom 404 page: /404.html served with status 404 for a missing URL, both languages reachable from it.
16. Broken links: the crawl group (section 5.2) plus every external link on the guides (status 200, no redirect to a
    login page).
17. Form validation: the contact form rejects empty required fields and a bad email client-side and server-side; the
    success page is /gracias.html. Use a fresh test submission only if Christian says so; otherwise verify the markup and
    the Netlify form definition.
18. Spam protection: the Netlify honeypot field (netlify-honeypot / bot-field) is present on every form in both
    languages and hidden from users and screen readers.
19. Analytics: GTM container loads once per page (one gtm.js tag), consent and privacy page agree with what it sets.
20. One clear call to action: every guide page keeps the single "Solicitar una revisión / Request a review" card
    (one primary CTA per page, no competing buttons added by the Nov 4 and 5 commits).

## 7. Performance

1. PageSpeed Insights (the public API or the web UI, not local Lighthouse) on the homepage, /guias/autos/ and
   /guias/inundacion/, phone: must stay at 99. If lower, say which audit dropped and by how much, and whether it is a
   Nov 4 or Nov 5 change.
2. Transfer size of /guias/autos/ and /guias/inundacion/ at phone width, first view, before and after dragging the slider
   across all steps. Expect about 20 KB per extra frame at 480 AVIF (flood: 9 steps).

## 8. PR #7 and the 3D assets (Christian's call, do not decide for him)

1. PR #7 (Claude Code's Unreal work, sections 2.1 and 2.2): do not merge. Rebase it on today's `main`, drop its headline
   fix (7aefa3e already fixed it), keep section 0 (plugin setup), and leave 2.1 and 2.2 on the branch with screenshots of
   each new scene and of the 3D hero attached to the PR. Christian decides after seeing them. The direction since Nov 4
   is photoreal Flow frames, not blockouts.
2. Dead weight now that no page loads the 3D engine: img/scenes/3d (7 glb), img/scenes/flo3d (3 glb), js/casa3d.v1-3.js,
   js/flood3d.v1.js, tools/casa3d, site-tests/casa3d-check.js. Measure what they weigh in the deploy and confirm nothing
   on the live site requests them (network log on all 28 guide pages and the homepage). List them under OPEN with a
   recommendation; delete nothing. They stay until Christian decides on PR #7, which depends on the engine.

## 9. Full suite, last

`node site-tests/local-netlify.js <abs repo path> 8787 &` then
`BASE=http://localhost:8787 OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/verify.js` (every group, no ONLY filter;
the `netlify.toml` served-locally failure is the only accepted failure), `node site-tests/scenes-check.js` (28 pages),
and the new `img-clean` group. `casa3d-check.js` has nothing left to check; report that rather than running it.

## RETURN FORMAT

Reply with, in this order:
1. BUILD: the chain's diff against main (file list), the add-scenes idempotence result, the frame count per folder.
2. IMAGES: img-clean hits (expect 0), plate sizes table, any frame above the size caps.
3. SCENES: scenes-check pass/fail counts per page (28), CLS per page, the screenshots listed in 3.2, the 404 check on the
   96 + 177 old URLs (with the cache caveat), the grep for old names, the data-3d/loader grep (expect 0).
4. HOMEPAGE: gold pixel count per browser, counters OK/not, CLS, reduced-motion result, myths cue result.
5. LAUNCH: footer link count (expect 40 pages), crawl result, sitemap check.
6. REEL: the 20 items, one line each: OK / FIXED (what) / OPEN (why), with evidence.
7. PERF: PageSpeed phone scores for the three pages, transfer sizes.
8. FIXES: every change you made, one line each, with the file.
9. OPEN: anything that needs Christian's call (PR #7, the 3D assets, any cookie finding).
10. PR: the branch name and PR link, with all of the above pasted in the PR body.
