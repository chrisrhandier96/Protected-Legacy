# -*- coding: utf-8 -*-
"""Builds the Part F ads files for the six new guides (work order 2026-09).
Run from the repo root:  python ads/make_new_adgroups.py
Writes ads/pp-new-adgroups-2026-09.csv (Google Ads Editor, new ad groups only, all Paused, no campaign row),
ads/claims-2026-09.json (what each headline claims, for site-tests/ads_check.py), ads/new-sitelinks.txt
and ads/new-negatives.txt. Keyword volumes are unverified (no Keyword Planner access).
"""
import csv, json, os

CAMPAIGN = "PP Search | Protección Patrimonial"
SITE = "https://www.protectedlegacyfl.com"
HEADER = ["Campaign", "Campaign type", "Campaign status", "Budget", "Bid strategy type", "Networks", "EU political ads",
          "Ad group", "Ad group status", "Default max. CPC", "Keyword", "Match type", "Keyword status", "Max. CPC",
          "Ad type", "Ad status", "Final URL", "Path 1", "Path 2"] + [f"Headline {i}" for i in range(1, 16)] + [f"Description {i}" for i in range(1, 5)]

# Each headline is (text, claim). claim = phrases that must all appear on the landing page (lowercase), or None
# for site-level lines (the soft agent line and the bilingual/educational lines), which the validator reports separately.
G = []
def group(name, cpc, path, p1, p2, keywords, heads, descs):
    G.append({"name": name, "cpc": cpc, "url": SITE + path, "p1": p1, "p2": p2, "kw": keywords, "heads": heads, "descs": descs})

group("EN 10 Personal Cyber", "5.00", "/en/guides/personal-cyber/", "cyber", "family",
  [("personal cyber insurance", "exact"), ("personal cyber insurance florida", "phrase"), ("cyber insurance for families", "phrase"),
   ("family cyber protection", "phrase"), ("real estate wire fraud", "phrase"), ("identity theft coverage", "phrase")],
  [("Personal Cyber, Explained", ["personal cyber"]), ("Family Cyber Protection", ["family cyber protection"]),
   ("Personal Cyber Insurance", ["personal cyber insurance"]), ("Wire Fraud at Home Closings", ["wire fraud", "closing"]),
   ("A Call-Back Rule for Wires", ["confirmation call"]), ("Online Extortion at Home", ["extortion"]),
   ("Identity Theft Coverage Gaps", ["identity theft"]), ("What Home Policies Leave Out", ["homeowners policy usually does not cover"]),
   ("A 10-Step Family Checklist", ["multi-factor authentication", "password manager"]), ("Credit Freezes, Explained", ["freeze your credit"]),
   ("Figures From the FBI and FTC", ["fbi", "federal trade commission"]), ("Staff and Teen Device Risk", ["household staff", "teenagers"]),
   ("Read It in English or Spanish", None), ("Educational, Not a Sales Pitch", None), ("Talk It Through With an Agent", None)],
  ["How personal cyber coverage works, what a home policy leaves out and how families respond.",
   "Wire fraud at closings, online extortion and identity theft, explained with FBI figures.",
   "A family checklist: MFA, a password manager, credit freezes and a wire call-back rule.",
   "An educational guide in English and Spanish. Read it at your pace, then ask questions."])

