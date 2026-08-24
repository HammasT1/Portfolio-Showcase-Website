/* ==========================================================================
   Footer — infinite marquee strip (GSAP, seamless loop via a duplicated
   track translated by -50%) and the scramble-text hover on footer links.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function initMarquee() {
    const track = document.getElementById('footer-marquee-track');
    if (!track) return;

    if (App.utils.prefersReducedMotion() || typeof gsap === 'undefined') {
      // Static content reads oddly with the duplicated half still visible
      // (it exists purely so the animated loop has no seam) — trim it.
      const children = Array.from(track.children);
      children.slice(children.length / 2).forEach((el) => el.remove());
      return;
    }

    gsap.to(track, {
      xPercent: -50,
      duration: 22,
      ease: 'none',
      repeat: -1,
    });
  }

  App.initFooter = () => {
    initMarquee();
    if (App.bindScrambleHover) App.bindScrambleHover('.footer-links a');
  };
})();
