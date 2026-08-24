/* ==========================================================================
   Custom cursor — three layers with progressively more lag for real
   depth: a dot that tracks the pointer 1:1, a ring that trails behind it
   with lerp-based easing, and a soft blurred glow trailing furthest
   behind of all. Swaps state classes when hovering interactive elements.
   Skipped entirely on touch/coarse-pointer devices.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function init() {
    if (App.utils.isTouchDevice()) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const glow = document.getElementById('cursor-glow');
    if (!dot || !ring) return;

    document.documentElement.classList.add('has-custom-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    const ringEase = 0.16;
    const glowEase = 0.07;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function tick() {
      ringX = App.utils.lerp(ringX, mouseX, ringEase);
      ringY = App.utils.lerp(ringY, mouseY, ringEase);
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      if (glow) {
        glowX = App.utils.lerp(glowX, mouseX, glowEase);
        glowY = App.utils.lerp(glowY, mouseY, glowEase);
        glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Generic interactive elements
    const hoverTargets = document.querySelectorAll('a, button, [data-cursor-hover]');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('is-hover');
        if (glow) glow.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-hover');
        if (glow) glow.classList.remove('is-hover');
      });
    });

    // "View" state for project cards — handled separately so it can
    // override the generic hover state with a bigger, filled ring.
    document.addEventListener('cursor:view-enter', () => ring.classList.add('is-view'));
    document.addEventListener('cursor:view-leave', () => ring.classList.remove('is-view'));

    document.addEventListener('cursor:magnetic-enter', () => ring.classList.add('is-magnetic'));
    document.addEventListener('cursor:magnetic-leave', () => ring.classList.remove('is-magnetic'));

    // Hide cursor visuals when it leaves the viewport
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      if (glow) glow.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      if (glow) glow.style.opacity = '';
    });
  }

  App.initCursor = init;
})();
