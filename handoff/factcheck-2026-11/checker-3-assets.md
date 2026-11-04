# checker-3-assets: mar (boats), avi (private aviation), emp (household staff and legacy)

Checked 2026-11-03 against primary sources. Edited only content/guides/mar.json, avi.json, emp.json
(`updated` set to 2026-11-03 on all three). `python3 tools/check_content.py mar avi emp`: all OK (the
`eligib/elegib` review note on emp's Schedule H line was there before and is fine).

Note: the September pass only checked the *mitigation* sections of these three guides. This pass covered
every section, summary, FAQ and source in ES and EN.

## Totals

| | mar | avi | emp | Total |
|---|---|---|---|---|
| Factual claims checked (ES and EN, FAQ repeats counted once) | 34 | 28 | 20 | **82** |
| Verified unchanged | 34 | 28 | 19 | **81** |
| Corrected | 0 | 0 | 1 (citation) | **1** |
| Softened or dropped | 0 | 0 | 0 | **0** |
| Source links replaced (2025 statute edition to 2026) | 6 | 1 | 2 | **9** |
| Dead links found | 0 | 0 | 0 | **0** |

All 35 source URLs were opened. Every one loads and supports what is cited (see access notes for two that the fetch tool could not read directly).

## Changes

| File | Location | Old (EN) | New (EN) | Why | Source and exact line relied on | Accessed |
|---|---|---|---|---|---|---|
| emp | section `mitigation` (ES `mitigacion`), bullet 7 | "Limit staff access to financial documents and passwords, and keep valuables in a safe [6]." | "Limit staff access to financial documents and passwords, and keep valuables in a safe." (ES: "...y guarde los objetos de valor en una caja fuerte.") | Wrong citation. The FDIC article does not recommend a home safe; it says the opposite: "A home safe isn't a true replacement for a bank's safe deposit box." September marked this VERIFIED. The advice stays as general practice; [6] is still cited in the callout, where it is correct. | https://www.fdic.gov/consumer-resource-center/2018-safe-deposit-boxes-home-safes-and-your-valuables ("A home safe isn't a true replacement for a bank's safe deposit box.") | 2026-11-03 |
| mar | sources [5] | Fla. Stat. 327.32 (2025), /Statutes/2025/327.32 | (2026), https://www.flsenate.gov/Laws/Statutes/2026/0327.32 | Newer official edition. 2026 text identical on the cited point; history ends ch. 85-81. The unpadded 2026 URL did not load in the fetch tool; the padded form does. | 2026 text: "Liability for reckless or careless operation of a vessel shall be confined to the operator in immediate charge ... unless the owner is the operator or is present in the vessel" | 2026-11-03 |
| mar | sources [6] | 327.39 (2025) | (2026), /Statutes/2026/327.39 | Newer edition; text unchanged (history ends 2015) | (1) non-inflatable PFD; (2) lanyard; (3) half hour after sunset to half hour before sunrise; (5) under 14; (6) owner may not authorize or knowingly permit | 2026-11-03 |
| mar | sources [7] | 327.395 (2025) | (2026), /Statutes/2026/327.395 | Newer edition; last amended ch. 2025-197; no 2026 change, no phase-in or future date | (1) "A person born on or after January 1, 1988, may not operate a vessel powered by a motor of 10 horsepower or greater" without the documents "in his or her possession aboard the vessel"; (6)(c) accompanied by a person "18 years of age or older" who is exempt or holds a card and is "attendant to the operation of the vessel and responsible" | 2026-11-03 |
| mar | sources [8] | 327.54 (2025) | (2026), /Statutes/2026/327.54 | Newer edition; last amended ch. 2025-147 and 2025-197; no 2026 change | (6) no livery vessel to "any person who is under 18 years of age" (human-powered excluded); (7)(a) at least $500,000 per person and $1 million per event | 2026-11-03 |
| mar | sources [13] | 823.11, Derelict vessels (2025) | (2026), https://www.flsenate.gov/Laws/Statutes/2026/0823.11 | Section amended in 2026 (s. 51, ch. 2026-14); cited points unchanged. Padded URL for the same fetch reason as [5] | (2)(a) owner "may not leave any derelict or migrant vessel upon waters of this state"; (3)(a) costs "are recoverable against the owner" | 2026-11-03 |
| mar | sources [15] | 627.409 (2025) | (2026), /Statutes/2026/627.409 | Newer edition; text unchanged (history ends ch. 2014-86) | (2) breach does not void a wet marine or transportation policy "unless such breach or violation increased the hazard by any means within the control of the insured" | 2026-11-03 |
| avi | sources [8] | 627.409 (2025) | (2026), /Statutes/2026/627.409 | Same as mar [15] | same | 2026-11-03 |
| emp | sources [2] | /Statutes/2025/440.02 | /Statutes/2026/440.02 | Newer edition; no 2025 or 2026 amendment | s. 440.02(20)(c)1: "Employment" does not include "Domestic servants in private homes." | 2026-11-03 |
| emp | sources [3] | /Statutes/2025/440.04 | /Statutes/2026/440.04 | Newer edition; unchanged since ch. 97-103 | (1) employer may "waive such exclusion or exemption and accept the provisions of this chapter" | 2026-11-03 |

## Verified unchanged (key figures and rules)

**mar**
- FWC 2025 Boating Accident Statistical Report is the latest (the FWC accidents page lists 2007 to 2025). Exact matches: "With 1,027,742 registered vessels"; "694 reportable boating accidents and 51 boating-related fatalities"; "Personal watercraft (PWC) accounted for 17% of all registered vessels"; "PWC were involved in 23% (161) of reportable boating accidents"; "Florida is the 'Boating Capital of the World.'" https://myfwc.com/media/1cobinby/2025-basr.pdf
- USCG Recreational Boating Statistics: **2024 (COMDTPUB P16754.38, June 24, 2025) is still the latest.** The USCG statistics page lists 2025 as "Pending" with a date of Nov 16, 2026. 69% ("Where instruction was known, 69% of deaths occurred on boats where the operator did not receive boating safety instruction") and 20% (alcohol "listed as the leading factor in 20% of deaths") match. Florida 75 deaths in 2024, first among states: the USCG state table could not be read through the fetch tool, but the FWC 2025 report's chart "2024 Fatalities - Top Ten States," sourced to the "U.S. Coast Guard Boating Safety Division," shows Florida first with 75. (FWC's own 2024 count is 81; the guide correctly attributes 75 to USCG.)
- III boat page: homeowners give limited property cover for small boats, "Liability coverage is typically not included"; agreed value pays the agreed amount after a total loss and replaces items after a partial loss without subtracting depreciation. III PWC page: PWCs "not generally covered by homeowners insurance," limits "low."
- 46 U.S.C. 30104 ("civil action at law, with the right of trial by jury, against the employer"); 33 U.S.C. 902(3)(G) ("a master or member of a crew of any vessel"); Wex maintenance and cure (living expenses and medical costs until "fit for duty" or further treatment "will not help"); 33 U.S.C. 409 (mark and "commence the immediate removal"); 33 U.S.C. 2702(a) (responsible party liable for removal costs and damages).

