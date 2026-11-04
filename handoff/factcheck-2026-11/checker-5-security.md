# Fact-check report: checker-5-security (cyb, kr, FAQ), Nov 3, 2026

Files: content/guides/cyb.json, content/guides/kr.json, content/extras/faq.json. All sources accessed 2026-11-03.

## Totals

| File | Claims checked | Verified unchanged | Corrected | Softened or dropped | Links checked | Links replaced |
|---|---|---|---|---|---|---|
| cyb | 37 | 37 | 0 | 0 | 5 | 0 |
| kr | 23 | 23 | 0 | 0 | 7 (1 blocks scripts) | 0 |
| faq | 80 | 78 | 2 | 0 | n/a (no links) | 0 |
| **Total** | **140** | **138** | **2** | **0** | **12** | **0** |

cyb.json and kr.json are unchanged ("updated" left at 2026-09-25). faq.json "updated" set to 2026-11-03.
`python3 tools/check_content.py cyb kr`: both OK (the cyb "numbers only in one language" warning was there before and comes from $3,500 millones vs $3.5 billion formatting). faq.json parses as valid JSON, has 29 items and no em dashes. I edited it as strings, so its compact one-item-per-line layout is unchanged.

## Changes

| File | Location | Old text (EN) | New text (EN) | Why | Source and exact line relied on | Accessed |
|---|---|---|---|---|---|---|
| faq.json | item `costo-reemplazo-vs-acv`, a_en / a_es | "Many policies pay ACV first and the rest once the repair is completed." (ES "...y el resto cuando se completa la reparación.") | "Many policies pay ACV first and the rest as the repair is performed." (ES "...y el resto a medida que se hace la reparación.") | Disagreed with Florida law and with the res guide, which says "pay the remaining amounts as repairs are performed [3]". For a partial dwelling loss, Florida requires the remaining amounts to be paid as the work goes on, not only when it is finished. | https://www.flsenate.gov/Laws/Statutes/2026/627.7011 (read on leg.state.fl.us, 2026 edition), s. 627.7011(3)(a): insurer "must initially pay at least the actual cash value of the insured loss, less any applicable deductible" and then the remaining amounts "necessary to perform such repairs as work is performed and expenses are incurred". No 2026 amendment (last: ch. 2024-182). | 2026-11-03 |
| faq.json | item `alquiler-licencia`, a_en / a_es | "...more than three times in a calendar year for less than 30 days or one month, or advertise it..." (ES "...por menos de 30 días o un mes, o la anuncia...") | "...more than three times in a calendar year for periods of less than 30 consecutive days, or advertise it..." (ES "...por períodos de menos de 30 días consecutivos, o la anuncia...") | Out of date since July 1, 2025. SB 606 (ch. 2025-113) changed the transient public lodging definition, which the vacation rental definition in s. 509.242(1)(c) depends on, to "30 consecutive days" and removed the "1 calendar month" alternative. DBPR's VRTSP guide still shows the old wording, which explains the lag. | http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0509/Sections/0509.013.html (2026 Florida Statutes), s. 509.013(4)(a)1.: "rented to guests more than three times in a calendar year for periods of less than 30 consecutive days", or advertised or held out as regularly rented for such periods; history ends "s. 1, ch. 2025-113". Bill summary: https://flsenate.gov/Committees/BillSummaries/2025/html/606 ("removes references to one calendar month"; effective July 1, 2025). s. 509.242(1)(c) has no 2026 amendment. | 2026-11-03 |
| faq.json | top-level "updated" | 2026-09-25 | 2026-11-03 | Content changed | n/a | 2026-11-03 |

## Verified unchanged (main items)

