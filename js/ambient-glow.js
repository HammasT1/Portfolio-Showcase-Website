/* ==========================================================================
   Sitewide ambient glow — drives the --mx/--my custom properties that
   base.css's `body` background-image (a radial-gradient) reads, so a soft
   light drifts toward the cursor everywhere on the page, not just in the
   hero. Deliberately slower/laggier than the custom cursor's own trailing
   glow (see cursor.css) — this is meant to read as atmosphere sitting
   behind the page, not another pointer-tracking accessory. Skipped on
   touch devices, small viewports, and under reduced motion, in which case
   the gradient just sits at its CSS fallback position (fixed, centered).
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function init() {
    if (App.utils.isTouchDevice() || App.utils.prefersReducedMotion() || App.utils.isMobileViewport()) {
      return;
    }

    const root = document.documentElement;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight * 0.35;
    let x = mouseX;
    let y = mouseY;
    const ease = 0.045;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function tick() {
      x = App.utils.lerp(x, mouseX, ease);
      y = App.utils.lerp(y, mouseY, ease);
      root.style.setProperty('--mx', `${x}px`);
      root.style.setProperty('--my', `${y}px`);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  App.initAmbientGlow = init;
})();
