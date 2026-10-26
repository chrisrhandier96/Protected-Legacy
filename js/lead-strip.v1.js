/* Lead strip (2026-10-26, the ad landing fix): a two-field "call me" card near the top of every guide and
   under the home hero, so a visitor who arrived from an ad can ask for a call without scrolling 20 screens.
   Name + phone/WhatsApp. Posts to the same Netlify form "contacto" as every other form on the site, with the
   same hidden attribution fields plus form_id=strip, and pushes one generate_lead (the GTM tag turns that into
   the Google Ads conversion). Nothing is sent until the button is tapped; the thank-you shows in place.
   Loaded with defer. Cached as immutable: change the content, change the version in the name (lead-strip.vN.js)
   and in tools/post/add-lead-strip.js. */
(function () {
  var slot = document.getElementById('leadStrip');
  if (!slot) return;
  var L = document.documentElement.lang === 'en' ? 'en' : 'es', ES = L === 'es';
  var t = function (es, en) { return ES ? es : en; };
  var Q = function (x) { return String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var dark = !!slot.closest('.hero');
  var key = (document.body.getAttribute('data-type') || 'page');
  var gf = document.getElementById('gForm');
  var tema = (gf && gf.querySelector('input[name="tema"]') || {}).value || t('Conversación', 'Conversation');
  var pp = function (k) { try { return sessionStorage.getItem('pp.' + k) || ''; } catch (x) { return ''; } };
  var PHONE = '(786) 671-2171', TEL = 'tel:+17866712171';

  var css = document.createElement('style');
  css.textContent =
    '.lstrip{position:relative;order:-2;margin:0 0 24px;padding:18px 18px 14px;border-radius:3px;background:var(--blanco,#fff);border:1px solid var(--arena-oscura,#E6DCC6);border-left:3px solid var(--oro,#C29B40)}' +
    '.lstrip.dark{margin:-28px 0 56px;background:rgba(13,36,28,.55);border:1px solid rgba(217,188,114,.35);border-left:3px solid var(--oro,#C29B40);backdrop-filter:blur(6px)}' +
    '.lstrip [hidden]{display:none!important}' +
    '.ls-k{margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#7E5F17}.lstrip.dark .ls-k{color:var(--oro-claro,#D9BC72)}' +
    '.ls-t{margin:0 0 4px;font-family:var(--display,Georgia,serif);font-size:21px;line-height:1.25;color:var(--verde,#14352A);max-width:none}.lstrip.dark .ls-t{color:var(--blanco,#fff)}' +
    '.ls-p{margin:0 0 12px;font-size:14px;line-height:1.5;color:var(--tinta,#2B2B2B);max-width:none}.lstrip.dark .ls-p{color:#DCE5DD}' +
    '.ls-grid{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}@media(max-width:700px){.ls-grid{grid-template-columns:1fr}}' +
    '.ls-f label{display:block;font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--verde,#14352A);margin-bottom:5px}.lstrip.dark .ls-f label{color:var(--oro-claro,#D9BC72)}' +
    '.ls-f input{width:100%;min-height:46px;padding:10px 13px;border:1px solid var(--arena-oscura,#E6DCC6);border-radius:12px;background:var(--arena,#F5EFE3);color:var(--tinta,#2B2B2B);font:16px var(--body,system-ui,sans-serif)}' +
    '.lstrip.dark .ls-f input{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.25);color:var(--blanco,#fff);border-radius:2px}' +
    '.ls-f input:focus{outline:2px solid var(--oro,#C29B40);border-color:var(--oro,#C29B40)}' +
    '.ls-go{min-height:46px;padding:0 22px;white-space:nowrap;cursor:pointer}' +
    '.ls-alt{margin:10px 0 0;font-size:13.5px;line-height:1.5;color:var(--tinta,#2B2B2B)}.lstrip.dark .ls-alt{color:#DCE5DD}' +
    '.ls-alt a{color:var(--verde,#14352A);font-weight:600;text-decoration:underline;text-underline-offset:3px}.lstrip.dark .ls-alt a{color:var(--oro-claro,#D9BC72)}' +
    '.ls-line{margin:8px 0 0;font-size:12px;line-height:1.5;color:#5F665A}.lstrip.dark .ls-line{color:#C9D6CC}' +
    '.ls-err{display:none;margin:8px 0 0;font-size:13.5px;color:#9B1C1C}.lstrip.dark .ls-err{color:#F2B8B8}' +
    '.ls-done{margin:0;font-family:var(--display,Georgia,serif);font-size:20px;line-height:1.3;color:var(--verde,#14352A)}.lstrip.dark .ls-done{color:var(--blanco,#fff)}' +
    '.ls-done small{display:block;margin-top:6px;font-family:var(--body,system-ui,sans-serif);font-size:14px;color:inherit;opacity:.85}';
  document.head.appendChild(css);

  var id = 'ls-' + Math.random().toString(36).slice(2, 7);
  slot.className = ((slot.className || '') + ' lstrip no-print' + (dark ? ' dark' : '')).trim();
  slot.setAttribute('aria-live', 'polite');
  slot.innerHTML =
    '<p class="ls-k">' + t('Hablemos · respuesta hoy mismo', 'Let us talk · reply today') + '</p>' +
    '<p class="ls-t">' + t('¿Prefiere que lo llame? Déjeme su nombre y su teléfono.', 'Prefer a call? Leave your name and number.') + '</p>' +
    '<p class="ls-p">' + t('Una conversación de 20 minutos, sin costo y sin compromiso, con un agente licenciado en la Florida (Lic. W606240). En español o en inglés.', 'A 20-minute conversation, no cost and no obligation, with a licensed Florida agent (Lic. W606240). In English or Spanish.') + '</p>' +
    '<form class="ls-form" novalidate>' +
      '<div class="ls-grid">' +
        '<div class="ls-f"><label for="' + id + '-n">' + t('Nombre', 'Name') + '</label><input id="' + id + '-n" name="nombre" type="text" autocomplete="name" required></div>' +
        '<div class="ls-f"><label for="' + id + '-t">' + t('Teléfono o WhatsApp', 'Phone or WhatsApp') + '</label><input id="' + id + '-t" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required></div>' +
        '<button class="btn btn-oro ls-go" type="submit">' + t('Llámeme', 'Call me') + '</button>' +
      '</div>' +
      '<p class="ls-err" role="alert"></p>' +
      '<p class="ls-alt">' + t('O llame ahora al ', 'Or call now: ') + '<a href="' + TEL + '" data-track="llamada">' + PHONE + '</a></p>' +
      '<p class="ls-line">' + t('Al enviar, autoriza a Christian R. González a contactarlo por teléfono o WhatsApp. Sus datos no se comparten.', 'By sending, you authorize Christian R. González to contact you by phone or WhatsApp. Your details are not shared.') + '</p>' +
    '</form>';

  var form = slot.querySelector('form'), err = slot.querySelector('.ls-err'), go = slot.querySelector('.ls-go');
  var digits = function (s) { return (s || '').replace(/\D/g, ''); };
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    err.style.display = 'none';
    var n = form.nombre.value.trim(), p = form.telefono.value.trim();
    if (n.length < 2) { err.textContent = t('Escriba su nombre.', 'Please enter your name.'); err.style.display = 'block'; form.nombre.focus(); return; }
    if (digits(p).length < 10) { err.textContent = t('Escriba un teléfono con código de área, por ejemplo 305 555 0123.', 'Please enter a phone number with area code, for example 305 555 0123.'); err.style.display = 'block'; form.telefono.focus(); return; }
    var params = new URLSearchParams();
    params.set('form-name', 'contacto');
    params.set('form_id', 'strip');
    params.set('nombre', n);
    params.set('telefono', p);
    params.set('email', '');
    params.set('idioma', ES ? 'Español' : 'English');
    params.set('idioma_sitio', L);
    params.set('tema', tema);
    params.set('mensaje', t('Pide una llamada (franja superior)', 'Asks for a call (top strip)') + ' · ' + location.pathname);
    params.set('origen', pp('origen'));
    params.set('campana', pp('campana'));
    params.set('termino', pp('termino'));
    params.set('gclid', pp('gclid'));
    params.set('pagina_entrada', pp('landing') || location.pathname);
    var T = go.textContent;
    go.disabled = true; go.textContent = t('Enviando…', 'Sending…');
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() })
      .then(function (r) {
        if (!r || !r.ok) throw new Error('send');
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'generate_lead', lead_source: 'strip_' + key, form_id: 'strip', language: L, page_type: key, quiz_score: '' });
        } catch (x) {}
        slot.innerHTML = '<p class="ls-done">' + t('Gracias, ' + Q(n) + '. Lo llamo hoy mismo, en horario de Miami.', 'Thank you, ' + Q(n) + '. I will call you today, Miami time.') +
          '<small>' + t('Si prefiere adelantarse: ', 'If you would rather not wait: ') + '<a href="' + TEL + '" data-track="llamada" style="color:inherit">' + PHONE + '</a></small></p>';
      })
      .catch(function () {
        go.disabled = false; go.textContent = T;
        err.innerHTML = t('No se pudo enviar desde el sitio. Llame o escriba al ', 'We could not send it from the site. Call or text ') + '<a href="' + TEL + '" data-track="llamada">' + PHONE + '</a>.';
        err.style.display = 'block';
      });
  });

})();
