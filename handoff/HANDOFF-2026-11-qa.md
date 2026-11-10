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

Live results of this batch: in a comment on the pull request of this branch.

## Not done, Christian's call
- Turning off Cloudflare's bot protection would remove its script from the pages. Not recommended. It is a setting in his Cloudflare account.
- Trimming pages to make room for Cloudflare's script would cost a deploy and change nothing for a visitor.

## Closed on Nov 10 by pull request #9 (item numbers as in pull request #8)
- Item 2: the tab title now follows the language switch.
- Item 4: cookies. The privacy page wording now matches what the tags do. No banner was added and no Ads setting was changed.
- Item 6: the two broken sources point to where the pages moved.
- Item 11: flood pictures. The frames from 2 ft up were rebuilt without the streaks.

## Still open (Christian's call, item numbers and details as in pull request #8)
- Item 1: hero LCP on the homepage. Showing the eyebrow without the fade does not move LCP (3.1 s as built and in the three variants tested, on the local build). What would move it is deferring the homepage's own script work, to be tried on a deploy preview. The hero animation is protected and was not changed.
- Item 3: about 3.3 MB of 3D files are deployed and nothing loads them (list in section 8 of pull request #8). Since pull request #9 the 42 old flood frames are in the same position (`flo-rise-02` to `flo-rise-12` without the `b`, 2778 KiB): deployed, and no page uses them. Recommendation: remove both in one commit. Nothing was deleted.
- Item 5: `http://` on the bare domain takes 2 redirects to reach `https://www` (a dashboard setting).
- Item 7: the form has no server-side validation beyond the honeypot.
- Item 8: controls under 44 px outside the scenes (list in reel item 14 of pull request #8).
- Item 9: the domain cards need JavaScript to appear.
- Item 10: 25 scene captions and pins are paraphrases, not quotes. Every fact traces to its source.
