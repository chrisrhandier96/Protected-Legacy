# Work order: QA audit of everything shipped Nov 4 to Nov 9, 2026 (updated Nov 9)

For Claude Code on Christian's computer (Windows, repo `chrisrhandier96/Protected-Legacy`, Netlify deploys `main`).
Goal: verify that every change pushed to `main` from Nov 4 to Nov 9 is top notch, fix what is not, and report. Work on a
branch (`qa-2026-11-09`), open a PR with the test output in the body. Christian merges. PR #7 is closed (section 8).
This replaces the Nov 5 version of this file: the Nov 5 scenes round 3, the Nov 5 audit fixes and the Nov 9 changes
(titles, the enforced Content Security Policy, the 17-frame car) are now in scope.

House rules (every change, every caption): no carrier names, no employer name, no insurer-set limits, no sales lines,
no em dashes, Spanish uses usted, no people in site photos except the approved family plate, no text, logos, badges,
plates, tail numbers, hull names or flags inside images, no recognizable real product designs. Never run
`tools/flatten.py` alone (it breaks every page); run the chain check_content, build_library, build_en, flatten,
postbuild. `/js/` is immutable-cached: never reuse a JS file name, bump the version suffix. `/img/` is cached 7 days: a
replaced image gets a new file name, never the same name, and a deleted name is never reused. The Content Security
Policy in `netlify.toml` is enforced since Nov 9: any new script, font, frame or request to another domain is blocked
until that domain is added there, so test every change with the header on (section 7).

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
12. `e34ebe2` .. `6bf14b2` (1 of 14 .. 11 of 14): one commit per guide with its new frames.
13. `662656a` (12 of 14): tools/scenes/scenes.json rewritten (live3d removed from every key, cnd is a 3-tab scene instead
    of mask layers, captions and alts open with "Imagen ilustrativa / Illustrative image", legal sentences unchanged,
    zero "3D" strings), sizes.json merged, tools/scenes/hotspots-lia.json placed by hand, build_scene_images.py only
    reads ID masks when `<frame>-ids.png` exists.
14. `fbce8e6` (13 of 14): site-tests/scenes-check.js covers all 14 guides (28 pages).
15. `e45d25c` (14 of 14): the 22 guide pages regenerated with the new frames. No page carries `data-3d` or
    `pp-scene3d-loader` any more.
16. `f333099` Removed the 177 old frames for the 11 guides. `f4aab89` The Nov 5 version of this work order.

Nov 5, scenes round 3 and audit fixes (after the Nov 5 version of this order was written):
17. `7f1719a`, `4a8d5b7`, `0b8dcfe` (1 to 3 of 10): the rental (str), K&R (kr) and boards (brd) guides became pinned
    scenes: a canal home (5 pins), a home entrance (4 pins), a governance table (5 pins). Pins are hand-placed in
    tools/scenes/hotspots-str.json, hotspots-kr.json and hotspots-brd.json.
18. `4a57006` (4 of 10): js/scenes.v3.js preloads the other frames on reader intent (hover, focus, touch), not on page
    load. `6387aad` (6 of 10): add-scenes.js loads scenes.v3.js.
19. `61ff460` (5 of 10): scenes.json with the 3 pinned scenes and honest car labels; pins; sizes.
20. `ee16d6e` (7 of 10): build_library: glossary terms as h2, shorter library description.
21. `4449c86` (8 of 10): scenes-check handles pinned scenes with 3 or more pins.
22. `248798d` (9 of 10): meta descriptions under 160 characters (boats EN, cyber ES and EN, boards ES).
23. `cdd7348` (10 of 10): pinned scenes live, the 8-frame car turn, legal page links and share tags, glossary headings,
    Permissions-Policy header.
24. `fd9e47a` Removed 54 replaced frames (car 09 to 12, the old rental, K&R and boards frames).

Nov 9 (titles, Content Security Policy, the car all the way around):
25. `512fb57` Six titles cut to 60 characters or less (home ES and EN, the hurricane checklist ES and EN, the English boat
    guide, the English glossary) and a Content-Security-Policy-Report-Only header.
