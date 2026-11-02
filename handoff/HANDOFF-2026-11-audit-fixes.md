# Audit fixes, Nov 1 2026

What changed, from the Nov 1 site audit (hotel page "Hotel Domi Audit"):

1. Legal notice: the license sentence is now baked into both homepages (ES and EN, Lic. W606240). The script that used to fill `{{LIC}}` stays as a no-op fallback. Crawlers and no-JS renders no longer see the raw token.
2. Guides: a layout-shift guard for the call-me strip, injected by `tools/post/add-lead-strip.js` as `<style id="ls-reserve-guide">` in the head of all 28 guides. Heights measured with Playwright per language and width (268px from 701px up; 404 to 535px on phones). Strip-caused shift on the guides went from up to 0.196 to 0 at every width tested. The homepages keep their own reserve.
3. Boats guides: "Jet Ski" is gone from the title, meta, Open Graph, TOC, H2, FAQ and JSON-LD. House rule: Personal Watercraft (PWC). Source: `content/guides/mar.json`.
4. The 25.9% reconstruction-cost figure on the glossary and hurricane tool now carries its source inline (Verisk), since those pages have no footnote block. Source: `content/extras/glossary.json`, `hurricane.json`.
5. Home library card: "14 guías a fondo / 14 in-depth guides" (was 8) with "y seis temas más / and six more".
6. `en.html`: English default text for the 24 form options, the Library panel title, its close label and the honeypot label (they used to show Spanish until the script swapped them).
7. Sitemap lastmod refreshed by the build (2026-11-01).

Not changed, needs Christian's call:
- WhatsApp buttons on the guides dial the cell (786 731 5265), not the PP line. Keep (if the Google Voice line is not on WhatsApp) or switch those two buttons to sms:.
- NFIP average payout: the site says $63,691, correctly cited to FEMA's July 2025 toolkit. FloodSmart's live flood-risk page says $82,614 (2020 to 2024, all claims). Pick one source and the tile, the guide line and the sources note move together.
- The 64% underinsured figure (CoreLogic/Cotality) has no date or link.

Build: `python3 tools/check_content.py && python3 tools/build_library.py && python3 tools/flatten.py && node tools/postbuild.js` (run here; output verified).
