# QA, Nov 9 2026: what went live and what the live checks found

Work order: `handoff/WORK-ORDER-qa-2026-11-04.md`. What was checked and fixed, with the numbers before the deploy, is in pull request #8 (branch `qa-2026-11-09`).

## What went live
- Pull request #8 was merged to `main` on Nov 9 2026, 23:43 Eastern (merge commit 56fae51). One production deploy.

## Live results after the deploy (Nov 10)
- `verify.js` against https://www.protectedlegacyfl.com, every group: 98 of 99 passed. The one failure is explained below.
- `scenes-check.js`: 384 passed, 0 failed.
- PageSpeed on live: the homepage on a phone 75 for performance (72 before the deploy), LCP 5.6 s (5.9 s before); the homepage on desktop 68, accessibility 100 (97 before); the flood guide on a phone 97. Accessibility, best practices and SEO are 100 on all three.

## The one failure: the page weight check counted Cloudflare's own files
The check in `verify.js` (group `three`, "code, text and fonts within 85 KiB") failed on live for 6 of the 32 guide and tool pages: 66 to 95 KiB counted. The same build passes on the local stand-in server: 50 to 79 KiB.

Cause: the check counted every file served from the site's own address. On live, Cloudflare adds two files of its own to every page:
- `/cdn-cgi/challenge-platform/.../scripts/jsd/main.js`, the JavaScript Detections script of its bot protection: 14.5 to 18.0 KiB, a different size from page to page. Cloudflare runs it after the page has loaded.
- `/cdn-cgi/speculation`: 0.1 KiB.

Measured file by file on live (Nov 10, all 32 pages): the site's own code, text and fonts are 50.2 to 79.3 KiB, the same as the local build. The heaviest is the umbrella guide (79.3 KiB in Spanish, 78.7 in English). No page is over the limit on its own files, so the deploy did not make any page heavier. The earlier passing runs of this check (Nov 3 and Nov 9) were against local servers, where Cloudflare is not in front.

## What changed in the test (test only, no page changed)
`site-tests/verify.js`: files under `/cdn-cgi/` go to their own bucket. The 85 KiB limit stays on the site's own files. Cloudflare's files are printed in the result line as "reported, not counted", so a jump in them is still visible.

Result with the change, group `three`, Nov 10:
- Local stand-in server: 10 of 10. `32 pages, 50 to 79 KiB; images 9 to 131 KiB; live 3D 0 to 0 KiB; Cloudflare /cdn-cgi/ files (reported, not counted) 0 to 0 KiB`.
- Live: 10 of 10. `32 pages, 50 to 79 KiB; images 9 to 131 KiB; live 3D 0 to 0 KiB; Cloudflare /cdn-cgi/ files (reported, not counted) 15 to 18 KiB`. The other groups were not run again; they passed in the full live run after the deploy.

## Nov 10, second batch: pull request #9 and this branch in one deploy
Christian's word: "merge branch pass-2026-11-10 into your work, then deploy once". Branch `pass-2026-11-10` (pull request #9, the work of another session) was merged into this branch, `post-deploy-2026-11-10`, unchanged (merge commit d28f82a), so that both go live in one production deploy.

What pull request #9 brings (details in that pull request):
- Flood guide, both languages: the slider frames from 2 ft up were rebuilt without the vertical streaks in the reflection (`flo-rise-02b` to `flo-rise-12b`, 42 files, 2617 KiB). The frames for normal tide and 1 ft are unchanged.
- Homepage: the tab title follows the language switch. Two lines in `setLang` in `index.html`; `tools/build_en.py` stops if the English title does not match. The language switch is protected: Christian's instruction to merge that branch and deploy is the yes.
- Two sources that had moved: guide key `col` (iii.org) and guide key `str` (floridarevenue.com, GT-800034).
- Privacy page: the cookies sentence now says that the tags can store cookies in the browser, this site's own and ones on Google domains such as doubleclick.net.
- `.gitattributes` keeps text files on LF, the build tools write LF, and the notes carry the full build command with `build_en.py`.

