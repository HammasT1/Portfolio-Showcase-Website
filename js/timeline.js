/* ==========================================================================
   Experience timeline — the vertical progress line fills in sync with
   scroll (scrubbed, not just triggered), and each entry's dot/content
   activates as it crosses the active zone.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  App.initTimeline = () => {
    const track = document.getElementById('timeline-track');
    const lineFill = document.getElementById('timeline-line-fill');
    const items = document.querySelectorAll('[data-timeline-item]');
    if (!track || !lineFill || !items.length) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      items.forEach((item) => item.classList.add('is-active'));
      lineFill.style.height = '100%';
      return;
    }

    const reducedMotion = App.utils.prefersReducedMotion();

    if (reducedMotion) {
      items.forEach((item) => item.classList.add('is-active'));
      lineFill.style.height = '100%';
      return;
    }

    gsap.to(lineFill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 60%',
        end: 'bottom 80%',
        scrub: true,
      },
    });

    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 65%',
        end: 'bottom 40%',
        onEnter: () => item.classList.add('is-active'),
        onEnterBack: () => item.classList.add('is-active'),
      });

      gsap.from(item, {
        opacity: 0,
        x: -24,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  };
})();
