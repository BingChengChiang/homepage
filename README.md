# Personal homepage / Little Ocean

A dependency-free personal homepage embedding a browser translation of the author's official asciiquarium 1.1 release. Sprites and color masks are extracted from the original Perl program; simulation rules follow the pinned upstream and Term::Animation 2.6. The current personal introduction is draft copy, not a verified biography.

## Run

Install Node.js 22 or later, then from this folder:

```powershell
node preview.mjs
```

Open http://127.0.0.1:4173. Stop with Ctrl+C. There is no npm install or build step.

## Edit

- `dist/profile.js`: name, introduction, email, social links, projects.
- `dist/style.css`: layout, colors, mobile breakpoints.
- `dist/app.js`: profile and project content rendering.
- `dist/asciiquarium/`: independent iframe application (original sprite data, translated engine, browser adapter and upstream source).
- `dist/asciiquarium/display.js`: logical terminal presets; default 160 × 48. Viewport resizing scales the terminal instead of shrinking its column count. The dropdown or `?size=200x60` changes the terminal dimensions without changing simulation speeds.
- `dist/index.html`: structure, browser description, labels, document language.
- `dist/favicon.svg`: browser tab icon.
- `.github/workflows/pages.yml`: automatic validation and GitHub Pages deployment.

The browser serves `dist/` as-is. Full Traditional Chinese operations manual: [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Equivalence checks

```powershell
node tests/parity.mjs
node tests/trace-parity.mjs
```

42 spawn fixtures and 3,000 full frames are compared against actual upstream Perl evaluation. Frame comparison replays Perl's randomized hash traversal and random inputs to compare the same execution. Independent sessions have different randomness and same-depth tie order; browser scheduling and font rasterization also differ. See [docs/PORT-PARITY.md](docs/PORT-PARITY.md).

The original code, sprites and this derivative are supplied under GPL-2.0-or-later. See LICENSE and dist/asciiquarium/NOTICE.md. No Perl runtime, backend or hosted terminal is needed by visitors.

## GitHub Pages

Live site: https://bingchengchiang.github.io/homepage/

For daily updates, deployment and event previews, read [docs/GITHUB-PAGES.md](docs/GITHUB-PAGES.md). Tests run before publishing dist/.