group("ES 11 Ciberprotección", "4.00", "/guias/ciber-proteccion-familiar/", "ciber", "familia",
  [("ciberseguro personal", "exact"), ("seguro cibernetico personal", "phrase"), ("seguro contra fraude cibernetico", "phrase"),
   ("seguro robo de identidad", "phrase"), ("fraude de transferencia bancaria", "phrase")],
  [("Ciberprotección Familiar", ["ciberprotección familiar"]), ("Ciberseguro Personal", ["ciberseguro personal"]),
   ("Fraude en Cierres de Casas", ["fraude", "cierre"]), ("Regla de Llamada al Transferir", ["llamada de confirmación"]),
   ("Extorsión en Línea en Casa", ["extorsión"]), ("Robo de Identidad: Qué Ayuda", ["robo de identidad"]),
   ("Lo Que la Póliza No Cubre", ["normalmente no cubre"]), ("Lista Familiar de 10 Pasos", ["administrador de contraseñas"]),
   ("Congelar Su Crédito", ["congele su crédito"]), ("Datos del FBI y la FTC", ["fbi", "comisión federal de comercio"]),
   ("Riesgo de Personal y Jóvenes", ["personal del hogar", "adolescentes"]), ("Seguro Cibernético, Explicado", ["ciberseguro"]),
   ("Guía en Español e Inglés", None), ("Educativo, Sin Presión", None), ("Converse con un Agente", None)],
  ["Cómo funciona el ciberseguro personal, qué excluye la póliza de hogar y cómo responder.",
   "Fraude en cierres, extorsión en línea y robo de identidad, explicados con datos del FBI.",
   "Una lista familiar: verificación en dos pasos, contraseñas, congelar el crédito y más.",
   "Guía educativa en español e inglés. Léala a su ritmo y luego haga sus preguntas."])

group("EN 12 Kidnap & Ransom", "6.00", "/en/guides/kidnap-ransom/", "kidnap-ransom", "guide",
  [("kidnap and ransom insurance", "exact"), ("k&r insurance", "phrase"), ("kidnap and ransom insurance for individuals", "phrase"),
   ("kidnap ransom insurance family", "phrase"), ("kidnap insurance travel", "phrase")],
  [("Kidnap and Ransom, Explained", ["kidnap and ransom"]), ("K&R Insurance for Families", ["k&r", "famil"]),
   ("What K&R Policies Cover", ["covered events"]), ("Why Response Teams Matter", ["response consultants"]),
   ("The Confidentiality Condition", ["confidentiality condition"]), ("Travel Advisory Levels", ["advisory levels"]),
   ("Individual vs. Corporate K&R", ["corporate policies"]), ("How K&R Fits With Umbrella", ["umbrella"]),
   ("Extortion and Detention", ["extortion", "detention"]), ("A Discreet Coverage", ["discreet coverage"]),
   ("Plan Calmly, Long Before", ["long before any trip"]), ("Questions to Review", ["kidnap and ransom"]),
   ("Read It in English or Spanish", None), ("Educational, Not a Sales Pitch", None), ("Talk It Through With an Agent", None)],
  ["What kidnap and ransom insurance is, who it is for and why the response team matters most.",
   "Covered events, the confidentiality condition and how K&R fits with umbrella and travel.",
   "State Department advisory levels and calm family planning, explained in plain language.",
   "An educational guide in English and Spanish. Read it at your pace, then ask questions."])

group("ES 13 Secuestro y Extorsión", "5.00", "/guias/secuestro-y-extorsion/", "secuestro", "guia",
  [("seguro de secuestro", "phrase"), ("seguro contra secuestro y extorsion", "phrase"), ("seguro k&r", "phrase"), ("seguro de secuestro para familias", "phrase")],
  [("Secuestro y Extorsión: la Guía", ["secuestro y extorsión"]), ("Seguro K&R para Familias", ["k&r", "familia"]),
   ("Qué Eventos Cubre", ["eventos cubiertos"]), ("Por Qué Importa la Respuesta", ["consultores de respuesta"]),
   ("Condición de Confidencialidad", ["condición de confidencialidad"]), ("Niveles de Alerta de Viaje", ["niveles de alerta"]),
   ("Póliza Personal o Corporativa", ["corporativas"]), ("Cómo Encaja con la Umbrella", ["umbrella"]),
   ("Extorsión y Detención", ["extorsión", "detención"]), ("Una Cobertura Discreta", ["cobertura discreta"]),
   ("Planifique con Calma", ["con calma"]), ("Preguntas Para Revisar", ["secuestro"]),
   ("Guía en Español e Inglés", None), ("Educativo, Sin Presión", None), ("Converse con un Agente", None)],
  ["Qué es el seguro de secuestro y extorsión, a quién le conviene y cómo funciona.",
   "Eventos cubiertos, la condición de confidencialidad y cómo encaja con la umbrella.",
   "Los niveles de alerta del Departamento de Estado y la planificación familiar, con calma.",
   "Guía educativa en español e inglés. Léala a su ritmo y luego haga sus preguntas."])

