/* ==========================================================================
   Skills — renders an interactive constellation of skill nodes (desktop)
   scattered on a jittered grid so they never overlap. Layered motion:
     - cursor parallax on the node itself (existing)
     - a continuous, gentle idle float on each node's inner dot, so the
       constellation reads as alive even before the cursor arrives
     - an entrance stagger (scale + opacity) as the section scrolls in
     - hand-drawn SVG lines chaining every "core" skill together, with a
       stroke-drawing animation timed to the same entrance
   Renders a plain responsive chip grid as the mobile fallback (no
   absolute positioning to fight with small viewports).
   ========================================================================== */

window.App = window.App || {};

(function () {
  'use strict';

  function renderConstellation(container) {
    const skills = App.skillsData;
    const cols = Math.ceil(Math.sqrt(skills.length * 1.4));
    const rows = Math.ceil(skills.length / cols);
    const cellW = 100 / cols;
    const cellH = 100 / rows;

    const nodes = [];
    const positions = [];

    skills.forEach((skill, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Jitter within the cell so the layout reads organic, not gridded.
      const jitterX = (Math.random() - 0.5) * cellW * 0.5;
      const jitterY = (Math.random() - 0.5) * cellH * 0.5;
      const left = App.utils.clamp(col * cellW + cellW / 2 + jitterX, 6, 94);
      const top = App.utils.clamp(row * cellH + cellH / 2 + jitterY, 8, 92);

      const node = document.createElement('div');
      node.className = 'skill-node';
      node.dataset.tier = skill.tier;
      node.style.left = `${left}%`;
      node.style.top = `${top}%`;
      node.style.setProperty('--node-size', skill.tier === 'core' ? '76px' : '58px');
      node.dataset.depth = skill.tier === 'core' ? '0.6' : '0.3';

      node.innerHTML = `
        <span class="skill-node__dot">${skill.name.slice(0, 2).toUpperCase()}</span>
        <span class="skill-node__label">${skill.name} · ${skill.category}</span>
      `;

      container.appendChild(node);
      nodes.push(node);
      positions.push({ left, top, tier: skill.tier });
    });

    return { nodes, positions };
  }

  function addParallax(container, nodes) {
    if (App.utils.isTouchDevice() || typeof gsap === 'undefined') return;

    const movers = nodes.map((node) => ({
      el: node,
      depth: parseFloat(node.dataset.depth),
      xTo: gsap.quickTo(node, 'x', { duration: 0.6, ease: 'power3.out' }),
      yTo: gsap.quickTo(node, 'y', { duration: 0.6, ease: 'power3.out' }),
    }));

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      movers.forEach((m) => {
        m.xTo(relX * 30 * m.depth);
        m.yTo(relY * 30 * m.depth);
      });
    });

    container.addEventListener('mouseleave', () => {
      movers.forEach((m) => {
        m.xTo(0);
        m.yTo(0);
      });
    });
  }

  /**
   * A slow, continuous bob applied to each node's inner dot (never the
   * node itself, which addParallax already drives via x/y — animating
   * the same property from two independent tweens would fight and jitter).
   */
  function addIdleFloat(nodes) {
    if (typeof gsap === 'undefined' || App.utils.prefersReducedMotion()) return;

    nodes.forEach((node) => {
      const dot = node.querySelector('.skill-node__dot');
      gsap.to(dot, {
        y: 6 + Math.random() * 6,
        duration: 2.2 + Math.random() * 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 1.5,
      });
    });
  }

  /**
   * Draws faint SVG lines chaining the "core" skill nodes together,
   * using a viewBox of "0 0 100 100" so the same left/top percentages
   * used to position the HTML nodes can be reused directly as line
   * coordinates — no separate pixel-space bookkeeping needed.
   */
  function renderConstellationLines(container, positions) {
    if (typeof gsap === 'undefined') return null;

    const coreCoords = positions.filter((p) => p.tier === 'core');
    if (coreCoords.length < 2) return null;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'skills__lines');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    const lines = [];
    for (let i = 0; i < coreCoords.length - 1; i++) {
      const a = coreCoords[i];
      const b = coreCoords[i + 1];
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', a.left);
      line.setAttribute('y1', a.top);
      line.setAttribute('x2', b.left);
      line.setAttribute('y2', b.top);
      line.setAttribute('class', 'skills__line');
      svg.appendChild(line);
      lines.push(line);
    }

    container.insertBefore(svg, container.firstChild.nextSibling);
    return lines;
  }

  function animateEntrance(container, nodes, lines) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    if (App.utils.prefersReducedMotion()) {
      gsap.set(nodes, { opacity: 1, scale: 1 });
      return;
    }

    gsap.set(nodes, { opacity: 0, scale: 0.4 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to(nodes, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.8)',
      stagger: { each: 0.035, from: 'random' },
    });

    if (lines && lines.length) {
      lines.forEach((line) => {
        const length = line.getTotalLength ? line.getTotalLength() : 100;
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
      });
      tl.to(
        lines,
        {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          stagger: 0.08,
        },
        '-=0.3'
      );
    }
  }

  function renderFallbackGrid(container) {
    App.skillsData.forEach((skill) => {
      const chip = document.createElement('div');
      chip.className = 'skill-chip';
      chip.dataset.tier = skill.tier;
      chip.innerHTML = `
        <span class="skill-chip__name">${skill.name}</span>
        <span class="skill-chip__cat">${skill.category}</span>
      `;
      container.appendChild(chip);
    });
  }

  App.initSkills = () => {
    const constellation = document.getElementById('skills-constellation');
    const fallback = document.getElementById('skills-grid-fallback');
    if (!constellation || !fallback || !App.skillsData) return;

    const { nodes, positions } = renderConstellation(constellation);
    addParallax(constellation, nodes);
    addIdleFloat(nodes);
    const lines = renderConstellationLines(constellation, positions);
    animateEntrance(constellation, nodes, lines);
    renderFallbackGrid(fallback);
  };
})();
