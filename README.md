<div align="center">

# Muhammad Hammas Rasheed — Portfolio

### A Flutter developer's portfolio, built without a single framework.

Pure HTML5, CSS3, and vanilla JavaScript (ES6+) — GSAP-driven animation, a Canvas2D particle hero, custom cursor, and scroll-choreographed sections, running at 60fps with zero build step.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![GSAP](https://img.shields.io/badge/GSAP-0AE448?style=for-the-badge&logo=greensock&logoColor=white)](#)
[![No Framework](https://img.shields.io/badge/Framework-None-9146FF?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

**[Live Site](#)** &nbsp;·&nbsp; **[Report a Bug](https://github.com/HammasT1/My-Portfolio-Website/issues)** &nbsp;·&nbsp; **[Contact](mailto:muhammadhammasrasheed@gmail.com)**

</div>

<br />

> **PLACEHOLDER** — this README references a live demo URL and a preview screenshot/GIF that don't exist yet. Deploy the site (GitHub Pages, Vercel, or Netlify all work with zero config since there's no build step) and drop a screen recording into a `preview/` folder, then swap the links/embed below.

<div align="center">

<!-- PLACEHOLDER: replace with an actual screen recording or screenshot, e.g. -->
<!-- <img src="preview/hero.gif" alt="Site preview" width="850" /> -->

*Hero → About → Skills → Projects → Experience → Education → Contact, all on one scroll.*

</div>

<br />

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Performance & Accessibility](#performance--accessibility)
- [Roadmap](#roadmap)
- [About the Developer](#about-the-developer)
- [License](#license)

<br />

## Overview

This is my personal portfolio — built to demonstrate the same care I put into production Flutter apps, just in a different toolset. No React, no build pipeline, no animation library doing the heavy lifting beyond GSAP: the point was to show fundamentals, not hide behind a framework.

It's a single `index.html` you can open directly, or serve with anything — there's nothing to compile.

<br />

## Features

**Signature animation system**
- 🌌 A generative particle constellation in the hero, rendered on Canvas2D — particles drift, link to nearby neighbors, and react to the cursor in real time
- 🖱️ A three-layer custom cursor (dot → ring → soft blurred glow), each trailing with progressively more lag
- 🧲 Magnetic buttons/links that pull toward the cursor within a radius
- ✂️ Hand-built text-splitting for per-character and per-word reveals — no paid SplitText plugin
- 📜 A genuine GSAP ScrollTrigger `pin` (About section) plus scrubbed parallax (hero depth, timeline progress, project media)
- 📖 A scroll-scrubbed "read-along" effect in About — words brighten in sequence as the paragraph scrolls through view
- ✨ A hand-drawn SVG constellation connecting core skills, stroke-animated on scroll entrance
- 🔄 A custom FLIP-style morph transition — project cards expand into full case studies via hand-rolled `getBoundingClientRect` diffing, not the GSAP Flip plugin
- 🔤 Scramble-text hover on nav/footer links (cycles random characters before resolving)
- 🎞️ An infinite marquee strip in the footer
- 🎬 A one-time-per-session preloader (via `sessionStorage`, never annoys a returning visitor)

**Sections**
- Hero, About, Skills (interactive constellation), Projects (case-study grid + detail overlay), Experience timeline, Education & Certifications, Contact (animated form with inline validation)

**Built to actually ship**
- Respects `prefers-reduced-motion` everywhere — every animation has a static fallback, not just the obvious ones
- Degrades gracefully if the GSAP CDN fails to load (checked explicitly — content stays visible rather than getting stuck hidden behind a `.reveal` class waiting for JS that never arrives)
- Lenis smooth scroll wired directly into GSAP's ticker (no competing rAF loops)
- Mobile fallbacks that simplify rather than fake the desktop experience (e.g. Skills' constellation becomes a plain chip grid; the About pin only engages above 960px)

<br />

## Tech Stack

| Layer | Choice |
|---|---|
| Structure | Semantic HTML5 |
| Styling | CSS3 — custom properties, Grid/Flexbox, no preprocessor |
| Behavior | Vanilla JavaScript (ES6+), plain `<script>` tags — no bundler, no modules (keeps it runnable straight from `file://`) |
| Animation | [GSAP](https://gsap.com/) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering/) |
| Fonts | [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) (display) · [Inter](https://fonts.google.com/specimen/Inter) (body) · [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (labels/mono) |

No build tools, no `package.json`, no `node_modules` — every dependency loads from a CDN via a plain `<script>` tag.

<br />

## Project Structure

```
Portfolio-Website/
├── index.html                  # Single entry point — all sections, in order
├── css/
│   ├── reset.css                # Minimal modern reset
│   ├── variables.css            # Design tokens — color, type, spacing, motion
│   ├── base.css                 # Global element styling + utility classes
│   ├── animations.css           # Shared keyframes, Lenis scaffolding
│   ├── cursor.css                # Custom cursor (dot / ring / glow)
│   ├── preloader.css
│   ├── layout.css                # Header, footer, buttons, grain overlay
│   ├── hero.css
│   ├── about.css
│   ├── skills.css
│   ├── projects.css
│   ├── project-detail.css        # Full-screen case-study overlay
│   ├── timeline.css
│   ├── education.css
│   └── contact.css
└── js/
    ├── utils.js                  # lerp, clamp, debounce, splitText, scrambleText, placeholderImage…
    ├── data/
    │   ├── projects-data.js      # Project case-study content
    │   └── skills-data.js
    ├── preloader.js
    ├── smooth-scroll.js           # Lenis + GSAP ticker integration
    ├── cursor.js
    ├── magnetic.js
    ├── nav.js                     # Header behavior + scramble-hover binding
    ├── footer.js                  # Marquee + footer link scramble-hover
    ├── hero-canvas.js             # Particle constellation
    ├── text-animations.js         # Hero title + heading + About read-along reveals
    ├── scroll-animations.js       # Generic [data-reveal], counters, pin, parallax
    ├── skills.js                  # Constellation render + entrance + idle float
    ├── projects.js                # Card render + FLIP morph transition
    ├── timeline.js
    ├── contact-form.js            # Validation + ambient blob animation
    └── main.js                    # Init orchestration
```

<br />

## Getting Started

No installation required.

```bash
git clone https://github.com/HammasT1/My-Portfolio-Website.git
cd My-Portfolio-Website
```

Then either:

- **Just open it** — double-click `index.html`, or
- **Serve it locally** (recommended, avoids any `file://` quirks in some browsers):

```bash
# with Python
python -m http.server 5500

# or with Node
npx serve .
```

Then visit `http://localhost:5500`.

<br />

## Design System

- **Palette** — near-black base (`#0b0b0e`), warm off-white text, an electric-lime accent (`#d4ff3f`) with a violet secondary (`#7c5cff`) for gradients and glow
- **Type** — Bricolage Grotesque for headings, Inter for body copy, JetBrains Mono for labels/tags/eyebrows
- **Motion** — spring/expo easing throughout (`power4.out`, `back.out`, `elastic.out`), never linear defaults; every animated property is `transform`/`opacity`-only for GPU acceleration

<br />

## Performance & Accessibility

- `prefers-reduced-motion: reduce` is checked in every animation module — reduced-motion visitors get the final state instantly, not a stripped-down version of the animation
- Images are runtime-generated SVG data URIs (see `utils.placeholderImage`) — no network requests, no broken-image icons while real project screenshots are still pending
- Semantic landmarks, a skip-to-content link, `aria-label`s on icon-only controls, and `aria-hidden` on purely decorative layers (grain overlay, cursor, background canvas)
- The custom cursor and all pointer-driven effects are disabled outright on touch/coarse-pointer devices — no simplified-but-still-present version fighting real touch input

<br />

## Roadmap

- [ ] Swap generated placeholder imagery for real project screenshots/GIFs
- [ ] Add real GitHub/LinkedIn/X profile links (currently `#`)
- [ ] Add the Dino Flutter repo link once it's public
- [ ] Add real Coursera certificate URLs to the Education section
- [ ] Deploy and swap in the live URL + preview GIF at the top of this README
- [ ] Wire the contact form to a real backend (Formspree/Netlify Forms/custom endpoint) — currently a simulated submit

<br />

## About the Developer

**Muhammad Hammas Rasheed** — Flutter developer, 3+ years building offline-first, production-grade mobile apps with clean architecture and Riverpod/BLoC. Computer Science undergraduate at the University of Engineering & Technology, Taxila.

- 📧 [muhammadhammasrasheed@gmail.com](mailto:muhammadhammasrasheed@gmail.com)
- 💻 [github.com/HammasT1](https://github.com/HammasT1)

<br />

## License

Distributed under the [MIT License](LICENSE) — added as a default since most of my other repos use it; swap it out if you'd rather use something else. Feel free to use this as a structural reference for your own portfolio — please don't copy the content wholesale.

<br />

<div align="center">

Built with care, one `AnimationController` at a time.

</div>