group("EN 14 Short-Term Rentals", "5.00", "/en/guides/short-term-rentals/", "rentals", "florida",
  [("short term rental insurance florida", "exact"), ("vacation rental insurance florida", "phrase"), ("florida vacation rental license", "phrase"),
   ("insurance for vacation rental home", "phrase"), ("short term rental insurance", "phrase"), ("home sharing insurance", "phrase")],
  [("Short-Term Rentals in Florida", ["short-term rentals in florida"]), ("Vacation Rental Licensing", ["vacation rental license"]),
   ("When DBPR Requires a License", ["dbpr", "license"]), ("Rental Taxes, Explained", ["tourist development tax"]),
   ("Condo and HOA Rental Rules", ["condominium", "association"]), ("Short-Term Rental Insurance", ["short-term rental"]),
   ("Guest Injuries and Liability", ["guest injury"]), ("When a Home Policy Falls Short", ["homeowners policy may not respond"]),
   ("Landlord Policy or Endorsement", ["landlord policy", "endorsement"]), ("Pools, Docks and Golf Carts", ["pools", "docks", "golf carts"]),
   ("Hurricane Plans for Bookings", ["hurricane"]), ("A Rental Safety Checklist", ["how to reduce the risk"]),
   ("Read It in English or Spanish", None), ("Educational, Not a Sales Pitch", None), ("Talk It Through With an Agent", None)],
  ["When a Florida rental needs a DBPR license, which taxes apply and what policies miss.",
   "Why a homeowners policy may not respond to paying guests, and the options families review.",
   "Guest injuries, pools and docks, condo rules and hurricane plans for your bookings.",
   "An educational guide in English and Spanish. Read it at your pace, then ask questions."])

group("ES 15 Alquiler Vacacional", "4.00", "/guias/alquiler-vacacional/", "alquiler", "florida",
  [("seguro para alquiler vacacional", "phrase"), ("licencia alquiler vacacional florida", "phrase"), ("seguro renta corto plazo", "phrase"),
   ("alquiler vacacional florida seguro", "phrase")],
  [("Alquiler Vacacional en Florida", ["alquiler vacacional en florida"]), ("Licencia del DBPR", ["dbpr", "licencia"]),
   ("Impuestos del Alquiler", ["impuesto de desarrollo turístico"]), ("Reglas del Condominio y HOA", ["condominio", "asociación"]),
   ("Seguro de Alquiler Vacacional", ["alquiler vacacional"]), ("Huéspedes y Responsabilidad", ["huésped"]),
   ("Cuando la Póliza No Responde", ["puede no responder"]), ("Póliza de Arrendador o Endoso", ["póliza de arrendador", "endoso"]),
   ("Piscinas, Muelles y Carritos", ["piscinas", "muelles", "carritos de golf"]), ("Plan de Huracán y Reservas", ["huracán", "reservas"]),
   ("Lista Para Reducir el Riesgo", ["cómo reducir el riesgo"]), ("Qué Revisar Antes de Alquilar", ["antes de alquilar"]),
   ("Guía en Español e Inglés", None), ("Educativo, Sin Presión", None), ("Converse con un Agente", None)],
  ["Cuándo un alquiler en Florida necesita licencia del DBPR y qué impuestos aplican.",
   "Por qué la póliza de hogar puede no responder ante huéspedes que pagan, y qué revisar.",
   "Lesiones de huéspedes, piscinas y muelles, reglas del condominio y planes de huracán.",
   "Guía educativa en español e inglés. Léala a su ritmo y luego haga sus preguntas."])

