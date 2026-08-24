/* ==========================================================================
   Shared utilities — attached to the global App namespace so every other
   script (loaded as plain <script> tags at the end of body, no bundler)
   can use them.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  const utils = {};

  /** Linear interpolation, used for cursor trailing / parallax smoothing. */
  utils.lerp = (start, end, factor) => start + (end - start) * factor;

  utils.clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  utils.mapRange = (value, inMin, inMax, outMin, outMax) => {
    const t = (value - inMin) / (inMax - inMin);
    return outMin + t * (outMax - outMin);
  };

  utils.debounce = (fn, wait = 150) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  };

  utils.prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  utils.isTouchDevice = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  utils.isMobileViewport = () => window.innerWidth < 720;

  /**
   * Scrambles an element's text through random characters before
   * resolving to its real value, left-to-right — a hover micro-
   * interaction for nav links / footer links. No-ops under reduced
   * motion (text is left exactly as-is). Safe to call repeatedly on the
   * same element (re-entry cancels the previous run via the frame id
   * stashed on the element).
   * @param {HTMLElement} el
   * @param {object} opts { duration, chars }
   */
  utils.scrambleText = (el, opts = {}) => {
    if (utils.prefersReducedMotion()) return;

    const { duration = 500, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' } = opts;
    const original = el.dataset.scrambleSource || el.textContent;
    el.dataset.scrambleSource = original;

    const length = original.length;
    const startTime = performance.now();

    if (el._scrambleFrame) cancelAnimationFrame(el._scrambleFrame);

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const revealCount = Math.floor(progress * length);
      let output = '';
      for (let i = 0; i < length; i++) {
        if (i < revealCount || original[i] === ' ') {
          output += original[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = output;

      if (progress < 1) {
        el._scrambleFrame = requestAnimationFrame(tick);
      } else {
        el.textContent = original;
        el._scrambleFrame = null;
      }
    }

    el._scrambleFrame = requestAnimationFrame(tick);
  };

  /**
   * A small confetti burst radiating from `originEl`'s center — plain
   * DOM squares (no canvas needed for a couple dozen short-lived nodes),
   * flung outward at random angles/distances with a bit of rotation and
   * gravity, then removed once they fade out. Used as the contact form's
   * success reward. No-ops under reduced motion or without GSAP — the
   * success message text already carries the meaning on its own.
   * @param {HTMLElement} originEl
   */
  utils.confettiBurst = (originEl, opts = {}) => {
    if (typeof gsap === 'undefined' || utils.prefersReducedMotion() || !originEl) return;

    const { count = 26 } = opts;
    const colors = ['#d4ff3f', '#7c5cff', '#f4f2ec'];
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      const size = 5 + Math.random() * 6;
      Object.assign(piece.style, {
        position: 'fixed',
        left: `${originX}px`,
        top: `${originY}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: colors[i % colors.length],
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        pointerEvents: 'none',
        zIndex: '9500',
        willChange: 'transform, opacity',
      });
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 160;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 40; // bias upward before gravity pulls it down

      gsap.timeline({ onComplete: () => piece.remove() })
        .to(piece, {
          x: dx,
          y: dy,
          rotation: (Math.random() - 0.5) * 480,
          duration: 0.55 + Math.random() * 0.25,
          ease: 'power2.out',
        })
        .to(
          piece,
          {
            y: dy + 90 + Math.random() * 60,
            opacity: 0,
            duration: 0.5 + Math.random() * 0.3,
            ease: 'power1.in',
          },
          '-=0.1'
        );
    }
  };

  /**
   * Splits an element's text into per-word or per-character spans for
   * GSAP reveal animations, without a paid SplitText plugin.
   *
   * 'words' mode leaves each word as a plain inline-block span with no
   * extra wrapper, so headings keep wrapping normally across multiple
   * words per line based on the container's width.
   *
   * 'chars' mode wraps each word's characters in an overflow-hidden
   * `.split-line` block so they can rise from behind a clean mask — only
   * safe to use on text that is already a single deliberate line (e.g.
   * the hero title's manually-broken `.line` elements), since the wrapper
   * itself forces a line break.
   *
   * @param {HTMLElement} el
   * @param {'chars'|'words'} mode
   * @returns {HTMLElement[]} the individual split targets, in DOM order
   */
  utils.splitText = (el, mode = 'chars') => {
    const text = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);

    const words = text.split(/\s+/);
    const targets = [];

    words.forEach((word, wi) => {
      if (mode === 'words') {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'split-word';
        wordSpan.textContent = word;
        el.appendChild(wordSpan);
        targets.push(wordSpan);
      } else {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'split-line';
        wordWrap.setAttribute('aria-hidden', 'true');
        [...word].forEach((char) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'split-char';
          charSpan.textContent = char;
          wordWrap.appendChild(charSpan);
          targets.push(charSpan);
        });
        el.appendChild(wordWrap);
      }

      if (wi < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });

    return targets;
  };

  /**
   * Generates a stylized gradient-mockup placeholder image as a data URI
   * SVG — no network request, no broken-image icons, and it scales
   * crisply to whatever box it's placed in.
   * PLACEHOLDER: swap for real project screenshots later.
   * @param {number} w
   * @param {number} h
   * @param {object} opts { seed, label }
   */
  utils.placeholderImage = (w, h, opts = {}) => {
    const { seed = 1, label = '' } = opts;
    const palettes = [
      ['#7c5cff', '#0b0b0e'],
      ['#d4ff3f', '#0b0b0e'],
      ['#ff5f9d', '#0b0b0e'],
      ['#3fdcff', '#0b0b0e'],
      ['#ff9a3f', '#0b0b0e'],
    ];
    const [c1, c2] = palettes[seed % palettes.length];
    const gridLines = 6;
    let gridSvg = '';
    for (let i = 1; i < gridLines; i++) {
      const x = (w / gridLines) * i;
      gridSvg += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="rgba(244,242,236,0.06)" stroke-width="1"/>`;
    }
    const escapedLabel = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <defs>
          <linearGradient id="g${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="${c2}" stop-opacity="1"/>
          </linearGradient>
          <radialGradient id="r${seed}" cx="30%" cy="20%" r="80%">
            <stop offset="0%" stop-color="${c1}" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#g${seed})"/>
        <rect width="${w}" height="${h}" fill="url(#r${seed})"/>
        ${gridSvg}
        <circle cx="${w * 0.82}" cy="${h * 0.24}" r="${Math.min(w, h) * 0.16}" fill="none" stroke="rgba(244,242,236,0.18)" stroke-width="1.5"/>
        <circle cx="${w * 0.14}" cy="${h * 0.82}" r="${Math.min(w, h) * 0.1}" fill="rgba(244,242,236,0.06)"/>
        <text x="${w * 0.06}" y="${h * 0.92}" font-family="JetBrains Mono, monospace" font-size="${Math.max(12, w * 0.028)}" fill="rgba(244,242,236,0.55)" letter-spacing="1">${escapedLabel}</text>
      </svg>`.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  App.utils = utils;
})();
