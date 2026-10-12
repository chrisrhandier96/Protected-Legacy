# Hand-off notes: the umbrella quick check (work order 2026-10-08, Part 4)

Branch `work-order-2026-10-umbrella-check`, from `main` at `d6ac329` (the lead-path merge). Screens and speed data in `handoff/umbrella-check-2026-10/`.

## What changed

- **Umbrella guide only** (`/guias/umbrella-responsabilidad/`, `/en/guides/umbrella-liability/`): the self-check card under the summary is now an inline 4-question check. There is no page change, and everything else on the guide stays.
  - Question 1 and its four answers are in the HTML (`tools/build_library.py`, `if k == "lia"`), so nothing shifts when the script loads. The full 12-question self-check link and "o escríbame" stay in the card, with their old `data-cta` names.
  - `/js/quick-check.v1.js` (deferred, only on these two pages) runs questions 2 to 4 and shows the result.
    - The result reuses the home page's three result bands word for word, and links to the guide sections to review.
    - Then comes the same two-field form as the home result. It posts to Netlify form `contacto` with the guide form's hidden fields (topic, language, ad source, landing page), plus `form_id=mini`, the score, the answers, the blank zones and `nivel_conciencia`.
    - On success it shows "Listo. Le escribo hoy mismo." and the guide's long form collapses.
  - The four questions are the home quiz's Q9 (umbrella limits), Q4 (auto liability, UM/UIM), Q5 (boat liability) and Q10 (digital risks), in that order and with the same wording and answers. The work order says "the four liability questions", but only two of the 12 belong to the liability domain. These four are the ones the umbrella guide covers; the household-staff question (Q11) belongs to the staff guide.
  - Scoring follows the home page: yes=2, not sure=1, no=0, n/a skipped. The bands are 75 and above, then 45 and above. `blank_count` counts the questions not answered "yes" (n/a excluded).
- **All guides:** the guide contact form's `generate_lead` now carries `form_id: 'guia'`, so the three forms are told apart (`mini`, `long`, `guia`). The new card styles are in the shared library CSS.

## dataLayer

- `quiz_complete` with `quiz_id: 'umbrella_4'`, `quiz_score`, `quiz_gaps` (the home quiz uses the same event without `quiz_id`).
- `generate_lead` with `lead_source: 'umbrella_quick_check'`, `form_id: 'mini'`, `lang`, `awareness_level`, `blank_count`, `quiz_score`, `page_type: 'guide'`. There is no redirect, so count it with the Tag Manager tag on `generate_lead`, not the thank-you URL.

## Speed (Lighthouse 13.5, phone network, CPU 1.5x calibrated as in the lead-path notes, side by side with main)

| Page | main | branch |
|---|---|---|
| /guias/umbrella-responsabilidad/ | 100 · CLS 0 · 77 KiB | 100 · CLS 0 · 83 KiB |
| /en/guides/umbrella-liability/ | 100 · CLS 0 · 77 KiB | 100 · CLS 0 · 83 KiB |
| /guias/inundacion/, /en/guides/flood/ | 100 · CLS 0 | 100 · CLS 0 |

The +6 KiB is the deferred script. The umbrella guide HTML is about 25 KB compressed, far from the simulated round-trip boundary that constrains the home page.

## Tests

`site-tests/verify.js` has a new `umbrella` group with 7 checks:
- The card with question 1 in the page, at 390 px, in ES and EN.
- The four questions in order, the result with working section links, and one `quiz_complete`.
- No contact is blocked. Phone only sends once (a double tap included), fires one `generate_lead`, collapses the guide form and stays on the page.
- The other guides keep the plain card and don't load the script.

New option `BLOCK_GTM=1` aborts Tag Manager for local runs when it is unreachable: the page's load event waits for it. `NAV_TIMEOUT` raises the page-load limit.
