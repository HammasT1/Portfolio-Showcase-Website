/* ==========================================================================
   Real projects. The first three (Ben 10 Omnitrix Watch, Starbucks Card
   Animation, Dino Flutter) are grounded in what was confirmed directly
   (features, tech used, repo links); a few fields on those are still
   marked PLACEHOLDER because they weren't — fill those in with the real
   values.

   Dino Flutter's repo link (https://github.com/HammasT1/dino-flutter)
   currently 404s via the GitHub API — either private or a different
   name/case — so its `links.code` is left as '#' below. Swap in the
   working URL once you have it (see the PLACEHOLDER comment on that
   entry).

   The five after that (PSL Cricket Companion through WalletFX) are drafted
   from their screenshots alone — nothing beyond what's visibly on screen
   is confirmed. `links.code` is '#' for all five pending the real repo
   URLs; problem/approach/architecture read as reasonable portfolio copy
   but should be reviewed/edited against what was actually built before
   this goes live, same as any other PLACEHOLDER-marked field below.

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
  {
    id: 'psl-cricket-companion',
    index: '04',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2026',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'PSL Cricket Companion',
    tagline: 'A Pakistan Super League companion app — fixtures, live-soon match cards, and standings.',
    tags: ['Flutter', 'Dart', 'UI Design'],
    summary:
      'A PSL (Pakistan Super League) companion app UI — a home feed built around the next match, a scrollable upcoming-fixtures list, and bottom navigation into Teams and Standings.',
    // PLACEHOLDER: written from the screenshot alone — confirm whether fixture/standings data is live (API-backed) or local/mock, and correct this paragraph accordingly.
    problem:
      'A sports companion app lives or dies on how fast you can answer "what\'s next" — the goal was a home screen that leads with the next match and countdown-style framing, rather than burying it in a generic list.',
    approach:
      'The home feed is anchored by a "Next Match" card (teams, format, date/time, venue, a LIVE SOON badge) above a scrollable list of upcoming fixtures in the same team-vs-team format, with bottom navigation handing off to dedicated Teams and Standings sections.',
    architecture:
      'A tab-based shell (Home / Teams / Standings / Settings) with the home tab built around a hero fixture card plus a scrollable fixture list.',
    stack: ['Flutter', 'Dart', 'Bottom Navigation'],
    results: [
      { label: 'Home Focus', value: 'Next-match hero card' },
      { label: 'Fixtures', value: 'Scrollable upcoming list' },
      { label: 'Navigation', value: '4-tab bottom nav' },
    ],
    links: {
      // PLACEHOLDER: repo link to be provided
      code: '#',
    },
    image: 'assets/projects/clean/PSL-flutter.png',
    gallery: [],
    imageSeed: 4,
  },
  {
    id: 'nike-shop',
    index: '05',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2026',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'Nike Shop',
    tagline: 'A single-product e-commerce screen UI, built around one hero product and a clean add-to-cart flow.',
    tags: ['Flutter', 'Dart', 'E-Commerce UI'],
    summary:
      'A Nike-styled product page — a hero product shot, price, a page-indicator carousel, and a cart icon with a live item badge, closing with a clear Add to Cart action.',
    // PLACEHOLDER: written from the screenshot alone — confirm cart/checkout behavior and correct this paragraph accordingly.
    problem:
      'Product-detail screens are one of the most common UI patterns to build badly — cluttered, or so plain the product itself gets lost. The goal was a layout where the product image stays the clear focal point, with price and the cart action never competing for attention.',
    approach:
      'A single elevated card frames the hero product shot with a carousel page-indicator beneath it, product name and price directly below, and a full-width Add to Cart button anchored at the bottom — with a persistent cart icon and item-count badge always visible in the header.',
    architecture:
      'A single product-detail screen: app bar with a badge-driven cart icon, a card-framed hero image area, and a fixed bottom action bar for Add to Cart.',
    stack: ['Flutter', 'Dart', 'Cart Badge State'],
    results: [
      { label: 'Layout', value: 'Single hero product' },
      { label: 'Cart', value: 'Live item-count badge' },
      { label: 'Primary Action', value: 'Full-width Add to Cart' },
    ],
    links: {
      // PLACEHOLDER: repo link to be provided
      code: '#',
    },
    image: 'assets/projects/clean/nike-flutter.png',
    gallery: [],
    imageSeed: 5,
  },
  {
    id: 'pour',
    index: '06',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2026',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'Pour',
    tagline: 'A drink-pouring fill animation — pick a cup size and watch it fill toward a target volume.',
    tags: ['Flutter', 'Dart', 'AnimationController'],
    summary:
      'An animation-focused Flutter toy centered on a single satisfying interaction: pick a cup size (S/M/L), pour from the can, and watch the liquid level animate up to a live ml readout — with a one-tap reset.',
    // PLACEHOLDER: written from the screenshot alone — confirm the actual pour trigger (tap/drag/timer) and correct this paragraph accordingly.
    problem:
      'Fill/progress animations are everywhere but rarely feel tactile — the goal was a pour interaction specific enough (can, cup size, a real ml target) that it reads as a physical action rather than a generic progress bar with a cup graphic wrapped around it.',
    approach:
      'Selecting a cup size (S/M/L) sets the fill target, and the liquid level animates up inside a cup graphic in sync with a live "current / target ml" readout, with an "Empty cup" control to reset the animation back to zero.',
    architecture:
      'A single animated screen: a size-selector row driving the target volume, an AnimationController-backed fill level on the cup graphic, and a reset action that replays the animation from empty.',
    stack: ['Flutter', 'Dart', 'AnimationController'],
    results: [
      { label: 'Sizes', value: 'S / M / L cup targets' },
      { label: 'Feedback', value: 'Live ml readout' },
      { label: 'Reset', value: 'One-tap empty cup' },
    ],
    links: {
      // PLACEHOLDER: repo link to be provided
      code: '#',
    },
    image: 'assets/projects/clean/pour_flutter.png',
    gallery: [],
    imageSeed: 6,
  },
  {
    id: 'tetrix',
    index: '07',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2026',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'Tetrix',
    tagline: 'A Tetris clone built from scratch in Flutter, with full on-screen touch controls.',
    tags: ['Flutter', 'Dart', 'Game Loop'],
    summary:
      'A Tetris-style falling-block game rebuilt in Flutter — points, lines-cleared, level, and a next-piece preview on a classic handheld-style HUD, played entirely with on-screen touch controls.',
    // PLACEHOLDER: written from the screenshot alone — confirm the actual game-loop/input implementation and correct this paragraph accordingly.
    problem:
      'Same challenge as this portfolio\'s other game rebuild (Dino Flutter): a falling-block game needs a real, continuously-ticking game loop — piece gravity, line-clear detection, level-based speed-up — which is a different discipline from UI animation work.',
    approach:
      'The board tracks points, lines cleared ("Cleans"), and level on a persistent HUD, with a next-piece preview so upcoming pieces are never a surprise. Touch controls are fully on-screen: a directional pad for movement/rotation and a dedicated drop button, alongside sound and pause/resume/reset controls.',
    architecture:
      'A hand-rolled falling-block game loop — a grid-based board, a piece-spawning/rotation system, and level-driven speed scaling — with input handled entirely through on-screen touch controls rather than gestures.',
    stack: ['Flutter', 'Dart', 'Custom Game Loop', 'Touch Controls'],
    results: [
      { label: 'HUD', value: 'Points, Cleans, Level' },
      { label: 'Preview', value: 'Next-piece indicator' },
      { label: 'Input', value: 'Full on-screen controls' },
    ],
    links: {
      // PLACEHOLDER: repo link to be provided
      code: '#',
    },
    image: 'assets/projects/clean/tetris-flutter.png',
    gallery: [],
    imageSeed: 7,
  },
  {
    id: 'walletfx',
    index: '08',
    // PLACEHOLDER: confirm actual build year/duration
    year: '2026',
    duration: 'Personal Project',
    role: 'Solo Developer',
    title: 'WalletFX',
    tagline: 'A virtual card wallet UI with a switchable theme library for restyling the card on the fly.',
    tags: ['Flutter', 'Dart', 'Theming'],
    summary:
      'A digital wallet card UI — card number, cardholder, and expiry on a realistic card face with a reveal/hide toggle, plus a "Theme Library" for restyling the card\'s color scheme and saving favorite looks.',
    // PLACEHOLDER: written from the screenshot alone — confirm whether "Save this look" actually persists themes and correct this paragraph accordingly.
    problem:
      'Card UIs are usually static — the goal was a card that felt like a real customizable object, with restyling as a first-class feature rather than a settings-menu afterthought.',
    approach:
      'The card face shows number, cardholder, and expiry with a visibility toggle to hide sensitive digits, while a swatch-based "Theme Library" below lets you preview different card color themes and save the ones you like via "Save this look".',
    architecture:
      'A single wallet screen: a card-face widget parameterized by theme color, a swatch selector driving that parameter live, and a saved-looks list for persisted theme choices.',
    stack: ['Flutter', 'Dart', 'Theming'],
    results: [
      { label: 'Privacy', value: 'Reveal/hide card details' },
      { label: 'Theming', value: 'Live swatch preview' },
      { label: 'Personalization', value: 'Saved custom looks' },
    ],
    links: {
      // PLACEHOLDER: repo link to be provided
      code: '#',
    },
    image: 'assets/projects/clean/walletfx-flutter.png',
    gallery: [],
    imageSeed: 8,
  },
];
