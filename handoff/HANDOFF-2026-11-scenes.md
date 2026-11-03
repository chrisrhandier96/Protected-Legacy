# Interactive 3D scenes, Nov 3 2026

What changed:

1. Five guides now carry one interactive 3D illustration each, both languages, right after the summary box ("En resumen" / "In short"). The frames are Unreal renders of Casa Patrimonio, a hypothetical waterfront home (Unreal session, `Downloads\ue-renders\pp\`). Every scene is labelled "Ilustración 3D / 3D illustration".
   - Flood (`flo`): "How high is the water?" slider, nine frames from normal tide to 12 ft above the first floor.
   - Homes and hurricanes (`res`): six tabs, prepared, not prepared, tropical storm, Category 1, Category 3, after.
   - Condos (`cnd`): cutaway unit with three toggles that tint the association's part, the unit finishes and the owner's belongings. The tints come from the render's ID mask, so they line up with the frame.
   - Umbrella (`lia`): aerial view with six numbered pins (pool, boat, PWC, cars and young drivers, events at home, household staff) linked to numbered notes under the image.
   - Renovations (`ren`): before, during the work, after.
2. Copy: every caption and note repeats a sentence the same guide already says, or a fact listed in `content/BRIEF.md` (FEMA one inch, FWC PWC shares, 768.125, the condo split from 718.111). No selling, no carriers, no limits. Source of all scene copy: `tools/scenes/scenes.json`.
3. Images: `img/scenes/<key>/<frame>-{480,960,1600}.{avif,webp}`, 5 to 18 KB per frame at 960 (1.7 MB for all 27 frames in every size and format; a visitor downloads one size). Built by `tools/scenes/build_scene_images.py` (Pillow 11.3+ with AVIF, numpy), which also writes the condo tint layers and `tools/scenes/hotspots-lia.json` (pin positions from the mask).
4. Markup: `tools/post/add-scenes.js`, a new postbuild step (runs before the lead strip). Static HTML with a fixed 16:9 box, so the scenes add no layout shift. Script: `js/scenes.v1.js` (defer, immutable cache: rename it if it changes). It preloads a scene's frames when the scene is 600 px from the viewport and swaps frames only after the next one is decoded. One `scene_interact` dataLayer event per scene per page view (GTM can count use; nothing is tagged yet).
5. Umbrella guides, layout-shift fix (was live): the guided path filled its slot after the first paint and moved the card above the call-me strip, up to 0.55 CLS on phones when a visitor scrolled early (seen on the live site in about 1 run in 3). `tools/build_library.py` now emits `<style id="gp-reserve">` with the card's order and its measured height per language and width. Measured in Chrome with Playwright from 300 to 760 px. Measure again if the guided path's copy or CSS changes.
6. Tests: `site-tests/scenes-check.js` (each scene, both languages, phone and laptop: placement, first frame, every control, console errors, CLS under 0.02). `verify.js` accepts `CHANNEL=chrome` to use an installed Chrome instead of the Playwright download.

Why only five guides: the other nine sets (boats, garage, gallery, office, kitchen, rentals, drone, travel, boardroom) are blockout renders that would sit next to the guides' photographs without explaining anything. The five above are explainers, where the simple 3D style reads as a diagram.

Build: `python3 tools/check_content.py && python3 tools/build_library.py && python3 tools/flatten.py && node tools/postbuild.js` (images only when the renders change: `python3 tools/scenes/build_scene_images.py`).

Test: `node local-netlify.js .. 8787 &` then `BASE=http://localhost:8787 OUT=out-scenes node scenes-check.js` (add `CHANNEL=chrome` without the Playwright browser download).

Results before the merge (local build, Chrome):
- scenes-check.js: all passed (10 pages, phone and laptop).
- verify.js pages, crawl, img, lang, quiz, contact, tools, nav, expansion, newshots, visual: 53/56, and none of the 3 failures comes from this change. One is the known local-only `netlify.toml` quirk. The other two fail the same way on the live site: stale tests that still expect the old shared card (`/og.png`) on the guides and the old portrait name (`christian-retrato`) on the homepage. The site now uses per-guide share cards and `christian-emerald`; update those two assertions in `verify.js` when convenient.
- verify.js guidecta, leadpath, umbrella, hero: 30/30. The reserve lives in the head (`page(..., head_extra=)`), because the order check wants the guided path as the article's first element.
