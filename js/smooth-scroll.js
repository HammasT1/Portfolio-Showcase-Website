/* ==========================================================================
   Smooth scroll — Lenis, wired into GSAP's ticker so ScrollTrigger and
   Lenis stay perfectly in sync (no double rAF loops fighting each other).
   Skipped on touch devices (native momentum scroll is already good there
   and fighting it causes jank) and under reduced-motion.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  let lenis = null;

  function init() {
    const skip =
      App.utils.prefersReducedMotion() ||
      App.utils.isTouchDevice() ||
      typeof Lenis === 'undefined';

    if (skip) {
      App.lenis = null;
      return;
    }

    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    });

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // Anchor links (nav, footer, CTAs) should scroll smoothly through Lenis
    // rather than the browser's native jump.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId.length <= 1) return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -20, duration: 1.4 });
      });
    });

    App.lenis = lenis;
  }

  App.stopScroll = () => lenis && lenis.stop();
  App.startScroll = () => lenis && lenis.start();
  App.initSmoothScroll = init;
})();