group("EN 16 Renovations", "5.00", "/en/guides/renovations-builders-risk/", "renovations", "florida",
  [("builders risk insurance for homeowners", "exact"), ("builders risk insurance florida", "phrase"), ("home renovation insurance", "phrase"),
   ("insurance during home renovation", "phrase"), ("notice of commencement florida", "phrase"), ("vacant home during renovation", "phrase")],
  [("Renovating in Florida?", ["renovat", "florida"]), ("Builder's Risk, Explained", ["builder's risk"]),
   ("Builder's Risk Insurance", ["builder's risk insurance"]), ("When the Home Sits Empty", ["vacancy clause"]),
   ("Contractor Certificates", ["certificate"]), ("Additional Insured Status", ["additional insured"]),
   ("Notice of Commencement", ["notice of commencement"]), ("Avoid Paying Twice", ["paying twice"]),
   ("Owner-Builder Risks", ["owner-builder"]), ("Hurricane Season on Site", ["hurricane"]),
   ("Permits and Building Code", ["permits", "building code"]), ("Update the Policy After", ["after the work"]),
   ("Read It in English or Spanish", None), ("Educational, Not a Sales Pitch", None), ("Talk It Through With an Agent", None)],
  ["What changes in your insurance during a renovation, and what to ask every contractor for.",
   "Builder's risk, the vacancy clause and wind coverage during hurricane season, explained.",
   "The notice of commencement and lien releases that help keep a family from paying twice.",
   "An educational guide in English and Spanish. Read it at your pace, then ask questions."])

group("EN 17 Condo & HOA", "5.00", "/en/guides/condos-hoa/", "condo-hoa", "florida",
  [("ho6 insurance florida", "exact"), ("condo insurance florida", "phrase"), ("loss assessment coverage", "phrase"),
   ("condo master policy vs ho6", "phrase"), ("milestone inspection florida", "phrase"), ("sirs reserve study florida", "phrase"),
   ("condo special assessment insurance", "phrase")],
  [("Condos and HOAs in Florida", ["condos and associations in florida"]), ("Master Policy vs. HO-6", ["master policy", "ho-6"]),
   ("Condo Insurance, Explained", ["unit owner policy"]), ("Loss Assessment Coverage", ["loss assessment coverage"]),
   ("Special Assessments", ["special assessment"]), ("Milestone Inspections", ["milestone inspection"]),
   ("Reserve Studies (SIRS)", ["structural integrity reserve study"]), ("What the Association Covers", ["what the association covers"]),
   ("What the Owner Insures", ["owner's responsibility"]), ("Florida Condo Laws, Cited", ["section 718.111"]),
   ("Before You Buy a Unit", ["before buying"]), ("HOA Rules for Houses", ["homeowners association"]),
   ("Read It in English or Spanish", None), ("Educational, Not a Sales Pitch", None), ("Talk It Through With an Agent", None)],
  ["What the master policy covers, what falls to the owner and how the HO-6 fills the gap.",
   "Loss assessment coverage, special assessments and hurricane deductibles, explained.",
   "Milestone inspections and structural integrity reserve studies, with Florida statutes.",
   "An educational guide in English and Spanish. Read it at your pace, then ask questions."])