**avi**
- eCFR (Title 14 current as of 8/06/2026 and 10/16/2026): 61.56(a) 1 hour flight + 1 hour ground, (c) 24 calendar months; 61.57(a)(1) three takeoffs and landings in 90 days, same category, class and type; 1.1 operational control definition; 91.1001(b)(10) 1/16 of a fixed-wing program aircraft; 91.1009(a) owner in operational control when it has directed the aircraft carry its passengers and the aircraft is carrying them; 91.1011(a) owner "ultimately responsible for safe operations," may delegate, then owner and manager "jointly and individually responsible." Subpart K last amended 1/21/2025; nothing in 2026. 135.77 (read on Cornell LII; eCFR blocks the fetch tool): "Each certificate holder is responsible for operational control."
- No 2026 rule change affects the guide. Part 108 (BVLOS) final rule was still at OIRA in mid-October 2026 (sent July 10, 2026), not published; it would not change the Part 107 / recreational statements. Recreational Flyers page updated Oct 29, 2026: TRUST free and online, carry proof, 400 ft in Class G, visual line of sight, "taking photos to help sell a property or service" and "roof inspections" are not recreational, "When in doubt, assume Part 107." Registration: $5, three years, recreational covers all drones, Part 107 "$5 per drone", age 13+, Remote ID for drones required to be or that are registered. Part 107: at least 16; drone under 55 lb.
- AOPA smooth-limit (2022) and hull exclusion (2019) articles support the cited lines. Pickett v. Woods, 404 So. 2d 1152 (Fla. 5th DCA, Oct 21, 1981) applied 627.409(2) to an aircraft policy.
- NTSB general aviation statistics: not cited anywhere in avi (nothing to update).

**emp**
- IRS Publication 926 (2026) is current: "$3,000 or more in cash wages in 2026"; examples include cooks, drivers, caretakers, nannies, housekeepers, private nurses; agency sentence; spouse, child under 21, parent, employee under 18 unless household work is the principal occupation; FUTA "$1,000 or more in any calendar quarter of 2025 or 2026"; no required income tax withholding; Form I-9 "When you hire a household employee to work for you on a regular basis"; Schedule H and W-2.
- Florida DOR RT-800002 (current file is R. 03/25): domestic employers liable after paying "at least $1,000 in wages in any one calendar quarter" in the current or prior year.
- FTC/EEOC joint page: stand-alone written notice, written permission, copy of report plus "A Summary of Your Rights Under the Fair Credit Reporting Act" before adverse action.
- FDIC 2018 article: access to a box after death "depends on state law" (callout correct).
- LIMRA (Sept 25, 2025, 2025 Insurance Barometer): Hispanic coverage "dropped eleven percentage points from 51% in 2021 to just 40% today, lower than any other ethnicity." Still accurate as a dated statement (see "Needs Christian's call").
- Auto minimums and owner liability: consistent with BRIEF; 2026 PIP repeal failed again (Florida Politics, "hits the skids again").
- E-Verify: not mentioned in emp (nothing to check).

