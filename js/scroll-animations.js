/* ==========================================================================
   Generic scroll-triggered animation system: [data-reveal] fade-ups,
   animated stat counters, and scroll-scrubbed parallax on project media.
   Kept separate from text-animations.js (which owns split-text reveals)
   and projects.js (which owns the grid-to-detail morph) to keep each
   file's responsibility obvious.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function revealElements() {
    const reducedMotion = App.utils.prefersReducedMotion();
    const targets = document.querySelectorAll('[data-reveal]');

    // JS owns hiding these elements entirely (no CSS `opacity: 0` rule —
    // see the comment on `.reveal` in base.css for why that's a trap).
    // If the GSAP/ScrollTrigger CDN scripts failed to load, fall back to
    // just showing everything: permanently-invisible content is a far
    // worse outcome than a missing entrance animation.
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      targets.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    targets.forEach((el, i) => {
      if (reducedMotion) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(el, { opacity: 0, y: 32 });

      // .to() with an explicit destination, not .from() — .from() reads
      // the element's current opacity to infer what to animate *back*
      // to, and the gsap.set() above just set that to 0, which would
      // make the "reveal" a no-op (0 -> 0). Spelling out both ends
      // explicitly avoids relying on GSAP inferring the right target.
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: (i % 4) * 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }

  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      counters.forEach((el) => {
        el.firstChild.textContent = el.getAttribute('data-counter');
      });
      return;
    }

    counters.forEach((el) => {
      const target = parseInt(el.getAttribute('data-counter'), 10);
      const counterObj = { value: 0 };

      // el's first child is the leading text node ("0"); the trailing
      // <span> (+, %) is left untouched so only the number itself ticks up.
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(counterObj, {
            value: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
              el.firstChild.textContent = Math.round(counterObj.value);
            },
          });
        },
      });
    });
  }

  /**
   * The one genuine GSAP ScrollTrigger `pin` in the site: the About
   * intro column locks in place while the (taller) copy column scrolls
   * past it, unpinning once the column's content clears the viewport.
   * Scoped to wide viewports via `matchMedia` — pinning a short column
   * against a single-column mobile stack would just be scroll-jacking
   * with no visual payoff, which the brief explicitly ruled out.
   */
  function pinAboutIntro() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (App.utils.prefersReducedMotion()) return;

    ScrollTrigger.matchMedia({
      '(min-width: 960px)': function () {
        const trigger = ScrollTrigger.create({
          trigger: '.about__grid',
          start: 'top 96px',
          end: 'bottom bottom',
          pin: '.about__intro',
          pinSpacing: false,
        });
        return () => trigger.kill();
      },
    });
  }

  function parallaxHeroDepth() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (App.utils.prefersReducedMotion()) return;

    gsap.to('#hero-canvas', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to('.hero__content', {
      yPercent: -12,
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /**
   * Thin gradient bar fixed to the top of the viewport, filling
   * left-to-right in exact sync with scroll position (0 at the top of
   * the page, full width at the bottom). A direct 1:1 mapping of the
   * user's own scroll input rather than an autonomous animation, so it
   * isn't gated behind prefers-reduced-motion the way the rest of this
   * file is.
   */
  function initScrollProgress() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  }

  App.initScrollAnimations = () => {
    revealElements();
    animateCounters();
    pinAboutIntro();
    parallaxHeroDepth();
    initScrollProgress();
  };
})();
