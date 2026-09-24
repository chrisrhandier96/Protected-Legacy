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
import os, sys
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
rep(t0, "<title>Patrimonio Protegido | Christian R. González · Risk education for high-net-worth Hispanic families in Florida</title>")
d0 = html[html.find('<meta name="description"'):]
d0 = d0[:d0.find(">") + 1]
rep(d0, '<meta name="description" content="Bilingual education on protecting what your family built in Florida: homes, collections, boats, aviation, liability and legacy. Verifiable data, in your language. Licensed Florida agent.">')
o0 = html[html.find('<meta property="og:description"'):]
o0 = o0[:o0.find(">") + 1]
rep(o0, '<meta property="og:description" content="Hispanic wealth in the U.S. tripled in a decade. Protection did not keep up. Risk education in your language, backed by verifiable data.">')
rep('<meta property="og:locale" content="es_US">', '<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="es_US">')
rep('<link rel="canonical" href="' + BASE + '/">', '<link rel="canonical" href="' + BASE + '/en/">')
rep('<button id="btn-es" class="active" onclick="setLang(\'es\')">ES</button>', '<button id="btn-es" onclick="setLang(\'es\')">ES</button>')
rep('<button id="btn-en" onclick="setLang(\'en\')">EN</button>', '<button id="btn-en" class="active" onclick="setLang(\'en\')">EN</button>')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
header = "<!-- GENERATED from /index.html by tools/build_en.py. Do not edit by hand. -->\n"
open(OUT, "w", encoding="utf-8").write(html.replace("<!DOCTYPE html>\n", "<!DOCTYPE html>\n" + header, 1))
print(f"en.html written: {len(kept)} elements translated, {len(jobs) - len(kept)} nested skipped")