26. `547a04d`, `a936e9d`, `b853493` The same titles in the sources: content/extras/hurricane.json gets `seo_title_es` and
    `seo_title_en`, content/guides/mar.json `en.title`, tools/build_library.py uses `seo_title_<lang>` and the shorter
    English glossary title. `43a3bbc` verify.js accepts the shorter English homepage title.
27. `7281f08` The report-only policy allows analytics.google.com and the doubleclick collect endpoints.
28. `72e5ef7` Car frames aut-orbit-13 to 21 (54 files). 13 and 20 to 21 come from two Veo 3.1 Fast bridge clips; 14 to 19
    are the original Veo Quality orbit frames mirrored for the left side; blank plates on background cars retouched out.
    Names 09 to 12 are skipped on purpose (used before, deleted in fd9e47a, may still sit in the 7-day image cache).
    Masters: `C:\Users\rhand\Downloads\pp-car360\masters\aut\`.
29. `546ba93` scenes.json: aut has 17 frames (01 to 08, then 13 to 21), each label names the side in both languages;
    sizes.json updated.
30. `571650a` guias-autos.html and en-guides-auto.html get the 17-frame scene (the figure only, rest of each page byte for
    byte as before); netlify.toml switches to an enforced Content-Security-Policy, and connect-src adds
    `https://*.google.com` as Google's tag platform CSP guide lists.

Also Nov 9: PR #7 was closed at Christian's word (branch `unreal-wo-2026-11` kept). Live checks already done that day, as
a baseline: under the enforced policy, 0 violations on the homepage, guias-autos, the hurricane checklist and the English
flood guide, with gtm.js, gtag, GA4 collect, the Ads conversion linker and remarketing calls, and Cloudflare Insights
all loading; the car slider loads 17 of 17 frames live; three new frames fetched live are byte-identical to the build.

How the flood slider was built (so you can judge it, not redo it): Veo clips move the camera, so the 9 steps are stills.
flo-rise-00 is the Flow base still; 1 ft to 12 ft above the floor are numpy composites of one Flow "3 ft" still
(mirror reflection, wave displacement, blur, tint, noise, a faint water line), so the camera never moves between steps.
The composites are not in the repo; the frames are.

How the car's left side was built: the left side (frames 14 to 19) is the right side mirrored, so the car, the light and
the floor match exactly; the background garage is mirrored too. Frame 13 (behind the car, toward the left) and frames 20
and 21 (the front) come from Veo bridge clips, so the background changes between frames 08 and 13 by design. Judge it,
do not regenerate it.

Also outside the repo: the Hotel Domi artifact, the Domi World Unreal work, and the scheduled Nov 10 PP ads verdict.
Not in scope here.

## 1. Build integrity (the first thing to run)

