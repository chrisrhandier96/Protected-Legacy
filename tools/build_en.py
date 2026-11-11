# -*- coding: utf-8 -*-
"""Genera /en.html (servida en /en/) a partir de /index.html (fuente unica).
Generates /en.html (served at /en/) from /index.html (single source of truth).

Uso / usage (desde la raiz del repo / from the repo root):
    python3 tools/build_en.py

Que hace / what it does:
- <html lang="en">, English title / description / og tags, canonical /en/
- every element with data-en gets its English content written into the HTML itself,
  so the page is English before any script runs (what Google reads)
- EN button marked active
Run it again every time index.html changes, and upload both files.
"""
import os, re, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")
OUT = os.path.join(ROOT, "en.html")  # served at /en/ by a rewrite in netlify.toml
BASE = "https://www.protectedlegacyfl.com"
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}

src = open(SRC, encoding="utf-8").read()
# line starts, for converting HTMLParser (line, col) positions into offsets
line_starts = [0]
for i, ch in enumerate(src):
    if ch == "\n":
        line_starts.append(i + 1)

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.jobs = [], []
    def _off(self):
        l, c = self.getpos(); return line_starts[l - 1] + c
    def handle_starttag(self, tag, attrs):
        start = self._off(); end = start + len(self.get_starttag_text())
        if tag in VOID: return
        self.stack.append((tag, start, end, dict(attrs)))
    def handle_endtag(self, tag):
        pos = self._off()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                t, s, e, a = self.stack[i]
                del self.stack[i:]
                if "data-en" in a and "data-es" in a:
                    self.jobs.append((e, pos, a["data-en"]))
                return

p = P(); p.feed(src); p.close()
jobs = sorted(p.jobs)
# drop nested jobs (outer element already rewrites its whole content)
kept, last_end = [], -1
for e, pos, en in jobs:
    if e < last_end: continue
    kept.append((e, pos, en)); last_end = pos
out, cur = [], 0
for e, pos, en in kept:
    out.append(src[cur:e]); out.append(en); cur = pos
out.append(src[cur:])
html = "".join(out)

def rep(old, new, count=1):
    global html
    n = html.count(old)
    if n != count:
        sys.exit(f"build_en: expected {count} of {old[:70]!r}, found {n}")
    html = html.replace(old, new)

rep('<html lang="es">', '<html lang="en">')
t0 = html[html.find("<title>"):html.find("</title>") + 8]
EN_TITLE = "Patrimonio Protegido | Christian R. González · FL Insurance"   # 60 characters or less (Nov 9)
if "en:'" + EN_TITLE + "'" not in html:
    sys.exit("build_en: the English title in setLang's PP_TITLE (index.html) does not match EN_TITLE")
rep(t0, "<title>" + EN_TITLE + "</title>")
d0 = html[html.find('<meta name="description"'):]
d0 = d0[:d0.find(">") + 1]
rep(d0, '<meta name="description" content="Guides in English and Spanish to protect what your family built in Florida: home, flood, auto, boats, collections and legacy.">')
o0 = html[html.find('<meta property="og:description"'):]
o0 = o0[:o0.find(">") + 1]
rep(o0, '<meta property="og:description" content="Hispanic wealth in the U.S. keeps growing. Protection did not keep up. Risk education in your language, backed by verifiable data.">')
rep('<meta property="og:locale" content="es_US">', '<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="es_US">')
rep('<link rel="canonical" href="' + BASE + '/">', '<link rel="canonical" href="' + BASE + '/en/">')
# the share tags, the honeypot label and the plates' alt text (were restored by hand after every build until Nov 9)
rep('<meta property="og:url" content="' + BASE + '/">', '<meta property="og:url" content="' + BASE + '/en/">')
rep('<meta property="og:image" content="' + BASE + '/og.png">', '<meta property="og:image" content="' + BASE + '/og-en.png">')
rep('<meta name="twitter:image" content="' + BASE + '/og.png">', '<meta name="twitter:image" content="' + BASE + '/og-en.png">')
rep('<label>No llenar <input name="bot-field"', '<label>Do not fill <input name="bot-field"')
html, _n_alt = re.subn(r'alt="[^"]*"( data-alt-en="([^"]*)")', lambda m: 'alt="' + m.group(2) + '"' + m.group(1), html)
if _n_alt != 5:
    sys.exit(f'build_en: expected 5 plates with data-alt-en, found {_n_alt}')
