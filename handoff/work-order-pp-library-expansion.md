# WORK ORDER: Patrimonio Protegido: library expansion + ads (for Claude Code)

**Owner:** Christian R. González · **Repo:** `chrisrhandier96/Protected-Legacy` (Netlify auto-deploys `main` to https://www.protectedlegacyfl.com)
**Date:** 2026-09-25 · **Priority order:** Part A → B → C → D → E → F. Push after each part passes its checks, not all at the end.

---

## 0. Read first (do not skip)

1. Pull `main` and read, in this order: `content/BRIEF.md` (content schema + voice rules), `content/guides/*.json` (the 8 existing guides), `content/extras/*.json`, `tools/build_library.py`, `tools/build_en.py`, `tools/flatten.py`, `netlify.toml`, `sitemap.xml`, and `site-tests/`.
2. **Follow the repo as it is now.** Earlier sessions changed the redirect rules (the slash-301 loop fix), flattened pages and added a library side panel. Build with those conventions; don't reintroduce anything they removed.
3. Every new page must go through the existing pipeline: JSON in `content/`, then `build_library.py`, then `flatten.py`, then `build_en.py` if `index.html` changes. Never hand-write a guide's HTML.

## 1. House rules (apply to every word you write)

- **Educational first, sales quiet.** Christian is a licensed Florida agent (license W606240). He *is* open to quotes and to selling, but it should never be loud. Allowed: one soft closing line per guide such as "If you want a second look at how your family is set up, write to me." Not allowed: "call now", "get a quote today", discounts, urgency, pricing promises.
- **No carrier names. No employer name.** No "Marsh", no insurer brands, anywhere.
- **No em dashes** in site copy. Formal *usted* in Spanish. Full ES/EN parity (same sections, same facts, same numbers).
- **Every number and every statute gets a footnote** to a primary source: FEMA, NFIP, the Florida Statutes, the Florida OIR, FBI IC3, FTC, the U.S. State Department, NAIC, III. If a figure can't be verified from a primary source, leave it out and list it in the report as "dropped: unverified".
- **Florida-specific** wherever the law or rules are state-specific.
- K&R and cyber content must be general education. **No operational security advice** that could help a criminal, and no description of how kidnappings are carried out. Cover how coverage and response work, not how crimes work.

## 2. PART A: New guides (highest priority)

Build each one as a full guide with the same schema as the existing 8: kicker, H1, dek, summary box, 6–7 sections, "questions to review with your agent, attorney or CPA", 3 FAQs, sources, 3 related guides, and CTA with a `?tema=` prefill. ES + EN.

| # | key | ES slug | EN slug | Must cover |
|---|---|---|---|---|
| A1 | `cyb` | `guias/ciber-proteccion-familiar/` | `en/guides/personal-cyber/` | Personal cyber coverage vs. identity-theft add-ons; cyber extortion/ransomware at home; social-engineering and wire/funds-transfer fraud (common in real-estate closings); online reputation and cyberbullying; data restoration; smart-home and family-office device risk; what a home policy usually excludes; household-staff and teen device exposure; 10-point family cyber-hygiene checklist (MFA, password manager, separate network for smart devices, a closing-wire call-back rule, credit freezes). Use FBI IC3 and FTC figures only. |
| A2 | `kr` | `guias/secuestro-y-extorsion/` | `en/guides/kidnap-ransom/` | What K&R insurance is and who it's for (families with a public profile, travel to Latin America, family-business owners); covered events: kidnap, express kidnapping, extortion (including virtual/"fake" kidnapping calls), detention, hijack, threat; why response consultants matter more than the payout; **policy confidentiality conditions** (explain that many K&R policies require the coverage itself to stay confidential); travel-risk basics tied to U.S. State Department advisory levels; how K&R relates to umbrella, cyber and travel coverage; family protocol planning at a high level. |
| A3 | `str` | `guias/alquiler-vacacional/` | `en/guides/short-term-rentals/` | Airbnb/VRBO-style rentals of a family's second home: why a standard homeowners policy may not respond, home-sharing endorsements vs. commercial/landlord forms, guest injury and liability, local registration rules (point to county/city rules generically and cite the Florida DBPR vacation-rental licensing rules). |
| A4 | `ren` | `guias/remodelaciones/` | `en/guides/renovations-builders-risk/` | Builder's risk, the contractor's certificate of insurance, additional-insured status, what happens to the homeowners policy during a major renovation or vacancy, hurricane season during construction, Florida permit and Building Code tie-in. |
| A5 | `brd` | `guias/juntas-y-fundaciones/` | `en/guides/board-service-family-foundations/` | Nonprofit/foundation board service: D&O basics, household employment practices liability (EPLI), family foundation risks. **Reuse the 2026 Fla. Stat. 617.0834 language already fact-checked in `lia.json`**; don't re-derive it. |
| A6 | `cnd` | `guias/condominios-y-hoa/` | `en/guides/condos-hoa/` | HO-6 walls-in coverage, loss assessment coverage, the master policy vs. the unit owner, Florida's post-Surfside condo safety laws (milestone inspections and structural integrity reserve studies: cite the actual statutes and effective dates from primary sources), special assessments. |

**Optional (build only if A1–A6 pass):** A7 `eqn` equine & farm (the site currently has no equine page; a keyword was blocked for that reason), A8 `ltv` golf carts, LSVs and ATVs (Florida road rules for golf carts and LSVs, with liability).

For each new guide, also add 4–8 glossary terms to `content/extras/glossary.json` and 2 FAQs to `content/extras/faq.json` (ES + EN).

## 3. PART B: Mitigation depth across ALL guides (existing 8 + new ones)

Add one new section per guide titled **"Cómo reducir el riesgo" / "How to reduce the risk"**. Concrete, practical, cited. Minimums:

**Residencias y huracanes (res):** a full wind-mitigation subsection:
- The **Florida Uniform Mitigation Verification Inspection Form (OIR-B1-1802)** and what each item means: building code / year built, roof covering, roof deck attachment, roof-to-wall attachment (toe nails, clips, single/double wraps), roof geometry (hip vs. gable), secondary water resistance (SWR), opening protection (impact glass/shutters, including garage doors).
- **Fla. Stat. 627.0629:** insurers must offer mitigation credits/discounts. Explain the concept; don't promise amounts.
- The 4-point and roof inspections for older homes, and roof age.
- A 10-item pre-season checklist that cross-links the existing hurricane checklist tool.

**Inundación (flo):** a full flood-zone subsection:
- FEMA zones explained: **A, AE, AH, AO, V, VE, X (shaded/0.2%), X (unshaded), D**; Base Flood Elevation (BFE); freeboard.
- **Elevation Certificates:** what they are and when they matter.
- **Risk Rating 2.0:** how NFIP pricing changed; what drives the rate now.
- **Community Rating System (CRS):** community discounts; how to look up yours.
- How to look up a property on the **FEMA Flood Map Service Center** (link only, no scraping).
- Mitigation: elevation, flood vents, dry vs. wet floodproofing, backflow valves, raising utilities, flood barriers. Cite FEMA publications.

**Every other guide:** 6–10 concrete mitigation tactics. For example:
- **Auto:** telematics and teen-driver rules, garaging.
- **Boats:** hurricane haul-out plans, named-storm provisions, captain/crew qualifications.
- **Aviation:** pilot currency, hangar.
- **Collections:** appraisals every 3–5 years, climate control, central-station alarms, safes, vaulting while traveling.
- **Umbrella:** limits review against net worth, social-media conduct, household guest events.
- **Household staff:** written agreements, background checks, workers' comp election.
- **New guides:** apply the same approach.

Also add one **"Mitigación" / "Mitigation"** card to the library hub that links to each guide's new section (deep links with `#` anchors).

## 4. PART C: Site wiring

1. Homepage: add the new domains where the site lists them (domain cards, `GUIDE_URL` map, library section) without breaking the existing 8-domain quiz. **Do NOT change the 12-question quiz scoring.** If you add questions, make them a clearly separate optional block and ask Christian first.
2. Contact form topic dropdown (`f-tema`): add the new topics in ES/EN, and extend the `?tema=` map (keys `cyb`, `kr`, `str`, `ren`, `brd`, `cnd`).
3. Library hub, related-guides cards, library side panel, glossary categories, sitemap (with hreflang pairs), JSON-LD (Article, FAQPage, BreadcrumbList), and `netlify.toml` rewrites via `flatten.py`.
4. Regenerate `en.html` if `index.html` changed.

## 5. PART D: Fact-check (independent)

- Run **two separate sub-agents** that did not write the content, each checking half the new/changed guides against primary sources. The writer never grades its own work.
- Deliverable: `content/FACTCHECK-2026-09.md` listing every figure/statute → source URL → verified / corrected / dropped.
- Specific traps to verify:
  - Current Fla. Stat. text for 627.0629, the condo milestone-inspection and SIRS statutes, and the golf-cart/LSV rules.
  - The NFIP Risk Rating 2.0 description.
  - The current OIR-B1-1802 form revision.
  - IC3 figures: use the latest annual report and state the year.

## 6. PART E: Tests, then deploy

1. Re-run everything in `site-tests/` and extend it:
   - every sitemap URL returns 200
   - every internal link and anchor resolves, including the new `#mitigation` anchors
   - ES/EN pairs exist and have matching hreflang
   - `?tema=` prefill works for each new key
   - no em dashes, carrier names or employer name (regex scan)
   - banned-phrase scan ("call now", "get a quote today", "cotice ya")
   - mobile 390 px has no horizontal scroll
   - zero JS errors
   - Tag Manager loads exactly once
2. Screenshots (desktop + mobile) of each new guide, ES + EN.
3. Commit per part with clear messages, push to `main`, wait for Netlify, and re-run the checks **against the live site**.

## 7. PART F: Google Ads for the new guides (build the file; do NOT touch existing ads)

**Critical:** the live campaign already has 8 edited ads, 12 locations, 16 sitelinks and 26 negatives. **Do not re-import any existing ad group or ad.** Re-importing responsive search ads creates duplicates, and campaign rows overwrite settings.

1. Create `ads/pp-new-adgroups-2026-09.csv` in Google Ads Editor format containing **only new ad groups** inside campaign `PP Search | Protección Patrimonial` (exact name). No campaign-level row. Status **Paused**.
2. Ad groups:
   - EN 10 Personal Cyber
   - ES 11 Ciberprotección
   - EN 12 Kidnap & Ransom
   - ES 13 Secuestro y Extorsión
   - EN 14 Short-Term Rentals
   - ES 15 Alquiler Vacacional
   - EN 16 Renovations
   - EN 17 Condo & HOA
   - ES 18 Condominios
   - (optional) EN 19 Board Service
3. Per ad group:
   - 4–8 keywords (phrase/exact), each with a Final URL to its guide
   - 1 RSA with 15 headlines (≤30 characters) and 4 descriptions (≤90)
   - display paths
4. Keyword research: prefer the Google Ads Keyword Planner if you have access; otherwise mark volumes as "unverified".
5. Copy rules:
   - Use "insurance"/"seguro" in 1–2 headlines per ad, no more.
   - Educational tone. One soft line is allowed, such as "Talk It Through With an Agent".
   - Never "cheap", "free", "quote now" or "Licensed Florida Agent".
   - Every claim must match its landing page (the earlier ads were flagged for promising topics their pages didn't cover).
   - K&R ads must be discreet: no fear-bait ("Protect your kids from kidnappers").
6. Validator script in `site-tests/ads_check.py`:
   - character limits
   - no duplicate headlines within an ad
   - banned words
   - every Final URL returns 200 on the live site
   - every headline claim appears in its landing page (keyword check)
7. Also output `ads/new-sitelinks.txt` (ES + EN, same format as before) and `ads/new-negatives.txt` for any new conflicts. **Do not add "quote"/"cotizar" as negatives; Christian wants those searches.**
8. **Stop there.** Christian imports and enables the file himself. Enabling spend is his click.

## 8. Report back (RETURN FORMAT)

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
