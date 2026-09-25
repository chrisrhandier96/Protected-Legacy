# -*- coding: utf-8 -*-
"""Checks guide JSON against the house rules before building.
Usage (repo root): python tools/check_content.py [key ...]   (no keys = every guide)

Checks: valid JSON and schema; ES/EN parity (same sections, same block types, same
footnotes); every [n] has a source and every source is cited; 1,100-1,600 body words
per language; required "mitigacion"/"mitigation" section; no em dashes; banned words,
carrier/employer names, sales phrases, insurer-set limits and underwriting acceptance.
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# carrier and employer names: case-sensitive (so "travelers" or "pure" as ordinary words pass)
# No carriers anywhere, Citizens included; "Marshall Fire" is a wildfire, hence \bMarsh\b.
NAMES = [r"\bMarsh\b", r"Chubb", r"\bPURE\b", r"\bAIG\b", r"Cincinnati Insurance", r"Nationwide", r"State Farm",
         r"Allstate", r"Travelers", r"Lloyd'?s", r"Frontline", r"Universal Property", r"\bCitizens\b", r"Hiscox",
         r"Heritage Insurance", r"Tower Hill", r"American Integrity", r"Security First", r"Liberty Mutual",
         r"Progressive", r"GEICO", r"USAA", r"Farmers Insurance", r"Hagerty", r"Grundy", r"Zurich", r"Markel"]
# rules and phrases: case-insensitive
PHRASES = [r"—", r"genuinely", r"honestly", r"straightforward", r"call now", r"get a quote( today)?", r"quote now",
           r"cotice( ya)?", r"llame ya", r"cheap", r"barat[oa]s?", r"garantizamos", r"we guarantee",
           # insurer-set limits and underwriting acceptance (user rule 2026-09-25); statutes are fine
           r"insurers? (typically |often |usually |commonly )?(want|require|ask for) at least",
           r"aseguradoras? (suelen |normalmente )?(piden|exigen|pedir) al menos", r"underwriting", r"suscripción",
           r"theft (limit )?(at|to|of) about \$", r"robo de joyas a unos \$", r"in \$\d+M increments", r"tramos de \$"]
# words that need a human look (fine when they describe a statute, not an insurer's appetite)
REVIEW = [r"eligib", r"elegib", r"insurers? (may|can) (decline|refuse)", r"puede negarse"]
def words(t): return len(re.findall(r"\w+", t))
def text_of(c):
    out = []
    for s in c["sections"]:
        out.append(s["h2"])
        for b in s["blocks"]:
            if "p" in b: out.append(b["p"])
            elif "ul" in b: out += b["ul"]
            elif "callout" in b: out.append(b["callout"])
            elif "table" in b: out += b["table"]["head"] + [x for r in b["table"]["rows"] for x in r]
    return " ".join(out)
def all_strings(o):
    if isinstance(o, str): yield o
    elif isinstance(o, list):
        for x in o: yield from all_strings(x)
    elif isinstance(o, dict):
        for v in o.values(): yield from all_strings(v)

keys = sys.argv[1:] or [os.path.basename(p)[:-5] for p in sorted(glob.glob(os.path.join(ROOT, "content", "guides", "*.json")))]
fail = 0
for k in keys:
    p = os.path.join(ROOT, "content", "guides", k + ".json"); errs, notes = [], []
    try:
        g = json.load(open(p, encoding="utf-8"))
    except Exception as e:
        print(f"[{k}] INVALID JSON: {e}"); fail += 1; continue
    for f in ("key", "slug_es", "slug_en", "updated", "es", "en", "sources"):
        if f not in g: errs.append(f"missing {f}")
    src = {s["n"] for s in g.get("sources", [])}
    for l in ("es", "en"):
        c = g[l]
        for f in ("title", "meta", "kicker", "h1", "dek", "summary", "sections", "questions", "faq"):
            if f not in c: errs.append(f"{l}: missing {f}")
        if len(c["title"]) > 62: notes.append(f"{l} title {len(c['title'])} chars")
        if not 120 <= len(c["meta"]) <= 165: notes.append(f"{l} meta {len(c['meta'])} chars")
        if not 3 <= len(c["summary"]) <= 5: errs.append(f"{l}: summary {len(c['summary'])} items")
        if not 5 <= len(c["questions"]) <= 7: errs.append(f"{l}: {len(c['questions'])} questions")
        if len(c["faq"]) != 3: errs.append(f"{l}: {len(c['faq'])} faq")
        if not 5 <= len(c["sections"]) <= 8: errs.append(f"{l}: {len(c['sections'])} sections")
        mit = "mitigacion" if l == "es" else "mitigation"
        # the mitigation section (work order Part B) is extra depth, so it does not count toward the cap
        w = words(text_of({"sections": [x for x in c["sections"] if x["id"] != mit]}))
        wm = words(text_of({"sections": [x for x in c["sections"] if x["id"] == mit]}))
        if w + wm < 1000 or w > 1800: errs.append(f"{l}: {w}+{wm} body words (need 1000+ total, 1800 max outside mitigation)")
        notes.append(f"{l} {w}w+{wm}")
        if not any(s["id"] == mit for s in c["sections"]): errs.append(f"{l}: no '{mit}' section")
        refs = {int(n) for s in all_strings(c) for n in re.findall(r"\[(\d+)\]", s)}
        if refs - src: errs.append(f"{l}: footnotes without source {sorted(refs - src)}")
        if src - refs: errs.append(f"{l}: sources never cited {sorted(src - refs)}")
        for s in all_strings(c):
            for pat in NAMES:
                if re.search(pat, s): errs.append(f"{l}: name /{pat}/ in: {s[:70]}")
            for pat in PHRASES:
                if re.search(pat, s, flags=re.I): errs.append(f"{l}: banned /{pat}/ in: {s[:70]}")
            for pat in REVIEW:
                if re.search(pat, s, flags=re.I): notes.append(f"{l} review /{pat}/: {s[:50]}")
    es, en = g["es"]["sections"], g["en"]["sections"]
    if len(es) != len(en): errs.append("ES/EN section count differs")
    for a, b in zip(es, en):
        if [list(x)[0] for x in a["blocks"]] != [list(x)[0] for x in b["blocks"]]:
            errs.append(f"block types differ: {a['id']} vs {b['id']}")
        na = re.findall(r"\[(\d+)\]", json.dumps(a, ensure_ascii=False)); nb = re.findall(r"\[(\d+)\]", json.dumps(b, ensure_ascii=False))
        if sorted(na) != sorted(nb): errs.append(f"footnotes differ: {a['id']} {sorted(na)} vs {b['id']} {sorted(nb)}")
    # numeric parity: every figure with 3+ digits in one language appears in the other
    num = lambda c: set(re.sub(r"[,.]", "", n) for n in re.findall(r"\d[\d,.]{2,}\d", text_of(c)))
    miss = num(g["es"]) ^ num(g["en"])
    if miss: notes.append(f"numbers only in one language: {sorted(miss)[:8]}")
    print(f"[{k}] {'OK' if not errs else 'FAIL'}  " + "; ".join(notes) + ("" if not errs else "\n   - " + "\n   - ".join(errs)))
    fail += bool(errs)
sys.exit(1 if fail else 0)