**cyb.** I read the 2025 IC3 Annual Report PDF: https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf.
- BEC: 24,768 complaints (p. 7) and $3,046,598,558 (p. 8).
- Real estate: 12,368 complaints (p. 7) and $275,110,419 (p. 8).
- Florida: rank 3 in complaints with 71,843 (p. 28) and rank 3 in losses with $1,596,138,595 (p. 29).
- FFKC: 3,900 incidents, $679,013,183 frozen of $1,163,919,846 attempted, 58% (p. 17).
- Extortion: 89,129 complaints, second after phishing/spoofing at 191,561 (p. 7). Ransomware: 3,611 (p. 7).
- Sextortion: "more than 75,000 submissions" (p. 11; the September notes said p. 10, but the guide text gives no page).
- August 2025 closing case (p. 23): "individuals" closing on a home, email "impersonating their legitimate attorneys", over $449,000, "full amount ... on hold".
- Bank recall and ic3.gov advice (p. 17).
- No newer report exists. The 2025 report came out in early April 2026 (Help Net Security, Apr 7, 2026), and the next one is due in spring 2027.

Other cyb sources:
- FTC 2025 figures (more than 1M impostor reports, more than $3.5B, 3M fraud reports, $15.9B): https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-testifies-joint-economic-committee-agencys-efforts-combat-fraud (Mar 25, 2026). The later FTC release of June 15, 2026 agrees (about $3.5B impostor, about $16B total): https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-data-show-people-reported-losing-3-point-5-billion-imposter-scams-2025
- NAIC article (Dec 3, 2025): legal fees, lost wages, administrative costs; "generally does not reimburse money stolen from your accounts"; sold alone or in homeowners or renters policies.
- FTC credit freeze page: free, no score effect, all three bureaus, children under 16.
- FBI PSA I-120525-PSA (Dec 5, 2025): altered social media photos used as proof of life; code word; contact the loved one first; report to ic3.gov.

**kr.**
- III "What does K&R cover": business packages, stand-alone individual policies, some homeowners policies. Corporate policies cover the ransom; individual policies "do not reimburse for ransom payments".
- III "Insuring against employee kidnapping": the four events with their exact definitions (extortion includes "damage to property"; illegal detention by "rogue law enforcement or government officials"; hijacking of "planes, ships or other vehicles"). Covered expenses: security consultants (investigators, ransom negotiators), crisis management, legal, PR, travel, medical, rest and rehabilitation. Insurer "will likely include consulting services and training".
- 2015 documents (all load):
  - Fact sheet: "reaffirms our longstanding commitment to make no concessions"; no concessions ≠ no communication; "may work with private entities to locate and recover" and "may also assist private efforts to communicate with hostage-takers".
  - PPD-30: same points.
  - President's statement: "no family of an American hostage has ever been prosecuted for paying a ransom".
- Hostage policy is still current. EO 14348 (Sept 2025, wrongful detention) does not mention or revoke PPD-30 or EO 13698. I found nothing rescinding PPD-30.
- State Department four levels and the K indicator: still in use. A K indicator was added to Pakistan's advisory on Jan 26, 2026 (AOL report).

**FAQ, against 2026 law and the guides.**
- Flood:
  - Agrees with the flo guide on NFIP limits, waiting periods, the one-third figure and the $25,000 per inch figure.
  - FloodSmart Flood Insurance 101 confirms the 30-day rule and the loan exception.
  - 44 CFR 61.11(a) confirms the 13-month next-day rule.
- s. 627.701 (2026): offers of $500, 2%, 5% and 10% in (3)(a); exceptions at $250k and $3M in (3)(d); calendar-year application in (5)(a)1; no 2026 amendment. The $40,000 example is correct ($2,000,000 × 2%).
- s. 627.736 (2026), no 2026 amendment (last ch. 2025-4): $10,000 limit, 80% medical, 60% income, $5,000 death benefit, $2,500 cap when no emergency medical condition. The repeal effort failed again in 2026.
- Boats:
  - FWC 2025 BASR: "694 reportable boating accidents and 51 boating-related fatalities".
  - s. 327.32 (2026): liability is confined to the operator unless the owner is the operator or is present.
  - s. 327.54(7)(a) (2026): liveries must carry at least $500k per person and $1M per event.