Checks on the merged tree before the deploy (Nov 10, local stand-in server):
- Build chain: every step exit 0, and a run changes nothing.
- `verify.js`, every group: 98 of 99 passed. The 1 is the known local only check that `/netlify.toml` is not served. Page weight line: `32 pages, 50 to 79 KiB; images 9 to 131 KiB; live 3D 0 to 0 KiB; Cloudflare /cdn-cgi/ files (reported, not counted) 0 to 0 KiB`.
- `scenes-check.js`: 384 passed, 0 failed.
- One-off check, not part of the suite: 10 of 10. The tab title follows ES and EN on `/` and on `/en/`. The flood slider in both languages lists the 9 frames and loads each one when moved, and no old frame is requested.
- Before and after, looked at by eye at 960 px: the old 10 ft frame has the streaks in the bottom third of the picture; the new 2, 6, 10 and 12 ft frames do not.
- Source links: the iii.org page answers 200. The floridarevenue.com link answers 401 to a script, and the old address without `www` answers 404: that server turns scripts away. Pull request #9 states that both pages were opened and checked against the sentences they support. The Florida page was not opened in a browser in this session.

## Live results of the second batch (Nov 10)
- Pull request #10 (branch `post-deploy-2026-11-10`, with pull request #9 merged in up to its sixth commit, 08ee1e7) was merged to `main` on Nov 10 2026, 09:05 Eastern (merge commit dc41ce7). One production deploy: Netlify deploy `6af324af6856bf0ce09e704c`, state ready, published 09:05:46 Eastern, commit dc41ce7.
- Smoke test on live: `/`, `/en/` and `/guias/inundacion/` answer 200 with the 6 security headers, and the Tag Manager loader is on each page once. Both flood pages list `flo-rise-00`, `flo-rise-01` and the seven `b` frames. The privacy page carries the new cookies sentence.
- The one-off check described above, against live: 10 of 10.
- `verify.js` against live, every group: 98 of 99 in the full run (09:10 to 09:46 Eastern). The one failure was the layout shift on `/?3d=1` at desktop width: 0.0239 against a limit of 0.02. That run shared the PC with a large C++ compile. Rerun of that group with the PC idle (09:56): 10 of 10, layout shift 0.0002. Page weight line: `32 pages, 50 to 79 KiB; images 9 to 131 KiB; live 3D 0 to 0 KiB; Cloudflare /cdn-cgi/ files (reported, not counted) 15 to 18 KiB`.
- `scenes-check.js` against live: 378 of 384 in the full run (09:46 to 09:52 Eastern), during the same compile: five layout shift figures of 0.0202 to 0.0301 against a limit of 0.02 and one failed tab swap check, on five guide pages that this deploy did not change. Rerun with the PC idle (09:59 to 10:03): 384 of 384, highest layout shift 0.0139, the same figures as in the live run after the Nov 9 deploy. Lesson: run the browser suites on an idle PC, because the layout shift and tab checks are timing sensitive.
- The same results are in a comment on pull request #10.

## What missed that deploy, and why
- Pull request #9 received a seventh commit at 09:01 Eastern, four minutes before the merge: 59a47d6, the homepage headline on phones. The note asking for that commit and for a cleanup to go out in the same deploy (`FOR-CODE-one-deploy-2026-11-10.md`, in the handoff folder on Christian's PC, not in the repo) was saved at 09:04.
- The merge was made at 09:05 from the tree that had been tested, with pull request #9 at its sixth commit. Right before the merge, `main` and the head of pull request #10 were checked again. The head of pull request #9 was not, and the note was read after the merge.
- Lesson: right before a merge to `main`, check the head of every pull request in the batch, not only your own.
- Nothing was rolled back. Both pieces are on the branch below. Christian asked on Nov 10 for them to go live the same day: a second production deploy, made by merging that branch's pull request.

## Nov 10, second deploy: branch `batch2-2026-11-10`
The branch starts from `main` at dc41ce7 and holds two pieces. Christian said yes to both on Nov 10, in the note named above. The live results of this deploy are in a comment on the branch's pull request and not in this note: adding them here would cost a third deploy.

The homepage headline on phones: commit 59a47d6 from pull request #9, merged unchanged (merge commit 90e7d55). It touches the cinema layer on purpose. Do not revert it.
- The hero `h1` is visible from the first paint and keeps the rise without the fade (`ppRiseShow` in `<style id="pp-cinema">`).
- The word by word entrance runs only on a language switch after the page has loaded (`.hero h1.pp-swap .w`; `setLang` sets the class).
- Reduced motion behaves as before.
- Files: `index.html` and the generated `en.html`, 5 lines added and 2 removed in each.

