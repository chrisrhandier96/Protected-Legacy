# Fact-check, checker-1-property (Nov 3, 2026)

Files: `content/guides/res.json` (homes and hurricanes), `content/guides/flo.json` (flood),
`content/extras/hurricane.json` (hurricane season tool). All sources accessed 2026-11-03.

## Totals

| File | Claims checked | Verified unchanged | Corrected | Softened | Dropped | Not re-fetchable today (Sept-verified, left as is) |
|---|---|---|---|---|---|---|
| res | 31 | 29 | 1 | 1 | 0 | 0 |
| flo | 41 | 33 | 1 | 0 | 0 | 7 |
| hurricane | 15 | 15 | 0 | 0 | 0 | 0 |
| **Total** | **87** | **77** | **2** | **1** | **0** | **7** |

Links replaced: 0. Every res, flo and hurricane source that is not on fema.gov loaded today and says what we cite.
fema.gov returned client_error to every fetch today (and Wayback is blocked here), so the 7 fema.gov-only claims in flo
stay as verified on Sept 25. `check_content.py res flo`: OK (the review flags it prints existed before).
`updated` set to 2026-11-03 on res and flo. hurricane.json unchanged (no edit, so its date stays 2026-09-24).

## Changes made

| File | Location | Old (EN) | New (EN) | Why | Source and exact line | Accessed |
|---|---|---|---|---|---|---|
| res | `replacement-cost`, p2 (ES same) | "found that 74% of policyholders who lost their homes were underinsured" | "found that 74% of policyholders who filed claims after the fire were underinsured" | Wrong denominator. The 74% and 36% are shares of all homeowners in the sample (everyone who filed a Marshall Fire claim, total and partial losses), not of those who lost homes. ES: "que perdieron su casa" to "que presentaron reclamos tras el incendio". | https://www.philadelphiafed.org/-/media/frbp/assets/working-papers/2025/wp25-09.pdf : "The data contain 4,859 policies ... of homeowners who filed claims linked to the Marshall Fire. The data include 989 policies linked to homes that were completely destroyed. The remainder ... claims for smaller damages." Sec. 4.1: "we estimate that 74% of the homeowners in our sample were underinsured"; "For 36% of homeowners ... dwelling coverage was less than three-quarters of their home's replacement cost." | 2026-11-03 |
| res | `hurricane-deductible`, p1 (ES same) | "with variations for higher-value homes: the $500 option is not required ..." | "with variations for higher-value homes; for example, the $500 option is not required ..." | The colon presented two variations as the full list. 627.701(3)(c) and (3)(d)2 have others, including a 3% option that may replace 2% at $1M to under $3M dwelling limits. ES: "valor:" to "valor; por ejemplo,". | https://www.flsenate.gov/Laws/Statutes/2026/627.701 (3)(d)1 $250,000+: $500 not required; (3)(d)2 $1M to under $3M: insurer "may offer a 3 percent deductible" instead of 2%; (3)(d)3 $3M+: 2% not required. History ends s. 8, ch. 2023-217 (no 2024 to 2026 changes). | 2026-11-03 |
| flo | `waiting-period` p1, table row 3, FAQ 2 (ES same in all three) | "coverage bought within 13 months of a flood map revision has a 1-day waiting period" | "coverage bought within 13 months of a flood map revision that newly places the building in a high-risk area has a 1-day waiting period" (table: "NFIP bought within 13 months of a map revision that newly places the building in a high-risk area"; FAQ same wording) | FEMA limits the 1-day exception to buildings newly mapped into an SFHA; "any map revision" overstated it. ES: "que ubica el edificio por primera vez en (una) zona de alto riesgo". In the ES FAQ "del mapa de inundación" became "del mapa" so it stays at 80 words. | https://agents.floodsmart.gov/topics/flood-insurance-101 : "If a building is newly designated in a Special Flood Hazard Area (SFHA) ... purchased within the 13-month period following a map revision" (1-day wait). DFS [7] states the 13-month rule without the condition, so FEMA's wording governs. | 2026-11-03 |

## Verified unchanged (key items)

