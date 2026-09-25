# Patrimonio Protegido: content brief for the education library

Site: https://www.protectedlegacyfl.com (Spanish at /, English at /en/). Author: Christian R. González,
licensed Florida insurance agent (Lic. W606240), Doral/Miami. Audience: high-net-worth Hispanic families,
family offices and their advisors (CPAs, attorneys) in Florida. The site is EDUCATIONAL ONLY.

## Voice rules (hard rules, any violation = rewrite)
- Educational, calm, precise. Explain how things work, what the common gaps are, and which questions to ask.
- NEVER sell or solicit: no "call now", "get a quote", "contact me to buy", "cotice", "contrate", "llame ya",
  no prices of premiums, no promises of savings or results, no "best coverage", no guarantees.
- NEVER name insurance carriers or brands, and give no carrier-specific information (who offers what, market availability).
  This includes Citizens Property Insurance. Government programs and agencies (FEMA, NFIP, Florida DFS, OIR, FWC, FAA, USCG) are fine.
- NEVER state coverage limits that insurers set, sell or typically require (jewelry theft caps, umbrella sizes, required
  underlying limits, extended replacement percentages). Figures set by law or a government program are fine (NFIP maximums,
  Florida minimums, statutes). Hypothetical deductible math on a stated dwelling limit is fine.
- NEVER describe underwriting acceptance: who insurers accept, decline or find eligible, or requirements to qualify.
  Legal consumer rights are fine (Fla. Stat. 627.7011 roof-age rule, written UM rejection).
- NEVER name the author's employer.
- No em dashes (—) anywhere. Use commas, colons, periods or parentheses. En dash only inside number ranges is also discouraged: write "2020 a 2024" / "2020 to 2024".
- Spanish: neutral Latin American Spanish, formal "usted", natural (not a translation feel). Accents correct.
- English: plain American English. Both languages say the same things (parity), but each should read natively.
- Avoid the words: genuinely, honestly, straightforward.
- Hedge correctly: "typically", "many policies", "can", "often" where practice varies by policy. Every policy has its own terms.
- Florida-specific where it matters (hurricanes, flood, statutes). Say when something is general U.S. practice.
- Close each guide with neutral next steps (the questions to review with your own licensed agent, attorney or CPA).