1. Fresh clone of `main`. Run the chain: `python tools/check_content.py`, `python tools/build_library.py`,
   `python tools/build_en.py`, `python tools/flatten.py`, `node tools/postbuild.js` (plus whatever `deploy.md` lists).
   After build_en restore the English title, description, og:url, og:image and the honeypot label by hand (known generator
   gap, see FACTCHECK-2026-11.md). Then `git status`: the chain must reproduce `main` with no diff on any page except
   the known generator gap. Known on Nov 9: a full rebuild changed 41 files, because some fixes on main were made by
   hand in the built pages and never in the generators (for example the Terms footer link and the glossary headings
   around cdd7348). Fold every one back into the source (content/*.json, tools/*.py, tools/post/*.js) so the next build
   does not undo it, rebuild, and repeat until the diff is empty. Report the exact files and what you folded back.
2. `tools/scenes/scenes.json` is the single source for the scene markup: run `node tools/post/add-scenes.js .` on the
   built pages and confirm zero changes (idempotent), including the 17-frame car on both auto pages.
3. Expected on Nov 9: 14 scenes, 52 frames referenced (frames plus hotspots frames), sizes.json with 52 entries, every
   frame in all six variants (480/960/1600 x avif/webp), 312 files, no orphans. Per folder: aut 102, avi 18, brd 6,
   cnd 18, col 12, cyb 6, emp 6, flo 54, kr 6, lia 6, mar 18, ren 18, res 36, str 6. Plus the 10 glb files
   (img/scenes/3d 7, img/scenes/flo3d 3), see section 8.

## 2. Images: clean bytes and sizes

1. Add `site-tests/img-clean.js`: walk `img/` and fail if any avif, webp, jpg or png contains the byte string `C2PA` or
   `c2pa` (a provenance manifest that adds about 5.8 KB per file). Wire it into `verify.js` as group `imgclean`.
   Expected: 0 hits. Keep it in the suite; files sent from Claude chat can pick the manifest up.
2. Compare each homepage plate on `main` with its 2K source in `C:\Users\rhand\Downloads` (the Flow downloads from
   Nov 4): same crop, no visible banding at 640, AVIF under 70 KB at 640. Report sizes.
3. Scene frames: every 960 AVIF at or under 65 KB (heaviest on Nov 9: res-sun-shut 62.1 KB); every 1600 AVIF at or
   under 180 KB (heaviest: flo-rise-00 167.2 KB, res-calm 165.1 KB). If any file is above, re-encode with
   `tools/scenes/build_scene_images.py` at a lower quality, under a new file name, and report. The flood composites
   (flo-rise-01..12) carry film grain by design; do not "clean" them.

## 3. Scenes on the live site (both languages, phone and laptop)

All 28 guide pages (14 guides x ES/EN). The PAGES table in `site-tests/scenes-check.js` is the list.
1. `BASE=https://www.protectedlegacyfl.com OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/scenes-check.js`: every line
   PASS. CLS under 0.02 on all 28. If the check still expects 8 car frames, update it to read the frame count from
   scenes.json.
2. By eye, screenshots in the PR:
   - aut (slider, 17 frames): positions 0 (front, right side), 3 (right profile), 7 (rear), 11 (left profile) and 16
     (front). Same car in every frame, no badge, no plate, no text; labels name the side in both languages.
   - mar and avi (3 tabs each): same place and light in all frames; tail clean.
   - flo (slider, 9 steps): the water rises in place with the camera fixed; the house, palms and sky must not shift
     between steps. Flag any step where the reflection or the water line looks wrong at 1600.
   - res (6 tabs: Preparada / Sin preparar / Tormenta tropical / Categoría 1 / Categoría 3 / Después): the same house
     and angle; shutters closed on "Preparada", open on "Sin preparar"; no readable text, flags or plates.
   - ren (3 tabs: before, work, after) and cnd (3 tabs: shell, finishes, furnished): the same place and angle.
   - col (2 tabs), cyb and emp (one frame each).
   - Pinned scenes: lia (6 pins), str (5), kr (4), brd (5). Each pin must sit on its feature and its numbered note must
     match. The pins are hand-placed percentages in tools/scenes/hotspots-*.json, not mask-derived.
3. No `data-3d` attribute and no `pp-scene3d-loader` script on any of the 28 pages (grep the built HTML: expect 0).
4. Captions and labels: bilingual parity, every sentence appears in the guide or in content/BRIEF.md
   (`python tools/check_content.py` covers the guide text; check the scene captions by hand). Every caption opens with
   "Imagen ilustrativa" / "Illustrative image". No "3D" wording anywhere in scenes.json or the built pages. Badge text on
   all 28 pages is "Ilustración" / "Illustration".
5. Alt text on the current frame updates when the tab or slider changes (scenes.v3.js does this; confirm in the DOM on
   the car slider at three positions).
6. Old URLs: the 96 round-1 files, the 177 round-2 files and the 54 round-3 files (car 09 to 12 among them) must be gone
   from the deploy. Netlify's edge served stale copies of some on Nov 5 from the 7-day `/img/` cache; nothing links to
   them, so this is harmless. Check again after Nov 12 and expect 404. Grep the whole built site for any reference to the
   old names: expect none.
7. `/js/scenes.v3.js` is the only scene script on guide pages (28 pages); `scenes.v1.js` and `scenes.v2.js` must not be
   referenced anywhere.

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
7. Known on Nov 9: switching language on the page keeps the Spanish title in the browser tab. Report it under OPEN with
   the fix you would make (set document.title in setLang from the page's own title for that language); do not change it
   without Christian's yes, because it touches the homepage script.

## 5. Launch checklist pages

1. /terminos.html (one bilingual page; hreflang es and en both point at it): canonical and hreflang correct, in the
   sitemap, linked from every footer (40 pages, both "Privacidad · Términos" and "Privacy · Terms"; 404, gracias,
   privacidad and terminos have no footer). No em dashes, usted throughout, no carrier or employer names. cdd7348 added
   links between privacidad.html and terminos.html and back to the site: confirm they work in both languages and that
   the generators produce them (section 1).
2. The crawl group in verify.js passes against the live site (no 404s, no redirect loops, the trailing-slash rule holds).
3. Custom 404, robots, sitemap lastmod values, share images for the three ad guides: still correct after the Nov 9
   commits. /content/*, /tools/*, /ads/*, /site-tests/* and /handoff/* return 404 on the live site.

## 6. The pre-launch reel, item by item

Christian's reference: https://www.instagram.com/reel/Dc9jxR_PuFg/ ("20 things to have Claude do before launching your
website", millee.md). On Nov 4 the status was: 16 already in place, 2 added that day (terms page, alt text on the
plates), 1 skipped on purpose (cookie banner), 1 is the form validation that already existed. Re-check all 20 against
the live site, one line each in the RETURN FORMAT, with the evidence (file, header, screenshot or test line).

1. Privacy policy page: /privacidad.html (bilingual), linked from every footer (40 pages).
2. Terms and conditions page: /terminos.html (bilingual), linked from every footer, in the sitemap, cross-linked with
   the privacy page (section 5.1).
3. Secrets off the frontend: grep the built site and js/ for keys, tokens, Netlify or Google credentials; the only IDs
   allowed in the HTML are the GTM container id, the GA4 and Ads tag ids the container loads, and public form names.
4. Force HTTPS: http:// and the apex redirect to https://www.protectedlegacyfl.com with one hop; HSTS header present
   (netlify.toml sets max-age=31536000, includeSubDomains, preload).
5. Cookie consent banner: skipped on purpose. US audience, first-party cookies only, disclosed on the privacy page.
   Confirm no third-party cookies are set before consent on a fresh profile (list every cookie the homepage sets and its
   origin). If any third-party cookie appears, report it under OPEN; do not add a banner without Christian's call.
6. Meta titles and descriptions: unique per page, both languages; titles within 60 characters (six fixed on Nov 9),
   descriptions within 160 (fixed on Nov 5). Report any page over.
7. Social preview image: og:image and twitter:image on every page resolve (200, correct size); the three ad guides keep
   their own share images.
8. Favicon: favicon.svg plus the 32 and 192 PNGs resolve; apple-touch-icon present.
9. Sitemap and robots.txt: every indexable page in the sitemap (both languages, terms pages included), lastmod sane,
   robots allows the site and points at the sitemap.
10. Alt text on images: every `<img>` on all 44 pages has a non-empty alt (the scene frames update theirs per frame,
    section 3.5); the plate alts are bilingual.
11. Compress your images: section 2 covers it (size caps, clean bytes, avif/webp first in every `<picture>`).
12. Check page load speed: section 7.
13. Fix color contrast: run axe or Lighthouse accessibility on the homepage, one ES guide, one EN guide and terminos:
    every text/background pair at or above 4.5:1 (3:1 for large text), the gold on green included.
14. Mobile friendly: iPhone Safari and Android Chrome at 360 and 390 wide: no horizontal scroll on any of the 44 pages,
    tap targets at least 44 px, the scene sliders (car and flood) usable with a thumb.
15. Custom 404 page: /404.html served with status 404 for a missing URL, both languages reachable from it.
16. Broken links: the crawl group (section 5.2) plus every external link on the guides (status 200, no redirect to a
    login page).
17. Form validation: the contact form rejects empty required fields and a bad email client-side and server-side; the
    success page is /gracias.html. Do not submit the live form; verify the markup and the Netlify form definition
    only.
18. Spam protection: the Netlify honeypot field (netlify-honeypot / bot-field) is present on every form in both
    languages and hidden from users and screen readers.
19. Analytics: GTM container loads once per page (one gtm.js tag); under the enforced CSP the GA4 and Ads calls still go
    out (section 7.3); the privacy page agrees with what the tags set.
20. One clear call to action: every guide page keeps the single "Solicitar una revisión / Request a review" card
    (one primary CTA per page, no competing buttons added by any commit since Nov 4).

## 7. Performance and security headers

1. PageSpeed Insights (the public API or the web UI, not local Lighthouse) on the homepage, /guias-autos.html and
   /guias-inundacion.html, phone and desktop. Nov 9 baseline for the homepage: phone Performance 75 (FCP 1.3 s, LCP
   5.7 s, TBT 120 ms, CLS 0), Accessibility, Best Practices and SEO 100; desktop 88. The phone LCP element is the hero
   eyebrow ("Protección patrimonial · Florida"), with about 2.6 s of render delay waiting for its animation. Report the
   numbers and the top audits for each page. Do not change the hero animation: it is part of the protected cinema layers.
   Under OPEN, describe the smallest change that would show the eyebrow at once and keep the rest of the motion, with the
   LCP you expect, so Christian can decide.
2. Transfer size of /guias-autos.html and /guias-inundacion.html at phone width, first view, before and after dragging
   the slider across all steps (car 17, flood 9). Frames load only after the reader touches the scene (scenes.v3.js).
3. Content Security Policy (enforced since Nov 9): read the header from the live site (`content-security-policy`
   present, `content-security-policy-report-only` absent). Add a `csp` group to `verify.js`: serve the built site with
   the header taken from `netlify.toml`, load all 44 pages in Chromium, and fail on any `securitypolicyviolation` event
   (block external hosts so the run stays offline; a blocked request is not a violation). Then, on the live site, load
   the homepage, one ES guide, one EN guide, gracias.html and the hurricane checklist with a ReportingObserver for
   `csp-violation`: expect 0, and confirm gtm.js, GA4 collect and the Ads calls appear in the network log.
4. The other headers on `/*`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security and
   Permissions-Policy present on the live site.

## 8. PR #7 and the 3D assets

1. PR #7 (the Nov 4 Unreal order, sections 2.1 and 2.2) was closed on Nov 9 at Christian's word because it brought back
   the blockout look and conflicted with main. The branch `unreal-wo-2026-11` stays. Do not reopen or merge it.
2. Dead weight now that no page loads the 3D engine: img/scenes/3d (7 glb), img/scenes/flo3d (3 glb), js/casa3d.v1-3.js,
   js/flood3d.v1.js, tools/casa3d, site-tests/casa3d-check.js. Measure what they weigh in the deploy and confirm nothing
   on the live site requests them (network log on all 28 guide pages and the homepage). List them under OPEN with a
   recommendation (with PR #7 closed, the case for removing them is stronger); delete nothing without Christian's yes.

## 9. Full suite, last

`node site-tests/local-netlify.js <abs repo path> 8787 &` then
`BASE=http://localhost:8787 OUT=<abs> NODE_PATH=$(npm root -g) node site-tests/verify.js` (every group, no ONLY filter;
the `netlify.toml` served-locally failure is the only accepted failure), `node site-tests/scenes-check.js` (28 pages),
and the new `imgclean` and `csp` groups. `casa3d-check.js` has nothing left to check; report that rather than running it.

## RETURN FORMAT

Reply with, in this order:
1. BUILD: the chain's diff against main (file list), what you folded back into the generators, the add-scenes
   idempotence result, the frame count per folder.
2. IMAGES: imgclean hits (expect 0), plate sizes table, any frame above the size caps.
3. SCENES: scenes-check pass/fail counts per page (28), CLS per page, the screenshots listed in 3.2, the 404 check on the
   old URLs (with the cache caveat), the grep for old names, the data-3d/loader grep (expect 0).
4. HOMEPAGE: gold pixel count per browser, counters OK/not, CLS, reduced-motion result, myths cue result, the tab title
   finding.
5. LAUNCH: footer link count (expect 40 pages), legal cross-links, crawl result, sitemap check, the 404 rules.
6. REEL: the 20 items, one line each: OK / FIXED (what) / OPEN (why), with evidence.
7. PERF AND HEADERS: PageSpeed phone and desktop for the three pages, transfer sizes, the live CSP header, csp group
   result, live violations (expect 0) and the tag calls seen, the other headers.
8. FIXES: every change you made, one line each, with the file.
9. OPEN: anything that needs Christian's call (the hero LCP change, the tab title fix, the 3D assets, any cookie finding).
10. PR: the branch name and PR link, with all of the above pasted in the PR body.