## EEOC criminal-records guidance (coordinator tip): checked, no text change needed

- **The tip is true.** The EEOC's April 2012 *Enforcement Guidance on the Consideration of Arrest and Conviction Records in Employment Decisions Under Title VII* was rescinded at the end of October 2026. Primary source: the Federal Register Sunshine Act notice https://public-inspection.federalregister.gov/2026-21825.pdf (EEOC meeting Friday Oct 30, 2026; sole item "Rescission of Enforcement Guidance on the Consideration of Arrest and Conviction Records in Employment Decisions Under Title VII of the Civil Rights Act"). Law-firm and trade reports confirm the rescission: Morgan Lewis (announced Oct 29, published Oct 30, 2026), https://www.morganlewis.com/pubs/2026/10/eeoc-rescinds-guidance-on-employers-use-of-arrest-and-conviction-records-in-employment-decisions; HR Dive (2-1 vote; updated Oct 30, 2026). The sources do not agree on the exact vote date (Oct 28 or Oct 30). The eeoc.gov guidance page would not load in the fetch tool. Accessed 2026-11-03.
- **emp does not rely on that guidance.** It never mentions criminal records or the 2012 guidance. What it cites to the joint FTC/EEOC page [5] is Fair Credit Reporting Act procedure: a stand-alone written notice, written permission, and a copy of the report plus "A Summary of Your Rights Under the FCRA" before adverse action. The rescission does not touch these requirements (they are federal statute, enforced by the FTC). The mitigation line "Follow FTC and EEOC rules for background checks, including written consent and notices [5]" also stays accurate, because the EEOC still enforces the anti-discrimination laws. No edit made.
- **Watch item:** the joint page [5] (https://www.ftc.gov/business-guidance/resources/background-checks-what-employers-need-know, footer "February 2014") still links to the rescinded guidance under "Further Information," and it still carries EEOC wording on criminal-record exclusion policies. The guide repeats none of that. If the FTC or EEOC withdraws or revises the joint page, [5] would need a new FCRA source (for example, the FTC's FCRA pages).

## Needs Christian's call (not edited)

1. **Homepage Fed SCF figure is superseded (index.html / en.html, not my files).** The Fed released the **2025 Survey of Consumer Finances on Oct 9, 2026** (https://www.federalreserve.gov/publications/files/scf26.pdf, Table 2, 2025 dollars): Hispanic or Latino median net worth **$79,600 in 2025**, up from $67,400 in 2022 (the old $61,600 is the same 2022 value in 2022 dollars). The homepage line "from about $18,000 (2013) to $61,600 (2022)" is still true as stated but no longer the latest edition. Whoever owns the homepage should update it from the 2025 SCF historical table (scf2025_tables_internal_real_historical.xlsx, linked on https://www.federalreserve.gov/econres/scfindex.htm), which gives 2013 in 2025 dollars. My rough estimate only (CPI scaling of $18,000 by 67,400/61,600) puts 2013 near $19,700, which would make 2013 to 2025 roughly four times. Do not publish that estimate without reading the table.
2. **LIMRA 2026 Insurance Barometer exists**, but no Hispanic ownership percentage could be read reliably (the LIAM 2026 fact sheet chart text is garbled). It does say "Gen Z and Hispanic adults are the least likely to say they own life insurance." The emp line (51% in 2021 to 40% in 2025) and the homepage line stay accurate as dated statements; update only if Christian can get the 2026 Hispanic figure from LIMRA or Life Happens.
3. **USCG 2025 statistics are due Nov 16, 2026** (listed "Pending"). After release, re-check Florida's 2025 death count and rank, and the 69% and 20% figures, in mar and on the homepage.
4. emp FAQ 3: "Many insurers allow the trust or trustee to be added as an insured" is an unsourced statement about insurer practice, close to the "no carrier-specific practice" rule. Keep, hedge, or drop.
5. Small parity and wording items (not factual): avi FAQ 1 EN ends "so the exclusion wording is worth reading closely" with no ES equivalent; mar ES mitigation says "encomienda negligente" while the rest of the guide says "entrega negligente".

## Could not reach a source

- USCG 2024 Table 30 (state rows) is unreadable through the fetch tool. Florida 75 was confirmed through FWC's chart citing USCG instead.
- LIMRA 2026 Hispanic ownership figure (see item 2).
- SCF 2013 Hispanic median in 2025 dollars (an Excel file the tools cannot read).
- eCFR 135.77 blocks scripted fetches; the same text was read on Cornell LII. The eCFR link itself is fine for browsers.

## Access notes

- flsenate.gov: the unpadded 2026 URLs for 327.32 and 823.11 kept returning client errors to the fetch tool, but the padded forms (/2026/0327.32, /2026/0823.11) and leg.state.fl.us both showed the 2026 text, so the sources use the padded form. The other 2026 statute URLs load unpadded.
