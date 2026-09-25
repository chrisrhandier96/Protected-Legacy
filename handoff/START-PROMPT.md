Paste this as the first message of the new Claude session (repo: chrisrhandier96/Protected-Legacy):

---

Continue the library-expansion work order for my site. Check out the branch `work-order-2026-09` and read `handoff/HANDOFF.md` from top to bottom before doing anything. It has my rules, the current state and the exact remaining steps (sections 5 to 8).

In short:
1. Apply the 12 fact-check corrections in `handoff/factcheck-A.md`.
2. Run fact-check half B with a separate sub-agent, using `handoff/factcheck-B-prompt.md`, and apply its corrections.
3. Write `content/FACTCHECK-2026-09.md`.
4. Fix the privacy page hreflang and run the full test suite plus the ads validator locally.
5. Commit everything on the branch.

Important:
- Do NOT push to `main` or merge into it without asking me first. `main` deploys to production and costs Netlify credits. Ask me once at the end, with a summary of what will go live.
- After I say yes, merge once, wait for Netlify, re-run the tests against the live site, and report back in the RETURN FORMAT from the work order (it's in the handoff).
- Never submit the contact form in tests.
- No carrier names, no insurer-set coverage limits, no underwriting-acceptance statements, no em dashes.
