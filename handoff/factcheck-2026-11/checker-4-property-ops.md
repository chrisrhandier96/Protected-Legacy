# checker-4-property-ops: cnd, str, ren, brd (re-verified 2026-11-03)

Files edited: `content/guides/str.json`, `content/guides/brd.json` (both `updated` set to 2026-11-03).
Files verified with no change: `content/guides/cnd.json`, `content/guides/ren.json` (`updated` left at 2026-09-25).
Saved with `json.dump(obj, f, ensure_ascii=False, indent=2)` + newline, as the brief says. This changes the layout of
str.json and brd.json from the old compact style, so `git diff` looks large. The content diff is only the 9 field
changes listed below (checked with a field-by-field compare against HEAD). `python3 tools/check_content.py cnd str ren brd`: all OK.

## Totals

| Guide | Claims checked | Verified unchanged | Corrected | Softened | Dropped | Links replaced |
|---|---|---|---|---|---|---|
| cnd | 31 | 31 | 0 | 0 | 0 | 0 |
| str | 26 | 24 | 1 (ES parity) | 1 | 0 | 0 |
| ren | 29 | 29 | 0 | 0 | 0 | 0 |
| brd | 31 | 29 | 1 | 0 | 0 | 1 (2025 to 2026 edition) |
| **Total** | **117** | **113** | **2** | **1** | **0** | **1** |

Claims include each statute point, each sourced sentence, unsourced general statements, the 2026-session check for each
guide's statutes, and the 21 source URLs.

## Changes

| File | Location | Old (EN) | New (EN) | Why | Source and exact line relied on | Accessed |
|---|---|---|---|---|---|---|
| brd.json | en/es `legal-protections` p1 | "section 617.0834 provides that directors and officers of not-for-profit corporations generally are not personally liable ..." | "section 617.0834 provides that directors and uncompensated officers of not-for-profit corporations generally are not personally liable ..." (ES: "los directores y los funcionarios no remunerados de corporaciones sin fines de lucro") | The shield covers only unpaid officers. Paid officers fall outside it, which matters because family foundations sometimes pay a relative who serves as an officer. September noted the point but did not change the text. | https://www.flsenate.gov/Laws/Statutes/2026/617.0834 , (4)(b): "Officer" means "a person who serves as an officer without compensation except reimbursement for actual expenses incurred or to be incurred." | 2026-11-03 |
| brd.json | sources [4] | "Florida Statutes, section 718.111 (2025)", .../Statutes/2025/718.111 | "Florida Statutes, section 718.111 (2026)", https://www.flsenate.gov/Laws/Statutes/2026/718.111 | September flagged the 2025 URL (report B, S1), but it was never updated. The 2026 edition is current. Its history adds s. 42, ch. 2026-14 and s. 189, ch. 2026-168. The cited points (1)(d), which cross-references s. 617.0834, and (11)(h), fidelity bonding of "all persons who control or disburse funds", are unchanged. | 2026 text read at https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0718/Sections/0718.111.html ("The 2026 Florida Statutes") | 2026-11-03 |
| str.json | en `homeowners-gap` table, row "Lost income after a hurricane" (es `poliza-de-hogar`) | "Usually not covered" | "May be excluded or limited" (ES: "Normalmente no se cubren" changed to "Pueden excluirse o limitarse") | No source supports "usually". NAIC [4] only lists lost rental income among the coverages a landlord policy can include. This is the same claim September softened in the glossary (`perdida-de-renta`, correction B-11), but the str table was missed. | https://content.naic.org/article/consumer-insight-renting-out-your-home-you-need-insurance-coverage-home-sharing-rentals : a landlord policy covers "lost rental income due to damage" | 2026-11-03 |
| str.json | es summary bullet 4 | EN unchanged: "even though state law protects the activity from cities and counties" | ES "frente a los municipios" changed to "frente a los municipios y los condados" | ES/EN parity. ES left out counties, and s. 509.032(7)(b) covers any "local law, ordinance, or regulation" (city or county). | https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0509/Sections/0509.032.html (2026 edition), (7)(b) | 2026-11-03 |
| str.json, brd.json | `updated` | 2026-09-25 | 2026-11-03 | Brief rule | n/a | |

