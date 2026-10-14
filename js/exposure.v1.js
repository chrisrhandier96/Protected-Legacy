/* Flood and homes/hurricanes guides: illustrative hurricane deductible and building flood coverage calculator.
   Markup is rendered by tools/build_library.py with the guides' own example as defaults ($2,000,000, 5%, NFIP $250,000). */
(function () {
  var c = document.getElementById('calc'); if (!c) return;
  var L = document.getElementById('calc-l'), D = document.getElementById('calc-d'), F = document.getElementById('calc-f'),
      lv = document.getElementById('calc-lv'), o1 = document.getElementById('calc-o1'), o2 = document.getElementById('calc-o2'),
      go = document.getElementById('calc-go'), sent = false;
  var fmt = function (n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  var val = function () {
    var l = +L.value, d = +D.value, f = F.value === 'full' ? l : +F.value;
    return { l: l, d: d, f: f, ded: l * d / 100, gap: Math.max(0, l - f) };
  };
  var draw = function () { var v = val(); lv.textContent = fmt(v.l); o1.textContent = fmt(v.ded); o2.textContent = fmt(v.gap); };
  var push = function () {
    if (sent) return; sent = true; var v = val();
    try { window.dataLayer = window.dataLayer || []; dataLayer.push({ event: 'calculator_interacted', calc_id: 'exposure', home_value: v.l, deductible_pct: v.d, flood_cover: v.f, page_path: location.pathname, language: document.documentElement.lang }); } catch (e) {}
  };
  [L, D, F].forEach(function (x) { x.addEventListener('input', function () { draw(); push(); }); x.addEventListener('change', function () { draw(); push(); }); });
  /* the review button carries the numbers into the guide form's message box, only if the visitor has not typed there yet */
  go.addEventListener('click', function () {
    var m = document.getElementById('gf-msg'), v = val(); if (!m || m.value.trim()) return;
    m.value = (c.getAttribute('data-msg') || '').replace('{L}', fmt(v.l)).replace('{D}', v.d + '%').replace('{F}', fmt(v.f));
  });
  draw();
})();
