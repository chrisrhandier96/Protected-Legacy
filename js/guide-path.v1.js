/* Guided path on the umbrella guide (2026-10-26): the visitor taps the doubt that brought them, answers one short
   question about their family, and gets the short answer built only from sentences this guide already says
   (fact-checked with its sources), a link to the full section, and a call-me step that carries the doubt to
   Christian. Posts to the Netlify form "contacto" with form_id=path and the same attribution fields as every other
   form; pushes cta_click for each step (Tag Manager already sends cta_click to GA4) and generate_lead when a request
   is sent (the Google Ads conversion). Nothing is sent until the button is tapped.
   Loaded with defer on the two umbrella guides only. Cached as immutable: change the content, change the version in
   the name (guide-path.vN.js) and in both pages. */
(function () {
  var slot = document.getElementById('guidePath');
  if (!slot) return;
  var L = document.documentElement.lang === 'en' ? 'en' : 'es', ES = L === 'es', I = ES ? 0 : 1;
  var T = function (p) { return p[I]; };
  var E = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var dl = function (o) { try { o.page_type = 'guide'; o.language = L; window.dataLayer = window.dataLayer || []; window.dataLayer.push(o); } catch (x) {} };
  var pp = function (k) { try { return sessionStorage.getItem('pp.' + k) || ''; } catch (x) { return ''; } };
  var PHONE = '(786) 671-2171', TEL = 'tel:+17866712171';
  var SEC = {
    how: ['como-funciona', 'how-it-works'], under: ['limites-subyacentes', 'underlying-limits'],
    limit: ['elegir-limite', 'choosing-a-limit'], excl: ['exclusiones-defensa', 'exclusions-defense'],
    um: ['um-anfitrion', 'um-host-liability'], digital: ['riesgos-digitales', 'digital-risks'],
    board: ['juntas-directivas', 'board-service']
  };

  // Every answer line below is a sentence this guide already says, shortened, in the same language.
  var D = [
    { id: 'limit', label: ['¿Cuánta umbrella necesito?', 'How much umbrella do I need?'], sec: 'limit', multi: true,
      q: ['¿Cuáles de estas aplican a su familia? Marque todas las que apliquen.', 'Which of these apply to your family? Tap all that apply.'],
      intro: ['No existe una fórmula oficial para escoger el límite de una umbrella, y ningún límite asegura por sí solo que una sentencia quede cubierta. Muchas familias usan su patrimonio neto como punto de partida y luego ajustan según los ingresos futuros, la visibilidad pública y las actividades que aumentan la exposición. Un jurado no calcula una indemnización a partir de su patrimonio, sino de los daños que considera probados.',
              'There is no official formula for choosing an umbrella limit, and no limit by itself ensures that a judgment will be covered. Many families use net worth as a starting point, then adjust for future income, public visibility and activities that raise exposure. A jury does not size an award from your net worth; it sizes it from the damages it finds proven.'],
      opts: [
        { id: 'pool', l: ['Piscina, muelle o eventos en casa', 'Pool, dock or events at home'],
          a: ['Piscina y eventos: el III menciona tener piscina y recibir invitados con frecuencia entre las situaciones que aumentan la exposición.', 'Pool and entertaining: the III lists having a pool and entertaining often among the situations that raise exposure.'] },
        { id: 'boat', l: ['Embarcación o moto acuática', 'Boat or jet ski'],
          a: ['Embarcación: las embarcaciones y motos acuáticas a menudo tienen su propio mínimo, y muchas umbrellas cubren barcos solo si existe una póliza de embarcación subyacente.', 'Boat: boats and personal watercraft often carry their own minimum, and many umbrellas cover boats only when an underlying boat policy exists.'] },
        { id: 'teen', l: ['Un conductor joven en casa', 'A young driver at home'],
          a: ['Conductor joven: todos los vehículos del hogar, incluido el de un conductor joven, deben cumplir el límite que exige la umbrella; si no, la familia paga la diferencia en un accidente con ese auto.', 'Young driver: every household vehicle, including a young driver’s car, has to meet the limit the umbrella requires; if it does not, the family pays the difference after a crash in that car.'] },
        { id: 'rental', l: ['Alquiler o segunda residencia', 'Rental or second home'],
          a: ['Alquiler o segunda residencia: puede haber requisitos subyacentes separados para propiedades de alquiler y segundas residencias.', 'Rental or second home: there can be separate underlying requirements for rental properties and second homes.'] },
        { id: 'staff', l: ['Personal doméstico', 'Household staff'],
          a: ['Personal doméstico: es una de las exposiciones que las familias consideran al escoger un límite, junto con piscina, muelle y eventos en casa.', 'Household staff: it is one of the exposures families weigh when sizing a limit, along with a pool, a dock and events at home.'] },
        { id: 'public', l: ['Perfil público o cargo en una junta', 'Public profile or a board seat'],
          a: ['Perfil público o junta: algunas familias con perfil público evalúan límites por encima de su patrimonio neto, y muchas umbrellas personales excluyen o limitan la responsabilidad por servicio en juntas.', 'Public profile or board seat: some families with a public profile look at limits above their net worth, and many personal umbrellas exclude or limit liability for board service.'] },
        { id: 'none', l: ['Ninguna de estas', 'None of these'], solo: true,
          a: ['Ninguna: muchas familias se enfocan primero en corregir brechas subyacentes, como un auto con un límite menor al que exige la umbrella.', 'None: many families focus first on closing underlying gaps, such as a car whose limit is below what the umbrella requires.'] }
      ],
      many: ['Con varias exposiciones al mismo tiempo, algunas familias evalúan límites por encima de su patrimonio neto.', 'With several exposures at once, some families look at limits above their net worth.'] },

    { id: 'cover', label: ['¿Qué cubre y qué no?', 'What does it cover, and what not?'], sec: 'excl',
      q: ['¿Qué le preocupa más?', 'What worries you most?'],
      opts: [
        { id: 'car', l: ['Un accidente de auto', 'A car accident'], sec: 'um',
          a: ['Su póliza de auto responde primero, hasta su límite de responsabilidad; la umbrella responde por encima, hasta su propio límite. Si la sentencia supera ambas capas, quedan expuestas inversiones, cuentas y, según la ley aplicable, ingresos futuros. En Florida, alrededor de 1 de cada 5 conductores (20.6%) no tenía seguro en 2023, y la cobertura UM en una umbrella no es automática: la aseguradora debe ponerla a disposición a petición escrita de un asegurado.',
              'Your auto policy responds first, up to its liability limit; the umbrella responds above it, up to its own limit. If a judgment exceeds both layers, investments, accounts and, depending on the law, future income are exposed. In Florida about 1 in 5 drivers (20.6%) was uninsured in 2023, and UM coverage on an umbrella is not automatic: the insurer must make it available at the written request of an insured.'] },
        { id: 'home', l: ['Alguien que se lastime en mi casa', 'Someone hurt at my home'], sec: 'um',
          a: ['Su póliza de hogar responde primero; la umbrella responde por encima de su límite. En reuniones, la regla general de Florida es que quien sirve alcohol a una persona en edad legal para beber generalmente no responde por lo que cause su embriaguez; las excepciones son servir de forma deliberada e ilegal a un menor de 21 años o servir a sabiendas a una persona habitualmente adicta al alcohol. La responsabilidad por lesiones en la propiedad, como en la piscina, es un tema aparte.',
              'Your home policy responds first; the umbrella responds above its limit. At gatherings, Florida’s general rule is that serving alcohol to a person of lawful drinking age generally does not make you liable for what that person’s intoxication causes; the exceptions are willfully and unlawfully serving someone under 21, or knowingly serving a person habitually addicted to alcohol. Liability for injuries on the property, such as at the pool, is a separate issue.'] },
        { id: 'online', l: ['Algo publicado en redes', 'Something said online'], sec: 'digital',
          a: ['La umbrella puede cubrir lesiones personales como la difamación, lo que en algunos contratos alcanza publicaciones en redes sociales de cualquier miembro del hogar, incluidos los hijos. Otros contratos limitan o excluyen el contenido en línea. Una transferencia fraudulenta o un rescate por secuestro de datos no es responsabilidad civil y normalmente requiere una cobertura cibernética familiar, con límites propios.',
              'An umbrella may cover personal injury such as libel and slander, which under some contracts reaches social media posts by any household member, including children. Other contracts limit or exclude online content. A fraudulent wire transfer or a ransomware demand is not liability; it usually calls for family cyber coverage, with its own limits.'] },
        { id: 'defense', l: ['El costo de una demanda', 'The cost of a lawsuit'], sec: 'excl',
          a: ['La NAIC indica que una umbrella puede pagar costos de defensa que superan lo que paga la póliza primaria. La pregunta clave es si esos costos se pagan además del límite o dentro de él: dentro, cada dólar de abogados reduce lo disponible para una sentencia.',
              'The NAIC notes that an umbrella can pay defense costs beyond what the primary policy pays. The key question is whether those costs are paid in addition to the limit or inside it: inside, every dollar spent on lawyers reduces what is left for a judgment.'] }
      ],
      always: ['Lo que no hace: pagar daños a su propia casa o a su propio vehículo. Entre las exclusiones comunes están aeronaves, actividades de negocio, actos intencionales y daños punitivos.',
               'What it does not do: pay for damage to your own home or vehicle. Common exclusions include aircraft, business activities, intentional acts and punitive damages.'] },

    { id: 'assets', label: ['¿Cubre mi embarcación, alquiler y autos?', 'Does it cover my boat, rental and cars?'], sec: 'under',
      q: ['¿Cuál le preocupa?', 'Which one is on your mind?'],
      opts: [
        { id: 'boat', l: ['Embarcación o moto acuática', 'Boat or jet ski'],
          a: ['Muchas umbrellas cubren barcos solo si existe una póliza de embarcación subyacente, y algunas limitan por eslora o potencia. Las embarcaciones y motos acuáticas a menudo tienen su propio mínimo. Según la NAIC, una embarcación grande queda excluida del seguro de hogar tanto en daños como en responsabilidad.',
              'Many umbrellas cover boats only when an underlying boat policy exists, and some limit by length or horsepower. Boats and personal watercraft often carry their own minimum. The NAIC warns that a large boat is excluded from a homeowners policy for both property and liability.'] },
        { id: 'rental', l: ['Propiedad de alquiler o segunda residencia', 'Rental property or second home'],
          a: ['Cada aseguradora fija sus propios montos subyacentes, y puede haber requisitos separados para propiedades de alquiler y segundas residencias. Informe a su agente sobre sus alquileres.',
              'Each insurer sets its own underlying amounts, and there can be separate requirements for rental properties and second homes. Tell your agent about your rentals.'] },
        { id: 'teen', l: ['El auto de un conductor joven', 'A young driver’s car'],
          a: ['Si la umbrella exige un límite de auto mayor que el que tiene ese vehículo, la familia paga la diferencia de su bolsillo en un accidente con él. Por lo general, una umbrella no asume el tramo de un límite subyacente que falta.',
              'If the umbrella requires a higher auto limit than the one on that car, the family pays the difference after a crash in it. An umbrella usually does not drop down to fill a missing underlying limit.'] },
        { id: 'llc', l: ['Autos o propiedades a nombre de una LLC o fideicomiso', 'Cars or property in an LLC or trust'],
          a: ['Para vehículos o propiedades a nombre de una LLC o un fideicomiso, confirme que el asegurado nombrado coincide en cada póliza.',
              'For vehicles or property titled to an LLC or trust, confirm that the named insured matches on each policy.'] }
      ],
      always: ['La brecha aparece cuando el límite subyacente real es menor al exigido, cuando una póliza subyacente se cancela o cuando se agrega un vehículo sin ajustar sus límites.',
               'The gap appears when the actual underlying limit is lower than required, when an underlying policy lapses, or when a vehicle is added without matching limits.'] },

    { id: 'worth', label: ['¿Vale la pena para mi familia?', 'Is it worth it for my family?'], sec: 'how', multi: true,
      q: ['¿Qué quedaría expuesto por encima de sus límites de hogar y auto?', 'What would be exposed above your home and auto limits?'],
      intro: ['Esa es la pregunta que decide. Si una sentencia supera su póliza subyacente y la umbrella, lo que queda expuesto son inversiones, cuentas y, según la ley aplicable, ingresos futuros. Para una familia con patrimonio significativo en Florida, el seguro umbrella suele ser la pieza que conecta la protección de cada bien con la protección del patrimonio en su conjunto. En Florida pesan además el tráfico, la cantidad de conductores sin seguro y el uso frecuente de embarcaciones.',
              'That is the question that decides it. If a judgment exceeds both your underlying policy and the umbrella, what is exposed is investments, accounts and, depending on the law, future income. For a high-net-worth family in Florida, an umbrella is often the piece that links the protection of each asset to the protection of the whole balance sheet. In Florida, heavy traffic, the share of uninsured drivers and frequent boating add weight.'],
      opts: [
        { id: 'invest', l: ['Inversiones y cuentas', 'Investments and accounts'],
          a: ['Inversiones y cuentas: son parte de lo que queda expuesto si una sentencia supera ambas capas.', 'Investments and accounts: they are part of what is exposed if a judgment exceeds both layers.'] },
        { id: 'property', l: ['Propiedades además de la casa', 'Real estate beyond our home'],
          a: ['Otras propiedades: puede haber requisitos subyacentes separados para propiedades de alquiler y segundas residencias, así que cada una se revisa por su cuenta.', 'Other properties: there can be separate underlying requirements for rental properties and second homes, so each one is reviewed on its own.'] },
        { id: 'income', l: ['Ingresos futuros', 'Future income'],
          a: ['Ingresos futuros: según la ley aplicable, también pueden quedar expuestos.', 'Future income: depending on the law, it can be exposed too.'] },
        { id: 'unsure', l: ['No estoy seguro', 'Not sure'], solo: true,
          a: ['Un buen comienzo: anote su patrimonio neto y los ingresos que espera en los próximos años, y compárelos con los límites de responsabilidad que tiene hoy.', 'A simple start: write down your net worth and the income you expect over the coming years, and compare them with the liability limits you carry today.'] }
      ] },

    { id: 'board', label: ['Sirvo en una junta directiva', 'I serve on a board'], sec: 'board',
      q: ['¿Qué tipo de junta?', 'What kind of board?'],
      opts: [
        { id: 'nonprofit', l: ['Sin fines de lucro, escuela o fundación', 'Nonprofit, school or foundation'],
          a: ['En Florida, la sección 617.0834 establece que los directores de corporaciones sin fines de lucro, por lo general, no responden personalmente por daños monetarios derivados de sus decisiones, salvo excepciones como una violación penal, un beneficio personal indebido o una conducta imprudente o de mala fe. La sección se reformó en 2026: confirme con su abogado el texto que aplica.',
              'In Florida, section 617.0834 provides that directors of not-for-profit corporations generally are not personally liable for monetary damages arising from their decisions, with exceptions such as a criminal violation, an improper personal benefit, or reckless or bad-faith conduct. The section was revised in 2026: confirm the text that applies with your attorney.'] },
        { id: 'condo', l: ['Asociación de condominio', 'Condo association'],
          a: ['Para asociaciones de condominio, la sección 718.111 remite a esos estándares y exige seguro o fianza de fidelidad para quienes controlan o desembolsan fondos. Esa fianza protege el dinero de la asociación, no al director.',
              'For condominium associations, section 718.111 refers to those standards and requires insurance or fidelity bonding for everyone who controls or disburses association funds. That bond protects the association’s money, not the director.'] }
      ],
      always: ['Estas protecciones no impiden que lo demanden, y defenderse cuesta. Muchas umbrellas personales excluyen o limitan el servicio en juntas; algunas lo cubren para juntas sin fines de lucro no remuneradas mediante endoso. Pida a cada organización copia de su póliza D&O.',
               'These protections do not stop someone from suing you, and a defense costs money. Many personal umbrellas exclude or limit board service; some cover uncompensated nonprofit board service by endorsement. Ask each organization for a copy of its D&O policy.'] },

    { id: 'other', label: ['Otra duda: pregúnteme', 'Something else: ask me'], direct: true }
  ];

  var css = document.createElement('style');
  css.textContent =
    '.gpath{order:-3}.gpath [hidden]{display:none!important}' +
    '.gp-k{margin:0 0 4px;font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#7E5F17}' +
    '.gp-t{margin:0 0 4px;font-family:var(--display,Georgia,serif);font-size:21px;line-height:1.25;color:var(--verde,#14352A)}' +
    '.gp-p{margin:0 0 12px;font-size:14.5px;line-height:1.5;color:var(--tinta,#2B2B2B)}' +
    '.gp-chips{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 4px}@media(max-width:560px){.gp-chips{grid-template-columns:1fr}}' +
    '.gp-chips button{min-height:46px;padding:9px 14px;border:1px solid var(--arena-oscura,#E6DCC6);border-radius:12px;background:var(--arena,#F5EFE3);color:var(--verde,#14352A);font:600 14.5px/1.3 var(--body,system-ui,sans-serif);text-align:left;cursor:pointer}' +
    '.gp-chips button:hover,.gp-chips button:focus-visible{border-color:var(--oro,#C29B40);outline:2px solid var(--oro,#C29B40);outline-offset:1px}' +
    '.gp-chips button[aria-pressed="true"]{background:var(--verde,#14352A);border-color:var(--verde,#14352A);color:var(--blanco,#fff)}' +
    '.gp-go{margin-top:10px;min-height:46px;padding:0 22px;cursor:pointer}.gp-go[disabled]{opacity:.45;cursor:default}' +
    '.gp-more{margin-top:6px}' +
    '.gp-a{margin:0 0 10px;font-size:15px;line-height:1.55;color:var(--tinta,#2B2B2B)}' +
    '.gp-list{margin:0 0 10px;padding-left:18px;font-size:14.5px;line-height:1.5;color:var(--tinta,#2B2B2B)}.gp-list li{margin:0 0 6px}' +
    '.gp-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:2px 0 14px}' +
    '.gp-links a,.gp-links button{background:none;border:0;padding:6px 0;font:600 14px/1.2 var(--body,system-ui,sans-serif);color:var(--verde,#14352A);text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
    '.gp-call{border-top:1px solid var(--arena-oscura,#E6DCC6);padding-top:14px}' +
    '.gp-call h3{margin:0 0 4px;font-family:var(--display,Georgia,serif);font-size:19px;line-height:1.3;color:var(--verde,#14352A)}' +
    '.gp-grid{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;margin-top:8px}@media(max-width:700px){.gp-grid{grid-template-columns:1fr}}' +
    '.gp-f label{display:block;font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--verde,#14352A);margin-bottom:5px}' +
    '.gp-f input,.gp-f textarea{width:100%;min-height:46px;padding:10px 13px;border:1px solid var(--arena-oscura,#E6DCC6);border-radius:12px;background:var(--arena,#F5EFE3);color:var(--tinta,#2B2B2B);font:16px var(--body,system-ui,sans-serif)}' +
    '.gp-f textarea{min-height:70px;resize:vertical}.gp-full{grid-column:1/-1}' +
    '.gp-f input:focus,.gp-f textarea:focus{outline:2px solid var(--oro,#C29B40);border-color:var(--oro,#C29B40)}' +
    '.gp-send{min-height:46px;padding:0 20px;white-space:nowrap;cursor:pointer}' +
    '.gp-small{margin:8px 0 0;font-size:12px;line-height:1.5;color:#5F665A}' +
    '.gp-err{display:none;margin:8px 0 0;font-size:13.5px;color:#9B1C1C}' +
    '.gp-done{margin:0;font-family:var(--display,Georgia,serif);font-size:20px;line-height:1.3;color:var(--verde,#14352A)}' +
    '.gp-done small{display:block;margin-top:6px;font-family:var(--body,system-ui,sans-serif);font-size:14px;opacity:.85}';
  document.head.appendChild(css);

  slot.classList.add('gpath');
  slot.setAttribute('aria-live', 'polite');
  var state = { d: null, picks: [] };
  var find = function (id) { for (var i = 0; i < D.length; i++) if (D[i].id === id) return D[i]; return null; };
  var focusHead = function () { try { var h = slot.querySelector('.gp-t'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } } catch (x) {} };
  var cta = function (what) { dl({ event: 'cta_click', cta: 'path_' + what }); };

  function start() {
    state = { d: null, picks: [] };
    slot.innerHTML =
      '<p class="gp-k">' + T(['Paso a paso · 1 minuto', 'Step by step · 1 minute']) + '</p>' +
      '<p class="gp-t">' + T(['¿Cuál es su duda sobre la umbrella?', 'What is your question about umbrella insurance?']) + '</p>' +
      '<p class="gp-p">' + T(['Toque su duda: le doy la respuesta corta, con su fuente, y si quiere hablamos.', 'Tap your question: you get the short answer with its source, and we can talk if you want.']) + '</p>' +
      '<div class="gp-chips" role="group" aria-label="' + E(T(['Dudas frecuentes sobre la umbrella', 'Common umbrella questions'])) + '">' + D.map(function (d) { return '<button type="button" data-d="' + d.id + '">' + E(T(d.label)) + '</button>'; }).join('') + '</div>' +
      // the two links every guide's top card carries (same data-cta names, so the click reports stay comparable)
      '<div class="row gp-more"><a class="topcta-w" href="' + (ES ? '/#mapa' : '/en/#mapa') + '" data-cta="guide_top_quiz_lia">' + T(['Autoevaluación completa (12 preguntas)', 'Full self-assessment (12 questions)']) + '</a>' +
      '<a class="topcta-w" href="#contacto" data-cta="guide_top_write_lia">' + T(['o solicite una revisión de sus pólizas', 'or request a policy review']) + '</a></div>';
  }

  function ask(d) {
    state.d = d; state.picks = [];
    cta('start_' + d.id);
    if (d.direct) { answer(); return; }
    slot.innerHTML =
      '<p class="gp-k">' + T(['Paso 2 de 3', 'Step 2 of 3']) + '</p>' +
      '<p class="gp-t">' + E(T(d.label)) + '</p>' +
      '<p class="gp-p">' + E(T(d.q)) + '</p>' +
      '<div class="gp-chips" role="group" aria-label="' + E(T(d.q)) + '">' + d.opts.map(function (o) {
        return '<button type="button" data-o="' + o.id + '"' + (d.multi ? ' aria-pressed="false"' : '') + '>' + E(T(o.l)) + '</button>';
      }).join('') + '</div>' +
      (d.multi ? '<button type="button" class="btn btn-oro gp-go" disabled>' + T(['Ver mi respuesta', 'See my answer']) + '</button>' : '') +
      '<div class="gp-links"><button type="button" data-restart>' + T(['Volver', 'Back']) + '</button></div>';
    focusHead();
  }

  function answer() {
    var d = state.d, picks = state.picks, body = '';
    if (!d.direct) {
      cta('answer_' + d.id);
      var chosen = d.opts.filter(function (o) { return picks.indexOf(o.id) >= 0; });
      if (d.intro) body += '<p class="gp-a">' + E(T(d.intro)) + '</p>';
      var lines = chosen.filter(function (o) { return o.a; }).map(function (o) { return '<li>' + E(T(o.a)) + '</li>'; });
      if (d.multi && lines.length) body += '<p class="gp-p"><b>' + T(['Lo que marcó:', 'What you marked:']) + '</b></p><ul class="gp-list">' + lines.join('') + '</ul>';
      else if (!d.multi && chosen[0] && chosen[0].a) body += '<p class="gp-a">' + E(T(chosen[0].a)) + '</p>';
      var real = chosen.filter(function (o) { return !o.solo; }).length;
      if (d.many && real >= 3) body += '<p class="gp-a">' + E(T(d.many)) + '</p>';
      if (d.always) body += '<p class="gp-a">' + E(T(d.always)) + '</p>';
      var sec = (!d.multi && chosen[0] && chosen[0].sec) || d.sec;
      body += '<div class="gp-links"><a href="#' + SEC[sec][I] + '" data-sec>' + T(['Leer la sección completa', 'Read the full section']) + ' ↓</a>' +
              '<button type="button" data-restart>' + T(['Tengo otra duda', 'I have another question']) + '</button></div>' +
              '<p class="gp-small">' + T(['Información general de esta guía y sus fuentes (III, NAIC, Estatutos de Florida). No sustituye la revisión de su póliza.', 'General information from this guide and its sources (III, NAIC, Florida Statutes). It does not replace a review of your policy.']) + '</p>';
    }
    slot.innerHTML =
      '<p class="gp-k">' + T(['Paso 3 de 3', 'Step 3 of 3']) + '</p>' +
      '<p class="gp-t">' + E(T(d.label)) + '</p>' + body +
      '<div class="gp-call">' +
        '<h3>' + (d.direct ? T(['Cuénteme su duda', 'Tell me your question']) : T(['¿Quiere una segunda mirada a su caso?', 'Want a second look at your situation?'])) + '</h3>' +
        '<p class="gp-p">' + T(['Le llamo sobre esta duda: 20 minutos, sin costo y sin compromiso, en español o en inglés. Agente licenciado en la Florida, Lic. W606240.', 'I will call you about this question: 20 minutes, no cost and no obligation, in English or Spanish. Licensed Florida agent, Lic. W606240.']) + '</p>' +
        '<form class="gp-form" novalidate><div class="gp-grid">' +
          (d.direct ? '<div class="gp-f gp-full"><label for="gp-q">' + T(['Su pregunta (opcional)', 'Your question (optional)']) + '</label><textarea id="gp-q" name="pregunta" maxlength="600"></textarea></div>' : '') +
          '<div class="gp-f"><label for="gp-n">' + T(['Nombre', 'Name']) + '</label><input id="gp-n" name="nombre" type="text" autocomplete="name" required></div>' +
          '<div class="gp-f"><label for="gp-tel">' + T(['Teléfono o WhatsApp', 'Phone or WhatsApp']) + '</label><input id="gp-tel" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required></div>' +
          '<button class="btn btn-oro gp-send" type="submit">' + T(['Llámeme sobre esto', 'Call me about this']) + '</button>' +
        '</div><p class="gp-err" role="alert"></p>' +
        '<p class="gp-small">' + T(['O llame ahora al ', 'Or call now: ']) + '<a href="' + TEL + '" data-track="llamada">' + PHONE + '</a>. ' +
          T(['Al enviar, autoriza a Christian R. González a contactarlo por teléfono o WhatsApp. Sus datos no se comparten.', 'By sending, you authorize Christian R. González to contact you by phone or WhatsApp. Your details are not shared.']) + '</p>' +
        '</form></div>' +
      (d.direct ? '<div class="gp-links"><button type="button" data-restart>' + T(['Volver', 'Back']) + '</button></div>' : '');
    focusHead();
  }

  function send(form) {
    var d = state.d, err = slot.querySelector('.gp-err'), btn = slot.querySelector('.gp-send');
    if (state.sending) return; // one request per tap, even on a double tap or a second Enter
    err.style.display = 'none';
    var n = form.nombre.value.trim(), p = form.telefono.value.trim(), q = form.pregunta ? form.pregunta.value.trim() : '';
    if (n.length < 2) { err.textContent = T(['Escriba su nombre.', 'Please enter your name.']); err.style.display = 'block'; form.nombre.focus(); return; }
    if (p.replace(/\D/g, '').length < 10) { err.textContent = T(['Escriba un teléfono con código de área, por ejemplo 305 555 0123.', 'Please enter a phone number with area code, for example 305 555 0123.']); err.style.display = 'block'; form.telefono.focus(); return; }
    var marked = d.opts ? d.opts.filter(function (o) { return state.picks.indexOf(o.id) >= 0; }).map(function (o) { return o.l[0]; }).join(', ') : '';
    var params = new URLSearchParams();
    params.set('form-name', 'contacto'); params.set('form_id', 'path');
    params.set('nombre', n); params.set('telefono', p); params.set('email', '');
    params.set('idioma', ES ? 'Español' : 'English'); params.set('idioma_sitio', L);
    params.set('tema', 'Responsabilidad y umbrella');
    params.set('mensaje', 'Duda (guía umbrella): ' + d.label[0] + (marked ? ' · Marcó: ' + marked : '') + (q ? ' · Pregunta: ' + q : '') + ' · ' + location.pathname);
    params.set('origen', pp('origen')); params.set('campana', pp('campana')); params.set('termino', pp('termino'));
    params.set('gclid', pp('gclid')); params.set('pagina_entrada', pp('landing') || location.pathname);
    var label = btn.textContent; state.sending = true; btn.disabled = true; btn.textContent = T(['Enviando…', 'Sending…']);
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() })
      .then(function (r) {
        if (!r || !r.ok) throw new Error('send');
        dl({ event: 'generate_lead', lead_source: 'path_' + d.id, form_id: 'path', quiz_score: '' });
        slot.innerHTML = '<p class="gp-done">' + E(T(['Gracias, ' + n + '. Le llamo hoy mismo, en horario de Miami, sobre: ' + d.label[0], 'Thank you, ' + n + '. I will call you today, Miami time, about: ' + d.label[1]])) +
          '<small>' + T(['Si prefiere adelantarse: ', 'If you would rather not wait: ']) + '<a href="' + TEL + '" data-track="llamada" style="color:inherit">' + PHONE + '</a></small></p>';
      })
      .catch(function () {
        state.sending = false; btn.disabled = false; btn.textContent = label;
        err.innerHTML = T(['No se pudo enviar desde el sitio. Llame o escriba al ', 'We could not send it from the site. Call or text ']) + '<a href="' + TEL + '" data-track="llamada">' + PHONE + '</a>.';
        err.style.display = 'block';
      });
  }

  slot.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button, a[data-sec]');
    if (!b || !slot.contains(b)) return;
    if (b.hasAttribute('data-restart')) { cta('restart'); start(); focusHead(); return; }
    if (b.hasAttribute('data-sec')) { cta('section_' + (state.d ? state.d.id : '')); return; }
    if (b.hasAttribute('data-d')) { ask(find(b.getAttribute('data-d'))); return; }
    if (b.hasAttribute('data-o')) {
      var d = state.d, id = b.getAttribute('data-o'), o = null;
      d.opts.forEach(function (x) { if (x.id === id) o = x; });
      if (!d.multi) { state.picks = [id]; answer(); return; }
      var on = state.picks.indexOf(id) >= 0;
      if (o.solo) state.picks = on ? [] : [id];
      else { state.picks = state.picks.filter(function (p) { var x = null; d.opts.forEach(function (y) { if (y.id === p) x = y; }); return !(x && x.solo); }); if (on) state.picks.splice(state.picks.indexOf(id), 1); else state.picks.push(id); }
      [].forEach.call(slot.querySelectorAll('button[data-o]'), function (x) { x.setAttribute('aria-pressed', state.picks.indexOf(x.getAttribute('data-o')) >= 0 ? 'true' : 'false'); });
      slot.querySelector('.gp-go').disabled = state.picks.length === 0;
      return;
    }
    if (b.classList.contains('gp-go')) { if (state.picks.length) answer(); }
  });
  slot.addEventListener('submit', function (e) { e.preventDefault(); send(e.target); });

  start();
})();