# the four stat cards carry their real figure in the HTML (Nov 11): the visible number has to equal data-count
_nums = re.findall(r'<div class="num" data-count="([^"]+)"(?: data-prefix="([^"]*)")?(?: data-es=\'[^\']*\' data-en=\'[^\']*\')?><span class="nv">([^<]+)</span>', src)
if len(_nums) != 4 or any(pre + cnt != shown for cnt, pre, shown in _nums):
    sys.exit(f"build_en: the stat cards in #datos must show their own data-count in <span class=nv>: {_nums}")
# the JSON-LD block in the head (static since Nov 11): English description on the English page
rep('"description":"Protección patrimonial, en español e inglés, para familias hispanas de alto patrimonio en la Florida."', '"description":"Wealth protection, in Spanish and English, for high net worth Hispanic families in Florida."')
# the plain list of the 14 guides inside #domGrid (for readers without JavaScript) has to match GUIDE_URL and DOMS
import json as _json
_gu = _json.loads(re.search(r"const GUIDE_URL=(\{.*?\});", src).group(1))
_doms = src[src.index("const DOMS=["):src.index("const GUIDE_URL=")]
_st = re.findall(r'<a class="dom-static" href="([^"]+)" data-href-es="([^"]+)" data-href-en="([^"]+)"><span class="dom-tag" data-es="[^"]+" data-en="[^"]+">[^<]+</span><span data-es="([^"]+)" data-en="([^"]+)">', src)
_pairs = {(v["es"], v["en"]) for v in _gu.values()}
if len(_st) != 14 or len(_gu) != 14:
    sys.exit(f"build_en: the plain list in #domGrid has {len(_st)} links and GUIDE_URL has {len(_gu)}; both must be 14")
for _h, _es, _en, _tes, _ten in _st:
    if _h != _es or (_es, _en) not in _pairs:
        sys.exit(f"build_en: the plain list in #domGrid has a link that is not in GUIDE_URL: {_es} {_en}")
    if not re.search("t:\\{es:['\"]" + re.escape(_tes) + "['\"],en:['\"]" + re.escape(_ten) + "['\"]\\}", _doms):
        sys.exit(f"build_en: the plain list in #domGrid names a domain differently from DOMS: {_tes} / {_ten}")
rep('<button id="btn-es" class="active" onclick="setLang(\'es\')">ES</button>', '<button id="btn-es" onclick="setLang(\'es\')">ES</button>')
rep('<button id="btn-en" onclick="setLang(\'en\')">EN</button>', '<button id="btn-en" class="active" onclick="setLang(\'en\')">EN</button>')

# links that point to a language-specific page (data-href-en) get their English href
def _swap_href(m):
    tag = m.group(0)
    en = re.search(r'data-href-en="([^"]+)"', tag).group(1)
    return re.sub(r'\shref="[^"]*"', ' href="' + en + '"', tag, count=1)
html = re.sub(r'<a\b[^>]*data-href-en="[^"]+"[^>]*>', _swap_href, html)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
header = "<!-- GENERATED from /index.html by tools/build_en.py. Do not edit by hand. -->\n"
open(OUT, "w", encoding="utf-8", newline="\n").write(html.replace("<!DOCTYPE html>\n", "<!DOCTYPE html>\n" + header, 1))
print(f"en.html written: {len(kept)} elements translated, {len(jobs) - len(kept)} nested skipped")