## Verified unchanged (key points)

**cnd**
- s. 718.111 (2026): (11)(f)1 "as originally installed"; the (11)(f)3 exclusion list and "Such property and any insurance thereupon is the responsibility of the unit owner"; (11)(c) the board sets deductibles "consistent with industry standards and prevailing practice", which "may be based upon available funds, including reserve accounts"; (11)(j) deductibles and excess damages are a common expense. The only 2026 changes are the reviser's bill (ch. 2026-14) and ch. 2026-168 cross-references.
- s. 627.714 (2026): $2,000 loss assessment; deductible "no more than $250 per direct property loss"; no deductible if one was already applied to the same loss; (4) excess clause. History ends ch. 2021-99.
- s. 553.899 (2026): (3)(a) "three habitable stories or more", "subject, in whole or in part, to the condominium or cooperative form of ownership"; Dec 31 of the year the building reaches 30, then every 10 years; (3)(b) "local enforcement agency" may require it at 25 years (salt water); (7) phases one and two; (9) 45 days to distribute the summary and post it. History ends s. 4, ch. 2025-175. No 2026 law.
- s. 718.112 (2026): (g)1 SIRS every 10 years for 3+ habitable stories; items a to h; (g)7 deadline Dec 31, 2025, or with a milestone inspection due on or before Dec 31, 2026, "In no event ... after December 31, 2026"; (f)2.b no waiver for budgets adopted on or after Dec 31, 2024; (f)2.e pause or reduction, all conditions as stated. History ends s. 43, ch. 2026-14 (reviser's bill).
- 2026 session: no act changed SIRS, milestone inspections, reserves, 718.111 insurance or 627.714. SB 722 (SIRS) died in committee on 3/13/2026 (https://flsenate.gov/Session/Bill/2026/722). HB 657, SB 1498 and SB 1744 died. The only chapter 720 change was ch. 2026-63, a new s. 720.3035(1)(c) on building permits before architectural review, which the guide does not address. Secondary confirmations: https://hamiltonmikes.com/legislative-updates/florida-condominium-law-changes/ (Sept 26, 2026) and https://www.cic-sc.org/articles/florida-2026-legislative-landscape (Aug 26, 2026).

**str**
- DBPR guide: definition (s. 509.242(1)(c)); "more than three times in a calendar year for periods of less than 30 days or 1 calendar month, whichever is less" or "held out ... as a place regularly rented"; Condominium and Dwelling license types; "records readily observable fire safety items during inspections" and reports them to the State Fire Marshal (and to local fire safety authorities); the local-jurisdiction sentence for rentals that need no license.
- s. 509.032(7)(b) (2026 edition; history ends ch. 2016-86) and s. 509.242 (history ends ch. 2014-133): no changes.
- 2026 session: no vacation rental law. CS/CS/SB 658 (water safety for rentals, merged with SB 608) passed the Senate but "Died in Messages" on 3/13/2026. HB 79 died. The SB 280 veto was in 2024.
- Tax: s. 212.03 still 6% on rentals of 6 months or less (history ends 2014). GT-800034 (R. 01/25) is unchanged on the point. DR-15TDT is now **R. 10/26** and still shows 62 of 67 counties above 0% (Calhoun, Lafayette, Liberty, Sumter and Union at 0%), so "most counties" holds. (Miami-Dade 6%, Miami Beach 7%, Surfside and Bal Harbour 4%; the guide states no rates.)
- NAIC article (Mar 19, 2020): every quoted point still loads and matches.

**ren**
- DFS builder's risk FAQ: named peril; wind "subject to other contractual provisions"; stage of completion; "Rain is not a named peril"; materials by endorsement.
- III remodeling and the III vacancy blog (June 3, 2025, "typically 30 to 60 consecutive days"): all points match.
- s. 713.13 (2026; history ends ch. 2023-226): void after 90 days; (1)(c) 1-year expiry, contracts over 1 year, improper payments; WARNING TO OWNER "recorded and posted ... before the first inspection" and "paying twice".
- s. 489.103(7) (2026; history ends ch. 2021-22): disclosure items 4 (1-year presumption) and 7 (unlicensed person's injuries; homeowner's insurance may not cover).

**brd**
- s. 617.0834 was rewritten by ch. 2026-168 (CS/CS/HB 797, approved June 25, 2026, effective July 1, 2026). The new catchline is "Liability of directors and officers". It now covers "a director or an officer" of any ch. 617 corporation (the old 501(c)(3)/(4)/(6) limit is gone). The exceptions are criminal violation, improper personal benefit, conscious disregard or willful misconduct in suits by the corporation or a member, and recklessness, bad faith or wanton and willful conduct in suits by others. The guide's "among other things" wording and "revised in 2026" sentence remain accurate.
- 42 U.S.C. 14503(a) four conditions and (c): match.
- III D&O: org types, claim types, legal fees, Sides A/B/C, exclusions (fraud, personal profiting, BI/PD, insured v. insured, ERISA): match.
- IRS self-dealing pages (last reviewed 28-Jun-2026): acts list, indirect self-dealing, 10% and 5% initial taxes, not-willful and reasonable-cause exception: match.
- III EPLI: employees, former employees, candidates; protects "the company, its directors, and officers": match.

## Links

All 21 URLs were checked. 17 loaded through the fetch tool today. Four flsenate.gov 2026 statute URLs returned a fetch
client_error several times today: **2026/718.111** (cnd [1], brd [4]), **2026/509.032** (str [2]) and **2026/489.103**
(ren [5]). flsenate's other 2026 statute pages loaded in the same session (553.899, 718.112, 627.714, 617.0834, 713.13),
and September loaded these same URLs. I read the identical 2026 text on the Legislature's official mirror
(leg.state.fl.us, "The 2026 Florida Statutes"), so I left the URLs as they are. **Please click-check those three in a browser.**

## Needs Christian's call (not edited)

1. **Closing lines** in all four guides ("If you want to review how ... is protected, write to me" / "escríbame").
   This is borderline under BRIEF's "never sell or solicit" rule. It is not a fact question.
2. **brd, optional precision:** since July 1, 2026, s. 617.0834 uses different standards for suits by the corporation or a member
   (conscious disregard or willful misconduct) and for suits by others (recklessness or bad faith). The guide's "among other things" plus
   "confirm the text with your attorney" covers this. Spelling it out would add new text.
3. **brd, optional addition:** Florida has its own Volunteer Protection Act, s. 768.1355 (2026 edition, unchanged since ch. 2011-190).
   It protects unpaid volunteers, officers and directors included, who act in good faith within the scope of their duties as a
   reasonably prudent person would, unless the harm was caused by wanton or willful misconduct. The guide cites only the federal act. Adding this would be new content.
4. **ren, low priority:** "closed permits ... show the work meets the current Florida Building Code". The 9th Edition (2026) FBC takes
   effect **Dec 31, 2026** (https://www.icc-nta.org/code-update/florida-adopts-new-building-codes/, Sept 4, 2026). A permit shows
   compliance with the code in force when the work was permitted, so "the Florida Building Code in effect" would age better. It is not wrong today.
5. **Outside my files (for whoever owns lia):** `content/guides/lia.json` repeats the same 617.0834 sentence ("directors and
   officers of not-for-profit corporations", EN line 247 and ES line 104), and source [8] still cites the **2025** 718.111 URL.
   The same two fixes apply. The glossary and homepage DOMS were not in my scope.

## Facts I could not reach a source for

None of the figures. These unfootnoted general statements have no primary source. September kept them, and they are adequately hedged:
the HOA insurance split (cnd); "some platforms collect and remit part of these taxes" (str); builder's risk "usually ends" at
completion or occupancy, and "a certificate of insurance alone does not" make you an additional insured (ren); umbrellas excluding board service, D&O
"usually" claims-made, and EPLI available for households (brd).
