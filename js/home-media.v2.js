/* Home hero, laptops only: a silent looping video of the Miami waterfront at dusk (Google Flow, Veo 3.1), behind the hero text.
   It starts after the page has finished loading. Reduced-motion visitors get the still first frame; phones and data-saver get nothing extra.
   The layer is absolutely positioned behind the text, so nothing on the page moves. */
(function () {
  var h = document.querySelector('.hero'); if (!h || !window.matchMedia) return;
  if (!matchMedia('(min-width: 981px)').matches) return;
  var c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = document.createElement('style');
  st.textContent = '.hero-ph{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;opacity:0;transition:opacity 1.6s ease}' +
    '.hero-ph.on{opacity:1}.hero-ph video,.hero-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%}' +
    '.hero-ph::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(13,36,28,.97) 0%,rgba(13,36,28,.86) 42%,rgba(13,36,28,.5) 72%,rgba(13,36,28,.66) 100%),linear-gradient(0deg,rgba(13,36,28,1) 0%,rgba(13,36,28,0) 30%)}' +
    '.hero>.wrap{position:relative;z-index:1}';
  document.head.appendChild(st);
  var d = document.createElement('div'); d.className = 'hero-ph'; d.setAttribute('aria-hidden', 'true');
  var P = '/img/ph/hero-miami-dusk';
  d.innerHTML = still
    ? '<picture><source type="image/avif" srcset="' + P + '.avif"><img src="' + P + '.webp" alt="" width="1280" height="720" decoding="async"></picture>'
    : '<video muted loop playsinline autoplay preload="auto" poster="' + P + '.webp" width="1280" height="720" disablepictureinpicture><source src="' + P + '.mp4" type="video/mp4"></video>';
  var go = function () {
    h.insertBefore(d, h.firstChild);
    var m = d.querySelector('video, img'), on = function () { d.className = 'hero-ph on'; };
    if (m.tagName === 'VIDEO') {
      m.muted = true; m.addEventListener('playing', on, { once: true });
      var p = m.play(); if (p && p.catch) p.catch(function () { on(); });
      /* pause when the hero is off screen so the loop does not run in the background */
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var q = m.play(); if (q && q.catch) q.catch(function () {}); } else m.pause(); }); }).observe(h);
    } else if (m.complete) on(); else m.addEventListener('load', on);
  };
  if (document.readyState === 'complete') setTimeout(go, 300); else window.addEventListener('load', function () { setTimeout(go, 300); });
})();
