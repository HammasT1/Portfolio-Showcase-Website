/* ==========================================================================
   Magnetic buttons — elements marked [data-magnetic] gently pull toward
   the cursor within a radius, and spring back on leave. Uses GSAP's
   quickTo for a performant, interruptible tween chain rather than
   fighting a new tween on every mousemove.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  /**
   * Binds the magnetic pull effect to every [data-magnetic] element inside
   * `scope` (defaults to the whole document). Pass a specific container
   * (e.g. the project detail overlay) when binding elements injected into
   * the DOM after the initial page load, so already-bound elements never
   * get a second, duplicate set of listeners.
   */
  function init(scope) {
    if (App.utils.isTouchDevice() || typeof gsap === 'undefined') return;

    const strength = 0.4;
    const root = scope || document;
    const els = root.querySelectorAll('[data-magnetic]');

    els.forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

      el.addEventListener('mouseenter', () => {
        document.dispatchEvent(new CustomEvent('cursor:magnetic-enter'));
      });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        xTo(relX * strength);
        yTo(relY * strength);
      });

      el.addEventListener('mouseleave', () => {
        xTo(0);
        yTo(0);
        document.dispatchEvent(new CustomEvent('cursor:magnetic-leave'));
      });
    });
  }

  App.initMagnetic = init;
})();
