/* Home hero, laptops only: a slow cinematic drift over the family-estate photo (Gemini Argon image, img/ph/).
   Phones, data-saver and reduced-motion visitors get nothing extra; the photo sits behind the hero text, so no layout shift. */
(function () {
  var h = document.querySelector('.hero'); if (!h || !window.matchMedia) return;
  if (!matchMedia('(min-width: 981px)').matches) return;
  var c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = document.createElement('style');
  st.textContent = '.hero-ph{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;opacity:0;transition:opacity 1.6s ease}' +
    '.hero-ph.on{opacity:1}.hero-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:60% 50%;transform:scale(1.06)}' +
    '.hero-ph::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(13,36,28,.97) 0%,rgba(13,36,28,.86) 42%,rgba(13,36,28,.55) 72%,rgba(13,36,28,.72) 100%),linear-gradient(0deg,rgba(13,36,28,1) 0%,rgba(13,36,28,0) 30%)}' +
    '.hero>.wrap{position:relative;z-index:1}' +
    (still ? '' : '.hero-ph.on img{animation:ppDrift 30s ease-in-out infinite alternate}@keyframes ppDrift{from{transform:scale(1.06) translate3d(0,0,0)}to{transform:scale(1.16) translate3d(-2.5%,-1.5%,0)}}');
  document.head.appendChild(st);
  var d = document.createElement('div'); d.className = 'hero-ph'; d.setAttribute('aria-hidden', 'true');
  d.innerHTML = '<picture><source type="image/avif" srcset="/img/ph/family-estate-1600.avif"><img src="/img/ph/family-estate-1600.webp" alt="" width="1600" height="900" decoding="async"></picture>';
  var go = function () {
    h.insertBefore(d, h.firstChild);
    var img = d.querySelector('img'), on = function () { d.className = 'hero-ph on'; };
    if (img.complete) on(); else img.addEventListener('load', on);
  };
  /* wait until the page has finished loading so the photo never competes with the first paint */
  if (document.readyState === 'complete') setTimeout(go, 300); else window.addEventListener('load', function () { setTimeout(go, 300); });
})();
