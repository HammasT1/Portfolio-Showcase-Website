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

  /**
   * Highlights whichever nav link matches the section currently occupying
   * the vertical center of the viewport. Plain IntersectionObserver rather
   * than a ScrollTrigger per section — this needs to keep working even if
   * the GSAP/ScrollTrigger CDN scripts fail to load, same as the rest of
   * navigation. The shrunk rootMargin (-45% top/bottom) collapses the
   * observed viewport down to a thin band across the middle, so a section
   * only counts as "current" once it's actually centered rather than the
   * instant its top edge appears at the bottom of the screen.
   */
  function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const linkMap = new Map();
    navLinks.forEach((link) => {
      linkMap.set(link.getAttribute('href').slice(1), link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const link = linkMap.get(entry.target.id);
          if (!link) return;
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initScrollTopButton() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return null;

    btn.addEventListener('click', () => {
      if (App.lenis) {
        App.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: App.utils.prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });

    return btn;
  }

  function init() {
    const header = document.getElementById('site-header');
    const toggle = document.getElementById('nav-toggle');
    const navList = document.getElementById('nav-list');
    if (!header) return;

    bindScrambleHover('.nav-list a');
    bindScrambleHover('.logo__text');
    initScrollSpy();
    const scrollTopBtn = initScrollTopButton();

    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', y > 600);

      const diff = y - lastY;
      lastY = y;

      // Ignore near-zero deltas — Lenis's eased scroll produces lots of these
      // as velocity decays between/after wheel ticks, and reacting to them
      // was causing the header to flicker open/closed on consecutive frames.
      if (Math.abs(diff) < 4) return;

      if (diff > 0 && y > 160) {
        header.classList.add('is-hidden');
      } else if (diff < 0) {
        header.classList.remove('is-hidden');
      }
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
        // .is-hidden's translateY also makes .site-header a containing
        // block for #nav-list's fixed positioning (same class of bug the
        // .is-scrolled backdrop-filter fix in layout.css addresses) — if
        // the header happened to be mid-hide from a scroll just before
        // this tap, force it back to visible so that never applies while
        // the full-screen menu is open.
        if (isOpen) header.classList.remove('is-hidden');
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
