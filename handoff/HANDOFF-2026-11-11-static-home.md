# Nov 11: what the homepage says before any script runs (branch `fixes-2026-11-11`)

Starts from `main` at dc5ce89. Not merged; merging and the production deploy are Christian's call.

## Why
An outside review of the live site (Nov 11) reported wrong figures on the four stat cards ("5.9%", "17%", "$14mil+", "0M+"). The site was not wrong: the reviewer's browser took its snapshot while the cards were counting up, and the HTML itself said `0`. Anything that reads the page without running the script, or stops it mid-count (some crawlers, AI readers, share previews, a visitor with scripts off), saw `0%` or a half-counted number on a site whose point is verified numbers. The same look at the raw HTML showed two more things only a script provided: the links to the 14 guides in "Los 14 dominios", and the JSON-LD block.

The rest of that review was checked against the live site and did not hold: the sitemap (42 pages, hreflang), `robots.txt`, IndexNow (run Nov 10, 202), the English page (dropdown, honeypot label, "14 in-depth guides", November 2026, the Fed figures) and the legal pages (both linked and canonical as `.html`) were already right.

## What changed (homepage only: `index.html`, and `en.html` from the build)
1. Stat cards (`#datos`): the HTML now holds the real figure (`25.9%`, `74%`, `$63mil+` / `$63K+`, `1M+`) inside `<span class="nv">`, and the script never rewrites it. The count-up is drawn by `.num.counting::before` from a `data-live` attribute while `.nv` is hidden (`position:absolute;opacity:0`). The page text is the real figure on every frame. With reduced motion nothing counts, as before.
   - The `$63` card keeps its `data-es` / `data-en`; they now include the `nv` span.
2. `#domGrid` is no longer empty in the HTML: it holds 14 plain links (`a.dom-static`), one per domain, to the Spanish guides on `/` and the English guides on `/en/`. `buildDomains()` replaces them with the interactive cards as before, so a visitor with scripts on sees no difference.
3. JSON-LD: the `WebSite` block that a script used to add is now written in the `<head>`. Same content, plus the author's `jobTitle` and license credential exactly as the 28 guides already carry them. `en.html` gets the English description. The script no longer adds a block (one block per page, not two).
4. `tools/build_en.py` stops the build if: a stat card does not show its own `data-count`; the plain list is not 14 links that match `GUIDE_URL` and the domain names in `DOMS`.
5. `sitemap.xml`: only the build date of the 12 pages that are not guides (the build stamps them; Nov 11).

Nothing else was touched: no wording, no numbers, no sources, no cinema layers, no ES/EN switch code, no guide page.

## Checks (Nov 11, local stand-in server)
- Build chain: every step exit 0, and a second run changes nothing. Run the whole chain, never `build_en.py` alone: on its own it writes an `en.html` without the post-build steps.
- One-off script, 50 of 50, both languages:
  - without JavaScript: the four figures read right, 14 guide links, each answers 200, one valid JSON-LD block with the license, description in the page's language;
  - with JavaScript at 390 and 1366 px: `textContent` and `innerText` of the four cards equal the real figure on every animation frame (about 260 frames per run) while each card counts up; the count ends clean; one JSON-LD block; 14 interactive cards and no plain link left; the ES/EN switch keeps the figures; no script errors;
  - reduced motion: figures present, nothing counts.
- Against `main`: position and size of the four numbers and their superscripts identical at 390 and 1366 px in both languages. Screenshots of the cards at rest: identical byte for byte at 1366 px in both languages; at 390 px, 7 to 17 pixels of about 300,000 differ, at the edge of the floating buttons that sit over the cards, and two runs of `main` differ from each other in the same way.
- `site-tests/verify.js`: 98 of 99; the one failure is the known local-only check (the stand-in server serves `/netlify.toml`).
- `site-tests/scenes-check.js`: 328 of 328 real checks pass; the other 56 lines are the sandbox blocking Tag Manager (one console error per guide page and width), not the site.

## After it is live
- Nothing to run. The sitemap is already in Search Console (read Nov 10, 42 pages, Success).
- Optional: `python3 tools/indexnow.py / /en/` tells Bing the two homepages changed.
