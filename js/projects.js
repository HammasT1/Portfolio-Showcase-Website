/* ==========================================================================
   Projects showcase — renders cards from App.projectsData, adds
   cursor-following image parallax on card hover, and opens a full case
   study as a custom FLIP-style morph: a clone of the card's image
   animates from its on-grid position/size to the detail view's hero
   position, while the detail overlay fades in underneath it. Implemented
   by hand (getBoundingClientRect diffing + GSAP tweens) rather than the
   GSAP Flip plugin, to avoid depending on a CDN that may not mirror
   every bonus plugin.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  let activeProject = null;
  let morphClone = null;
  // The currently-running open/close GSAP timeline, if any. Needed because
  // `activeProject` is set the instant openProject() starts (before its
  // animation even begins), so closeProject()'s `if (!activeProject)`
  // guard alone doesn't stop it from running WHILE the opening morph is
  // still mid-flight. Without this, a fast click on the close button
  // would leave both timelines fighting over `morphClone` — open's
  // deferred onComplete ends up removing close's clone instead of its
  // own, then close's onComplete tries to remove a clone that's already
  // null, throws, and finish() (which unlocks scroll and closes the
  // overlay) never runs. Confirmed directly: clicking close ~150ms after
  // opening left the overlay permanently stuck open, scroll permanently
  // locked, and an orphaned <img> floating in the DOM.
  let activeTimeline = null;

  /** Treats missing links and the '#' placeholder convention used
   *  elsewhere in this data file the same way: not a real link yet. */
  function isRealLink(url) {
    return Boolean(url) && url !== '#';
  }

  function cleanupMorphClone() {
    if (morphClone) {
      morphClone.remove();
      morphClone = null;
    }
  }

  function buildCardMarkup(project) {
    const hasRealImage = Boolean(project.image);
    const img =
      project.image ||
      App.utils.placeholderImage(1000, 750, {
        seed: project.imageSeed,
        label: project.title,
      });

    return `
      <article class="project-card" data-card-reveal data-project-id="${project.id}" tabindex="0" role="button"
        aria-label="Open case study: ${project.title}">
        <div class="project-card__media">
          <span class="project-card__index">${project.index} / 0${App.projectsData.length}</span>
          <div class="project-card__media-inner" data-parallax-media>
            <img class="project-card__placeholder-img${hasRealImage ? ' has-real-image' : ''}" src="${img}" alt="${project.title} preview" loading="lazy" />
          </div>
          <div class="project-card__glow" aria-hidden="true"></div>
        </div>
        <div class="project-card__body">
          <div class="project-card__tags">
            ${project.tags.map((t) => `<span>${t}</span>`).join('')}
          </div>
          <h3 class="project-card__title">
            ${project.title}
            <span class="project-card__arrow" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17L17 7M17 7H9M17 7V15"/></svg>
            </span>
          </h3>
          <p class="project-card__desc">${project.tagline}</p>
          <div class="project-card__footer">
            <span>${project.year}</span>
            <span>${project.duration}</span>
            <span>${project.role}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderCards() {
    const list = document.getElementById('project-list');
    const countEl = document.getElementById('projects-count');
    if (!list || !App.projectsData) return;

    list.innerHTML = App.projectsData.map(buildCardMarkup).join('');
    if (countEl) countEl.textContent = String(App.projectsData.length).padStart(2, '0');
  }

  function addCardInteractions() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach((card) => {
      const mediaInner = card.querySelector('[data-parallax-media]');
      let xTo, yTo;

      if (!App.utils.isTouchDevice() && typeof gsap !== 'undefined') {
        xTo = gsap.quickTo(mediaInner, 'x', { duration: 0.7, ease: 'power3.out' });
        yTo = gsap.quickTo(mediaInner, 'y', { duration: 0.7, ease: 'power3.out' });

        card.addEventListener('mousemove', (e) => {
          const rect = card.querySelector('.project-card__media').getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          xTo(relX * 24);
          yTo(relY * 24);
        });

        card.addEventListener('mouseleave', () => {
          xTo(0);
          yTo(0);
        });
      }

      // A continuous 3D tilt on the whole card toward the cursor — distinct
      // from the one-shot tilt-in entrance in addScrollEffects() (that one
      // plays once on scroll; this one tracks the pointer live for as long
      // as it's over the card).
      //
      // Deliberately gsap.to() per mousemove rather than gsap.quickTo():
      // verified directly (headless-browser probing, not a guess) that
      // quickTo silently no-ops for rotateX/rotateY/rotateZ on this
      // element once transformPerspective is involved — gsap.getProperty
      // reports the value updating, but it never composes into a visible
      // transform. quickTo works fine for x/y elsewhere in this file (see
      // the media parallax above); it's specifically the rotation+
      // perspective combination that breaks. Plain gsap.to() with
      // overwrite:'auto' has none of that limitation and is still cheap
      // enough for a per-mousemove call on 1-3 cards.
      if (!App.utils.isTouchDevice() && typeof gsap !== 'undefined' && !App.utils.prefersReducedMotion()) {
        // Kept deliberately subtle: a tilt effect on the same element that
        // owns the hover listeners is a known-unstable pattern at higher
        // angles — rotating the card shifts its own rendered bounding box,
        // which can push a corner out from under the cursor and fire a
        // native mouseleave, snapping the tilt back to 0, which un-shifts
        // the box and can immediately re-trigger mouseenter — a jittery
        // feedback loop, confirmed directly by tracking real mouseenter/
        // mousemove/mouseleave event coordinates during cursor movement
        // toward a corner. Keeping the max angle small and clamping the
        // input range short of the true edge keeps the rendered box's
        // displacement well inside the cursor's actual position at all
        // times, which is the standard fix for this technique.
        const tiltMax = 5;
        const inputClamp = 0.42;
        let cachedRect = null;
        gsap.set(card, { transformPerspective: 900 });

        card.addEventListener('mouseenter', () => {
          // Re-assert a centered pivot every time — the entrance tween
          // leaves transformOrigin at '50% 100%' (tilts up from the
          // bottom), which reads wrong for a "tilts toward the cursor"
          // hover interaction that should pivot from the card's center.
          gsap.set(card, { transformOrigin: '50% 50%' });
          // Cache the rect once per hover, before any tilt is applied —
          // reusing a live (transform-affected) rect for the relX/relY
          // math would make the tilt's own motion feed back into itself.
          cachedRect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
          if (!cachedRect) cachedRect = card.getBoundingClientRect();
          const relX = App.utils.clamp((e.clientX - cachedRect.left) / cachedRect.width - 0.5, -inputClamp, inputClamp);
          const relY = App.utils.clamp((e.clientY - cachedRect.top) / cachedRect.height - 0.5, -inputClamp, inputClamp);
          gsap.to(card, {
            rotateY: relX * tiltMax,
            rotateX: relY * -tiltMax,
            scale: 1.008,
            duration: 0.6,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });

        card.addEventListener('mouseleave', () => {
          cachedRect = null;
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });
      }

      card.addEventListener('mouseenter', () => {
        document.dispatchEvent(new CustomEvent('cursor:view-enter'));
      });
      card.addEventListener('mouseleave', () => {
        document.dispatchEvent(new CustomEvent('cursor:view-leave'));
      });

      card.addEventListener('click', () => openProject(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProject(card);
        }
      });
    });
  }

  /**
   * Two independent scroll-driven effects per card, layered on top of the
   * mouse-parallax already applied to `[data-parallax-media]`:
   *   1. A one-shot 3D tilt-in as the card enters the viewport (opacity +
   *      y + a slight rotateX, giving cards real depth instead of a flat
   *      fade — distinct from the plain fade-up used for body copy).
   *   2. A continuous scroll-scrubbed drift on the media image (`yPercent`),
   *      which composes cleanly with the hover parallax's pixel-based
   *      `x`/`y` since GSAP tracks those as separate transform components.
   */
  function addScrollEffects() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const reducedMotion = App.utils.prefersReducedMotion();
    const cards = document.querySelectorAll('[data-card-reveal]');

    cards.forEach((card) => {
      if (reducedMotion) {
        gsap.set(card, { opacity: 1 });
        return;
      }

      gsap.set(card, { opacity: 0, y: 70, rotateX: 8, transformPerspective: 900, transformOrigin: '50% 100%' });

      gsap.to(card, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });

      const mediaInner = card.querySelector('[data-parallax-media]');
      gsap.to(mediaInner, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  function buildDetailMarkup(project) {
    const hasRealImage = Boolean(project.image);
    const heroImg =
      project.image ||
      App.utils.placeholderImage(1600, 900, {
        seed: project.imageSeed,
        label: `${project.title} — Overview`,
      });

    // Real gallery images (project.gallery) win when present; otherwise
    // fall back to generated mockups only for projects with no real
    // screenshot at all yet (galleryCount) — a project that already has
    // one real image but no gallery yet renders no "Screens" section
    // rather than mixing a real shot with fake placeholder tiles.
    const gallery = project.gallery && project.gallery.length
      ? project.gallery
      : hasRealImage
        ? []
        : Array.from({ length: project.galleryCount || 0 }, (_, i) =>
            App.utils.placeholderImage(800, 500, {
              seed: project.imageSeed + i + 1,
              label: `${project.title} — Screen ${i + 1}`,
            })
          );

    return `
      <div class="project-detail__hero${hasRealImage ? ' has-real-image' : ''}">
        <img class="project-detail__hero-img${hasRealImage ? ' has-real-image' : ''}" id="project-detail-hero-img" src="${heroImg}" alt="${project.title} cover" />
      </div>

      <div class="container project-detail__intro">
        <div class="project-detail__eyebrow-row">
          <p class="eyebrow" style="margin-bottom:0;">Case Study · ${project.index}</p>
          <div class="project-detail__stack">
            ${project.tags.map((t) => `<span>${t}</span>`).join('')}
          </div>
        </div>
        <h2 class="project-detail__title">${project.title}</h2>
        <p class="project-detail__summary">${project.summary}</p>

        <dl class="project-detail__meta">
          <div><dt>Role</dt><dd>${project.role}</dd></div>
          <div><dt>Duration</dt><dd>${project.duration}</dd></div>
          <div><dt>Year</dt><dd>${project.year}</dd></div>
          <div><dt>Category</dt><dd>Mobile App</dd></div>
        </dl>
      </div>

      <div class="container">
        <div class="project-detail__section">
          <span class="project-detail__section-label">The Challenge</span>
          <div class="project-detail__section-body"><p>${project.problem}</p></div>
        </div>
        <div class="project-detail__section">
          <span class="project-detail__section-label">Approach</span>
          <div class="project-detail__section-body"><p>${project.approach}</p></div>
        </div>
        <div class="project-detail__section">
          <span class="project-detail__section-label">Architecture</span>
          <div class="project-detail__section-body"><p>${project.architecture}</p></div>
        </div>
        <div class="project-detail__section">
          <span class="project-detail__section-label">Tech Stack</span>
          <div class="project-detail__section-body">
            <div class="project-detail__stack">${project.stack.map((s) => `<span>${s}</span>`).join('')}</div>
          </div>
        </div>
        <div class="project-detail__section">
          <span class="project-detail__section-label">Highlights</span>
          <div class="project-detail__section-body">
            <div class="project-detail__meta" style="border:none; padding:0; margin:0;">
              ${project.results.map((r) => `<div><dt>${r.label}</dt><dd>${r.value}</dd></div>`).join('')}
            </div>
          </div>
        </div>
        ${
          gallery.length
            ? `<div class="project-detail__section">
          <span class="project-detail__section-label">Screens</span>
          <div class="project-detail__section-body">
            <div class="project-detail__gallery">
              ${gallery.map((src, i) => `<img src="${src}" alt="${project.title} screen ${i + 1}" loading="lazy" />`).join('')}
            </div>
          </div>
        </div>`
            : ''
        }

        <div class="project-detail__actions">
          ${
            isRealLink(project.links.code)
              ? `<a href="${project.links.code}" class="btn btn-primary" data-magnetic target="_blank" rel="noopener">View Source Code</a>`
              : ''
          }
          ${
            isRealLink(project.links.live)
              ? `<a href="${project.links.live}" class="btn btn-ghost" data-magnetic target="_blank" rel="noopener">Watch Demo</a>`
              : ''
          }
          ${
            !isRealLink(project.links.code) && !isRealLink(project.links.live)
              ? '<p class="project-detail__link-note">Links coming soon.</p>'
              : ''
          }
        </div>
      </div>
    `;
  }

  function openProject(card) {
    if (activeProject) return;
    const projectId = card.dataset.projectId;
    const project = App.projectsData.find((p) => p.id === projectId);
    if (!project) return;

    activeProject = { project, originCard: card };

    const overlay = document.getElementById('project-detail');
    const contentEl = document.getElementById('project-detail-content');
    const originImg = card.querySelector('.project-card__placeholder-img');
    const startRect = originImg.getBoundingClientRect();

    contentEl.innerHTML = buildDetailMarkup(project);
    if (App.initMagnetic) App.initMagnetic(contentEl);
    // Gallery images benefit from the fade-in; the hero image itself is
    // fine either way since the FLIP morph timeline below manages its
    // opacity directly via inline styles, which always wins over this
    // class-based rule regardless of load timing.
    if (App.initImageFade) App.initImageFade(contentEl);

    // The overlay is its own fixed, independently-scrolling box (see
    // .project-detail { overflow-y: auto } in project-detail.css) — reset
    // *its* scroll position, and deliberately leave the underlying page's
    // scroll untouched so closing returns the visitor to the exact card
    // they clicked rather than jumping them back to the top of the site.
    overlay.scrollTop = 0;

    if (App.stopScroll) App.stopScroll();
    document.body.classList.add('no-scroll');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    const reducedMotion = App.utils.prefersReducedMotion();

    if (reducedMotion || typeof gsap === 'undefined') {
      overlay.style.transform = 'translateY(0)';
      return;
    }

    // Any clone left over from a previous cycle should already be gone by
    // now, but clear it defensively before claiming the shared variable.
    cleanupMorphClone();

    // Build a clone of the origin image, pinned over its exact current
    // screen position, so we can morph *that* rather than the real DOM
    // node (which is about to be scrolled away under a fixed overlay).
    morphClone = originImg.cloneNode(true);
    Object.assign(morphClone.style, {
      position: 'fixed',
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      margin: '0',
      zIndex: '900',
      borderRadius: getComputedStyle(card.querySelector('.project-card__media')).borderRadius,
      objectFit: project.image ? 'contain' : 'cover',
    });
    document.body.appendChild(morphClone);

    gsap.set(overlay, { yPercent: 0 });
    gsap.set('#project-detail-hero-img', { opacity: 0 });

    const heroTarget = document.querySelector('.project-detail__hero');
    const endRect = heroTarget.getBoundingClientRect();

    activeTimeline = gsap.timeline({
      onComplete: () => {
        cleanupMorphClone();
        gsap.set('#project-detail-hero-img', { opacity: 1 });
        activeTimeline = null;
      },
    });

    activeTimeline
      .to(overlay, { autoAlpha: 1, duration: 0.01 })
      .fromTo(
        overlay,
        { y: '4%' },
        { y: '0%', duration: 0.6, ease: 'power3.out' },
        0
      )
      .to(
        morphClone,
        {
          top: endRect.top,
          left: endRect.left,
          width: endRect.width,
          height: endRect.height,
          borderRadius: '0px',
          duration: 0.65,
          ease: 'power3.inOut',
        },
        0
      );
  }

  function closeProject() {
    if (!activeProject) return;
    const { originCard, project } = activeProject;
    const overlay = document.getElementById('project-detail');
    const heroImg = document.getElementById('project-detail-hero-img');
    const reducedMotion = App.utils.prefersReducedMotion();

    // The close button (and Escape) is reachable at any point, including
    // while the OPEN animation is still mid-flight — a fast, perfectly
    // reasonable click right after opening. If that in-progress timeline
    // (and its clone) isn't torn down cleanly first, it and the close
    // animation about to start end up fighting over the shared
    // `morphClone` variable: see the comment above `activeTimeline`'s
    // declaration for exactly how that leaves the overlay stuck open
    // forever. Killing it and snapping the overlay to its resting
    // "fully open" position first guarantees close always starts clean.
    if (activeTimeline) {
      activeTimeline.kill();
      activeTimeline = null;
      if (typeof gsap !== 'undefined') gsap.set(overlay, { autoAlpha: 1, y: '0%' });
    }
    cleanupMorphClone();

    const finish = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (App.startScroll) App.startScroll();

      // Undo whatever inline transform/opacity/visibility the open/close
      // tweens left behind. This matters because GSAP writes those as
      // *inline* styles, which beat the stylesheet's `.project-detail {
      // visibility: hidden }` rule no matter what — so without clearing
      // them, removing the `is-open` class above doesn't actually hide
      // the overlay. It stays fully rendered and keeps intercepting every
      // click on the page underneath, which is exactly what "closing"
      // the case study looked/felt like it did nothing.
      if (typeof gsap !== 'undefined') {
        gsap.set(overlay, { clearProps: 'all' });
      } else {
        overlay.style.transform = '';
        overlay.style.opacity = '';
        overlay.style.visibility = '';
      }

      activeProject = null;
    };

    if (reducedMotion || typeof gsap === 'undefined' || !heroImg) {
      finish();
      return;
    }

    const startRect = heroImg.getBoundingClientRect();
    const originImg = originCard.querySelector('.project-card__placeholder-img');
    const endRect = originImg.getBoundingClientRect();

    morphClone = heroImg.cloneNode(true);
    Object.assign(morphClone.style, {
      position: 'fixed',
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      margin: '0',
      zIndex: '900',
      objectFit: project.image ? 'contain' : 'cover',
    });
    document.body.appendChild(morphClone);
    gsap.set(heroImg, { opacity: 0 });

    activeTimeline = gsap.timeline({
      onComplete: () => {
        cleanupMorphClone();
        finish();
        activeTimeline = null;
      },
    });

    activeTimeline
      .to(overlay, { y: '4%', duration: 0.55, ease: 'power3.inOut' }, 0)
      .to(
        morphClone,
        {
          top: endRect.top,
          left: endRect.left,
          width: endRect.width,
          height: endRect.height,
          borderRadius: getComputedStyle(originCard.querySelector('.project-card__media')).borderRadius,
          duration: 0.55,
          ease: 'power3.inOut',
        },
        0
      );
  }

  function bindOverlayClose() {
    const closeBtn = document.getElementById('project-detail-close');
    if (closeBtn) closeBtn.addEventListener('click', closeProject);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeProject) closeProject();
    });
  }

  App.initProjects = () => {
    renderCards();
    addCardInteractions();
    addScrollEffects();
    bindOverlayClose();
  };
})();