## Facts already verified today (use these exact figures when relevant; do not contradict)
- NFIP: residential building max $250,000; contents max $100,000. Average NFIP claim paid 2020 to 2024: $63,691 (median $20,272) (FEMA NFIP Media Toolkit, July 2025).
- Almost one-third of NFIP claims from 2014 to 2024 came from outside high-risk flood areas (FEMA).
- FEMA: "just one inch of water can cause $25,000 in damages" (say "$25,000", not "more than").
- NFIP policies generally have a 30-day waiting period; exceptions: bought with a mortgage loan transaction (no wait), 1 day within 13 months of a flood map revision. Private flood waits vary, often about two weeks.
- Standard homeowners policies exclude flood; storm surge counts as flood. Florida law (627.715) allows insurers to offer flood coverage by policy or endorsement.
- Florida hurricane deductible (627.701): insurers must offer $500, 2%, 5% and 10% of the dwelling (Coverage A) limit, with variations for higher-value homes (e.g., $500 not required at $250,000+ dwelling; at $3M+ the 2% option is not required); applies once per calendar year (hurricane season).
- Extended replacement cost: pays a percentage above the dwelling limit that varies by policy (do not state the percentage).
- Jewelry theft: a standard homeowners policy has a relatively low theft limit for jewelry (III). Do not state the amount.
- Residential reconstruction costs rose 25.9% from March 2020 to May 2023 (Verisk via Carrier Management).
- 2021 Marshall Fire (Colorado): 74% of policyholders who lost homes were underinsured, 36% severely (Cookson, Gallagher, Mulder, Philadelphia Fed WP 25-09, 2025).
- CoreLogic (now Cotality) estimated about 64% of U.S. homes are underinsured.
- Florida auto minimums: $10,000 PIP and $10,000 property damage liability; no bodily-injury liability requirement for private passenger cars. Repeal-PIP bills died in 2025 and 2026.
- About 1 in 5 Florida drivers (20.6%) was uninsured in 2023, 7th highest (Insurance Research Council, 2025).
- Fla. Stat. 322.09: an adult who signs a minor's license application is jointly and severally liable for the minor's negligent driving. Vehicle owners also face liability under Florida's dangerous instrumentality doctrine.
- Boats: Florida does not require private recreational owners to carry boat insurance (liveries/rentals must; marinas and lenders often require it). Fla. Stat. 327.32: liability for reckless or careless operation is confined to the operator unless the owner is the operator or is present in the vessel (an owner can still face negligent-entrustment claims).
- FWC 2025: 1,027,742 registered vessels; 694 reportable accidents; 51 fatalities; PWCs were 17% of registered vessels and 23% of reportable accidents. FWC calls Florida the "Boating Capital of the World". Florida recorded the most recreational boating deaths of any state in recent USCG reports (75 in 2024).
- Fla. Stat. 768.125: serving alcohol to a person of lawful drinking age generally creates no liability for what they do after; exceptions: willfully and unlawfully serving someone under 21, or knowingly serving someone habitually addicted to alcohol.
- Florida workers' comp (440.02): domestic servants in private homes are excluded from "employment"; an employer may voluntarily elect coverage (440.04).
- Hispanic median wealth more than tripled after inflation from about $18,000 (2013) to $61,600 (2022) (Fed SCF). Hispanic life insurance ownership 51% (2021) to 40% (2025), lowest of any ethnic group (LIMRA/Life Happens 2025). 72% of Hispanics overestimate the cost of term life (LIMRA 2024).
- Most personal umbrella policies exclude aviation liability; umbrellas require minimum underlying limits.

## New facts
You may add other facts ONLY if you verify them against a primary or authoritative source (government site,
statute, FEMA/NFIP, FAA, NAIC, III, Florida DFS/OIR, peer-reviewed or recognized industry research) and list
the source. Use WebSearch/WebFetch. If you cannot verify a figure, do not use it; describe the concept without a number.
Prefer fewer, solid numbers over many weak ones. No invented examples presented as real cases; hypothetical
illustrations must be clearly hypothetical ("Imagine...", "Por ejemplo, una familia hipotética...").

## Output format for a guide (write valid UTF-8 JSON to the given path)
{
  "key": "flo",                       // domain key
  "slug_es": "inundacion", "slug_en": "flood",
  "updated": "2026-09-24",
  "es": {
    "title": "<= 60 chars, includes the main Spanish search term",
    "meta": "meta description 140-160 chars",
    "kicker": "Guía · Inundación",
    "h1": "headline",
    "dek": "one-sentence subtitle",
    "summary": ["3 to 5 key-takeaway bullets"],
    "sections": [
      {"id": "short-kebab-id", "h2": "Section heading",
       "blocks": [
         {"p": "Paragraph text. Footnote refs like [1] refer to sources by number."},
         {"ul": ["bullet", "bullet"]},
         {"callout": "Short highlighted fact or warning"},
         {"table": {"head": ["col","col"], "rows": [["a","b"],["c","d"]]}}
       ]}
    ],
    "questions": ["5 to 7 questions to review with your licensed agent / attorney / CPA"],
    "faq": [{"q": "question people search", "a": "40 to 80 word answer"}]   // 3 items
  },
  "en": { same structure and same number of sections/blocks, English },
  "sources": [{"n": 1, "label": "Publisher, Title (year)", "url": "https://..."}]
}
Length: each language 1,100 to 1,600 words of body (sections), 5 to 7 sections. Use the target search terms
naturally in headings and first paragraphs. Footnote numbers [n] must match "sources". Same footnotes in both languages.
No HTML tags inside strings except <b> for rare emphasis. Escape quotes properly (validate with python -m json.tool).
