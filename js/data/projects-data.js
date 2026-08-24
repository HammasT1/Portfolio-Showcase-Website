/* ==========================================================================
   Real projects — Ben 10 Omnitrix Watch, Starbucks Card Animation, and
   Dino Flutter. Copy below is grounded in what was confirmed directly
   (features, tech used, repo links); a few fields are still marked
   PLACEHOLDER because they weren't — fill those in with the real values.

   Dino Flutter's repo link (https://github.com/HammasT1/dino-flutter)
   currently 404s via the GitHub API — either private or a different
   name/case — so its `links.code` is left as '#' below. Swap in the
   working URL once you have it (see the PLACEHOLDER comment on that
   entry).

   `image` points at a real screenshot (in assets/projects/clean/ — the
   raw captures in assets/projects/ still had a sliver of the dev
   environment bleeding in at the edges, cropped out with PIL). Card
   thumbnails and the case-study hero banner both use it, letterboxed
   (not cropped) since these are full device mockups, bezel included.

   `gallery` is intentionally empty for now — more real screens are
   coming later, and the "Screens" section just doesn't render until
   there's something real to put in it (see projects.js buildDetailMarkup)
   rather than padding it out with fake gradient mockups next to a real
   screenshot.
   ========================================================================== */

window.App = window.App || {};

App.projectsData = [
  {
    id: 'ben10-omnitrix-watch',
    index: '01',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2024',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'Ben 10 — Omnitrix Watch',
    tagline: 'A pixel-perfect, fully animated recreation of the Omnitrix interface.',
    tags: ['Flutter', 'Dart', 'AnimationController'],
    summary:
      'A UI/animation recreation of the classic Ben 10 Omnitrix — a spinning selection dial, a radial alien-select interface, and a full transformation sequence, built entirely with hand-rolled Flutter animations.',
    problem:
      'The Omnitrix is instantly recognizable and animation-heavy in a way most portfolio UI clones aren\'t — a rotating dial that has to feel physically grabbable, a radial layout of alien icons that has to read clearly as you spin past them, and a transformation moment that needs real payoff. It was built as a focused study in pushing Flutter\'s animation system on something demanding rather than another CRUD-app clone.',
    approach:
      'The dial is fully gesture-driven — dragging it rotates the alien selection ring, with each alien icon animating its scale and highlight state as it passes the active position. Selecting an alien triggers a multi-stage transformation sequence (a build-up, a flash, and a settle) rather than a single cross-fade, so the "transformation" moment actually feels like one. Every animation is driven directly by Flutter\'s AnimationController and curved tweens — no animation packages — which was the point of building it.',
    architecture:
      'A single animated screen built around several coordinated AnimationControllers: one for the dial\'s rotation (tied to drag gestures rather than a fixed duration), and a chained sequence of controllers/curves for the transformation effect so each stage can ease independently instead of one flat timeline.',
    stack: ['Flutter', 'Dart', 'AnimationController', 'CurvedAnimation', 'GestureDetector'],
    results: [
      { label: 'Dial Control', value: 'Drag-to-rotate' },
      { label: 'Selection', value: 'Radial alien layout' },
      { label: 'Transform FX', value: 'Multi-stage sequence' },
    ],
    links: {
      code: 'https://github.com/HammasT1/Ben10_watch_flutter',
    },
    image: 'assets/projects/clean/ben10-watch.png',
    gallery: [],
    imageSeed: 1,
  },
  {
    id: 'starbucks-card-animation',
    index: '02',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2024',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'Starbucks Card Animation',
    tagline: 'A Starbucks gift-card UI with flavor selection and Hero-driven transitions.',
    tags: ['Flutter', 'Dart', 'Hero Animations'],
    summary:
      'An animation-focused Flutter app centered on a set of Starbucks-style gift cards — swipe or select between different flavors, each with its own choreographed reveal, backed by AnimationController and Hero transitions between views.',
    problem:
      'Card-based selection UIs are easy to build flat and hard to build well — the goal was a flavor-switching interaction that felt tactile and a card-to-detail transition that felt continuous rather than a hard cut, using nothing beyond Flutter\'s own animation and Hero APIs.',
    approach:
      'Each flavor card is driven by its own AnimationController for its selection/reveal state, so switching flavors animates distinctly rather than just swapping content. Moving from the card grid into a detail view uses Hero animations so the selected card visibly morphs into place instead of the screen just changing.',
    architecture:
      'A card-selection screen and a detail screen connected by shared Hero tags per card, with AnimationControllers scoped to each card widget so their reveal animations stay independent of one another.',
    stack: ['Flutter', 'Dart', 'AnimationController', 'Hero Animations'],
    results: [
      { label: 'Flavor Selection', value: 'Per-card animated state' },
      { label: 'Navigation', value: 'Hero transitions' },
      { label: 'Motion', value: 'Custom-choreographed' },
    ],
    links: {
      code: 'https://github.com/HammasT1/starbucks_card_animation',
    },
    image: 'assets/projects/clean/starbucks-card-animation.png',
    gallery: [],
    imageSeed: 2,
  },
  {
    id: 'dino-flutter',
    index: '03',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2024',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'Dino Flutter',
    tagline: 'The offline Chrome dino game, rebuilt from scratch in Flutter — no game engine required.',
    tags: ['Flutter', 'Dart', 'Game Loop'],
    summary:
      'A recreation of the offline Chrome Dinosaur game, built entirely in Flutter. Jump over cacti, dodge the day/night cycle, and chase a new high score — all rendered with a hand-rolled sprite-based game loop.',
    problem:
      'An endless runner needs a real game loop — continuous physics, procedural obstacle spawning, parallax layers, and a live score — which is a different discipline from the app-style animations elsewhere in this portfolio. The goal was proving Flutter could carry an actual game (gravity, acceleration, collision, recycling) without reaching for a dedicated engine like Flame.',
    approach:
      'Jump physics run on tunable gravity, acceleration, and jump velocity, with cactus obstacles spawning randomly and recycling once off-screen instead of accumulating. Parallax clouds and a scrolling ground layer sell the sense of motion, and the background automatically shifts from day to night the further the run goes. Score and high score track live during the run. On top of the game itself, an in-app tuning panel exposes gravity, acceleration, jump velocity, run speed, and day/night timing as live-adjustable parameters — turning the game into its own physics playground rather than hard-coding the feel once and moving on.',
    architecture:
      'A hand-rolled, sprite-based game loop with no external game engine — obstacle objects are spawned and recycled rather than endlessly allocated, rendering is layered (background/parallax clouds, ground, obstacles, player) to keep depth cheap to draw every frame, and gameplay constants are pulled from a live-editable settings source instead of being hard-coded, which is what makes the in-app physics tuning possible. Built cross-platform: Android, iOS, Web, and Windows desktop from one codebase.',
    stack: ['Flutter', 'Dart', 'Custom Game Loop', 'Sprite Rendering', 'Cross-Platform (Android/iOS/Web/Windows)'],
    results: [
      { label: 'Platforms', value: 'Android, iOS, Web, Windows' },
      { label: 'Game Engine', value: 'None — hand-rolled loop' },
      { label: 'Live Tuning', value: 'In-app physics playground' },
    ],
    links: {
      // PLACEHOLDER: https://github.com/HammasT1/dino-flutter currently 404s — swap in the working repo URL
      code: '#',
    },
    image: 'assets/projects/clean/dino-flutter.png',
    gallery: [],
    imageSeed: 3,
  },
];