- 627.701: $500/2%/5%/10% options; $250k and $3M variations; applies annually to all hurricane losses in the calendar year with the same insurer or group; later hurricane = greater of the remaining hurricane deductible or the other-perils deductible (statute: insurer "may apply"; DFS [2]: "will be"); DFS: "no other deductible under the policy may be applied". Hypothetical math correct ($60k/$150k/$300k on $3M; $100k on $2M; $40k on $2M in hurricane.json).
- 627.4025(2)(c): starts at the NHC hurricane **warning**, ends 72 hours after the last watch or warning ends. Matches.
- 627.7011 (history s. 8, ch. 2024-182): RC offer; L&O 25% or 50%, deemed 25% without written refusal; total loss with no depreciation holdback; partial loss ACV less deductible first; roof under 15 years; 15+ with 5+ years remaining life by authorized inspection. Matches.
- 627.70132 (history ends ch. 2024-139): 1 year new/reopened, 18 months supplemental, hurricane date of loss = landfall. Matches res (3 places) and hurricane.json.
- 627.0629: technique list and website disclosure "Effective October 1, 2023". 627.711(2)(a) (2026, via leg.state.fl.us; flsenate gave client_error): authorized inspectors list. OIR page and Rev. 04/26 PDF: effective April 1, 2026, nine items, 5-year validity. 627.715 (latest s. 8, ch. 2025-145): standard/preferred/customized/flexible/supplemental forms, policy or endorsement, signed agent notice on NFIP discontinuance. All match.
- Verisk 25.9% (Mar 2020 to May 2023) is on the cited Jan 23, 2025 Verisk page. Verisk's 2026 quarterly reports don't replace a fixed-period figure. Keep (res [6] and hurricane.json).
- III [4] RC/ACV/extended/guaranteed; III [5] rebuild cost, off-site inventory, jewelry and silverware limits, floater; III [10] vacancy "typically 30 to 60 consecutive days", theft and vandalism. Match.
- My Safe Florida Home: the site (DFS footer, modified 2026-09-16) shows "Grants & Inspections Available", free inspections, grants up to $10,000. Our line ("check its site for eligibility and whether funding is available") is accurate as written.
- NOAA CPC [12]/[14]: June 1 to Nov 30; "vast majority ... during August-October". hurricane.json "mid-August to mid-October (NOAA)" matches NOAA's "season within the season" story (78% of TS days, 96% of major-hurricane days).
- FEMA July 2025 media toolkit [1] (still FEMA's latest; no 2026 edition found): $250k/$100k; "Most policyholders will need to wait 30 days"; 2020 to 2024 average $63,691, median $20,272; "From 2014 to 2024, almost one-third" of claims outside high-risk areas. FEMA fact sheet [2]: one inch "roughly $25,000". Basement [5], EC [9], RR2.0 2025 [10] (Oct 1, 2021 / Apr 1, 2022, "most annual increases capped at 18%", rating factors), ICC [8] ($30,000, SFHA, substantial/repetitive), NC DOI summary [6] (80% RC rule, contents ACV, building plus ICC capped at the building max), DFS [7] (60-day proof of loss, no ALE, $2,500 valuables aggregate). All match.
- CDC: generators outside, at least 20 feet from doors, windows and vents (page reviewed Aug 26, 2026). Matches hurricane.json.

## Needs Christian's call (not edited)

1. **NFIP average claim (tile, guide, source).** FEMA now publishes three 2020 to 2024 averages: $63,691 avg / $20,272 median (Media Toolkit, July 2025, dated PDF, live); $82,614 "average payment for all claims" (floodsmart.gov "What is My Flood Risk" and "Start a Claim", undated, no median); $65,401.05 "claims closed with payment" (agents.floodsmart.gov/hurricanes). **Recommended: keep $63,691.** It is FEMA's latest dated release, it is the only one with a median, and it continues FEMA's own series (Nov 2024 fast facts: $52,000 for 2019 to 2023). The tile (index.html/en.html line 707/711), Domain II li (1168 to 1169), ticker (1282 to 1283), sources note [3] and flo [1] already agree on it, so nothing needs to move. If you prefer $82,614, drop the median from flo and change all four homepage spots plus the sources note to "FEMA FloodSmart, What is My Flood Risk (2020 to 2024, all claims)".
2. **64% underinsured (CoreLogic/Cotality)**, on index.html/en.html (stat 703, chip 1165, ticker 1282 to 1283, sources [1]), glossary `infraseguro`, BRIEF.md line 38. I found no primary CoreLogic or Cotality publication. The earliest uses (Kin, Apr 12, 2021; Mutual Assurance, Jan 18, 2022; insurance.com) cite "CoreLogic's Residential Cost Handbook" with no date or link. CoreLogic's earlier public figure was "roughly 60 percent ... underinsured by an average of about 20 percent" (NBC 7 San Diego, Oct 11, 2017). **Recommended: drop the 64%.** Use the 74% Marshall Fire figure, or the Philadelphia Fed WP 25-09 abstract line "Most homeowners do not have enough insurance coverage to rebuild their house after a total loss."
3. **Marshall Fire "lost their homes", also outside my files**: index.html/en.html 705/709, 1164 (Domain I gap), 1282 to 1283 (ticker), and BRIEF.md line 37. Same fix: "of policyholders who filed claims after the fire" / "de los asegurados que presentaron reclamos tras el incendio".
4. **13-month map-revision wording, outside my files**: `content/extras/faq.json` item 4 has the same overstatement (the owner of that file should add "that newly places the building in a high-risk area").
5. **627.701 3% option** ($1M to under $3M dwelling limits, an insurer may offer 3% instead of 2%). This fits the audience. Suggested addition after the $3M clause: EN "and between $1 million and $3 million, a 3% option may replace the 2% option" / ES "y entre $1 millón y $3 millones, una opción de 3% puede reemplazar la de 2%".
6. **NFIP authorization expires Dec 11, 2026, 11:59 p.m.** (Continuing Appropriations and Extensions Act, 2027, P.L. 119-103; NAHB, Sept 4, 2026; legis1, Oct 7, 2026). The guides make no authorization claim, but flo and the checklist tell readers to buy NFIP coverage. During a lapse, new NFIP policies and renewals cannot be issued. Watch on Dec 12 and add a dated line if it lapses. The 2025 to 2026 lapses were Oct 1 to Nov 12, 2025 and Feb 1 to 3, 2026. There was no fall 2026 lapse.
7. **FEMA now sells NFIP policies online** (FloodSmart, launched Oct 20 to 22, 2026; ASFPM floods.org, Insurance Journal Oct 23, 2026; FEMA press release URL fema.gov/press-release/20261020/... could not be fetched). flo's "sold through insurers and agents" is still true but now incomplete. Whether to mention the direct channel is your call.
8. Low priority: hurricane.json "many insurers typically suspend new policies or changes when a storm threatens" describes general market practice (hedged, names no carrier). Keep or cut.
9. Low priority: res [13] (FEMA fact sheet) supports "homeowners policies do not cover flood" but not "storm surge counts as flood". That line is accurate but has no source in res. flo states the same thing without a footnote.

## Time-sensitive facts checked, but not stated in my files (for reference)

- State-backed residential insurer flood requirement, Fla. Stat. 627.351(6)(aa) (current-law text as quoted in 2026 HB 909, which died in committee 3/13/2026): SFHA new policies on or after April 1, 2023, renewals on or after July 1, 2023; dwelling replacement cost $600,000+ Jan 1, 2024; $500,000+ Jan 1, 2025; $400,000+ Jan 1, 2026; all other personal lines residential Jan 1, 2027. The flsenate 627.351 page is too long for the fetch tool to reach (6)(aa) directly. None of my three files mentions this requirement.
- Florida Building Code: the 8th Edition (2023) is in force. The 9th Edition (2026) takes effect Dec 31, 2026 (Miami-Dade notice: permits submitted on or after that date must comply). Not stated in my files.
- My Safe Florida Home funding: ~$405M reappropriated in the 2026 budget (secondary source, propertyexemption.com, June 8, 2026). Our text gives no amount, which is correct.
- 2026 season: ends Nov 30. My files make no 2026-specific or past-tense season statement.

## Could not reach a source

- fema.gov (client_error today): glossary zone pages [13][14][21][22][23], BFE [15], freeboard [16], "Protect Your Home" brochure [18], P-312 ch. 3 [20], and the CRS page [19]. The CRS fetch once returned a "Last updated September 28, 2021" version that does not match our label "updated September 24, 2026". California DWR's 2025 CRS fact sheet confirms the discount "will be uniformly applied to all policies throughout a community ... regardless of whether the structure is in an SFHA". All left as verified on Sept 25.
- flo [4] (agents.floodsmart.gov "What Is Covered...") is now labeled "Historical/Archived Content" (Aug 2021). It still loads and its lists are accurate. Replace it when FEMA posts a current equivalent.
- Private flood waiting period "often about two weeks" (flo, unfootnoted; BRIEF fact): no primary source. It is hedged, so I left it.
- 64% underinsured: no primary source (see call 2).
