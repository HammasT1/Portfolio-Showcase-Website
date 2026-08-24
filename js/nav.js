/* ==========================================================================
   Header behavior — background/blur once scrolled, hides on scroll-down
   and reappears on scroll-up, the mobile nav toggle, and a text-scramble
   hover micro-interaction on the nav links + logo.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  /**
   * Binds the scramble-text hover effect to every link matched by
   * `selector`. Shared between nav.js and footer.js so both sets of
   * links get the same treatment without duplicating the wiring.
   */
  function bindScrambleHover(selector) {
    if (App.utils.isTouchDevice()) return;
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('mouseenter', () => App.utils.scrambleText(el));
    });
  }
  App.bindScrambleHover = bindScrambleHover;

  function init() {
    const header = document.getElementById('site-header');
    const toggle = document.getElementById('nav-toggle');
    const navList = document.getElementById('nav-list');
    if (!header) return;

    bindScrambleHover('.nav-list a');
    bindScrambleHover('.logo__text');

    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);

      if (y > lastY && y > 160) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (App.lenis) {
      App.lenis.on('scroll', onScroll);
    }

    if (toggle && navList) {
      toggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('is-open');
        toggle.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
      });

      navList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          navList.classList.remove('is-open');
          toggle.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        });
      });
    }
  }

  App.initNav = init;
})();
