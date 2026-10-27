# Hand-off notes: call-me strip, the guided path on the umbrella guide, and the home page layout shift fix (2026-10-26)

Two changes aimed at the ad landing pages, which held visitors for about a minute and a half but turned almost none of them into a conversation, plus a fix for the layout shift the first one caused on the homepages.

## 1. Call-me strip (live on `main` since 2026-10-26, commits b6684fc, 3860ff0, 9fee2cb)

- `/js/lead-strip.v1.js` draws a two-field card (name, phone or WhatsApp) in `<div id="leadStrip">`: near the top of all 28 guides and under the hero buttons on both homepages (dark variant there).
- It posts to the Netlify form `contacto` with `form_id=strip` and the usual hidden fields (topic, language, ad source, campaign, term, gclid, landing page), then pushes one `generate_lead` with `lead_source: 'strip_<page_type>'` and `form_id: 'strip'`. The thank-you shows in place.
- Both homepages also got a second hero button, "Llamar · (786) 671-2171" / "Call · (786) 671-2171" (`data-track="llamada"`).
- `tools/post/add-lead-strip.js` puts the slot and the script on the flat pages. **Fixed with the guided path:** it was not in `tools/postbuild.js`, so a rebuild dropped the strip from every guide. It is now the last post-build step.

## 2. Guided path on the umbrella guide (live on `main` since 2026-10-26, merge 42a7f68, PR #3)

- **Umbrella guide only** (`/guias/umbrella-responsabilidad/`, `/en/guides/umbrella-liability/`). The 4-question quick check is gone from these two pages; `/js/quick-check.v1.js` stays in the repo, unused, for a rollback.
- `/js/guide-path.v1.js` (deferred) draws the card in `<div class="topcta gpath no-print" id="guidePath">`, first in the article, with the call-me strip right under it.
  1. "¿Cuál es su duda sobre la umbrella?" with six doubts: how much, what it covers, boat/rental/cars, is it worth it, board service, something else. The two links every top card carries stay under them, with their old `data-cta` names (`guide_top_quiz_lia`, `guide_top_write_lia`).
  2. One question about the family (multi-pick where it fits, "Ninguna de estas" / "No estoy seguro" clear the rest).
  3. The short answer, a link to the full section, a source line, and a call-me form (name and phone required). "Otra duda" goes straight to the form with an optional free question.
- **Copy rule:** every answer line is a sentence this guide already says, shortened, in the same language, with the same sources (III, NAIC, Florida Statutes 768.125, 617.0834 and 718.111, the 20.6% uninsured-driver figure for 2023). No carrier names, no prices, no em dashes. If the guide text changes, change the matching line in `D` in the script and bump the version (`guide-path.v2.js`, in `tools/build_library.py` too).
- **Form:** posts to `contacto` with `form_id=path`, `tema` "Responsabilidad y umbrella", the attribution fields, and `mensaje` = "Duda (guía umbrella): <doubt> · Marcó: <picks> · Pregunta: <free text> · <path>". One request per tap (double taps and a second Enter are ignored).
- **Build:** `tools/build_library.py` now emits the path slot for `lia` instead of the quick check. A full rebuild (`python3 tools/build_library.py && python3 tools/flatten.py && node tools/postbuild.js`) reproduces all 28 guides byte for byte. The only drift a rebuild shows is older and unrelated: `#a-na` in the a11y colour rule on `index.html` and `en.html`, and the sitemap dates.

## 3. Home page layout shift from the strip (fixed 2026-10-26)

- Found while testing the guided path: on both homepages the strip is drawn under the hero buttons after the first paint, so the hero grew by the card's height and pushed the skyline down. Desktop CLS on `/?3d=1` at 1440x900 went from 0 to 0.049 (0.105 on an iPad Pro in portrait), and the two `3D` checks (CLS 0.02 or less) failed.
- Fix: `<style id="ls-reserve">` in `index.html` and `en.html` reserves the card's box before the script runs: the dark card's margins at every width, and from 701 px up its height per language and width (ES 266.61 px up to 989 px, then 245.61; EN 284.61 up to 729, 266.61 up to 870, then 245.61). Each step sits 20 px past the measured wrap point, so a classic 17 px scrollbar never makes the card taller than its box. After a send, the thank-you releases the height (`:has(.ls-done)`).
- Result on the local server, same method as the suite: `/` and `/en/` at 1440x900, CLS 0 in 3 runs each; desktop widths 705 to 2560 px at most 0.0045; iPad Pro portrait 0.0013; phones 0, as before.
- Below 701 px nothing is reserved: on phones and tablets the strip sits at or below the fold and the shift is 0 with or without it. A desktop window narrower than 701 px still shifts (about 0.16 at 700x900).
- If the strip copy or its CSS changes (a `lead-strip.v2.js`), measure the card height across widths again and update the numbers; the `3D` checks catch a desktop regression.
- `en.html` is normally generated from `index.html` by `tools/build_en.py`, but the live `en.html` carries hand-tuned title, description and share tags that the generator does not reproduce, so the same style block was added to both files by hand. Running `build_en.py` as it is would revert those tags.

## dataLayer

- `cta_click` with `cta`: `path_start_<id>`, `path_answer_<id>`, `path_section_<id>`, `path_restart`. Tag Manager already forwards `cta_click` to GA4, so nothing changes there.
- `generate_lead` with `lead_source: 'path_<id>'` (`path_limit`, `path_cover`, `path_assets`, `path_worth`, `path_board`, `path_other`), `form_id: 'path'`, `page_type: 'guide'`, `language`. The Google Ads conversion fires from the existing `generate_lead` tag.

## Weight and layout shift (local server, same method as `site-tests`)

| Page | main | branch |
|---|---|---|
| Umbrella guide ES, transfer (gzip text + images) | 136.6 KiB | 141.9 KiB |
| Umbrella guide EN, CLS desktop 1366x768, slow 4G + CPU 4x, 3 runs | 0.017 / 0.017 / 0.030 | 0.016 / 0.013 / 0.013 |
| Umbrella guide ES and EN, CLS phone 390x844 | 0 | 0 |

The +5.3 KiB is the path script (11.1 KiB compressed) minus the quick check it replaces (5.4 KiB) and its markup. Both cards are drawn by deferred scripts, so on desktop the summary box can move down a little when they appear; it stays well inside "good" (0.1). Rendering the first screen in the HTML would bring it to 0 if that ever matters.

## Tests (`site-tests/verify.js`)

- `umbrella` group rewritten for the path, 11 checks: the start screen at 390 px (first in the article, above the strip, six doubts, the two links, no quick check); the multi-pick answer with a working section link and the `cta_click` events; name and phone required, one request with the doubt, the picks and the attribution, one `generate_lead`, thank-you in place; the car answer with the Florida figure and a working link, restart; the free question in the message; other guides untouched.
- `guidecta`: the card check now allows the call-me strip next to the card, and the phone check measures the first call to action (strip or card).
- Run locally: `node site-tests/local-netlify.js . 8787` in one terminal, then `BASE=http://localhost:8787 BLOCK_GTM=1 ONLY=guidecta,umbrella node site-tests/verify.js`.

## Next

- Watch for a week: `path_start_*` against page views, `path_answer_*`, and `generate_lead` with `form_id: 'path'` against `strip` and `guia`.
- If it earns its place, the same script can take a second config for the next most visited guides (flood, hurricane), with each guide's own sentences.