A fix found while checking this branch: commit 0a779b0 preloads the accent font of the headline (`/fonts/cormorant-garamond-italic.woff2`, next to the existing preload of the headline font) in `index.html`, and `en.html` follows from the build. With the headline visible from the first paint, the accent word ("Extraordinario." / "Extraordinary.") grew when its web font replaced the fallback, about half a second after the first paint, and pushed a word of the headline to the next line while it was on screen. Before the fix: layout shift 0.1085 on the English homepage at 1366x768 (live at dc41ce7: 0.0189) and 0.056 to 0.088 at 768x1024 in both languages; `verify.js` failed on `/en/?3d=1` at desktop width in 3 runs of 3. After the fix: 0.0000 at 390, 768, 1024, 1366 and 1440 widths in both languages, and the first paint on a slow phone is unchanged (median of 5 runs on `/`: 2100 ms with the preload, 2156 ms without). Christian said yes to this fix on Nov 10. It does not touch the animation layers or any wording.

The cleanup: commit 508f0fd removes 61 files that no page loads, 6310 KiB (about 6.2 MB).
- The live 3D files, 3532 KiB: the 7 models in `img/scenes/3d/`, the 3 models in `img/scenes/flo3d/`, `js/casa3d.v1.js`, `js/casa3d.v2.js`, `js/casa3d.v3.js`, `js/flood3d.v1.js`, `tools/casa3d/` (4 files) and `site-tests/casa3d-check.js`. No page has referred to them since commit e45d25c (Nov 5 2026), when the guide pages switched to the photo scenes.
- The 42 old flood frames, 2778 KiB: `flo-rise-02`, `03`, `04`, `06`, `08`, `10` and `12` without the `b`, each in 3 widths and 2 formats.
- Kept: `js/hero3d.v1.js` and `tools/hero3d/` (the homepage refers to hero3d), `flo-rise-00`, `flo-rise-01` and the seven `b` frames.
- Do not use the removed names again: `/js/` is cached forever and `/img/` for 7 days. To bring a file back: `git checkout dc41ce7 -- <path>`.
- `site-tests/verify.js`, the page weight check in group `three`: it now also fails if a page asks for one of the removed 3D files, so the "live 3D" figure in its result line has to stay at 0.

