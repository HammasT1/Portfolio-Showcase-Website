/* ==========================================================================
   Image fade-in — tags every <img> under a given root with `.img-fade`
   (opacity: 0 until loaded, see base.css) and reveals it once it actually
   finishes loading, instead of letting it pop in abruptly the instant the
   bytes arrive. Called once for the initial page content and again after
   projects.js injects the case-study detail markup, since those images
   don't exist yet at the first call.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function reveal(img) {
    img.classList.add('is-loaded');
  }

  function bind(img) {
    img.classList.add('img-fade');

    // Already cached/decoded by the time this runs (common for images
    // near the top of the page) — 'load' would never fire again, so
    // reveal immediately rather than leaving it stuck at opacity: 0.
    if (img.complete && img.naturalWidth > 0) {
      reveal(img);
      return;
    }

    img.addEventListener('load', () => reveal(img), { once: true });
    // A broken image (bad src, offline) should still show its alt text /
    // broken-image icon rather than staying invisible forever.
    img.addEventListener('error', () => reveal(img), { once: true });
  }

  App.initImageFade = (root) => {
    (root || document).querySelectorAll('img').forEach(bind);
  };
})();
