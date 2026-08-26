/* ==========================================================================
   Entry point — orchestrates init order across every module. Split into
   two phases:
     1. initEarly    — cursor, magnetic, nav, hero canvas, content render.
                        Safe to run the instant the DOM is parsed.
     2. initAfterPreload — scroll-triggered / text-split animations, which
                        need final layout (fonts settled, preloader gone)
                        to measure correctly, plus it re-enables scrolling.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function registerPlugins() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  function applyReducedMotionClass() {
    if (App.utils.prefersReducedMotion()) {
      document.documentElement.classList.add('reduced-motion');
    }
  }

  function initEarly() {
    registerPlugins();
    applyReducedMotionClass();

    App.initSmoothScroll();
    App.initCursor();
    App.initAmbientGlow();
    App.initMagnetic();
    App.initNav();
    App.initFooter();
    App.initHeroCanvas();
    App.initSkills();
    App.initProjects();

    // Scroll stays locked until the preloader hands off, whether that
    // handoff already happened (see the flag check below) or is still
    // to come.
    document.body.classList.add('no-scroll');
    if (App.stopScroll) App.stopScroll();

    if (App.preloaderDone) {
      initAfterPreload();
    } else {
      document.addEventListener('preloaderdone', initAfterPreload, { once: true });
    }
  }

  function initAfterPreload() {
    document.body.classList.remove('no-scroll');
    if (App.startScroll) App.startScroll();

    App.initTextAnimations();
    App.initScrollAnimations();
    App.initTimeline();
    App.initContactForm();
    App.initSectionBlobs();

    // Fonts/preloader exit can shift layout right up until this point;
    // give ScrollTrigger one fresh measurement pass once things settle.
    if (typeof ScrollTrigger !== 'undefined') {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  // preloader.js may run its `finish()` synchronously (already-shown /
  // reduced-motion skip path) before this script has even registered a
  // listener — `App.preloaderDone` is the source of truth `initEarly`
  // checks directly; the `preloaderdone` event only covers the case
  // where the preloader's exit animation finishes later, asynchronously.
  document.addEventListener('DOMContentLoaded', initEarly);

  const refreshScrollTrigger = App.utils.debounce(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 200);

  window.addEventListener('load', refreshScrollTrigger);
  window.addEventListener('resize', refreshScrollTrigger);
})();
