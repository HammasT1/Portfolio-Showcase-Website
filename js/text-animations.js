/* ==========================================================================
   Text reveal animations — per-character hero title reveal (custom split,
   no paid SplitText plugin needed) and per-word scroll-triggered reveals
   for section headings marked [data-split="words"].
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function animateHeroTitle() {
    const lines = document.querySelectorAll('#hero-title .line');
    if (!lines.length || typeof gsap === 'undefined') return;

    const reducedMotion = App.utils.prefersReducedMotion();
    const tl = gsap.timeline({ delay: reducedMotion ? 0 : 0.15 });

    lines.forEach((line) => {
      const chars = App.utils.splitText(line, 'chars');
      if (reducedMotion) {
        gsap.set(chars, { opacity: 1, y: 0 });
        return;
      }
      tl.from(
        chars,
        {
          yPercent: 130,
          rotate: 6,
          opacity: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.025,
        },
        '<+=0.05'
      );
    });

    // Subtitle, meta, actions — staggered rise right after the title.
    tl.from(
      '.hero__subtitle, .hero__meta-item, .hero__actions',
      {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
      },
      reducedMotion ? 0 : '-=0.4'
    );
  }

  function animateSplitHeadings() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const reducedMotion = App.utils.prefersReducedMotion();

    document.querySelectorAll('[data-split="words"]').forEach((el) => {
      const words = App.utils.splitText(el, 'words');
      if (reducedMotion) {
        gsap.set(words, { opacity: 1, y: 0 });
        return;
      }

      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.045,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }

  /**
   * The About section's read-along effect: each paragraph's words start
   * dim and brighten to full text color in sequence as the paragraph
   * scrolls through the trigger zone — scrubbed to scroll position
   * (not just triggered once), so reading pace and reveal pace stay
   * connected. Deliberately different from the plain fade-up used
   * elsewhere, since this copy is the section's main read and earns a
   * more expressive treatment.
   */
  function scrubTextReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const reducedMotion = App.utils.prefersReducedMotion();

    document.querySelectorAll('[data-scrub-text]').forEach((p) => {
      const words = App.utils.splitText(p, 'words');

      if (reducedMotion) {
        gsap.set(words, { opacity: 1 });
        return;
      }

      gsap.set(words, { opacity: 0.28 });
      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: {
          trigger: p,
          start: 'top 85%',
          end: 'bottom 55%',
          scrub: 0.4,
        },
      });
    });
  }

  /**
   * Runs the same character-scramble decode used on nav-link hover (see
   * App.utils.scrambleText) on every section's small mono eyebrow label,
   * once, the first time it scrolls into view — ties the hover
   * micro-interaction's typographic signature to the scroll experience
   * too, instead of it only ever showing up on a hover nobody may trigger.
   * Excludes `.hero__eyebrow` deliberately: that one has its own dedicated
   * entrance via animateHeroTitle's stagger and a live status dot inside
   * it, not a plain text label.
   */
  function scrambleEyebrowsOnScroll() {
    if (typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.eyebrow').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => App.utils.scrambleText(el, { duration: 600 }),
      });
    });
  }

  App.initTextAnimations = () => {
    animateHeroTitle();
    animateSplitHeadings();
    scrubTextReveal();
    scrambleEyebrowsOnScroll();
  };
})();
