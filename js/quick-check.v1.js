/* Umbrella quick check (work order 2026-10-08, Part 4), on the umbrella guide only (ES and EN).
   Four questions from the home page's 12 (Q9 umbrella limits, Q4 auto liability, Q5 boat liability, Q10 digital
   risks), same wording, same answers, same scoring bands. Then the same two-field form as the home result:
   it posts to the Netlify form "contacto" with the guide form's hidden fields plus form_id=mini, and pushes one
   generate_lead. Nothing is sent until the visitor taps the button; answers stay in this page.
   Question 1 is in the HTML (built by tools/build_library.py); this file runs after it with defer.
   Cached as immutable: change the content, change the version in the name and in build_library.py. */
(function () {
  var card = document.getElementById('qcheck');
  if (!card) return;
  var L = document.documentElement.lang === 'en' ? 'en' : 'es', ES = L === 'es';
  var $ = function (i) { return document.getElementById(i); };
  var t = function (es, en) { return ES ? es : en; };

  // questions: section = the guide section that answers it (ids are per language)
  var Q = [
    { d: 'lia', es: '¿Tiene una póliza umbrella con límites al menos comparables a su patrimonio neto?', en: 'Do you carry an umbrella policy with limits at least comparable to your net worth?', sec: ['elegir-limite', 'choosing-a-limit'] },
    { d: 'aut', es: '¿Sus límites de responsabilidad de auto crecieron junto con su patrimonio, e incluyen cobertura de motorista sin seguro (UM/UIM)?', en: 'Have your auto liability limits grown with your wealth, and do they include uninsured motorist (UM/UIM) coverage?', sec: ['limites-subyacentes', 'underlying-limits'] },
    { d: 'mar', es: '¿Su embarcación o moto acuática (PWC) tiene su propia póliza, con valor acordado y responsabilidad seria, conectada a su umbrella?', en: 'Does your boat or PWC carry its own policy, with agreed value and serious liability, tied into your umbrella?', sec: ['limites-subyacentes', 'underlying-limits'] },
    { d: 'lia', es: '¿Ha considerado los riesgos digitales de su familia (fraude de transferencias, ciberacoso, robo de identidad) y si alguna póliza los contempla?', en: "Have you considered your family's digital risks (wire fraud, cyberbullying, identity theft) and whether any policy addresses them?", sec: ['riesgos-digitales', 'digital-risks'] }
  ];
  var ANS = { '2': ['Sí, con certeza', 'Yes, with certainty'], '1': ['No estoy seguro/a', "I'm not sure"], '0': ['No / Nunca lo he pensado', "No / I've never thought about it"], '-1': ['No aplica a mi familia', "Doesn't apply to my family"] };
  var DOM = { lia: 'Responsabilidad', aut: 'Autos', mar: 'Embarcaciones' };
  // the home page's result bands, word for word
  var BAND = {
    high: { es: ['Guardián del patrimonio', 'Su conciencia de riesgo es alta, algo poco común. El siguiente paso de las familias organizadas es la revisión periódica: los patrimonios cambian, y la protección debe cambiar con ellos.'],
      en: ['Guardian of the estate', 'Your risk awareness is high, which is rare. The next step for organized families is periodic review: wealth changes, and protection must change with it.'] },
    medium: { es: ['Constructor consciente', 'Conoce varios conceptos clave, pero hay zonas de su mapa en blanco. Esas son precisamente las brechas que los eventos inesperados encuentran primero.'],
      en: ['Aware builder', 'You know several key concepts, but parts of your map are blank. Those are exactly the gaps unexpected events find first.'] },
    starting: { es: ['El momento de empezar es hoy', 'No se preocupe: muchas familias exitosas están exactamente aquí. Construyeron mucho, en poco tiempo, y nadie les explicó estos temas en su idioma. La conciencia es el primer paso, y usted acaba de darlo.'],
      en: ['The time to start is today', 'Do not worry: many successful families are exactly here. They built a great deal, in little time, and no one explained these topics in their language. Awareness is the first step, and you just took it.'] }
  };
  var dl = function (o) { try { o.page_type = 'guide'; o.language = L; window.dataLayer = window.dataLayer || []; window.dataLayer.push(o); } catch (x) {} };

  var css = document.createElement('style');
  css.textContent =
    '.qcheck [hidden]{display:none!important}' +
    '.qc-score{margin:6px 0 2px;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#7E5F17}' +
    '.qc-title{margin:0 0 6px;font-family:var(--display);font-size:22px;line-height:1.25;color:var(--verde)}' +
    '.qc-body{margin:0 0 10px;font-size:14.5px;line-height:1.5;color:var(--tinta)}' +
    '.qc-rev{margin:0 0 14px;font-size:14px;line-height:1.5}.qc-rev a{color:var(--verde);font-weight:600}' +
    '.qc-mini{border-top:1px solid var(--arena-oscura);padding-top:14px;margin-top:4px}' +
    '.qc-mini h3{margin:0 0 10px;font-family:var(--display);font-size:20px;line-height:1.25;color:var(--verde)}' +
    '.qc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:560px){.qc-grid{grid-template-columns:1fr}}' +
    '.qc-f label{display:block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--verde);margin-bottom:6px}' +
    '.qc-f input{width:100%;padding:12px 14px;border:1px solid var(--arena-oscura);border-radius:12px;background:var(--arena);color:var(--tinta);font:16px var(--body)}' +
    '.qc-f input:focus{outline:2px solid var(--oro);border-color:var(--oro)}' +
    '.qc-swap{display:inline-block;background:none;border:0;padding:6px 0;margin:4px 0 10px;color:var(--verde);font:600 13.5px/1.2 var(--body);text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
    '.qc-send{display:block;width:100%;min-height:48px}' +
    '.qc-err{display:none;margin:10px 0 0;font-size:13.5px;color:#9B1C1C}' +
    '.qc-line{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:#5F665A}' +
    '.qc-done{margin:6px 0 4px;font-family:var(--display);font-size:21px;line-height:1.3;color:var(--verde)}' +
    '.gform .form-done{font-family:var(--display);font-size:22px;color:var(--verde);margin:0}';
  document.head.appendChild(css);

  var picks = [];
  var step = $('qc-step'), res = $('qc-res');
  function render() {
    var q = Q[picks.length];
    $('qc-n').textContent = t('Pregunta ', 'Question ') + (picks.length + 1) + t(' de 4', ' of 4');
    $('qc-q').textContent = q[L];
  }
  card.querySelector('.qc-a').addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-v]'); if (!b) return;
    picks.push(+b.getAttribute('data-v'));
    if (picks.length < Q.length) { render(); try { card.querySelector('.qc-a button').focus(); } catch (x) {} return; }
    finish();
  });

  function stats() {
    var sc = 0, mx = 0, blank = [];
    picks.forEach(function (p, i) { if (p >= 0) { sc += p; mx += 2; if (p < 2) blank.push(i); } });
    var pct = mx > 0 ? Math.round(sc / mx * 100) : 100;
    return { pct: pct, blank: blank, band: pct >= 75 ? 'high' : pct >= 45 ? 'medium' : 'starting' };
  }

  function finish() {
    var st = stats(), b = BAND[st.band][L], si = ES ? 0 : 1;
    // the guide sections to review, named by their own headings (deduplicated)
    var seen = {}, links = st.blank.map(function (i) { var id = Q[i].sec[si]; if (seen[id]) return ''; seen[id] = 1; var s = document.getElementById(id), h = s && s.querySelector('h2');
      return h ? '<a href="#' + id + '">' + h.textContent.replace(/</g, '&lt;') + '</a>' : ''; }).filter(Boolean);
    res.innerHTML =
      '<p class="qc-score">' + t('Su resultado: ', 'Your result: ') + st.pct + '%</p>' +
      '<p class="qc-title">' + b[0] + '</p><p class="qc-body">' + b[1] + '</p>' +
      (links.length ? '<p class="qc-rev">' + t('Para revisar en esta guía: ', 'To review in this guide: ') + links.join(' · ') + '</p>' : '') +
      '<div class="qc-mini"><h3 id="qc-mt">' + t('Le envío su mapa con una nota personal', 'I will send you your map with a personal note') + '</h3>' +
      '<form id="qcForm" novalidate><div class="qc-grid">' +
        '<div class="qc-f"><label for="qc-nombre">' + t('Nombre', 'Name') + '</label><input id="qc-nombre" type="text" autocomplete="name" required></div>' +
        '<div class="qc-f" id="qc-tel-wrap"><label for="qc-tel">' + t('Teléfono o WhatsApp', 'Phone or WhatsApp') + '</label><input id="qc-tel" type="tel" inputmode="tel" autocomplete="tel"></div>' +
        '<div class="qc-f" id="qc-mail-wrap" hidden><label for="qc-email">' + t('Correo electrónico', 'Email') + '</label><input id="qc-email" type="email" autocomplete="email"></div>' +
      '</div><button class="qc-swap" type="button" id="qc-swap">' + t('o correo', 'or email') + '</button>' +
      '<button class="btn btn-oro qc-send" type="submit" id="qc-send">' + t('Enviarme mi mapa', 'Send me my map') + '</button>' +
      '<p class="qc-err" id="qc-err" role="alert"></p>' +
      '<p class="qc-line">' + t('Sin costo y sin compromiso. Uso educativo; no es asesoría de seguros.', 'No cost, no obligation. Educational use; not insurance advice.') + '</p></form>' +
      '<p class="qc-done" id="qc-done" role="status" tabindex="-1" hidden>' + t('Listo. Le escribo hoy mismo.', 'Done. I will write to you today.') + '</p></div>';
    step.hidden = true; res.hidden = false;
    dl({ event: 'quiz_complete', quiz_id: 'umbrella_4', quiz_score: st.pct, quiz_gaps: st.blank.length });
    wire(st);
    try { res.querySelector('.qc-title').setAttribute('tabindex', '-1'); res.querySelector('.qc-title').focus(); } catch (x) {}
  }

  function wire(st) {
    var F = $('qcForm'), err = $('qc-err'), btn = $('qc-send'), sw = $('qc-swap'), mode = 'tel', busy = false;
    sw.addEventListener('click', function () {
      mode = mode === 'tel' ? 'email' : 'tel'; $('qc-tel-wrap').hidden = mode !== 'tel'; $('qc-mail-wrap').hidden = mode !== 'email';
      sw.textContent = mode === 'tel' ? t('o correo', 'or email') : t('o teléfono', 'or phone'); err.style.display = 'none';
      try { $(mode === 'tel' ? 'qc-tel' : 'qc-email').focus(); } catch (x) {}
    });
    function say(es, en) { err.textContent = t(es, en); err.style.display = 'block'; }
    F.addEventListener('submit', function (ev) {
      ev.preventDefault(); if (busy) return;
      var n = $('qc-nombre').value.trim(), tel = mode === 'tel' ? $('qc-tel').value.trim() : '', e = mode === 'email' ? $('qc-email').value.trim() : '';
      if (!n) { say('Escriba su nombre, por favor.', 'Please type your name.'); $('qc-nombre').focus(); return; }
      if (!tel && !e) { say('Escriba su teléfono o su correo, por favor.', 'Please type your phone or your email.'); $(mode === 'tel' ? 'qc-tel' : 'qc-email').focus(); return; }
      if (tel && tel.replace(/\D/g, '').length < 7) { say('Revise su teléfono, por favor.', 'Please check your phone number.'); $('qc-tel').focus(); return; }
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { say('Revise su correo, por favor.', 'Please check your email.'); $('qc-email').focus(); return; }
      err.style.display = 'none';
      // the guide form's hidden fields (topic, language, ad source, landing page), filled when the page loaded
      var G = $('gForm'), p = new URLSearchParams();
      ['form-name', 'tema', 'idioma', 'idioma_sitio', 'origen', 'campana', 'termino', 'gclid', 'pagina_entrada'].forEach(function (k) { var el = G && G.elements[k]; p.set(k, el ? el.value : ''); });
      if (!p.get('form-name')) p.set('form-name', 'contacto');
      var b = BAND[st.band];
      p.set('form_id', 'mini'); p.set('nombre', n); p.set('telefono', tel); p.set('email', e);
      p.set('autoevaluacion_puntaje', st.pct + '% (umbrella, 4/4)');
      p.set('autoevaluacion_respuestas', picks.map(function (v, i) { return 'U' + (i + 1) + ' · ' + DOM[Q[i].d] + '\n' + Q[i].es + '\n→ ' + ANS[String(v)][0]; }).join('\n\n'));
      p.set('autoevaluacion_zonas_en_blanco', st.blank.map(function (i) { return DOM[Q[i].d]; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ') || 'Ninguna');
      p.set('nivel_conciencia', b.es[0]); p.set('bot-field', '');
      busy = true; btn.disabled = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p.toString() }).then(function (r) {
        if (!r || !r.ok) throw new Error('send');
        dl({ event: 'generate_lead', lead_source: 'umbrella_quick_check', form_id: 'mini', lang: L, awareness_level: st.band, blank_count: st.blank.length, quiz_score: p.get('autoevaluacion_puntaje') });
        F.hidden = true; $('qc-mt').hidden = true; $('qc-done').hidden = false;
        // the guide's long form collapses: the visitor already reached me
        if (G && !$('formDone')) { G.hidden = true; var d = document.createElement('p'); d.id = 'formDone'; d.className = 'form-done'; d.setAttribute('role', 'status');
          d.textContent = t('Listo. Le escribo hoy mismo.', 'Done. I will write to you today.'); G.parentNode.insertBefore(d, G); }
        try { $('qc-done').focus(); } catch (x) {}
      }).catch(function () {
        busy = false; btn.disabled = false;
        say('No pudimos enviarlo desde el sitio. Escríbame directamente: ', 'We could not send it from the site. Write to me directly: ');
        var m = document.createElement('a'); m.href = 'mailto:chrisrhandier96@gmail.com'; m.textContent = 'chrisrhandier96@gmail.com'; m.setAttribute('data-track', 'email'); err.appendChild(m);
      });
    });
  }
})();
