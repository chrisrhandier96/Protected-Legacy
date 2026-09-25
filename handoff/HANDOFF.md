# Handoff: library expansion work order (2026-09), for the next Claude session

Read this whole file before doing anything. It is the complete state of the work and the exact plan to finish it.
The work order itself is in `handoff/work-order-pp-library-expansion.md` (Parts A to F plus a RETURN FORMAT).

- Owner: Christian R. González (GitHub `chrisrhandier96`). Site: https://www.protectedlegacyfl.com
- Repo: `chrisrhandier96/Protected-Legacy`. **Netlify auto-deploys `main` to production.**
- All work so far is on branch **`work-order-2026-09`**. `main` on GitHub is still the old live site.
- Today's date when this was written: 2026-09-25.

---

## 1. Rules from Christian (these override the work order where they conflict)

1. **Deploys:** Every push to `main` is a production deploy and costs Netlify credits (credits already ran out once).
   - Commit on the branch as you go.
   - Do **one** merge/push to `main` at the very end of the task, and **only after Christian says yes in chat**.
   - Before asking, summarize what will go live.
   - No empty "trigger" commits. The work order's "push after each part" is replaced by this rule.
2. **No carriers anywhere:**
   - No insurance carrier names and no carrier-specific information (who offers what, market availability). This includes Citizens Property Insurance.
   - Government programs (FEMA, NFIP, OIR, DFS, FAA, USCG, FWC) are fine.
3. **No insurer-set coverage limits:**
   - No limits that insurers set, sell or typically require: jewelry theft caps, umbrella sizes, required underlying limits, extended replacement percentages.
   - Figures set by **law or a government program** are fine: NFIP maximums, Florida minimums, statutes.
   - Hypothetical math on a stated limit is fine.
4. **No underwriting acceptance:**
   - Nothing about who insurers accept, decline or find eligible, or what it takes to qualify.
   - Legal consumer rights are fine: the Fla. Stat. 627.7011 roof-age rule, written UM rejection.
5. **Employer name:** never name Christian's employer. "Marshall Fire" (the 2021 Colorado wildfire) is **not** the employer; scan with `\bMarsh\b`.
6. **Fact-checked wording:** don't change wording, numbers or legal/insurance statements that were already fact-checked unless a fact-check or Christian's rules require it, and report every such change.
7. **The contact form:** never submit it, in any test. It fires a Google Ads conversion. The test suite already aborts POSTs and analytics beacons.
8. **House style:**
   - No em dashes. Formal *usted* in Spanish. Full ES/EN parity.
   - Every number and statute gets a footnote to a primary source.
   - One soft closing line per guide ("If you want a second look..., write to me."). No sales language.
   - K&R and cyber content gives no operational security advice.
9. **Working style:** Christian isn't technical. Give plain-language updates, work end to end, and ask only real decisions.

## 2. Repo map and how to build

- `content/guides/<key>.json`: one guide in ES + EN, with sources and `[n]` footnotes.
  - Keys: `res flo aut mar avi col lia emp` (original 8) plus `cyb kr str ren brd cnd` (new).
- `content/extras/glossary.json`, `faq.json`, `hurricane.json`, `inventory.json`.
- `content/BRIEF.md`: voice rules and verified facts (already updated with rules 2 to 4 above).
- `tools/check_content.py`: schema, parity, footnote and word checks, plus scans for carriers, sales phrases, insurer limits and acceptance. **Run it before every build:** `python3 tools/check_content.py`.
- Build (never hand-write guide HTML):
  ```
  python3 tools/build_library.py && python3 tools/flatten.py && node tools/postbuild.js
  ```
  - `flatten.py` writes the flat `*.html` files and the rewrites block in `netlify.toml`.
  - `postbuild.js` runs the injectors in `tools/post/`: the side panel (`library-panel.html`), logo, og tags, fixes and CSS layers. It needs only Node's built-in modules.
