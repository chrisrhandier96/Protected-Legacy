# -*- coding: utf-8 -*-
"""Genera la biblioteca educativa (guias, glosario, preguntas, herramientas) en espanol e ingles.
Builds the education library (guides, glossary, FAQ, tools) in Spanish and English.

Uso / usage (desde la raiz del repo / from the repo root):
    python3 tools/build_library.py
Contenido / content: content/guides/*.json y content/extras/*.json
Salida / output: guias/, glosario/, preguntas-frecuentes/, herramientas/, en/guides/, en/glossary/, en/faq/, en/tools/
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.protectedlegacyfl.com"
GTM = "GTM-P88VGFHR"
ORDER = ["res", "flo", "aut", "mar", "avi", "col", "lia", "emp"]
ICONS = {
 "res": '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 "flo": '<path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M12 3v7"/><path d="M9 7l3 3 3-3"/>',
 "aut": '<path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5"/><path d="M3 13h18v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1z"/>',
 "mar": '<path d="M4 18l-1-5 9-2 9 2-1 5"/><path d="M12 11V4"/><path d="M12 4l6 6"/><path d="M2 21c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
 "avi": '<path d="M2 16l20-8-6 8 2 5-4-2-3 3-1-5z"/>',
 "col": '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18"/><path d="M12 21L8 9l2-6"/><path d="M12 21l4-12-2-6"/>',
 "lia": '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
 "emp": '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
}
ICON_EXTRA = {
 "glossary": '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M18 20H7a3 3 0 0 1-3-3"/><path d="M8 8h6 M8 12h6"/>',
 "faq": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5"/><path d="M12 17h.01"/>',
 "hurricane": '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M12 3c-5 0-8 3-8 6 3-2 6-2 8 0"/><path d="M12 21c5 0 8-3 8-6-3 2-6 2-8 0"/>',
 "inventory": '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 11h7 M9 15h7 M9 19h4"/>',
}
TOPIC = {"res": "Residencias y huracanes", "flo": "Inundación y marejada", "aut": "Autos de uso y colección",
         "mar": "Embarcaciones y PWC", "avi": "Aviación privada", "col": "Colecciones, arte y joyas",
         "lia": "Responsabilidad y umbrella", "emp": "Personal del hogar y legado"}

T = {  # interface strings
 "es": {"home": "Inicio", "guides": "Guías", "glossary": "Glosario", "faq": "Preguntas", "tools": "Herramientas",
        "quiz": "Autoevaluación", "contact": "Contacto", "library": "Biblioteca", "by": "Por Christian R. González, agente de seguros con licencia en la Florida",
        "updated": "Actualizada", "min": "min de lectura", "summary": "En resumen", "toc": "En esta guía",
        "questions": "Preguntas para revisar con su agente, abogado o contador", "faqh": "Preguntas frecuentes",
        "sources": "Fuentes", "related": "Siga leyendo", "read": "Leer la guía", "cta_t": "¿Dónde está su familia en este tema?",
        "cta_p": "El Mapa de Protección Familiar toma tres minutos, es anónimo y le muestra qué zonas de su plan quedaron en blanco.",
        "cta_quiz": "Hacer la autoevaluación", "cta_write": "¿Le quedaron preguntas? Escríbame",
        "print": "Imprimir", "search": "Buscar un término", "all": "Todos", "seeguide": "Ver la guía", "clear": "Borrar marcas",
        "months": ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
        "switch": "EN", "lic": "Christian R. González es agente de seguros con licencia en el estado de la Florida (Lic. W606240). Este sitio es educativo: no vende, cotiza ni negocia pólizas a través de esta página.",
        "disc": "<strong>Aviso importante:</strong> Este sitio tiene fines exclusivamente educativos e informativos. No constituye asesoría de seguros, legal, fiscal ni financiera, ni una oferta o solicitud para la venta de productos de seguros. {LIC} Los conceptos descritos son generales; cada póliza tiene sus propios términos, condiciones y exclusiones que prevalecen sobre cualquier descripción general. Para decisiones sobre coberturas, consulte a un agente con licencia; para temas legales o fiscales, consulte a un abogado o contador calificado. Las opiniones expresadas en este sitio son personales y no representan las de ningún empleador.",
        "privacy": "Privacidad", "made": "Hecho con orgullo para la comunidad hispana de la Florida"},
 "en": {"home": "Home", "guides": "Guides", "glossary": "Glossary", "faq": "FAQ", "tools": "Tools",
        "quiz": "Self-Assessment", "contact": "Contact", "library": "Library", "by": "By Christian R. González, licensed Florida insurance agent",
        "updated": "Updated", "min": "min read", "summary": "At a glance", "toc": "In this guide",
        "questions": "Questions to review with your agent, attorney or CPA", "faqh": "Frequently asked questions",
        "sources": "Sources", "related": "Keep reading", "read": "Read the guide", "cta_t": "Where does your family stand on this?",
        "cta_p": "The Family Protection Map takes three minutes, is anonymous, and shows which parts of your plan are still blank.",
        "cta_quiz": "Take the self-assessment", "cta_write": "Still have questions? Write to me",
        "print": "Print", "search": "Search a term", "all": "All", "seeguide": "See the guide", "clear": "Clear checks",
        "months": ["January","February","March","April","May","June","July","August","September","October","November","December"],
        "switch": "ES", "lic": "Christian R. González is a licensed insurance agent in the State of Florida (Lic. W606240). This site is educational: it does not sell, quote, or negotiate policies through this page.",
        "disc": "<strong>Important notice:</strong> This site is for educational and informational purposes only. It does not constitute insurance, legal, tax, or financial advice, nor an offer or solicitation for the sale of insurance products. {LIC} Concepts described here are general; every policy has its own terms, conditions, and exclusions that prevail over any general description. For coverage decisions, consult a licensed agent; for legal or tax matters, consult a qualified attorney or CPA. The opinions expressed on this site are personal and do not represent those of any employer.",
        "privacy": "Privacy", "made": "Made with pride for Florida's Hispanic community"},
}
CATS = {"es": {"hogar": "Hogar", "inundacion": "Inundación", "autos": "Autos", "nautica": "Náutica", "aviacion": "Aviación",
               "colecciones": "Colecciones", "responsabilidad": "Responsabilidad", "personal": "Personal del hogar", "general": "General"},
        "en": {"hogar": "Home", "inundacion": "Flood", "autos": "Auto", "nautica": "Boats", "aviacion": "Aviation",
               "colecciones": "Collections", "responsabilidad": "Liability", "personal": "Household staff", "general": "General"}}

# ---------- paths ----------
def p_home(l): return "/" if l == "es" else "/en/"
def p_hub(l): return "/guias/" if l == "es" else "/en/guides/"
def p_guide(g, l): return f"/guias/{g['slug_es']}/" if l == "es" else f"/en/guides/{g['slug_en']}/"
def p_gloss(l): return "/glosario/" if l == "es" else "/en/glossary/"
def p_faq(l): return "/preguntas-frecuentes/" if l == "es" else "/en/faq/"
def p_hur(l): return "/herramientas/temporada-de-huracanes/" if l == "es" else "/en/tools/hurricane-season/"
def p_inv(l): return "/herramientas/inventario-familiar/" if l == "es" else "/en/tools/family-inventory/"

def load(p): return json.load(open(os.path.join(ROOT, p), encoding="utf-8"))
def esc(s): return html.escape(s, quote=True)
def rich(s):
    """allow only <b>/<strong>/<em>; turn [n] into footnote links"""
    s = html.escape(s, quote=False)
    s = re.sub(r"&lt;(/?)(b|strong|em)&gt;", r"<\1\2>", s)
    def _fn(m):
        nums = re.findall(r"\d+", m.group(0))
        return '<sup class="fn">' + ",".join(f'<a href="#fuente-{n}" aria-label="fuente {n}">{n}</a>' for n in nums) + "</sup>"
    s = re.sub(r"\s*(?:\[\d+\])+", _fn, s)
    return s
def plain(s): return re.sub(r"<[^>]+>|\[\d+\]", "", s)
def words(txt): return len(re.findall(r"\w+", txt))
def fmt_date(d, l):
    y, m, dd = d.split("-"); m = int(m); dd = int(dd)
    return f"{dd} de {T['es']['months'][m-1]} de {y}" if l == "es" else f"{T['en']['months'][m-1]} {dd}, {y}"
def ico(paths, cls="ico"): return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{paths}</svg>'

LOGO = ('<svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="none" stroke="#C29B40" stroke-width="2"/>'
        '<path fill="#C29B40" d="M32 12l4 16-4 4-4-4z M32 52l4-16-4-4-4 4z M12 32l16-4 4 4-4 4z M52 32l-16-4-4 4 4 4z"/>'
        '<path d="M18 18l9 9 M46 18l-9 9 M18 46l9-9 M46 46l-9-9" stroke="#C29B40" stroke-width="2" fill="none"/><circle cx="32" cy="32" r="3.5" fill="#D9BC72"/></svg>')
FAVICON = open(os.path.join(ROOT, "tools", "favicon.txt"), encoding="utf-8").read().strip() if os.path.exists(os.path.join(ROOT, "tools", "favicon.txt")) else ""

CSS = r"""
:root{--verde:#14352A;--verde-oscuro:#0D241C;--verde-suave:#1E4A3A;--arena:#F5EFE3;--arena-oscura:#E7DDC7;--oro:#C29B40;--oro-claro:#D9BC72;--oro-palido:#EBD9A8;--tinta:#22271F;--humo:#6E7568;--blanco:#FDFBF6;--display:'Marcellus',serif;--accent:'Cormorant Garamond',serif;--body:'Figtree',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:var(--body);color:var(--tinta);background:var(--arena);line-height:1.7;font-size:17px}
h1,h2,h3{font-family:var(--display);font-weight:400;line-height:1.18}a{color:inherit}
:focus-visible{outline:3px solid var(--oro);outline-offset:3px}
.wrap{max-width:1160px;margin:0 auto;padding:0 28px}
#bar{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,var(--oro),var(--oro-claro));z-index:80}
nav{position:sticky;top:0;z-index:60;background:rgba(13,36,28,.97);backdrop-filter:blur(10px);border-bottom:1px solid rgba(194,155,64,.25)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 28px;max-width:1260px;margin:0 auto}
.logo-lockup{display:flex;align-items:center;gap:12px;text-decoration:none}.logo-mark{width:38px;height:38px;flex-shrink:0}
.logo-txt{display:flex;flex-direction:column;line-height:1.1}.logo{font-family:var(--display);color:var(--blanco);font-size:19px;letter-spacing:.04em}.logo em{font-style:normal;color:var(--oro-claro)}
.logo-sub{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:rgba(217,188,114,.85);font-weight:600;margin-top:3px}
.nav-links{display:flex;gap:22px;align-items:center}
.nav-links a{color:var(--arena);text-decoration:none;font-size:14px;font-weight:500}.nav-links a:hover,.nav-links a[aria-current]{color:var(--oro-claro)}
.lang-link{border:1px solid var(--oro);border-radius:99px;padding:6px 14px;font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--oro-claro)!important}
.hamb{display:none;background:none;border:1px solid rgba(194,155,64,.5);border-radius:3px;padding:8px 10px;color:var(--oro-claro)}
.hamb svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
.mobile-menu{display:none;background:var(--verde-oscuro);border-top:1px solid rgba(194,155,64,.25);padding:8px 28px 18px;flex-direction:column}
.mobile-menu a{color:var(--arena);text-decoration:none;font-size:16px;padding:13px 4px;border-bottom:1px solid rgba(157,178,163,.12)}.mobile-menu.show{display:flex}
@media(max-width:980px){.nav-links a:not(.lang-link){display:none}.hamb{display:block}}
.head{background:linear-gradient(180deg,var(--verde),var(--verde-oscuro));color:var(--blanco);padding:56px 0 60px;position:relative;overflow:hidden}
.head::after{content:"";position:absolute;right:-120px;top:-120px;width:420px;height:420px;border:1px solid rgba(194,155,64,.22);border-radius:50%}
.crumbs{font-size:13px;color:#B9C7BC;margin-bottom:22px}.crumbs a{color:#B9C7BC;text-decoration:none}.crumbs a:hover{color:var(--oro-claro)}.crumbs span{margin:0 8px;color:var(--oro)}
.kicker{font-size:12px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--oro-claro);display:inline-flex;align-items:center;gap:12px}
.kicker::before{content:"";width:30px;height:1px;background:var(--oro)}
.head h1{font-size:clamp(32px,5vw,52px);max-width:20ch;margin:16px 0 16px}
.head .dek{font-size:19px;font-weight:300;color:#DCE5DD;max-width:60ch}
.meta{margin-top:24px;font-size:13.5px;color:#B9C7BC;display:flex;flex-wrap:wrap;gap:6px 18px}.meta b{color:var(--oro-claro);font-weight:600}
.layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:56px;padding:56px 0 40px}
@media(max-width:980px){.layout{grid-template-columns:1fr;gap:0}.toc{display:none}}
.toc{position:sticky;top:88px;align-self:start;font-size:14px}
.toc h2{font-family:var(--body);font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--oro);margin-bottom:12px}
.toc ol{list-style:none;border-left:1px solid var(--arena-oscura)}.toc a{display:block;padding:7px 0 7px 14px;margin-left:-1px;border-left:2px solid transparent;text-decoration:none;color:var(--humo);line-height:1.35}
.toc a:hover,.toc a.on{color:var(--verde);border-left-color:var(--oro)}
article{max-width:720px}
.sumbox{background:var(--blanco);border:1px solid var(--arena-oscura);border-top:3px solid var(--oro);border-radius:3px;padding:24px 26px;margin-bottom:40px}
.sumbox h2,.qbox h2{font-family:var(--body);font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--oro);margin-bottom:12px}
.sumbox ul,.qbox ol{padding-left:20px}.sumbox li,.qbox li{margin:6px 0}
article section{margin-bottom:44px;scroll-margin-top:86px}
article h2{font-size:clamp(25px,3.2vw,32px);color:var(--verde);margin-bottom:16px}
article p{margin-bottom:16px}article ul{padding-left:22px;margin:0 0 18px}article li{margin:6px 0}
.callout{border-left:3px solid var(--oro);background:rgba(194,155,64,.09);padding:16px 20px;margin:20px 0;border-radius:0 3px 3px 0;font-weight:500}
.tbl{overflow-x:auto;margin:20px 0}table{border-collapse:collapse;width:100%;font-size:15px;background:var(--blanco)}
th,td{border:1px solid var(--arena-oscura);padding:10px 12px;text-align:left;vertical-align:top}th{background:var(--verde);color:var(--blanco);font-weight:600}
.fn{font-size:.62em;vertical-align:super;line-height:0}.fn a{color:var(--oro);text-decoration:none;font-weight:700;padding:0 2px}
.qbox{background:var(--verde);color:var(--arena);border-radius:3px;padding:28px 30px;margin:48px 0}.qbox h2{color:var(--oro-claro)}
.faq details{border-bottom:1px solid var(--arena-oscura);padding:16px 0}.faq summary{cursor:pointer;font-weight:600;color:var(--verde);list-style:none;display:flex;justify-content:space-between;gap:16px}
.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";color:var(--oro);font-size:22px;line-height:1}.faq details[open] summary::after{content:"\2212"}
.faq details p{margin:12px 0 0;color:#3B4237}
.cta{background:var(--blanco);border:1px solid var(--arena-oscura);border-radius:3px;padding:30px;margin:48px 0;display:grid;gap:14px}
.cta h2{font-size:26px;color:var(--verde)}.cta p{color:#3B4237;margin:0}.cta .row{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px}
.btn{display:inline-block;padding:14px 26px;border-radius:2px;font-weight:600;font-size:15px;text-decoration:none;border:none;cursor:pointer;font-family:var(--body)}
.btn-oro{background:var(--oro);color:var(--verde-oscuro)}.btn-oro:hover{background:var(--oro-claro)}
.btn-line{border:1px solid var(--verde);color:var(--verde);background:transparent}.btn-line:hover{background:var(--verde);color:var(--blanco)}
.srcs{font-size:14px;color:var(--humo)}.srcs h2{font-family:var(--body);font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--oro);margin-bottom:10px}
.srcs ol{padding-left:22px}.srcs li{margin:5px 0;scroll-margin-top:90px}.srcs a{color:var(--verde);word-break:break-word}
.srcs li:target{background:rgba(194,155,64,.15)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
.card{display:flex;flex-direction:column;gap:10px;background:var(--blanco);border:1px solid var(--arena-oscura);border-radius:3px;padding:24px;text-decoration:none;transition:transform .25s,box-shadow .25s,border-color .25s}
.card:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(20,53,42,.12);border-color:var(--oro)}
.card .ico{width:40px;height:40px;padding:8px;border:1px solid var(--oro);border-radius:50%;stroke:var(--oro);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.card h3{font-size:21px;color:var(--verde)}.card p{font-size:15px;color:#3B4237}.card .go{margin-top:auto;font-size:13px;font-weight:600;color:var(--oro);letter-spacing:.04em}
.band{padding:64px 0}.band h2.sec{font-size:clamp(28px,4vw,40px);color:var(--verde);margin-bottom:10px}.band .lede{color:#3B4237;max-width:62ch;margin-bottom:30px}
.band.alt{background:var(--blanco);border-top:1px solid var(--arena-oscura);border-bottom:1px solid var(--arena-oscura)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 26px}.chip{border:1px solid var(--arena-oscura);background:var(--blanco);border-radius:99px;padding:7px 14px;font-size:13px;font-weight:600;color:var(--verde);cursor:pointer;font-family:var(--body)}
.chip[aria-pressed="true"]{background:var(--verde);color:var(--blanco);border-color:var(--verde)}
.search{width:100%;max-width:520px;padding:14px 16px;border:1px solid var(--arena-oscura);border-radius:3px;font-size:16px;font-family:var(--body);background:var(--blanco)}
.terms{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.term{background:var(--blanco);border:1px solid var(--arena-oscura);border-radius:3px;padding:18px 20px;scroll-margin-top:90px}
.term h3{font-size:20px;color:var(--verde)}.term .alt{font-size:13px;color:var(--oro);font-weight:600;letter-spacing:.02em;margin:2px 0 8px}
.term p{font-size:15px;color:#3B4237;margin:0}.term a{font-size:13px;font-weight:600;color:var(--oro);text-decoration:none;display:inline-block;margin-top:8px}
.term:target{border-color:var(--oro);box-shadow:0 0 0 3px rgba(194,155,64,.2)}.empty{color:var(--humo);display:none}
.letters{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px}.letters a{font-family:var(--display);color:var(--verde);text-decoration:none;padding:2px 8px;border:1px solid var(--arena-oscura);border-radius:3px;font-size:15px}
.check h2{font-size:24px;color:var(--verde);margin:34px 0 12px}.check ul{list-style:none;padding:0}
.check li{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--arena-oscura)}
.check input{width:20px;height:20px;margin-top:3px;accent-color:var(--verde);flex:none}
.check label{cursor:pointer}.check li.done label{color:var(--humo);text-decoration:line-through}
.progress{height:6px;background:var(--arena-oscura);border-radius:99px;overflow:hidden;margin:8px 0 4px}.progress i{display:block;height:100%;width:0;background:var(--oro);transition:width .3s}
.inv h2{font-size:22px;color:var(--verde);margin:30px 0 6px}.inv .tip{font-size:14px;color:var(--humo);margin-bottom:10px}
.inv td{height:38px}.privacy{border:1px solid var(--oro);background:rgba(194,155,64,.08);padding:16px 20px;border-radius:3px;margin:20px 0;font-weight:500}
.toolbar{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}
footer{background:var(--verde-oscuro);color:#9DB2A3;padding:56px 0 40px;font-size:13.5px;margin-top:40px}
.disclaimer{border:1px solid rgba(194,155,64,.3);border-radius:3px;padding:20px 24px;margin:26px 0;line-height:1.7;color:#B9C7BC}
.flinks{display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:18px}.flinks a{color:#B9C7BC;text-decoration:none}.flinks a:hover{color:var(--oro-claro)}
footer .fin{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:20px;margin-top:22px;border-top:1px solid rgba(157,178,163,.2)}
@media print{nav,footer,.toc,.cta,.toolbar,#bar,.head::after,.no-print{display:none!important}body{background:#fff;font-size:12pt}.head{background:none;color:#000;padding:0 0 10px}.head .dek,.meta,.crumbs{color:#333}
 .kicker{color:#555}.check li{break-inside:avoid;padding:6px 0}.check input{appearance:none;-webkit-appearance:none;border:1.5px solid #333;width:14px;height:14px}
 .inv table{page-break-inside:auto}.inv tr{page-break-inside:avoid}th{background:#eee;color:#000}.wrap{padding:0}a{text-decoration:none}}
@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}.card{transition:none}}
"""

JS_COMMON = r"""
function toggleMenu(){var m=document.getElementById('mobileMenu'),b=document.querySelector('.hamb');var s=m.classList.toggle('show');b.setAttribute('aria-expanded',s);}
(function(){var bar=document.getElementById('bar');if(bar){addEventListener('scroll',function(){var h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';},{passive:true});}
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-cta]');if(!a)return;try{window.dataLayer=window.dataLayer||[];dataLayer.push({event:'cta_click',cta:a.getAttribute('data-cta'),page_type:document.body.getAttribute('data-type')||''});}catch(x){}});
 try{localStorage.setItem('pp.lang',document.documentElement.lang);}catch(e){}
})();
"""

def page(l, path, alt_path, title, meta, body, ptype, jsonld=None, extra_js="", noindex=False):
    other = "en" if l == "es" else "es"
    es_path, en_path = (path, alt_path) if l == "es" else (alt_path, path)
    t = T[l]
    nav_items = [(p_hub(l), t["guides"], "guides"), (p_gloss(l), t["glossary"], "glossary"), (p_faq(l), t["faq"], "faq"),
                 (p_hub(l) + "#herramientas", t["tools"], "tools"), (p_home(l) + "#mapa", t["quiz"], "quiz"), (p_home(l) + "#contacto", t["contact"], "contact")]
    cur = {"guide": "guides", "hub": "guides", "glossary": "glossary", "faq": "faq", "tool": "tools"}.get(ptype, "")
    AC = ' aria-current="page"'
    links = "".join(f'<a href="{h}"{AC if k == cur else ""}>{esc(n)}</a>' for h, n, k in nav_items)
    mlinks = "".join(f'<a href="{h}">{esc(n)}</a>' for h, n, k in nav_items)
    ld = ""
    if jsonld:
        for obj in jsonld:
            ld += '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False).replace("</", "<\\/") + "</script>\n"
    disc = t["disc"].replace("{LIC}", t["lic"])
    fl = [(p_home(l), t["home"]), (p_hub(l), t["guides"]), (p_gloss(l), t["glossary"]), (p_faq(l), t["faq"]),
          (p_hur(l), "Temporada de huracanes" if l == "es" else "Hurricane season"), (p_inv(l), "Inventario familiar" if l == "es" else "Family inventory"),
          ("/privacidad.html", t["privacy"])]
    flinks = "".join(f'<a href="{h}">{esc(n)}</a>' for h, n in fl)
    return f"""<!DOCTYPE html>
<!-- GENERATED by tools/build_library.py from content/*.json. Do not edit by hand. -->
<html lang="{l}">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','{GTM}');</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(meta)}">
<meta name="author" content="Christian R. González">
<meta name="robots" content="{'noindex,follow' if noindex else 'index,follow,max-image-preview:large'}">
<meta name="theme-color" content="#14352A">
<link rel="canonical" href="{BASE}{path}">
<link rel="alternate" hreflang="es" href="{BASE}{es_path}">
<link rel="alternate" hreflang="en" href="{BASE}{en_path}">
<link rel="alternate" hreflang="x-default" href="{BASE}{es_path}">
<meta property="og:type" content="{'article' if ptype == 'guide' else 'website'}">
<meta property="og:site_name" content="Patrimonio Protegido">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(meta)}">
<meta property="og:url" content="{BASE}{path}">
<meta property="og:locale" content="{'es_US' if l == 'es' else 'en_US'}">
{FAVICON}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Figtree:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
{ld}</head>
<body data-type="{ptype}">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={GTM}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div id="bar" aria-hidden="true"></div>
<nav>
  <div class="nav-inner">
    <a class="logo-lockup" href="{p_home(l)}" aria-label="Patrimonio Protegido">{LOGO}<span class="logo-txt"><span class="logo">Patrimonio <em>Protegido</em></span><span class="logo-sub">Christian R. González</span></span></a>
    <div class="nav-links">{links}<a class="lang-link" href="{alt_path}" hreflang="{other}" lang="{other}">{t['switch']}</a></div>
    <button class="hamb" onclick="toggleMenu()" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 7h16 M4 12h16 M4 17h16"/></svg></button>
  </div>
  <div class="mobile-menu" id="mobileMenu">{mlinks}</div>
</nav>
<main>
{body}
</main>
<footer>
  <div class="wrap">
    <div class="logo-lockup">{LOGO}<span class="logo-txt"><span class="logo">Patrimonio <em>Protegido</em></span><span class="logo-sub">Christian R. González</span></span></div>
    <nav class="flinks" aria-label="{t['library']}" style="position:static;background:none;border:0">{flinks}</nav>
    <div class="disclaimer">{disc}</div>
    <div class="fin"><span>© 2026 Patrimonio Protegido · Christian R. González · Florida · <a href="tel:+17866712171" style="color:inherit">(786) 671-2171</a></span><span>{t['made']}</span></div>
  </div>
</footer>
<script>{JS_COMMON}{extra_js}</script>
</body>
</html>
"""

def write(path, content):
    fp = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, "w", encoding="utf-8").write(content)
    return fp

def crumbs(l, items):
    out = [f'<a href="{p_home(l)}">{T[l]["home"]}</a>']
    for href, name in items:
        out.append(f'<a href="{href}">{esc(name)}</a>' if href else esc(name))
    return '<div class="crumbs">' + "<span>›</span>".join(out) + "</div>"

def bc_ld(l, items):
    li = [{"@type": "ListItem", "position": 1, "name": T[l]["home"], "item": BASE + p_home(l)}]
    for i, (href, name) in enumerate(items, 2):
        li.append({"@type": "ListItem", "position": i, "name": name, "item": BASE + href})
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": li}

AUTHOR = {"@type": "Person", "name": "Christian R. González", "jobTitle": "Licensed insurance agent (Florida)",
          "url": BASE + "/", "sameAs": ["https://www.linkedin.com/in/christiangonzalez22/"]}

# ---------- build ----------
guides = {}
for k in ORDER:
    guides[k] = load(f"content/guides/{k}.json")
gloss = load("content/extras/glossary.json")
faq = load("content/extras/faq.json")
hur = load("content/extras/hurricane.json")
inv = load("content/extras/inventory.json")
written, sitemap = [], []

def minutes(g, l):
    txt = " ".join(plain(json.dumps(g[l], ensure_ascii=False)).split())
    return max(3, round(words(txt) / 220))

def render_blocks(blocks):
    out = []
    for b in blocks:
        if "p" in b: out.append(f"<p>{rich(b['p'])}</p>")
        elif "ul" in b: out.append("<ul>" + "".join(f"<li>{rich(x)}</li>" for x in b["ul"]) + "</ul>")
        elif "callout" in b: out.append(f'<div class="callout">{rich(b["callout"])}</div>')
        elif "table" in b:
            tb = b["table"]
            head = "".join(f"<th scope=\"col\">{rich(h)}</th>" for h in tb["head"])
            rows = "".join("<tr>" + "".join(f"<td>{rich(c)}</td>" for c in r) + "</tr>" for r in tb["rows"])
            out.append(f'<div class="tbl"><table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>')
        else:
            sys.exit(f"unknown block {list(b)}")
    return "\n".join(out)

def guide_card(g, l):
    c = g[l]
    return (f'<a class="card" href="{p_guide(g, l)}">{ico(ICONS[g["key"]])}<h3>{esc(plain(c["h1"]))}</h3>'
            f'<p>{esc(plain(c["dek"]))}</p><span class="go">{T[l]["read"]} · {minutes(g, l)} {T[l]["min"]} →</span></a>')

for k in ORDER:
    g = guides[k]
    for l in ("es", "en"):
        c, t = g[l], T[l]
        path, alt = p_guide(g, l), p_guide(g, "en" if l == "es" else "es")
        secs = c["sections"]
        toc = "".join(f'<li><a href="#{s["id"]}">{esc(plain(s["h2"]))}</a></li>' for s in secs)
        body_secs = "".join(f'<section id="{s["id"]}"><h2>{esc(plain(s["h2"]))}</h2>{render_blocks(s["blocks"])}</section>' for s in secs)
        summ = "".join(f"<li>{rich(x)}</li>" for x in c["summary"])
        qs = "".join(f"<li>{rich(x)}</li>" for x in c["questions"])
        fq = "".join(f"<details><summary>{esc(plain(f['q']))}</summary><p>{rich(f['a'])}</p></details>" for f in c["faq"])
        src = "".join(f'<li id="fuente-{s["n"]}">{esc(s["label"])}. <a href="{esc(s["url"])}" rel="noopener" target="_blank">{esc(s["url"])}</a></li>' for s in sorted(g["sources"], key=lambda s: s["n"]))
        idx = ORDER.index(k)
        rel = [guides[ORDER[(idx + i) % 8]] for i in (1, 2, 3)]
        rel_cards = "".join(guide_card(r, l) for r in rel)
        tema = f'{p_home(l)}?tema={k}#contacto'
        body = f"""
<header class="head"><div class="wrap">
  {crumbs(l, [(p_hub(l), t['guides']), (None, plain(c['kicker']).split('·')[-1].strip())])}
  <span class="kicker">{esc(plain(c['kicker']))}</span>
  <h1>{esc(plain(c['h1']))}</h1>
  <p class="dek">{esc(plain(c['dek']))}</p>
  <div class="meta"><span>{t['by']}</span><span><b>{t['updated']}:</b> {fmt_date(g['updated'], l)}</span><span>{minutes(g, l)} {t['min']}</span></div>
</div></header>
<div class="wrap layout">
  <aside class="toc" aria-label="{t['toc']}"><h2>{t['toc']}</h2><ol>{toc}</ol></aside>
  <article>
    <div class="sumbox"><h2>{t['summary']}</h2><ul>{summ}</ul></div>
    {body_secs}
    <div class="qbox"><h2>{t['questions']}</h2><ol>{qs}</ol></div>
    <section class="faq" id="preguntas"><h2>{t['faqh']}</h2>{fq}</section>
    <div class="cta"><h2>{t['cta_t']}</h2><p>{t['cta_p']}</p>
      <div class="row"><a class="btn btn-oro" href="{p_home(l)}#mapa" data-cta="guide_quiz_{k}">{t['cta_quiz']}</a><a class="btn btn-line" href="{tema}" data-cta="guide_contact_{k}">{t['cta_write']}</a></div></div>
    <div class="srcs"><h2>{t['sources']}</h2><ol>{src}</ol></div>
  </article>
</div>
<section class="band alt"><div class="wrap"><h2 class="sec">{t['related']}</h2><div class="cards">{rel_cards}</div></div></section>
"""
        ld = [
            {"@context": "https://schema.org", "@type": "Article", "headline": plain(c["h1"])[:110], "description": c["meta"],
             "inLanguage": l, "datePublished": g["updated"], "dateModified": g["updated"], "author": AUTHOR,
             "publisher": {"@type": "Organization", "name": "Patrimonio Protegido", "url": BASE + "/"},
             "mainEntityOfPage": BASE + path},
            bc_ld(l, [(p_hub(l), t["guides"]), (path, plain(c["h1"]))]),
            {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": l,
             "mainEntity": [{"@type": "Question", "name": plain(f["q"]), "acceptedAnswer": {"@type": "Answer", "text": plain(f["a"])}} for f in c["faq"]]},
        ]
        js = r"""(function(){var links=[].slice.call(document.querySelectorAll('.toc a'));if(!('IntersectionObserver' in window)||!links.length)return;
var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('on')});var a=map[e.target.id];if(a)a.classList.add('on');}});},{rootMargin:'-20% 0px -70% 0px'});
document.querySelectorAll('article section[id]').forEach(function(s){io.observe(s);});})();"""
        written.append(write(path, page(l, path, alt, c["title"], c["meta"], body, "guide", ld, js)))
        if l == "es": sitemap.append((path, alt))

# ---------- hub ----------
tools_meta = {
 "es": [(p_gloss("es"), "glossary", "Glosario español e inglés", f"{len(gloss['terms'])} términos de seguros explicados en los dos idiomas, del deducible por huracán a la póliza umbrella."),
        (p_faq("es"), "faq", "Preguntas frecuentes", f"{len(faq['items'])} respuestas cortas a las dudas más comunes de las familias en la Florida."),
        (p_hur("es"), "hurricane", "Lista para la temporada de huracanes", f"{sum(len(g['items']) for g in hur['groups'])} pasos para prepararse, imprimible, de junio a noviembre."),
        (p_inv("es"), "inventory", "Inventario familiar: dónde está todo", "Una hoja imprimible para que su familia sepa dónde están las pólizas, escrituras y asesores.")],
 "en": [(p_gloss("en"), "glossary", "Spanish and English glossary", f"{len(gloss['terms'])} insurance terms explained in both languages, from hurricane deductible to umbrella policy."),
        (p_faq("en"), "faq", "Frequently asked questions", f"{len(faq['items'])} short answers to the questions Florida families ask most."),
        (p_hur("en"), "hurricane", "Hurricane season checklist", f"{sum(len(g['items']) for g in hur['groups'])} printable steps to prepare, June through November."),
        (p_inv("en"), "inventory", "Family inventory: where everything is", "A printable sheet so your family knows where the policies, deeds and advisors are.")],
}
for l in ("es", "en"):
    t = T[l]
    path, alt = p_hub(l), p_hub("en" if l == "es" else "es")
    cards = "".join(guide_card(guides[k], l) for k in ORDER)
    tcards = "".join(f'<a class="card" href="{h}">{ico(ICON_EXTRA[ic])}<h3>{esc(n)}</h3><p>{esc(d)}</p><span class="go">→</span></a>' for h, ic, n, d in tools_meta[l])
    if l == "es":
        h1, dek, title = "Biblioteca de protección patrimonial", "Ocho guías a fondo, un glosario bilingüe y herramientas prácticas para familias que construyeron algo en la Florida. Educación, no ventas.", "Guías de seguros en español para familias en la Florida"
        meta = "Guías en español sobre seguros de casa, inundación, autos, embarcaciones, aviación, colecciones, umbrella y personal del hogar en la Florida. Educación sin ventas."
        th, tl = "Herramientas y referencias", "Para consultar, imprimir y compartir con su familia o sus asesores."
    else:
        h1, dek, title = "The protection library", "Eight in-depth guides, a bilingual glossary and practical tools for families who built something in Florida. Education, not sales.", "Insurance guides for Florida families | Patrimonio Protegido"
        meta = "In-depth guides on home, flood, auto, boat, aviation, collections, umbrella and household staff insurance for Florida families. Education, not sales."
        th, tl = "Tools and references", "To look up, print and share with your family or your advisors."
    body = f"""
<header class="head"><div class="wrap">{crumbs(l, [(None, t['guides'])])}<span class="kicker">{t['library']}</span><h1>{h1}</h1><p class="dek">{dek}</p>
<div class="meta"><span>{t['by']}</span></div></div></header>
<section class="band"><div class="wrap"><div class="cards">{cards}</div></div></section>
<section class="band alt" id="herramientas"><div class="wrap"><h2 class="sec">{th}</h2><p class="lede">{tl}</p><div class="cards">{tcards}</div></div></section>
<section class="band"><div class="wrap"><div class="cta" style="margin:0"><h2>{t['cta_t']}</h2><p>{t['cta_p']}</p><div class="row"><a class="btn btn-oro" href="{p_home(l)}#mapa" data-cta="hub_quiz">{t['cta_quiz']}</a></div></div></div></section>
"""
    ld = [bc_ld(l, [(path, t["guides"])]),
          {"@context": "https://schema.org", "@type": "CollectionPage", "name": h1, "inLanguage": l, "url": BASE + path,
           "hasPart": [{"@type": "Article", "headline": plain(guides[k][l]["h1"]), "url": BASE + p_guide(guides[k], l)} for k in ORDER]}]
    written.append(write(path, page(l, path, alt, title, meta, body, "hub", ld)))
    if l == "es": sitemap.append((path, alt))

# ---------- glossary ----------
GUIDE_BY_KEY = {k: guides[k] for k in ORDER}
for l in ("es", "en"):
    t = T[l]; o = "en" if l == "es" else "es"
    path, alt = p_gloss(l), p_gloss(o)
    terms = sorted(gloss["terms"], key=lambda x: re.sub(r"[^a-z0-9 ]", "", html.unescape(x[l]).lower().translate(str.maketrans("áéíóúñü", "aeiounu"))))
    cats = sorted({x["cat"] for x in terms}, key=lambda c: list(CATS[l]).index(c) if c in CATS[l] else 99)
    chips = f'<button class="chip" data-cat="" aria-pressed="true">{t["all"]}</button>' + "".join(f'<button class="chip" data-cat="{c}" aria-pressed="false">{esc(CATS[l].get(c, c))}</button>' for c in cats)
    letters, items, seen = [], [], set()
    for x in terms:
        first = x[l].strip()[0].upper().translate(str.maketrans("ÁÉÍÓÚÑ", "AEIOUN"))
        anchor = ""
        if first not in seen:
            seen.add(first); letters.append(f'<a href="#letra-{first}">{first}</a>'); anchor = f' data-letter="{first}"'
        link = ""
        if x.get("guide") and x["guide"] in GUIDE_BY_KEY:
            link = f'<a href="{p_guide(GUIDE_BY_KEY[x["guide"]], l)}">{t["seeguide"]} →</a>'
        lid = f' id="letra-{first}"' if anchor else ""
        items.append(f'<div class="term"{lid} data-cat="{x["cat"]}" data-q="{esc((x["es"] + " " + x["en"] + " " + x["def_" + l]).lower())}"><h3 id="{x["id"]}">{esc(x[l])}</h3><div class="alt" lang="{o}">{esc(x[o])}</div><p>{esc(x["def_" + l])}</p>{link}</div>')
    if l == "es":
        h1, dek = "Glosario de seguros en español e inglés", "Los términos que aparecen en sus pólizas, explicados en su idioma y con su equivalente en inglés, para que ninguna conversación con su agente se pierda en la traducción."
        title, meta = "Glosario de seguros español e inglés | Patrimonio Protegido", f"{len(terms)} términos de seguros explicados en español con su equivalente en inglés: deducible por huracán, póliza umbrella, NFIP, valor acordado y más."
        emp = "No encontramos ese término. Pruebe con otra palabra o en inglés."
    else:
        h1, dek = "Insurance glossary in English and Spanish", "The terms in your policies, explained in plain English with their Spanish equivalent, so nothing gets lost in translation between your family and your advisors."
        title, meta = "English and Spanish insurance glossary | Patrimonio Protegido", f"{len(terms)} insurance terms explained in English with their Spanish equivalent: hurricane deductible, umbrella policy, NFIP, agreed value and more."
        emp = "No term matches. Try another word or search in Spanish."
    body = f"""
<header class="head"><div class="wrap">{crumbs(l, [(p_hub(l), t['guides']), (None, t['glossary'])])}<span class="kicker">{t['glossary']} · {len(terms)}</span><h1>{h1}</h1><p class="dek">{dek}</p></div></header>
<section class="band"><div class="wrap">
  <label for="q" class="kicker" style="color:var(--oro);margin-bottom:10px">{t['search']}</label><br>
  <input id="q" class="search" type="search" placeholder="{t['search']}…" autocomplete="off">
  <div class="chips" role="group">{chips}</div>
  <div class="letters">{''.join(letters)}</div>
  <div class="terms" id="terms">{''.join(items)}</div>
  <p class="empty" id="empty">{emp}</p>
</div></section>
"""
    js = r"""(function(){var q=document.getElementById('q'),cat='',cards=[].slice.call(document.querySelectorAll('.term')),empty=document.getElementById('empty');
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function run(){var v=norm(q.value.trim()),n=0;cards.forEach(function(c){var ok=(!cat||c.getAttribute('data-cat')===cat)&&(!v||norm(c.getAttribute('data-q')).indexOf(v)>=0);c.hidden=!ok;if(ok)n++;});empty.style.display=n?'none':'block';}
q.addEventListener('input',run);
document.querySelectorAll('.chip').forEach(function(b){b.addEventListener('click',function(){cat=b.getAttribute('data-cat');document.querySelectorAll('.chip').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});run();});});})();"""
    ld = [bc_ld(l, [(p_hub(l), t["guides"]), (path, t["glossary"])]),
          {"@context": "https://schema.org", "@type": "DefinedTermSet", "name": h1, "inLanguage": l, "url": BASE + path,
           "hasDefinedTerm": [{"@type": "DefinedTerm", "name": x[l], "alternateName": x[o], "description": x["def_" + l], "url": f"{BASE}{path}#{x['id']}"} for x in terms]}]
    written.append(write(path, page(l, path, alt, title, meta, body, "glossary", ld, js)))
    if l == "es": sitemap.append((path, alt))

# ---------- FAQ ----------
for l in ("es", "en"):
    t = T[l]; o = "en" if l == "es" else "es"
    path, alt = p_faq(l), p_faq(o)
    groups = {}
    for it in faq["items"]: groups.setdefault(it["cat"], []).append(it)
    order = [c for c in CATS[l] if c in groups] + [c for c in groups if c not in CATS[l]]
    blocks = ""
    for c in order:
        blocks += f'<h2 style="font-size:26px;color:var(--verde);margin:34px 0 8px">{esc(CATS[l].get(c, c))}</h2>'
        for it in groups[c]:
            link = ""
            if it.get("guide") in GUIDE_BY_KEY:
                link = f' <a href="{p_guide(GUIDE_BY_KEY[it["guide"]], l)}" style="color:var(--oro);font-weight:600;text-decoration:none">{t["seeguide"]} →</a>'
            blocks += f'<details id="{it["id"]}"><summary>{esc(it["q_" + l])}</summary><p>{esc(it["a_" + l])}{link}</p></details>'
    if l == "es":
        h1, dek = "Preguntas frecuentes sobre seguros en la Florida", "Respuestas cortas y verificadas a lo que más preguntan las familias. Cada una lleva a la guía completa del tema."
        title, meta = "Preguntas frecuentes sobre seguros en la Florida", "¿La póliza de hogar cubre inundación? ¿Cuándo empieza el seguro de inundación? ¿Necesito compensación laboral para la niñera? Respuestas claras en español."
    else:
        h1, dek = "Florida insurance FAQ", "Short, verified answers to what families ask most. Each one leads to the full guide on the topic."
        title, meta = "Florida insurance FAQ | Patrimonio Protegido", "Does homeowners insurance cover flood? When does flood insurance start? Do I need workers' comp for my nanny in Florida? Clear, verified answers."
    body = f"""
<header class="head"><div class="wrap">{crumbs(l, [(p_hub(l), t['guides']), (None, t['faq'])])}<span class="kicker">{t['faq']} · {len(faq['items'])}</span><h1>{h1}</h1><p class="dek">{dek}</p></div></header>
<div class="wrap" style="max-width:820px;padding-top:24px;padding-bottom:40px"><div class="faq">{blocks}</div>
<div class="cta"><h2>{t['cta_t']}</h2><p>{t['cta_p']}</p><div class="row"><a class="btn btn-oro" href="{p_home(l)}#mapa" data-cta="faq_quiz">{t['cta_quiz']}</a><a class="btn btn-line" href="{p_home(l)}#contacto" data-cta="faq_contact">{t['cta_write']}</a></div></div></div>
"""
    ld = [bc_ld(l, [(p_hub(l), t["guides"]), (path, t["faq"])]),
          {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": l,
           "mainEntity": [{"@type": "Question", "name": it["q_" + l], "acceptedAnswer": {"@type": "Answer", "text": it["a_" + l]}} for it in faq["items"]]}]
    js = "(function(){var h=location.hash.slice(1);if(h){var d=document.getElementById(h);if(d&&d.tagName==='DETAILS')d.open=true;}})();"
    written.append(write(path, page(l, path, alt, title, meta, body, "faq", ld, js)))
    if l == "es": sitemap.append((path, alt))

# ---------- hurricane checklist ----------
for l in ("es", "en"):
    t = T[l]; o = "en" if l == "es" else "es"
    path, alt = p_hur(l), p_hur(o)
    n = 0; groups_html = ""
    for g in hur["groups"]:
        lis = ""
        for it in g["items"]:
            n += 1
            lis += f'<li><input type="checkbox" id="h{n}" data-i="{n}"><label for="h{n}">{rich(it[l])}</label></li>'
        groups_html += f'<h2>{esc(g["h_" + l])}</h2><ul>{lis}</ul>'
    title = hur["title_" + l]
    meta = ("Lista imprimible para preparar a su familia, su casa, sus embarcaciones y sus pólizas antes y después de un huracán en la Florida."
            if l == "es" else "A printable checklist to prepare your family, home, boats and policies before and after a hurricane in Florida.")
    tl = "Temporada de huracanes" if l == "es" else "Hurricane season"
    body = f"""
<header class="head"><div class="wrap">{crumbs(l, [(p_hub(l) + '#herramientas', t['tools']), (None, tl)])}<span class="kicker">{t['tools']} · {n}</span><h1>{esc(title)}</h1><p class="dek">{rich(hur['intro_' + l])}</p></div></header>
<div class="wrap check" style="max-width:820px;padding-top:26px;padding-bottom:30px">
  <div class="toolbar no-print"><button class="btn btn-oro" onclick="window.print()" data-cta="print_hurricane">{t['print']}</button><button class="btn btn-line" id="clr">{t['clear']}</button></div>
  <div class="no-print"><div class="progress"><i id="pg"></i></div><small id="pgt" style="color:var(--humo)"></small></div>
  {groups_html}
  <p class="callout" style="margin-top:28px">{rich(hur['note_' + l])}</p>
  <div class="cta no-print"><h2>{t['cta_t']}</h2><p>{t['cta_p']}</p><div class="row"><a class="btn btn-oro" href="{p_guide(guides['flo'], l)}" data-cta="hurricane_flood_guide">{plain(guides['flo'][l]['h1'])}</a><a class="btn btn-line" href="{p_guide(guides['res'], l)}" data-cta="hurricane_home_guide">{plain(guides['res'][l]['h1'])}</a></div></div>
</div>
"""
    js = r"""(function(){var K='pp.hurricane',s={};try{s=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
var box=[].slice.call(document.querySelectorAll('.check input[type=checkbox]')),pg=document.getElementById('pg'),pgt=document.getElementById('pgt');
function upd(){var d=0;box.forEach(function(b){b.closest('li').classList.toggle('done',b.checked);if(b.checked)d++;});pg.style.width=(d/box.length*100)+'%';pgt.textContent=d+' / '+box.length;}
box.forEach(function(b){b.checked=!!s[b.dataset.i];b.addEventListener('change',function(){s[b.dataset.i]=b.checked;try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}upd();});});
document.getElementById('clr').addEventListener('click',function(){s={};try{localStorage.removeItem(K)}catch(e){}box.forEach(function(b){b.checked=false});upd();});upd();})();"""
    ld = [bc_ld(l, [(p_hub(l), t["guides"]), (path, tl)])]
    written.append(write(path, page(l, path, alt, title + " | Patrimonio Protegido", meta, body, "tool", ld, js)))
    if l == "es": sitemap.append((path, alt))

# ---------- family inventory ----------
for l in ("es", "en"):
    t = T[l]; o = "en" if l == "es" else "es"
    path, alt = p_inv(l), p_inv(o)
    secs = ""
    for s in inv["sections"]:
        cols = s["cols_" + l]
        head = "".join(f"<th scope=\"col\">{esc(c)}</th>" for c in cols)
        rows = "".join("<tr>" + "".join("<td></td>" for _ in cols) + "</tr>" for _ in range(int(s.get("rows", 4))))
        tip = f'<p class="tip">{rich(s["tip_" + l])}</p>' if s.get("tip_" + l) else ""
        secs += f'<h2>{esc(s["h_" + l])}</h2>{tip}<div class="tbl"><table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>'
    title = inv["title_" + l]
    meta = ("Hoja imprimible para que su familia sepa dónde están las pólizas, escrituras, colecciones, asesores y contactos si algo le pasa a usted."
            if l == "es" else "A printable sheet so your family knows where the policies, deeds, collections, advisors and contacts are if something happens to you.")
    tl = "Inventario familiar" if l == "es" else "Family inventory"
    body = f"""
<header class="head"><div class="wrap">{crumbs(l, [(p_hub(l) + '#herramientas', t['tools']), (None, tl)])}<span class="kicker">{t['tools']}</span><h1>{esc(title)}</h1><p class="dek">{rich(inv['intro_' + l])}</p></div></header>
<div class="wrap inv" style="max-width:980px;padding-top:26px;padding-bottom:30px">
  <div class="toolbar no-print"><button class="btn btn-oro" onclick="window.print()" data-cta="print_inventory">{t['print']}</button></div>
  <div class="privacy">{rich(inv['privacy_' + l])}</div>
  {secs}
  <div class="cta no-print"><h2>{t['cta_t']}</h2><p>{t['cta_p']}</p><div class="row"><a class="btn btn-oro" href="{p_guide(guides['emp'], l)}" data-cta="inventory_legacy_guide">{plain(guides['emp'][l]['h1'])}</a></div></div>
</div>
"""
    ld = [bc_ld(l, [(p_hub(l), t["guides"]), (path, tl)])]
    written.append(write(path, page(l, path, alt, title + " | Patrimonio Protegido", meta, body, "tool", ld)))
    if l == "es": sitemap.append((path, alt))

# ---------- sitemap ----------
def url_block(loc, es, en, pri):
    return (f"  <url>\n    <loc>{BASE}{loc}</loc>\n    <xhtml:link rel=\"alternate\" hreflang=\"es\" href=\"{BASE}{es}\"/>\n"
            f"    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{BASE}{en}\"/>\n    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{BASE}{es}\"/>\n"
            f"    <lastmod>2026-09-24</lastmod>\n    <priority>{pri}</priority>\n  </url>\n")
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
sm += url_block("/", "/", "/en/", "1.0") + url_block("/en/", "/", "/en/", "1.0")
for es, en in sitemap:
    pri = "0.9" if es.startswith("/guias/") and es != "/guias/" else "0.8"
    sm += url_block(es, es, en, pri) + url_block(en, es, en, pri)
sm += f"  <url>\n    <loc>{BASE}/privacidad.html</loc>\n    <priority>0.3</priority>\n  </url>\n</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(sm)
print(f"library written: {len(written)} pages, sitemap {sm.count('<url>')} urls")
