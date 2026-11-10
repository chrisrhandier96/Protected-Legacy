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

## Not done, Christian's call
- Turning off Cloudflare's bot protection would remove its script from the pages. Not recommended. It is a setting in his Cloudflare account.
- Trimming pages to make room for Cloudflare's script would cost a deploy and change nothing for a visitor.

## Still open from pull request #8 (Christian's call, details in the pull request)
1. Hero LCP on the homepage: showing the eyebrow without the fade does not move LCP (3.1 s as built and in the three variants tested, on the local build). What would move it is deferring the homepage's own script work, to be tried on a deploy preview. The hero animation is protected and was not changed.
2. The tab title stays Spanish after switching to English on the same page. Fix: set `document.title` in `setLang`. Needs his yes, the language toggle is protected.
3. About 3.3 MB of 3D files are deployed and nothing loads them (list in section 8 of the pull request). Recommendation: remove them in one commit. Nothing was deleted.
4. Cookies: Google Ads sets a third-party test cookie on doubleclick.net and fires remarketing calls, while the privacy page says the tags keep first-party cookies. Either the wording or the Ads settings (remarketing off) would close the gap. No banner was added.
5. `http://` on the bare domain takes 2 redirects to reach `https://www` (a dashboard setting).
6. Two broken external sources with no verified replacement: floridarevenue.com gt800034.pdf (guide key `str`) and iii.org floaters-and-endorsements (guide key `col`).
7. The form has no server-side validation beyond the honeypot.
8. Controls under 44 px outside the scenes (list in reel item 14 of the pull request).
9. The domain cards need JavaScript to appear.
10. 25 scene captions and pins are paraphrases, not quotes. Every fact traces to its source.
11. Flood pictures: from 2 ft up, the bottom of the reflection shows vertical streaks (faint at 2 ft, strong at 10 and 12 ft). Not regenerated.
