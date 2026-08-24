/* ==========================================================================
   Signature hero moment — a generative particle constellation rendered on
   Canvas2D. Particles drift slowly on their own, nearby particles connect
   with faint lines, and the whole field reacts to the cursor: particles
   within range are gently pushed away, and lines to the cursor itself
   light up, so it reads as one connected, reactive network rather than
   decorative noise.

   Chosen over a Three.js/WebGL scene deliberately: it hits the same
   "wow, unique to this site" bar at a fraction of the payload and with
   far more predictable performance across low/mid-range laptops and
   phones, which the brief flagged as non-negotiable. Canvas2D also makes
   the reduced-motion and mobile fallbacks trivial (draw one static frame
   and stop), where a WebGL scene would need its own teardown path.
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function init() {
    const canvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('hero');
    if (!canvas || !heroSection) return;

    const ctx = canvas.getContext('2d');
    const reducedMotion = App.utils.prefersReducedMotion();
    const isMobile = App.utils.isMobileViewport();
    const isTouch = App.utils.isTouchDevice();

    const CONFIG = {
      particleCount: isMobile ? 34 : 90,
      maxLinkDist: isMobile ? 100 : 150,
      cursorRadius: 160,
      cursorPush: 0.55,
      baseSpeed: 0.18,
      particleSize: [1, 2.4],
      colors: ['212,255,63', '124,92,255', '244,242,236'],
    };

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let rafId = null;
    let isVisible = true;
    let pulses = [];

    function resize() {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      const [minR, maxR] = CONFIG.particleSize;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.baseSpeed,
        vy: (Math.random() - 0.5) * CONFIG.baseSpeed,
        r: minR + Math.random() * (maxR - minR),
        color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
      };
    }

    function seedParticles() {
      particles = Array.from({ length: CONFIG.particleCount }, makeParticle);
    }

    /**
     * Ties the CTA buttons into the particle field: hovering one sends an
     * expanding ring out from its center and gives nearby particles a
     * one-time outward nudge, so the field visibly "notices" the button
     * rather than just sitting in the background behind it.
     */
    function spawnPulse(x, y) {
      pulses.push({ x, y, start: performance.now(), duration: 900, maxRadius: 190 });

      // The particle loop has no friction/damping — velocity only ever
      // flips sign at the canvas edges — so an impulse has to be clamped
      // rather than just added, or repeated hovers would compound into a
      // runaway speed-up over the course of a visit.
      const impulseRadius = 170;
      const maxV = CONFIG.baseSpeed * 6;
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < impulseRadius && dist > 0.001) {
          const force = (1 - dist / impulseRadius) * 14;
          p.vx = App.utils.clamp(p.vx + (dx / dist) * force * 0.02, -maxV, maxV);
          p.vy = App.utils.clamp(p.vy + (dy / dist) * force * 0.02, -maxV, maxV);
        }
      }
    }

    function drawPulses(now) {
      pulses = pulses.filter((pulse) => now - pulse.start < pulse.duration);
      for (const pulse of pulses) {
        // Clamped defensively: `now` is the rAF frame timestamp and
        // `pulse.start` is captured via performance.now() inside a
        // mouseenter handler firing between frames — the two should
        // always agree on ordering, but ctx.arc() throws outright on a
        // negative radius, and a thrown error here would silently kill
        // the whole particle loop (it isn't wrapped in try/catch), so
        // this is worth guarding rather than trusting the assumption.
        const t = App.utils.clamp((now - pulse.start) / pulse.duration, 0, 1);
        const radius = pulse.maxRadius * t;
        const alpha = (1 - t) * 0.5;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 255, 63, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function bindButtonPulses() {
      const buttons = heroSection.querySelectorAll('.hero__actions a');
      buttons.forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          const btnRect = btn.getBoundingClientRect();
          const heroRect = heroSection.getBoundingClientRect();
          spawnPulse(btnRect.left + btnRect.width / 2 - heroRect.left, btnRect.top + btnRect.height / 2 - heroRect.top);
        });
      });
    }

    function step(now) {
      now = now || performance.now();
      ctx.clearRect(0, 0, width, height);

      // Update + draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.cursorRadius && dist > 0.001) {
            const force = (1 - dist / CONFIG.cursorRadius) * CONFIG.cursorPush;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, 0.75)`;
        ctx.fill();
      }

      // Draw links between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.maxLinkDist) {
            const opacity = (1 - dist / CONFIG.maxLinkDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(244, 242, 236, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw links from cursor to nearby particles — the direct "reactive"
      // read: the network visibly acknowledges the visitor's presence.
      if (mouse.active) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.cursorRadius) {
            const opacity = (1 - dist / CONFIG.cursorRadius) * 0.4;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(212, 255, 63, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      drawPulses(now);

      if (isVisible) rafId = requestAnimationFrame(step);
    }

    function onMouseMove(e) {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.y > 0 && mouse.y < height;
    }

    function onMouseLeave() {
      mouse.active = false;
    }

    function start() {
      if (rafId) return;
      isVisible = true;
      rafId = requestAnimationFrame(step);
    }

    function stop() {
      isVisible = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    resize();
    seedParticles();

    if (reducedMotion) {
      // Draw a single static frame and stop — motion-sensitive visitors
      // still see the concept, just not the animation.
      step();
      isVisible = false;
      return;
    }

    if (!isTouch) {
      window.addEventListener('mousemove', onMouseMove);
      heroSection.addEventListener('mouseleave', onMouseLeave);
      bindButtonPulses();
    }

    // Pause the RAF loop entirely when the hero scrolls out of view or the
    // tab is backgrounded — this is a persistent canvas, not worth its
    // frame budget when nobody can see it.
    const observer = new IntersectionObserver(
      (entries) => {
        entries[0].isIntersecting ? start() : stop();
      },
      { threshold: 0.05 }
    );
    observer.observe(heroSection);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (heroSection.getBoundingClientRect().top < window.innerHeight) start();
    });

    window.addEventListener(
      'resize',
      App.utils.debounce(() => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        resize();
        seedParticles();
      }, 200)
    );

    start();
  }

  App.initHeroCanvas = init;
})();