- **Homepages `index.html` and `en.html` are edited directly, with the same edit in both files.**
  - Do **not** run `tools/build_en.py`: it would drop the EN-specific tags in `en.html`.
- `netlify.toml`:
  - Security and cache headers, 200 rewrites, and 404 rules for `/content/* /tools/* /ads/* /site-tests/* /handoff/*`.
  - **Never add `/x -> /x/` 301 rules**: Netlify matches with or without the slash, so they loop.
- `ads/`: Part F output (see section 4).
- `site-tests/`: test tools.
  - `verify.js` is the Playwright suite. It runs against `BASE` (default: live site) and filters groups with `ONLY`.
  - `local-netlify.js` is a local stand-in for Netlify.
  - `ads_check.py` is the ads validator.

### Run the tests locally

```
cd site-tests && npm install && npx playwright install --with-deps chromium
node local-netlify.js .. 8787 &          # restart it after changing netlify.toml (it reads rules at start)
BASE=http://localhost:8787 OUT=out-local ONLY=pages,crawl,img,lang,quiz,contact,tools,nav,expansion,newshots,visual node verify.js
python3 ads_check.py --base http://localhost:8787
```

- Known false failure locally: `[Pages] ... netlify.toml not 200 :: served: /netlify.toml`. The local server serves it; Netlify does not.
- Test groups:
  - `pages`, `crawl`: status codes, links and anchors, JS errors, GTM present, JSON-LD.
  - `lang`: language routing.
  - `quiz`: the 12-question quiz, plus every guide CTA's `?tema=`.
  - `contact`: dataLayer tracking on tel/sms/mailto/LinkedIn links, never dialed.
  - `tools`: glossary and FAQ tools.
  - `nav`: side panel, 20 links.
  - `expansion`: the Part E checks.
  - `newshots`: 24 screenshots of the new guides.
  - `visual`: screenshots, plus no horizontal scroll at 390 px on every sitemap page.

## 3. Status by part

| Part | Status | Where |
|---|---|---|
| Content rules cleanup (carriers, insurer limits, acceptance) | Done | commit `1e2c493` |
| A. Six new guides, ES + EN, 33 glossary terms, 12 FAQs | Done | commit `9158271` |
| B. "How to reduce the risk" in all 14 guides + hub Mitigation card | Done | commit `d3365a4` |
| C. Homepage wiring (14 domains, GUIDE_URL, form topics, `?tema=`), side panel, hub meta, sitemap lastmod = build date | Done, local tests pass | branch commit (see `git log`) |
| D. Independent fact-check | **Both reports done** (`handoff/factcheck-A.md`: 87 rows, 75 verified / 12 corrected / 0 dropped; `handoff/factcheck-B.md`: 158 rows, 146 verified / 12 corrected / 0 dropped). **No corrections applied yet** | section 5 |
| E. Tests extended (`expansion`, `newshots` groups) | Built; one open failure (privacy page hreflang) | section 6 |
| F. Ads file, validator, sitelinks, negatives | Done, validator PASS locally | `ads/` |
| Deploy + live re-test + report | Not started | sections 7 and 8 |

Optional A7 (`eqn`, equine) and A8 (`ltv`, golf carts/LSVs) were **not built**. Mention that in the report; don't build them unless Christian asks.

## 4. Part F files (done)

- `ads/make_new_adgroups.py` generates:
  - `ads/pp-new-adgroups-2026-09.csv`: Google Ads Editor format, campaign `PP Search | Protección Patrimonial`, **no campaign row**, all Paused. 10 ad groups (EN 10 to EN 19 as in the work order, including the optional EN 19 Board Service), 53 keywords (phrase/exact, each with a Final URL), 1 RSA each (15 headlines, 4 descriptions, 2 paths).
  - `ads/claims-2026-09.json`: the claim each headline makes. The validator checks each one against the landing page. Site-level lines ("Read It in English or Spanish", "Educational...", "Talk It Through With an Agent") are exempt.
