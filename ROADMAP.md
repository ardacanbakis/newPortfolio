# Portfolio versions — roadmap

Ten designs over the same content. Every version carries the same six projects, the same four
services, the same contact options and the same gridSmith-derived footer. Only the design
changes, so they can be compared like for like.

Preview them all from `index.html` at the repo root, or live at
<https://ardacanbakis.github.io/newPortfolio/>.

## Status

| # | Version | Concept | State |
| --- | --- | --- | --- |
| 1 | `v1/` | Current styling, refreshed | **Done** |
| 2 | `v2/` | Yin-yang, scroll-driven inversion | **Done** |
| 3 | `v3/` | Terminal / developer console | **Done** |
| 4 | `v4/` | Swiss minimal / typographic | Planned |
| 5 | `v5/` | Editorial / brutalist | Planned |
| 6 | `v6/` | Bento grid dashboard | Planned |
| 7 | `v7/` | Interactive 3D / WebGL | Planned |
| 8 | `v8/` | Timeline / journey | Planned |
| 9 | `v9/` | Glassmorphism / aurora | Planned |
| 10 | `v10/` | Retro terminal / Y2K | Planned |

Built in that order: the ones most different from each other come first, so the useful
comparisons arrive early. Stop at any point — each is finished and deployed as it lands.

## What every version must have

Non-negotiables, so the comparison stays fair:

- The same six projects, in order — gridSmith, musicVisualizer, hushBar, Tansu & Arda,
  VetApp, Theo's Gym. hushBar carries separate macOS and Windows links; the wedding site points
  at `/story/`.
- Working contact form (Web3Forms), plus direct email, WhatsApp and Linktree.
- WhatsApp button that appears only after the projects, then stays.
- gridSmith's footer: circular social icons over "Created with ♥ by Arda Canbakış".
  No Stack Overflow.
- English, Turkish and Spanish.
- The full responsive ladder: 320px to 1440px, no horizontal overflow, navigation reachable at
  every width, 44px touch targets.
- `prefers-reduced-motion` respected.
- No build step — plain HTML, CSS and JavaScript that can be uploaded as-is.

## The designs

**v3 · Terminal / developer console.** The page is a command line. `whoami`, `ls projects/`,
`cat about.md`, `./contact` — typed or clicked, with output printing above the prompt. Boot
sequence on load, blinking cursor, monospace throughout.

**v4 · Swiss minimal / typographic.** Strict grid, generous whitespace, one accent colour,
impeccable type. The most restrained of the ten and the sharpest contrast to v3.

**v5 · Editorial / brutalist.** Oversized type, asymmetric grid, hard rules, near-zero colour.
Reads like a design annual.

**v6 · Bento grid dashboard.** A mosaic of differently-sized tiles — projects, stack, activity,
location. Highly scannable.

**v7 · Interactive 3D / WebGL.** A navigable scene where projects are objects. Plays to the
Three.js work; needs a solid 2D fallback for weak devices.

**v8 · Timeline / journey.** One scrolling path from Patika through client work to today.
Narrative rather than grid.

**v9 · Glassmorphism / aurora.** Frosted panels over animated gradient light. Soft and premium.

**v10 · Retro terminal / Y2K.** CRT scanlines, pixel type, boot chime. Deliberately the most
playful — and deliberately last, since it overlaps v3 and is the easiest to cut.

## Shared code

From v3 onward the translations, WhatsApp configuration and contact-form handling live in
`shared/site.js`, rather than being copied into every version. Eight copies of five hundred
lines of translation strings would guarantee they drift apart.

Consequence: **v3 and later need the `shared/` folder uploaded alongside them.** v1 and v2 stay
fully self-contained and can still be uploaded on their own.

Project cards stay written out in each version's HTML rather than generated from data at
runtime, so the content is in the page for search engines and for anyone with JavaScript off.
