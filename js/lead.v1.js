/* Short form on the self-check result (work order 2026-10-08, the lead path).
   Name + phone/WhatsApp (or email). Posts to the same Netlify form "contacto" as the long form, with the
   same hidden fields plus form_id=mini, and pushes one generate_lead. Nothing is sent until the button is tapped.
   Loaded with defer from both homepages, after their inline script (it uses sendLead, quizPayload, awareness,
   qStats, telOk, mailOk, finished and lang from there). Kept out of the HTML so the page stays inside the
   phone speed budget. The file is cached as immutable: change the content, change the version in the name
   (lead.vN.js) and in both homepages. */
(function () {
  var slot = document.getElementById('miniSlot');
  if (!slot || typeof sendLead !== 'function' || typeof quizPayload !== 'function') return;
  var es = function () { return lang === 'es'; };
  var Q = function (x) { return x.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var T = function (sEs, sEn) { return 'data-es="' + Q(sEs) + '" data-en="' + Q(sEn) + '">' + (es() ? sEs : sEn); };

  var css = document.createElement('style');
  css.textContent =
    '.res-capture [hidden],.form-card [hidden]{display:none!important}' +
    '.rc-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}@media(max-width:560px){.rc-row{grid-template-columns:1fr}}' +
    '.rc-f label{display:block;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--oro-claro);margin-bottom:6px}' +
    '.rc-f input{width:100%;padding:12px 14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:var(--blanco);border-radius:2px;font-family:var(--body);font-size:16px}' +
    '.rc-f input:focus{outline:2px solid var(--oro);border-color:var(--oro)}' +
    '.result .res-capture .rc-err{display:none;font-size:13px;color:#F2B8B8;margin:10px 0 0;max-width:none}' +
    '.rc-go{display:block;width:100%}' +
    '.rc-swap{display:inline-block;background:none;border:0;padding:6px 0;margin:-4px 0 12px;color:var(--oro-claro);font:600 13.5px/1.2 var(--body);text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
    '.rc-swap:focus-visible{outline:2px solid var(--oro);outline-offset:3px}' +
    '.res-capture .rc-line{font-size:12.5px;color:#C9D6CC;margin:10px 0 0;max-width:none}' +
    '.res-capture .rc-done{font-family:var(--display);font-size:21px;line-height:1.3;color:var(--blanco);margin:4px 0 0;max-width:none}' +
    '.form-card .form-done{font-family:var(--display);font-size:22px;color:var(--verde);margin:0}';
  document.head.appendChild(css);

  slot.innerHTML =
    '<form id="miniForm" novalidate>' +
      '<div class="rc-row">' +
        '<div class="rc-f"><label for="m-nombre" ' + T('Nombre', 'Name') + '</label><input id="m-nombre" type="text" autocomplete="name" required></div>' +
        '<div class="rc-f" id="m-tel-wrap"><label for="m-tel" ' + T('Teléfono o WhatsApp', 'Phone or WhatsApp') + '</label><input id="m-tel" type="tel" inputmode="tel" autocomplete="tel"></div>' +
        '<div class="rc-f" id="m-mail-wrap" hidden><label for="m-email" ' + T('Correo electrónico', 'Email') + '</label><input id="m-email" type="email" autocomplete="email"></div>' +
      '</div>' +
      '<button class="rc-swap" type="button" id="m-swap" ' + T('o correo', 'or email') + '</button>' +
      '<button class="btn btn-oro rc-go" type="submit" id="m-send" ' + T('Enviarme mi mapa', 'Send me my map') + '</button>' +
      '<p class="rc-err" id="m-err" role="alert"></p>' +
      '<p class="rc-line" ' + T('Sin costo y sin compromiso. Uso educativo; no es asesoría de seguros.', 'No cost, no obligation. Educational use; not insurance advice.') + '</p>' +
    '</form>' +
    '<p class="rc-done" id="miniDone" role="status" tabindex="-1" hidden ' + T('Listo. Le escribo hoy mismo.', 'Done. I will write to you today.') + '</p>';

  var $ = function (i) { return document.getElementById(i); };
  var F = $('miniForm'), tw = $('m-tel-wrap'), mw = $('m-mail-wrap'), sw = $('m-swap'), err = $('m-err'), btn = $('m-send');
  var mode = 'tel', busy = false;
  var SW = { tel: ['o correo', 'or email'], email: ['o teléfono', 'or phone'] };
  function setSwap() { sw.setAttribute('data-es', SW[mode][0]); sw.setAttribute('data-en', SW[mode][1]); sw.textContent = SW[mode][es() ? 0 : 1]; }
  sw.addEventListener('click', function () {
    mode = mode === 'tel' ? 'email' : 'tel'; tw.hidden = mode !== 'tel'; mw.hidden = mode !== 'email'; setSwap(); err.style.display = 'none';
    try { (mode === 'tel' ? $('m-tel') : $('m-email')).focus(); } catch (x) {}
  });
  function say(sEs, sEn) { err.textContent = es() ? sEs : sEn; err.style.display = 'block'; }

  F.addEventListener('submit', function (ev) {
    ev.preventDefault(); if (busy) return;
    var n = $('m-nombre').value.trim(), t = mode === 'tel' ? $('m-tel').value.trim() : '', e = mode === 'email' ? $('m-email').value.trim() : '';
    if (!n) { say('Escriba su nombre, por favor.', 'Please type your name.'); $('m-nombre').focus(); return; }
    if (!t && !e) { say('Escriba su teléfono o su correo, por favor.', 'Please type your phone or your email.'); (mode === 'tel' ? $('m-tel') : $('m-email')).focus(); return; }
    if (t && !telOk(t)) { say('Revise su teléfono, por favor.', 'Please check your phone number.'); $('m-tel').focus(); return; }
    if (e && !mailOk(e)) { say('Revise su correo, por favor.', 'Please check your email.'); $('m-email').focus(); return; }
    err.style.display = 'none';
    // the same hidden fields as the long form (ad source, landing page), filled when the page loaded
    var L = $('ppForm'), p = new URLSearchParams();
    ['form-name', 'origen', 'campana', 'termino', 'gclid', 'pagina_entrada'].forEach(function (k) { var el = L && L.elements[k]; p.set(k, el ? el.value : ''); });
    var qp = quizPayload(), lv = awareness(), st = qStats();
    p.set('idioma_sitio', lang); p.set('form_id', 'mini'); p.set('nombre', n); p.set('telefono', t); p.set('email', e);
    p.set('idioma', es() ? 'Español' : 'English'); p.set('tema', 'Revisión de mi autoevaluación');
    p.set('autoevaluacion_puntaje', qp ? qp.score : ''); p.set('autoevaluacion_respuestas', qp ? qp.answers : '');
    p.set('autoevaluacion_zonas_en_blanco', qp ? qp.gaps : ''); p.set('nivel_conciencia', lv.es); p.set('bot-field', '');
    busy = true; btn.disabled = true;
    sendLead(p, 'formulario_corto_mapa', function () {
      busy = false; btn.disabled = false;
      say('No pudimos enviarlo desde el sitio. Escríbame directamente: ', 'We could not send it from the site. Write to me directly: ');
      var P = window.PP || {};
      if (P.CONTACT_EMAIL) { var m = document.createElement('a'); m.href = 'mailto:' + P.CONTACT_EMAIL; m.textContent = P.CONTACT_EMAIL; m.setAttribute('data-track', 'email'); m.style.color = 'var(--oro-claro)'; err.appendChild(m); }
    }, { push: { form_id: 'mini', lang: lang, awareness_level: lv.key, blank_count: finished ? st.weak.length : null }, onOk: function () {
      F.hidden = true; $('miniT').hidden = true; $('miniDone').hidden = false; $('rcGo').hidden = true;
      var nt = document.querySelector('#resCapture .rc-note'); if (nt) nt.hidden = true;
      // the long form collapses: the visitor already reached me
      if (L && !$('formDone')) {
        L.hidden = true;
        var d = document.createElement('p'); d.id = 'formDone'; d.className = 'form-done'; d.setAttribute('role', 'status');
        d.setAttribute('data-es', 'Listo. Le escribo hoy mismo.'); d.setAttribute('data-en', 'Done. I will write to you today.');
        d.textContent = es() ? 'Listo. Le escribo hoy mismo.' : 'Done. I will write to you today.'; L.parentNode.insertBefore(d, L);
      }
      try { $('miniDone').focus(); } catch (x) {}
    } });
  });
})();