group("ES 18 Condominios", "4.00", "/guias/condominios-y-hoa/", "condominios", "florida",
  [("seguro de condominio florida", "phrase"), ("seguro ho6", "phrase"), ("cobertura de evaluacion por perdida", "phrase"),
   ("inspeccion de hito florida", "phrase"), ("estudio de reservas condominio", "phrase")],
  [("Condominios en Florida", ["condominios"]), ("Póliza Maestra y HO-6", ["póliza maestra", "ho-6"]),
   ("Seguro de Condominio", ["condominio"]), ("Evaluación por Pérdida", ["evaluación por pérdida"]),
   ("Evaluaciones Especiales", ["evaluaciones especiales"]), ("Inspecciones de Hito", ["inspecciones de hito"]),
   ("Estudio de Reservas (SIRS)", ["estudio de reservas"]), ("Qué Cubre la Asociación", ["qué cubre la asociación"]),
   ("Qué Le Toca al Propietario", ["responsabilidad del propietario"]), ("Leyes de Florida, Citadas", ["sección 718.111"]),
   ("Antes de Comprar una Unidad", ["antes de comprar"]), ("Asociaciones de Propietarios", ["asociación de propietarios"]),
   ("Guía en Español e Inglés", None), ("Educativo, Sin Presión", None), ("Converse con un Agente", None)],
  ["Qué cubre la póliza maestra, qué le toca al propietario y cómo encaja la póliza HO-6.",
   "Cobertura de evaluación por pérdida, evaluaciones especiales y deducibles de huracán.",
   "Inspecciones de hito y estudios de reservas de integridad estructural, con la ley citada.",
   "Guía educativa en español e inglés. Léala a su ritmo y luego haga sus preguntas."])

group("EN 19 Board Service", "5.00", "/en/guides/board-service-family-foundations/", "boards", "foundations",
  [("nonprofit board d&o insurance", "phrase"), ("board member liability insurance", "phrase"), ("directors and officers insurance nonprofit", "phrase"),
   ("family foundation self dealing", "phrase"), ("nonprofit board member personal liability", "phrase")],
  [("Serving on a Board?", ["board"]), ("Board Service, Explained", ["board service"]),
   ("D&O Insurance, Explained", ["directors and officers"]), ("Side A, B and C of D&O", ["side a", "side b", "side c"]),
   ("Nonprofit Board Protections", ["not-for-profit"]), ("Florida Statute 617.0834", ["617.0834"]),
   ("Family Foundation Rules", ["family foundation"]), ("Self-Dealing, Explained", ["self-dealing"]),
   ("Claims-Made Policies", ["claims-made"]), ("Before Accepting a Seat", ["before accepting a seat"]),
   ("How It Fits Your Umbrella", ["umbrella"]), ("Good Governance Habits", ["good governance"]),
   ("Read It in English or Spanish", None), ("Educational, Not a Sales Pitch", None), ("Talk It Through With an Agent", None)],
  ["What the law protects when you serve on a board, and what D&O insurance usually covers.",
   "Family foundation rules on self-dealing, explained with IRS guidance, plus EPLI basics.",
   "How board service fits with your umbrella, and the questions to ask before you say yes.",
   "An educational guide in English and Spanish. Read it at your pace, then ask questions."])

def rows():
    base = [CAMPAIGN] + [""] * 6
    for g in G:
        yield base + [g["name"], "Paused", g["cpc"]] + [""] * (len(HEADER) - 10)
        for kw, mt in g["kw"]:
            # keyword-level Final URL: same guide as the ad
            yield base + [g["name"], "", "", kw, mt, "Paused", "", "", "", g["url"]] + [""] * (len(HEADER) - 17)
        heads = [h for h, _ in g["heads"]]
        yield base + [g["name"], "", "", "", "", "", "", "Responsive search ad", "Paused", g["url"], g["p1"], g["p2"]] + heads + g["descs"]

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "pp-new-adgroups-2026-09.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f); w.writerow(HEADER)
        for r in rows():
            assert len(r) == len(HEADER), (r[7], len(r)); w.writerow(r)
    claims = {g["name"]: {"url": g["url"], "headlines": {h: c for h, c in g["heads"]}} for g in G}
    json.dump(claims, open(os.path.join(here, "claims-2026-09.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(len(G), "ad groups,", sum(len(g["kw"]) for g in G), "keywords")