The guide explainers: branch `remotion-2026-11` (commits 583d00c, e6c4673 and dcd4978, on top of 59a47d6), merged without conflicts (merge commits 6b33da3 and bca6488). Its note (`FOR-CODE-remotion-explainers-NEXT-deploy.md`, on Christian's PC) planned it for the deploy after this one; on Nov 10 Christian asked for it to go out in this same deploy, to save a production deploy.
- One 10 second loop on each of the 14 guides, rendered with Remotion. Only numbers appear on screen; the words are in the page's caption, so one file serves both languages. The numbers are the ones already in each guide, with the same sources.
- Files: `img/vid/*.v1.mp4` (H.264), `*.v1.webm` (VP9 fallback) and `*.v1.webp` (poster), 14 clips, 2.2 MB in all. Nothing loads until a clip comes near the screen (`/js/vexp.v1.js`, on the 28 guide pages); reduced motion keeps the poster.
- Five guide titles matched to search queries: boats, aviation, kidnap and ransom and short-term rentals in English, flood in Spanish.
- Generator: a `video` block in `tools/build_library.py` and the content files; the Remotion source is in `tools/remotion/` (see its README).
- Search (dcd4978): the aviation guide gains one sourced paragraph on the federal charter insurance minimums (14 CFR Part 205, new source 14, ES and EN); every guide's `updated` date is Nov 10 and the sitemap uses each guide's own date; `build_library.py` also writes `/llms.txt`; an IndexNow key file `/7cfc983ec2e2ffe0fb73434c6acc4973.txt` and `tools/indexnow.py`, run once after the deploy.

Checks on this branch (Nov 10, local stand-in server):
- Build chain: every step exit 0, and a run changes nothing.
- `verify.js`, every group: 98 of 99 on the final tree (bca6488). The one failure is the known local-only check: the stand-in server serves `/netlify.toml`, Netlify does not. Layout shift on `/?3d=1` 0 and on `/en/?3d=1` 0.0021 (0.0865 before the font fix). Page weight line: `32 pages, 50 to 79 KiB; images 9 to 144 KiB; live 3D 0 to 0 KiB; Cloudflare /cdn-cgi/ files (reported, not counted) 0 to 0 KiB`.
- `scenes-check.js`: 384 of 384, `SCENES: all passed`.
- One-off checks, not part of the suite:
  - Tab title and flood slider, as described above: 10 of 10 (the tab title follows the language on `/` and `/en/`; both flood pages list `flo-rise-00`, `flo-rise-01` and the seven `b` frames; moving the slider through all 9 levels loads every frame, none broken, no old frame requested).
  - A crawl of every page in `sitemap.xml` and of the 404 page, at a phone width and a desktop width, that scrolls each page from top to bottom, moves every slider and presses every scene button: all passed. All 42 pages answer 200 and the 404 page answers 404, at both widths; no page asks for a removed file (1497 requests, 56 scenes, 104 slider steps, 160 scene buttons); no request to the site answers 400 or more; no broken picture among 606.
  - The explainers: on all 28 guide pages at phone width the clip loads nothing until it is scrolled to, then plays (time advancing, a decoded frame, poster and caption present); with reduced motion the poster stays and no clip is fetched: 29 of 29.
  - The headline, measured frame by frame against the build before the change: 71 of 71, before and after the font fix. On phones, small phones and desktops the headline is fully visible in every frame from the first one, keeps its rise, plays the word by word entrance only on a language switch, and with reduced motion nothing moves. On the build before the change, a slow phone showed the headline for a moment, then hid it for about two seconds (about 3.0 s to 5.0 s after opening) before it faded back in. Largest paint on the local server: on a 320 px phone and on a 1366 px laptop it is now the headline at about 0.4 to 0.5 s, against 1.2 to 1.4 s on the build before; on a 390 px phone it is the paragraph under the headline, at about 1.2 s in both builds.

Deploy previews: Netlify still builds a preview for a commit whose message carries `[skip netlify]` (59a47d6 got preview deploy `6af323b6ae12e755246e3d8c`, state ready). Previews cost nothing. The tag stays on branch commits, and the merge commit to `main` does not carry it.

## Not done, Christian's call
- Turning off Cloudflare's bot protection would remove its script from the pages. Not recommended. It is a setting in his Cloudflare account.
- Trimming pages to make room for Cloudflare's script would cost a deploy and change nothing for a visitor.

## Closed on Nov 10 by pull request #9 (item numbers as in pull request #8)
- Item 2: the tab title now follows the language switch.
- Item 4: cookies. The privacy page wording now matches what the tags do. No banner was added and no Ads setting was changed.
- Item 6: the two broken sources point to where the pages moved.
- Item 11: flood pictures. The frames from 2 ft up were rebuilt without the streaks.

## Closed by branch `batch2-2026-11-10` once it is on `main` (item numbers as in pull request #8)
- Item 3: the unused 3D files and the 42 old flood frames are removed (commit 508f0fd, 61 files, 6310 KiB).

## Still open (Christian's call, item numbers and details as in pull request #8)
- Item 1: hero LCP on the homepage. A first step goes live with branch `batch2-2026-11-10`: the headline is in the first paint (59a47d6). Pull request #9 says the lab scores both versions the same on most runs, so the proof is PageSpeed on the live homepage after that deploy (LCP on a phone was 5.6 s after the Nov 9 deploy). Still untried: deferring the homepage's own script work, to be tried on a deploy preview. Showing the eyebrow without the fade did not move LCP (3.1 s as built and in the three variants tested, on the local build).
- Item 5: `http://` on the bare domain takes 2 redirects to reach `https://www` (a dashboard setting).
- Item 7: the form has no server-side validation beyond the honeypot.
- Item 8: controls under 44 px outside the scenes (list in reel item 14 of pull request #8).
- Item 9: the domain cards need JavaScript to appear.
- Item 10: 25 scene captions and pins are paraphrases, not quotes. Every fact traces to its source.
