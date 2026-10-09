# Hand-off notes: the lead path (work order 2026-10-08)

Branch `work-order-2026-10-lead-path`, from `main` at `26bc305`. Not merged: Christian merges after the inspector reads the report.
Screenshots, speed numbers and the local suite log are in `handoff/lead-path-2026-10/`.

## What changed

- **Part 1, home page (ES + EN): two fields at the self-check result.**
  - `#resCapture` now holds a static heading, a `#miniSlot` the script fills, the "¿Prefiere contarme más?" / "Prefer to tell me more?" link to the long form (still `#rcGo`, same scroll-to-form behaviour), and the "nothing leaves your browser" note.
  - The form itself (name; phone/WhatsApp with an "o correo" / "or email" switch), its code and its styles live in **`/js/lead.v1.js`**, loaded with `defer`.
  - It posts to the same Netlify form `contacto` with the long form's hidden fields (ad source, landing page, quiz score, answers, blank zones), plus `form_id=mini`, `nivel_conciencia`, `idioma` and `tema = Revisión de mi autoevaluación`.
  - No redirect. On success it shows "Listo. Le escribo hoy mismo." / "Done. I will write to you today.", and the long form collapses (hidden, replaced by the same line).
- **Part 2, long form.**
  - A visible "Teléfono o WhatsApp (opcional)" / "Phone or WhatsApp (optional)" field above email. It replaces the hidden `telefono` input, so Netlify keeps the field.
  - Email is required only when phone is blank.
  - New hidden fields `form_id` (`long`) and `nivel_conciencia`. Netlify only stores fields that exist in the static form, which is why they are in `#ppForm`.
  - Consent line unchanged.
- **Part 3, the 28 guides.**
  - Phone bar order is now Autoevaluación / Self-check, Llamar / Call (phone icon plus the word), Escríbame / Write to me. The call link stays `tel:+17866712171`.
  - The guide click listener reports the bar's call as `phone_click` with `link_location: 'barra_movil'`.
  - Built through `tools/build_library.py` as usual.
- **Not done: Part 4** (umbrella quick check). The work order makes it phase 2, after Parts 1 to 3 ship clean.
- **Build fix:** `tools/build_library.py` now writes pages with LF line endings on every OS. On Windows it wrote CRLF, and the post-build injectors then added stray blank lines.

## The byte budget on the home page (read before adding anything to index.html / en.html)

The phone score depends on the size of the HTML, not only on code. Lighthouse's simulated phone network delivers the document in 150 ms round trips. `main`'s home page (74,096 bytes gzip-6 on the wire) fits in three. The first version of this branch (76,132) needed a fourth: +148 ms first paint, score 98 instead of 99.

The fixes:
- The short form's code, markup and styles moved to `/js/lead.v1.js`.
- Two unused rules from the old in-card form (`.rc-consent`, `.rc-s`) were deleted.

The branch home page is now about 74,330 bytes, so the boundary sits somewhere between 74,330 and 74,489. **Anything new on the home page should go in a deferred file or be paid for by removing bytes.** Check it with `doc transfer` in Lighthouse's network requests.

`/js/*` is cached immutable. Whenever `lead.v1.js` changes, rename it to `lead.v2.js` and update the `<script src>` near the end of both homepages.

## How the speed was measured

Lighthouse 13.5.0, phone preset network, median of 5 runs (home) or 3 to 5 (guides), local server.
- This PC is slower than the Oct 5 sandbox: unchanged `main` scores 84 to 92 here at the standard 4x CPU slowdown.
- At 1.5x, unchanged `main` reproduces the Oct 5 runs (home 99, flood guide 100 with about 640 ms of main-thread work, against 608 ms then). All comparisons use that setting, `main` and the branch side by side.
- Details: `handoff/lead-path-2026-10/perf.md`.

## Christian's side (Tag Manager and Ads)

- `generate_lead` now carries `form_id` (`mini` or `long`). The mini push also has `lang`, `awareness_level` (`high` / `medium` / `starting`) and `blank_count`. Create Data Layer Variables for them, and register `form_id` and `awareness_level` as GA4 custom dimensions.
- The mini form does **not** go to `/gracias.html`. A URL-based Ads conversion on the thank-you page will not count mini leads; the GTM tag on `generate_lead` does, as before.
  - The Sep 25 note still stands: the long form fires both the URL rule and the GTM tag, so it counts twice until one of them is removed.
- New Netlify form fields appear after the deploy: `form_id`, `nivel_conciencia`, and `telefono` (now visible).

## Tests

`site-tests/verify.js` has a new `leadpath` group with 13 checks:
- Both languages render the result screen at 390 px: labels and tab order.
- No phone and no email is blocked with a plain message and nothing sent.
- Phone only sends once (a double tap included), fires one `generate_lead` with `form_id: mini`, shows the done line and collapses the long form.
- The "or email" switch works.
- Long form: phone without email is accepted, neither is blocked.
- Guide bar order, label and `barra_movil` event.
- The copy scan: accents, no em dash, no pressure words.

`guidecta` now expects the visible "Llamar" / "Call" and the new order. POSTs are answered inside the browser, so nothing reaches Netlify.