- s. 768.125 (2026): text matches FAQ `invitado-conduce`.
- s. 322.09(2) (2026): the adult who signs is jointly and severally liable.
- s. 440.02 (2026): domestic servants are excluded, now numbered (20)(c)1.
- s. 440.04(1): an employer may waive the exemption.
- s. 713.13 (2026): recorded and posted before the first inspection; void after 90 days; expires 1 year after recording unless a different date is given; warning about paying twice; no 2026 amendment.
- s. 617.0834 (2026, amended by ch. 2026-168): the FAQ's exceptions are still accurate (criminal violation, improper personal benefit, bad faith in third-party suits).
- IRS self-dealing tax: 10% and 5%.
- s. 627.714 (2026): $2,000 of loss assessment coverage, deductible of $250 or less.
- s. 627.70132 (2026): 1 year for new or reopened claims, 18 months for supplemental claims; last amendment ch. 2024-139.
- s. 626.854 (2026, amended by ch. 2026-174): current text still caps fees at 10% for "claims made during the year after the declaration of emergency" and 20% for other claims. It also keeps the 10-day cancellation window (30 days after loss or 10 days, whichever is longer, in an emergency), the Monday to Saturday 8 a.m. to 8 p.m. contact rule, and the license requirement.
- NAIC home-sharing article: "Most homeowners or dwelling insurance policies are not designed to cover accidents arising from short-term rentals"; a paying guest "might be excluded".
- III remodeling: "before or shortly after construction begins".
- III vacancy: "typically 30 to 60 consecutive days".
- FAQ items on cyb, kr, lia, aut, emp, brd and cnd agree with the current guide texts.

## Cross-file issues for other checkers (not edited, not my files)

1. **str.json (what-counts paragraph and guide FAQ, ES and EN)** still says "less than 30 days or one calendar month, whichever is less". That has been out of date since July 1, 2025. s. 509.013(4)(a)1. now reads "less than 30 consecutive days" (ch. 2025-113, SB 606). The FAQ now follows the statute, so str should be aligned. The summary line ("less than 30 days") is fine. The DBPR VRTSP guide, source [1], still shows the old wording, so cite s. 509.013 for this point.
2. **flo.json and FAQ `cuando-empieza-inundacion`.** FloodSmart says the map-revision exception applies when a building is "newly designated in a Special Flood Hazard Area". 44 CFR 61.11(a) does not add that condition. I left the FAQ as is because it matches the guide and the BRIEF's verified fact. The flo checker may want to add "that newly maps the home into a high-risk area" in both places.
3. **cnd.json FAQ and FAQ `condominio-quien-cubre`** say "floors". s. 718.111 says "floor, wall, and ceiling coverings". This is minor and covered by "finishes". The two texts agree, so I left them.
4. **emp.json (FTC/EEOC background check line).** A search result titled "The EEOC Rescinds Its Criminal-Records Guidance" (The Employer Handbook blog, Oct 30, 2026) turned up. I did not verify it. Worth a check by the emp checker.

## Needs Christian's call

1. **OFAC sanctions risk on ransom payments** is not mentioned in cyb or kr. The current guidance is still Treasury's "Updated Advisory on Potential Sanctions Risks for Facilitating Ransomware Payments" (Sept 21, 2021). Adding a hedged line such as "paying a ransom to a sanctioned person or group can violate U.S. sanctions; get legal advice first" to cyb's extortion section or kr's other-policies section would be a new fact, so I did not add it.
2. **kr's 2015 quote** ("no family ... prosecuted for paying a ransom") is accurate and correctly attributed. Whether to keep it on its own, or pair it with the sanctions and material-support caution above, is an editorial choice.
3. **The phone number in FAQ `que-hace-este-sitio`** is (786) 671-2171. Christian's saved profile in memory lists a different number (786 731 5265). Please confirm which one is the public line. This comes from memory; I made no edit.

## Could not reach a source

- **travel.state.gov** (kr [4]) blocks scripted fetches, and the archive copy was blocked too. I confirmed the levels and the K indicator through Sept 2026 notes and January 2026 press coverage. Please open https://travel.state.gov/en/international-travel/travel-advisories.html in a browser.
- **The FTC Consumer Sentinel Network Data Book 2025** page and PDF returned client errors. I verified the figures against the FTC's own Mar 25 and Jun 15, 2026 releases instead.
- **The FAQ phone number** cannot be verified from any public source here.
