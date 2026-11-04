# Fact-check, full site (Nov 3, 2026)

Six independent checkers re-verified every factual claim on the site against primary sources as of Nov 3, 2026,
then the coordinator reviewed every diff and re-verified the main corrections. Full working notes, with the exact
line relied on for each source: `handoff/factcheck-2026-11/`. The September pass is in `FACTCHECK-2026-09.md`.

## Totals

| Area | Claims checked | Unchanged | Corrected | Softened or dropped |
|---|---|---|---|---|
| Homes, flood, hurricane tool (res, flo, hurricane) | 87 | 77 | 2 | 1 |
| Auto, umbrella, collections (aut, lia, col) | 87 | 82 | 5 | 0 |
| Boats, aviation, household staff (mar, avi, emp) | 82 | 81 | 1 | 0 |
| Condos, rentals, renovations, boards (cnd, str, ren, brd) | 117 | 113 | 2 | 1 |
| Cyber, kidnap and ransom, FAQ (cyb, kr, faq) | 140 | 138 | 2 | 0 |
| Homepage, glossary, privacy, utility pages | about 192 | about 173 | 12 | 7 |
| **Total** | **about 705** | **about 664** | **24** | **9** |

Coordinator fixes on top of these: the vacation rental definition in the str guide (2 places plus a new statute
source), the FAQ flood waiting period, one insurer-set limit removed from col, the privacy page, and the homepage
share description. 19 statute links moved from the 2025 to the 2026 edition; 2 sources added.

## Corrections that change what a reader learns

| Where | Was | Now | Source |
|---|---|---|---|
| str guide, FAQ, glossary | License needed for rentals of "less than 30 days or one calendar month" | "less than 30 consecutive days" | Fla. Stat. 509.013(4)(a)1. (2026), amended by ch. 2025-113 |
| Homepage myths, ticker, share text | Hispanic median wealth "more than tripled, 2013 to 2022, $18,000 to $61,600" | $79,600 in 2025, up 18% from 2022 (2025 dollars) | Federal Reserve, Changes in U.S. Family Finances from 2022 to 2025 (Oct 2026), Table 2 |
| Homepage tile, ticker, DOMS, glossary | "64% of U.S. homes are underinsured (CoreLogic)" | Dropped: no dated primary source exists. Tile now shows the Verisk 25.9% rebuild-cost rise | verisk.com newsroom, Jan 2025 |
| Homepage, res guide | Marshall Fire 74% / 36% "of policyholders who lost their homes" | "of policyholders who filed claims after the fire" | Philadelphia Fed WP 25-09 |
| flo guide, FAQ | 1-day NFIP wait "within 13 months of a flood map revision" | "...of a map revision that newly places the building in a high-risk area" | FEMA, NFIP waiting period rules |
| brd, lia | 617.0834 protects "directors and officers" | "directors and uncompensated officers" | Fla. Stat. 617.0834(4)(b) (2026), ch. 2026-168 |
| aut | TNC $50k/$100k/$25k tier "logged on without a passenger" | "logged on but not engaged in a prearranged ride"; $1M from ride acceptance | Fla. Stat. 627.748(1)(b), (7) (2026) |
| aut | UM rule tied to 627.727(2) | 627.727(1) (UM required only with bodily injury coverage) | Fla. Stat. 627.727 (2026) |
| lia | FTC fraud losses (2024) | $15.9 billion in 2025 | FTC, March 2026 |
| emp | "keep valuables in a safe [6]" cited an FDIC page that says the opposite | footnote removed | FDIC |
| str table | Lost rental income after a hurricane "usually not covered" | "may be excluded or limited" | no source supports "usually" |
| col | some insurers limit property away from home "to 10 percent" | "apply a lower limit" | house rule: no insurer-set limits |
| FAQ | replacement cost "the rest once the repair is completed" | "as the repair is performed" | Fla. Stat. 627.7011(3)(a) |
| Privacy page | "Only what you type"; "no advertising cookies" | discloses the automatic traffic-source fields, Google Tag Manager and first-party measurement cookies | site code |

## Confirmed unchanged (highlights)

NFIP limits and the $63,691 average claim (FEMA July 2025 toolkit, still the latest dated FEMA figure); NFIP
authorized through Dec 11, 2026 (P.L. 119-103); Florida auto minimums (both 2026 PIP repeal bills died March 13,
2026); IRC uninsured rate 20.6%; FWC 2025 boating figures; USCG 2024 report still current (2025 edition pending);
2025 IC3 report figures; 627.701 hurricane deductible options; 627.7011 roof rules; My Safe Florida Home; condo
SIRS and milestone rules (no 2026 change); construction lien and owner-builder rules; 2026 domestic employee
thresholds.

## Owner decisions applied (Nov 3, 2026, same PR)

- License W606240: confirmed active by Christian.
- Umbrella sizing on the homepage: idea kept, numbers dropped ("a limit in proportion to your net worth"; "a large estate behind a small umbrella").
- Appraisal frequency on the homepage now matches the col guide: "every few years", no fixed 3 to 5 year rule.
- Bio: "bilingual from birth" and "Native bilingual" replaced with "I work in both Spanish and English" and "Bilingual, Spanish and English".

## Still open

- 627.701 also lets insurers offer 3% instead of 2% for dwelling limits from $1M to under $3M (res now says "for example").
- NFIP authorization ends Dec 11, 2026: re-check on Dec 12.
- tools/build_en.py does not write the English title, description, og:url, og:image (og-en.png) or the honeypot
  label that en.html carries; they were restored by hand after this rebuild. Fix the generator before the next run.
  Run the full build chain (build_library, build_en, flatten, postbuild) together: flatten.py alone breaks the pages.
