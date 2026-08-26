/* ==========================================================================
   Ambient background blobs for the mid-page sections (About/Skills/
   Experience/Education) — same slow-drift idea as contact-form.js's
   `animateBlobs`, generalized across every `.ambient-blob` in the
   document rather than two hardcoded selectors, since there's now one
   per section instead of just in Contact.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || App.utils.prefersReducedMotion()) return;

    document.querySelectorAll('.ambient-blob').forEach((blob, i) => {
      const dx = 40 + Math.random() * 60;
      const dy = 30 + Math.random() * 50;
      const duration = 10 + Math.random() * 6;

      gsap.to(blob, {
        x: i % 2 === 0 ? dx : -dx,
        y: i % 2 === 0 ? -dy : dy,
        duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });
    });
  }

  App.initSectionBlobs = init;
})();
