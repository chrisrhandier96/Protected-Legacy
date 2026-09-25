# -*- coding: utf-8 -*-
"""Validates the new Google Ads file before import (work order 2026-09, Part F).
Usage:  python ads_check.py [--base https://www.protectedlegacyfl.com] [--repo <path to Protected-Legacy>]
Checks: campaign name and no campaign row, everything Paused, 4-8 phrase/exact keywords with Final URLs,
headline <= 30 / description <= 90 / path <= 15 characters, 15 headlines and 4 descriptions, no duplicate
headlines, "insurance"/"seguro" in 1-2 headlines, banned words, carrier names, em dashes, exclamation marks,
discreet K&R copy, every Final URL returns 200, and every headline claim appears on its landing page.
Exit code 1 if anything fails.
"""
import csv, html, json, os, re, sys, urllib.request

args = sys.argv[1:]
BASE = args[args.index("--base") + 1].rstrip("/") if "--base" in args else "https://www.protectedlegacyfl.com"
REPO = args[args.index("--repo") + 1] if "--repo" in args else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")  # site-tests/ sits in the repo
CSV = os.path.join(REPO, "ads", "pp-new-adgroups-2026-09.csv")
CLAIMS = json.load(open(os.path.join(REPO, "ads", "claims-2026-09.json"), encoding="utf-8"))
CAMPAIGN = "PP Search | Protección Patrimonial"
BANNED = [r"\bcheap", r"\bfree\b", r"\bgratis\b", r"\bbarat[oa]s?\b", r"quote now", r"get a quote", r"\bcotice\b", r"cotiza ya",
          r"licensed florida agent", r"agente con licencia en (la )?florida", r"call now", r"llame ya", r"\bbest\b", r"\bmejor(es)?\b", r"guarantee", r"garantiz"]
CARRIERS = [r"\bMarsh\b", r"Chubb", r"\bPURE\b", r"\bAIG\b", r"Citizens", r"Travelers", r"Nationwide", r"State Farm", r"Allstate", r"Lloyd'?s",
            r"Hiscox", r"Progressive", r"GEICO", r"Liberty Mutual", r"Zurich", r"Markel", r"Airbnb", r"VRBO"]
FEAR = [r"kidnapper", r"protect your (kids|children)", r"danger", r"\bterror", r"secuestrador", r"proteja a sus hijos", r"peligro"]

fails, notes = [], []
def fail(m): fails.append(m)
H = lambda n: f"Headline {n}"; D = lambda n: f"Description {n}"

rows = list(csv.DictReader(open(CSV, encoding="utf-8-sig", newline="")))
groups = {}
for r in rows:
    if r["Campaign"] != CAMPAIGN: fail(f"wrong campaign name: {r['Campaign']!r}")
    if r["Campaign type"] or r["Campaign status"] or r["Budget"]: fail(f"campaign-level row found (would overwrite settings): {r['Ad group']!r}")
    g = groups.setdefault(r["Ad group"], {"group": 0, "kw": [], "ads": []})
    if r["Keyword"]: g["kw"].append(r)
    elif r["Ad type"]: g["ads"].append(r)
    else: g["group"] += 1; (r["Ad group status"] == "Paused") or fail(f"{r['Ad group']}: ad group not Paused")

for name, g in groups.items():
    if g["group"] != 1: fail(f"{name}: {g['group']} ad group rows")
    if not 4 <= len(g["kw"]) <= 8: fail(f"{name}: {len(g['kw'])} keywords (need 4-8)")
    for k in g["kw"]:
        if k["Match type"] not in ("phrase", "exact"): fail(f"{name}: keyword {k['Keyword']!r} match type {k['Match type']!r}")
        if k["Keyword status"] != "Paused": fail(f"{name}: keyword {k['Keyword']!r} not Paused")
        if not k["Final URL"]: fail(f"{name}: keyword {k['Keyword']!r} has no Final URL")
    if len(g["ads"]) != 1: fail(f"{name}: {len(g['ads'])} ads (need 1 RSA)")
    for a in g["ads"]:
        if a["Ad status"] != "Paused": fail(f"{name}: ad not Paused")
        heads = [a[H(i)] for i in range(1, 16) if a[H(i)]]; descs = [a[D(i)] for i in range(1, 5) if a[D(i)]]
        if len(heads) != 15: fail(f"{name}: {len(heads)} headlines")
        if len(descs) != 4: fail(f"{name}: {len(descs)} descriptions")
        for h in heads:
            if len(h) > 30: fail(f"{name}: headline over 30 ({len(h)}): {h}")
            if "!" in h: fail(f"{name}: exclamation mark in headline: {h}")
        for d in descs:
            if len(d) > 90: fail(f"{name}: description over 90 ({len(d)}): {d}")
        for p in ("Path 1", "Path 2"):
            if len(a[p]) > 15: fail(f"{name}: {p} over 15: {a[p]}")
        low = [h.lower() for h in heads]
        if len(set(low)) != len(low): fail(f"{name}: duplicate headlines")
        n_ins = sum(1 for h in low if re.search(r"insurance|seguro", h))
        if not 1 <= n_ins <= 2: fail(f"{name}: 'insurance'/'seguro' in {n_ins} headlines (need 1-2)")
        text = " | ".join(heads + descs + [a["Path 1"], a["Path 2"]])
        for pat in BANNED:
            if re.search(pat, text, re.I): fail(f"{name}: banned /{pat}/")
        for pat in CARRIERS:
            if re.search(pat, text): fail(f"{name}: carrier name /{pat}/")
        if "—" in text: fail(f"{name}: em dash")
        if re.search(r"kidnap|secuestro", name, re.I):
            for pat in FEAR:
                if re.search(pat, text, re.I): fail(f"{name}: fear-bait /{pat}/")
        a["_heads"] = heads

# Final URLs return 200, and each headline's claim appears on its page
def fetch(u):
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (ads_check)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode("utf-8", "replace")
norm = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)).replace("’", "'").lower())
pages = {}
urls = sorted({r["Final URL"] for r in rows if r["Final URL"]})
for u in urls:
    url = u.replace("https://www.protectedlegacyfl.com", BASE)
    try:
        st, body = fetch(url); pages[u] = norm(body)
        if st != 200: fail(f"{url} returned {st}")
    except Exception as e:
        fail(f"{url} failed: {e}")
checked = exempt = 0
for name, c in CLAIMS.items():
    page = pages.get(c["url"])
    if page is None: continue
    for head, phrases in c["headlines"].items():
        if phrases is None: exempt += 1; continue
        checked += 1
        miss = [p for p in phrases if p.lower().replace("’", "'") not in page]
        if miss: fail(f"{name}: headline {head!r} not backed by the page (missing: {miss})")
    ad = groups.get(name, {}).get("ads", [{}])[0]
    if set(ad.get("_heads", [])) != set(c["headlines"]): fail(f"{name}: claims file out of sync with the CSV")

kw = sum(len(g["kw"]) for g in groups.values())
print(f"ad groups {len(groups)}, keywords {kw}, URLs {len(urls)} checked against {BASE}, headline claims checked {checked} (site-level lines exempt: {exempt})")
for m in fails: print("FAIL", m)
print("RESULT:", "PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
