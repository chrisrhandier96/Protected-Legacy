/* Guide explainers (Remotion renders in /img/vid/): load and play only while on screen; reduced motion keeps the poster. */
(function(){var v=[].slice.call(document.querySelectorAll('video.vexp-v'));if(!v.length)return;
var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(still||!('IntersectionObserver' in window))return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){var el=e.target;if(e.isIntersecting){if(el.preload!=='auto'){el.preload='auto';el.load();}var p=el.play();if(p&&p.catch)p.catch(function(){});}else{el.pause();}});},{rootMargin:'120px 0px',threshold:.35});
v.forEach(function(el){io.observe(el);});})();
