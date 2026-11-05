/* Interactive 3D scenes (2026-11): the Unreal illustrations on the guides. The markup is static (tools/post/add-scenes.js writes it with fixed 16:9 boxes, so nothing shifts);
   this script only wires the controls:
   - slider / tabs: swap the frame. The next image is decoded before it replaces the current one (no flash).
   - layers (condo): toggle transparent tint overlays.
   - hotspots (umbrella): numbered pins on the image, linked to the numbered notes under it.
   Frames are preloaded once the scene is near the viewport, at the size and format the browser already chose.
   One dataLayer event per scene per page view (scene_interact) so the GTM container can count use.
   Loaded with defer. Cached as immutable: change the file name when the content changes.
   v2 (2026-11-03) is v1 unchanged under a new name: a request made before the v1 deploy finished left a 404 for
   /js/scenes.v1.js in the Cloudflare cache under the one-year immutable header. Never fetch a new /js/ URL on the
   live domain before its deploy is live.
   v3 (2026-11-04, work order): pins (with their notes) can sit in any kind of scene, not only hotspots: the
   collections slider has pins on the case, the wall and the safe. A pin or note with data-frame shows only while that
   frame is on screen (household staff: the figures' pins belong to the "who is on the property" tab). */
(function () {
  'use strict';
  var figs = document.querySelectorAll('figure.scn[data-scene]');
  if (!figs.length) return;

  function chosen(img) {
    // which width and format did the browser pick for the first frame? reuse it for every frame
    var u = img.currentSrc || img.src || '';
    var m = u.match(/-(480|960|1600)\.(avif|webp)(\?|$)/);
    return m ? { w: m[1], f: m[2] } : { w: '960', f: 'webp' };
  }
  function srcset(base, f) {
    return base + '-480.' + f + ' 480w, ' + base + '-960.' + f + ' 960w, ' + base + '-1600.' + f + ' 1600w';
  }

  Array.prototype.forEach.call(figs, function (fig) {
    var key = fig.getAttribute('data-scene');
    var kind = fig.getAttribute('data-kind');
    var dir = '/img/scenes/' + key + '/';
    var frames = JSON.parse(fig.getAttribute('data-frames') || '[]');
    var labels = JSON.parse(fig.getAttribute('data-labels') || '[]');
    var altTpl = fig.getAttribute('data-alt') || '';
    var pic = fig.querySelector('.scn-stage picture');
    var img = pic && pic.querySelector('img');
    var src = pic && pic.querySelector('source[type="image/avif"]');
    var out = fig.querySelector('.scn-out');
    var cur = 0, busy = 0, told = false;

    function tell() {
      if (told) return; told = true;
      try { (window.dataLayer = window.dataLayer || []).push({ event: 'scene_interact', scene: key }); } catch (e) {}
    }

    function show(i) {
      if (!img || i === cur || i < 0 || i >= frames.length) return;
      var base = dir + frames[i];
      var c = chosen(img);
      var token = ++busy;
      var pre = new Image();
      pre.src = base + '-' + c.w + '.' + c.f;
      var swap = function () {
        if (token !== busy) return;            // a newer request won
        framePins(i);
        if (src) src.srcset = srcset(base, 'avif');
        img.srcset = srcset(base, 'webp');
        img.src = base + '-960.webp';
        img.alt = altTpl.replace('{label}', labels[i] || '');
        cur = i;
      };
      if (pre.decode) pre.decode().then(swap, swap); else pre.onload = pre.onerror = swap;
      if (out) out.textContent = labels[i] || '';
    }

    function preload() {
      if (!img) return;
      var c = chosen(img);
      frames.forEach(function (n, i) { if (i) { var p = new Image(); p.src = dir + n + '-' + c.w + '.' + c.f; } });
      Array.prototype.forEach.call(fig.querySelectorAll('img.scn-layer[data-src]'), function (l) {
        l.src = l.getAttribute('data-src'); l.removeAttribute('data-src');
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); preload(); }
      }, { rootMargin: '600px 0px' });
      io.observe(fig);
    } else preload();

    if (kind === 'slider') {
      var r = fig.querySelector('input.scn-range');
      if (r) r.addEventListener('input', function () {
        var i = +r.value; r.setAttribute('aria-valuetext', labels[i] || ''); show(i); tell();
      });
    }

    if (kind === 'tabs') {
      var tabs = fig.querySelectorAll('.scn-tab');
      Array.prototype.forEach.call(tabs, function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-i');
          Array.prototype.forEach.call(tabs, function (t) { t.setAttribute('aria-pressed', t === b ? 'true' : 'false'); });
          show(i); tell();
        });
      });
    }

    if (kind === 'layers') {
      Array.prototype.forEach.call(fig.querySelectorAll('.scn-lbtn'), function (b) {
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') !== 'true';
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          var l = fig.querySelector('img.scn-layer[data-layer="' + b.getAttribute('data-layer') + '"]');
          if (l) {
            if (l.hasAttribute('data-src')) { l.src = l.getAttribute('data-src'); l.removeAttribute('data-src'); }
            l.classList.toggle('on', on);
          }
          tell();
        });
      });
    }

    var pins = fig.querySelectorAll('.scn-pin');
    function framePins(i) {   // pins and notes that belong to one frame show only with it
      Array.prototype.forEach.call(fig.querySelectorAll('.scn-pin[data-frame], .scn-notes li[data-frame]'), function (el) {
        el.hidden = +el.getAttribute('data-frame') !== i;
      });
    }
    if (pins.length) {
      var notes = fig.querySelectorAll('.scn-notes li');
      var pick = function (id) {
        Array.prototype.forEach.call(pins, function (p) { p.setAttribute('aria-pressed', p.getAttribute('data-id') === id ? 'true' : 'false'); });
        Array.prototype.forEach.call(notes, function (n) { n.classList.toggle('on', n.getAttribute('data-id') === id); });
        tell();
      };
      Array.prototype.forEach.call(pins, function (p) {
        p.addEventListener('click', function () { pick(p.getAttribute('data-id')); });
      });
      Array.prototype.forEach.call(notes, function (n) {
        n.addEventListener('click', function () { pick(n.getAttribute('data-id')); });
      });
    }
  });
})();
