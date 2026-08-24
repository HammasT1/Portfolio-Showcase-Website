/* ==========================================================================
   Preloader — plays once per browser session (sessionStorage flag).
   On repeat visits within the same session it's skipped entirely so it
   never annoys a returning visitor. Dispatches `preloaderdone` on
   `document` when finished (or immediately, if skipped) so other modules
   can key their entrance animations off a single, reliable signal.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  const STORAGE_KEY = 'mhr_preloader_shown';
  const el = document.getElementById('preloader');
  const counterEl = document.getElementById('preloader-counter');
  const barEl = document.getElementById('preloader-bar');

  App.preloaderDone = false;

  // `App.preloaderDone` is the source of truth main.js checks — it can
  // run its DOMContentLoaded handler either before or after this fires,
  // so the flag covers the synchronous "already shown" path while the
  // `preloaderdone` event covers the later, animated one.
  function finish() {
    App.preloaderDone = true;
    document.dispatchEvent(new CustomEvent('preloaderdone'));
  }

  function skip() {
    if (el) el.style.display = 'none';
    document.body.style.visibility = 'visible';
    finish();
  }

  const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
  const reducedMotion = App.utils.prefersReducedMotion();

  if (!el || alreadyShown) {
    skip();
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, '1');
  document.body.style.visibility = 'visible';

  if (reducedMotion || typeof gsap === 'undefined') {
    el.style.display = 'none';
    finish();
    return;
  }

  const counter = { value: 0 };

  const tl = gsap.timeline({
    onComplete: () => {
      el.style.display = 'none';
      finish();
    },
  });

  tl.to(counter, {
    value: 100,
    duration: 1.3,
    ease: 'power2.inOut',
    onUpdate: () => {
      const v = Math.round(counter.value);
      counterEl.textContent = `${v}%`;
      barEl.style.width = `${v}%`;
    },
  })
    .to(
      '.preloader__mark, .preloader__counter, .preloader__bar-track',
      { opacity: 0, y: -16, duration: 0.4, ease: 'power2.in' },
      '+=0.1'
    )
    .to(
      el,
      {
        yPercent: -100,
        duration: 0.9,
        ease: 'expo.inOut',
      },
      '-=0.15'
    );
})();