- `ads/new-sitelinks.txt` has 6 EN + 6 ES sitelinks; `ads/new-negatives.txt` has negatives for the new topics. "quote"/"cotizar" are **not** negatives, on purpose.
- Keyword volumes are **unverified** (no Keyword Planner access).
- Default max CPCs are placeholders: $4 to $6 per ad group. List them as an open question.
- `site-tests/ads_check.py`: `PASS` against the local build. Rerun it against the live site after the deploy (without `--base`).

## 5. Part D: finish the fact-check (do this first)

1. **Apply every correction in `handoff/factcheck-A.md`.** It gives exact EN + ES replacement wording. Summary of the 12:
   1. `cyb`: the $449,000 closing case was "individuals", in August 2025, and the funds were frozen.
   2. `cyb` summary: "prevents most wire fraud" becomes "helps prevent".
   3. `cyb` mitigation intro: EN "remove a good share" becomes "reduce", to match the ES.
   4. `kr`: "Many current policies add express kidnapping and threats" becomes "Some policies also list..., check whether yours does".
   5. `kr`: the no-concessions policy is "longstanding", **reaffirmed** in 2015 (it did not start in 2015).
   6. `kr`: the "no family has ever been prosecuted for paying a ransom" point comes from the **President's June 24, 2015 statement**, not PPD-30 or the fact sheet. Fix the attribution and add the PPD-30 and statement URLs to source [5].
   7. `str`: DBPR records visible fire-safety items during its inspections and reports possible violations to the State Fire Marshal. It does not "conduct fire safety inspections".
   8. `str`: reword the "also subject to local authorities" sentence as the report says (DBPR's sentence was about renting individual rooms). Update source [2] to the 2026 statute and add the DR-15TDT county rates PDF to source [3].
   9. `ren`: the 489.103 disclosure says "an unlicensed person or his or her employees".
   10. `ren` (section **and** FAQ): the 713.13 notice expires 1 year after recording unless the notice itself states a later date, which it must do when the contract runs longer than a year.
   11. `ren`: the III says to raise coverage **before or shortly after work begins**, not "when the work is finished".
   12. `res` mitigation table: the **current OIR-B1-1802 (Rev. 04/26, effective April 1, 2026) has nine items**. It adds **Region** (wind zone based on design wind speed) and **Roof slope** to the seven listed.
      - Get the 04/26 PDF from floir.gov (Wind Mitigation Resources page) and update the ES + EN table.
      - Keep the roof-to-wall categories (toe nails, clips, single wraps, double wraps) and the roof shapes (hip, flat, other); the report confirms they still match.
      - Also update the ES/EN intro sentence if it says "seven".
   - Where a change touches the same fact in the homepage `DOMS` entries (`index.html` + `en.html`), glossary or FAQ, change it there too.
2. **Apply every correction in `handoff/factcheck-B.md`** (already done by an independent sub-agent; exact EN + ES wording is in the report). Summary of the 12:
   1. `brd`, Volunteer Protection Act: add the two missing conditions from 42 U.S.C. 14503(a). The volunteer must be properly licensed or authorized where required, and the protection doesn't cover operating a vehicle, boat or aircraft that the state requires a license or insurance for.
   2. `brd`, family foundations: "Many D&O policies exclude or limit fines, penalties and taxes" is unsourced; use the report's rewording.
   3. `cnd` summary: "can no longer waive those reserves" needs "with limited exceptions".
   4. `cnd` reserve study: add the 2025 exception (ch. 2025-175, effective July 1, 2025). An association that completed a milestone inspection in the previous 2 years can, by majority vote, pause or reduce reserve contributions for up to two budgets adopted on or before Dec 31, 2028.
   5. `cnd` deductibles: replace "often a percentage of the building's value" with 718.111(11)(c) (the board sets deductibles consistent with industry standards and local practice, based on available funds). **Also fix the homepage `DOMS` cnd entry and the `condominio-evaluacion` FAQ if they repeat it.**
   6. `flo` source [14]: the `/about/glossary/z` page only shows A, A99, AE, AH, AO. Point V, VE and D to FEMA's `zone-v`, `zone-ve-and-v1-30` and `zone-d` pages (add sources and renumber carefully, or add them to the same source entry).
   7. `flo` raised utilities: FEMA's "at least 1 foot" covers AC condensers, heat pumps and electrical panels. For water heaters FEMA only says to consider raising them above the ground floor.
   8. `avi` drones: FAA's Part 107 examples are "photos to help sell a property" and roof inspections, not property photos in general.
   9. `col`, safe deposit boxes: add FDIC's "Understanding Deposit Insurance" page as a source ("Safe deposit boxes or their contents" are not covered).
   10. `emp` source [3] label: the title of 440.04 is "Waiver of exemption."
   11. Glossary `perdida-de-renta`: soften "a typical homeowners policy usually does not include it".
   12. Glossary `aviso-de-inicio` **and** FAQ `aviso-de-inicio`: the notice expires after 1 year unless the notice itself states a different date (same fix as A-10).
   - Report B also lists **14 unfootnoted market-practice statements** in their own section. Keep, hedge or drop each one, and record the decision in the FACTCHECK file.
   - Its access notes: NAIC and State Department pages were read from 2026 Wayback Machine copies, so check the live travel-advisory URL in a browser.
   - Note: `site-tests/verify.js` and `tools/check_content.py` must still pass after the edits.
3. The golf cart/LSV trap in the work order doesn't apply (A8 was not built). Say so in the fact-check file.
4. Write **`content/FACTCHECK-2026-09.md`**:
   - Every figure and statute → source URL → verified / corrected / dropped, merged from both reports.
   - Include the two unfootnoted-by-design items: the K&R confidentiality paragraph (no neutral primary source; hedged) and the four-point inspection definition.
   - Include the `cnd` claim "master policy hurricane deductible is often a percentage of the building's value" (unfootnoted; judge it or drop it).
   - Include the totals for the report.
5. Run `python3 tools/check_content.py` (all 14 must say OK), rebuild, and commit ("Apply fact-check corrections ...").

## 6. Part E: tests

1. Open failure: `[Expansion] ES/EN pairs exist and hreflang matches both ways :: /privacidad.html: missing es/en alternate`.
   - `privacidad.html` is one bilingual page with a language toggle and no `/en/` twin.
   - Fix: add `<link rel="alternate" hreflang="es" ...>`, `hreflang="en"` and `x-default` tags that all point to `https://www.protectedlegacyfl.com/privacidad.html`. The test accepts a page whose alternates include itself.
2. Run the full local suite (command in section 2). Everything should pass except the known local `netlify.toml` quirk.
   - Screenshots land in `site-tests/out-local/shots/`: `new-*` for the 6 new guides, ES + EN, desktop + mobile.
3. Run `python3 site-tests/ads_check.py --base http://localhost:8787` and confirm PASS.
4. Commit.

## 7. Deploy (only with Christian's yes)

**About `[skip netlify]`:** the handoff commit that put this branch on GitHub has `[skip netlify]` in its message, so Netlify did not build it. Netlify skips any push whose newest commit carries that tag.
- **Your own commits on this branch must NOT include it**, and neither may the final merge. Otherwise the production deploy will be skipped.
- Make the final step a normal merge commit (for example `git merge --no-ff work-order-2026-09`), after at least one new commit of yours, so `main`'s newest commit has no skip tag.
- While you work, pushing the branch is optional. If you push it before the final merge, put `[skip netlify]` in that push's newest commit message, so an enabled branch-deploy setting can't spend credits.

1. Summarize for Christian what will go live: 6 new guides (12 pages), 14 mitigation sections, the content-rule cleanup, homepage/form wiring, and the fact-check corrections. Ask: "OK to merge to main and deploy?"
2. On yes, do **one** merge of `work-order-2026-09` into `main` and push. Wait for Netlify to publish; check that the new URLs return 200.
3. Re-run against the **live site**:
   ```
   cd site-tests && OUT=out-live node verify.js
   python3 ads_check.py
   ```
   - The first command uses the default `BASE`, which is the live site; `ads_check.py` defaults to live too.
4. **Expected live result, account-side and not a site bug:** `Tag Manager loads exactly once` will likely FAIL live with 2 loads.
   - Cloudflare's Google tag gateway (`/rgk9/` path) injects the GTM-P88VGFHR container a second time.
   - Report it as a Cloudflare setting for Christian: turn off the gateway or remove the page snippet.
5. Also report the **contact-tracking live counts per page** (pending from an earlier request): from the `contact` group output. Locally: `/` 7/7, `/en/` 7/7, each library page 1/1, `/privacidad.html` 1/1, `/gracias.html` 0 links.

## 8. Report back to Christian in the work order's RETURN FORMAT

```
PARTS DONE: A[ ] B[ ] C[ ] D[ ] E[ ] F[ ]
COMMITS: <hash> <message> (one per line)
NEW PAGES LIVE: <count> ES + <count> EN, list of URLs
MITIGATION SECTIONS ADDED: <n of n guides>
FACT-CHECK: <n verified> / <n corrected> / <n dropped>  (file path)
TESTS (live): links <ok/fail>, hreflang <ok/fail>, tema <ok/fail>, banned-scan <ok/fail>, mobile <ok/fail>, JS errors <n>, GTM loads <n>
ADS FILE: path, ad groups <n>, keywords <n>, validator <pass/fail>
OPEN QUESTIONS FOR CHRISTIAN: <bullets>
```

Open questions to include:
- Default max CPCs for the 10 new ad groups ($4 to $6 placeholders).
- Keyword volumes unverified (no Keyword Planner).
- Whether to build the optional A7 (equine) and A8 (golf carts/LSVs).
- The Cloudflare tag gateway double-loading GTM.
- The Google Ads conversion (label `1A9JCNrJ6YMdEMPC7eQp`) fires twice on `/gracias.html`, from an Ads URL rule plus a GTM tag. Keep one; account-side.
- The existing v5 ads still contain "Licensed Florida ..." headlines. The work order bans that phrase in new ads only; ask whether to fix the live ads, which is Christian's own click in Google Ads.

Then list what changed in wording (the cleanup and the fact-check corrections) so Christian can review it.

## 9. Pointers

- New guide URLs:
  - ES: `/guias/ciber-proteccion-familiar/`, `/guias/secuestro-y-extorsion/`, `/guias/alquiler-vacacional/`, `/guias/remodelaciones/`, `/guias/juntas-y-fundaciones/`, `/guias/condominios-y-hoa/`
  - EN: `/en/guides/personal-cyber/`, `/en/guides/kidnap-ransom/`, `/en/guides/short-term-rentals/`, `/en/guides/renovations-builders-risk/`, `/en/guides/board-service-family-foundations/`, `/en/guides/condos-hoa/`
- Mitigation anchors: `#mitigacion` (ES), `#mitigation` (EN).
- Form topics (ES labels must equal `TOPIC` in `tools/build_library.py`; the `?tema=` map in both homepages matches on them): Ciberprotección familiar, Secuestro y extorsión, Alquiler vacacional, Remodelaciones y construcción, Juntas y fundaciones, Condominios y HOA.
- Tracking IDs: GTM-P88VGFHR; GA4 G-5ESNN0V2XX; Google Ads AW-11217363267.
- Git identity used so far: `chrisrhandier96 <316214192+chrisrhandier96@users.noreply.github.com>`. End commit messages with the attribution trailer your harness asks for.
