# Portfolio versions — roadmap

Forty designs over the same content. Every version carries the same six projects, the same four
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
| 4 | `v4/` | Swiss minimal / typographic | **Done** |
| 5 | `v5/` | Editorial / brutalist | **Done** |
| 6 | `v6/` | Bento grid dashboard | **Done** |
| 7 | `v7/` | Interactive 3D / WebGL | **Done** |
| 8 | `v8/` | Timeline / journey | **Done** |
| 9 | `v9/` | Glassmorphism / aurora | **Done** |
| 10 | `v10/` | Retro terminal / Y2K | **Done** |
| 11 | `v11/` | Particle constellation | **Done** |
| 12 | `v12/` | Liquid mesh gradient | **Done** |
| 13 | `v13/` | **Art piece** — scroll-choreographed typography | **Done** |
| 14 | `v14/` | Generative flow field | **Done** |
| 15 | `v15/` | Isometric parallax world | **Done** |
| 16 | `v16/` | **Themed** — handheld overworld, voxel 3D | **Done** |
| 17 | `v17/` | **Themed** — scouter HUD | **Done** |
| 18 | `v18/` | **Themed** — construction-paper cutout | **Done** |
| 19 | `v19/` | **Slider** — filmstrip | **Done** |
| 20 | `v20/` | **Slider** — card stack | **Done** |
| 21 | `v21/` | **Slider** — prism | **Done** |
| 22 | `v22/` | **Slider** — iris | **Done** |
| 23 | `v23/` | **Slider** — fly-through | **Done** |
| 24 | `v24/` | **Tool** — working parametric configurator | **Done** |
| 25 | `v25/` | **App** — file explorer | **Done** |
| 26 | `v26/` | **App** — inbox | **Done** |
| 27 | `v27/` | **Spatial** — map | **Done** |
| 28 | `v28/` | **App** — spreadsheet | **Done** |
| 29 | `v29/` | **Search** — command palette | **Done** |
| 30 | `v30/` | **Light** — torch | **Done** |
| 31 | `v31/` | **Spatial** — infinite canvas | **Done** |
| 32 | `v32/` | **Playable** — arena | **Done** |
| 33 | `v33/` | **Print** — print-first CV | **Done** |
| 34 | `v34/` | **Print** — risograph | **Done** |
| 35 | `v35/` | **Type** — kinetic variable font | **Done** |
| 36 | `v36/` | **Platform** — liquid glass, OKLCH, `@property` | **Done** |
| 37 | `v37/` | **Platform** — scroll-driven animation, no motion script | **Done** |
| 38 | `v38/` | **Platform** — view transitions, shared-element morph | **Done** |
| 39 | `v39/` | **Platform** — container queries, anchor positioning, popover | **Done** |
| 40 | `v40/` | **Maximalist** — collage zine | **Done** |

Versions 11–15 add a motion layer: an animated background, a custom cursor, magnetic buttons,
scroll-velocity effects and section transitions, each with a different engine so none reads as a
reskin of another.

Versions 16–18 are the three fandom-flavoured builds. They are **original homages, not
reproductions** — there are no copyrighted sprites, character likenesses, logos or trademarked
fonts anywhere in them. Every figure, badge, tile and glyph was drawn for this repository.

Versions 19–23 are the sliders: one page, no scrollbar, content advancing one full-viewport panel
at a time. They share a single engine (`shared/deck.js`) and differ only in how a panel arrives.

Versions 24–35 stop varying the surface and vary the *substance*: what the content is structured
as, how you operate it, and what medium it pretends to be.

Versions 36–40 are built on browser features that appear nowhere in the first thirty-five, each
one carrying the design rather than decorating it:

| Version | The feature | What it is actually for |
| --- | --- | --- |
| 36 | `oklch()`, `@property`, layered `backdrop-filter` | One hue token drives the whole palette; typed custom properties let the specular and the rim light interpolate at all |
| 37 | `animation-timeline: view()` / `scroll()`, `timeline-scope` | Every animation, the reading bar, the active nav link and the WhatsApp gate, with no script reading the scroll |
| 38 | `startViewTransition`, `view-transition-name` | A project card that morphs into its own detail view, and a theme swap revealed through an expanding circle |
| 39 | `@container`, `anchor-name` / `position-try-fallbacks`, `popover`, `@starting-style` | One card component that lays itself out three ways from its slot, with a popover the browser positions and dismisses |
| 40 | `text-wrap: balance` / `pretty`, `field-sizing: content` | Display type at poster size that never rags badly, and a message box that grows with what you write |

Each of the five feature-detects and degrades: 37 hands the work back to script where scroll-driven
animation is missing, 38 swaps views instantly without `startViewTransition`, 39 centres its popover
where anchor positioning is unsupported, and 36 and 40 lose only polish.

All forty are built and deployed. Compare them from the root `index.html`, then say which
one should become the live site and I will promote it to the root and remove the rest.

## What every version must have

Non-negotiables, so the comparison stays fair:

- The same six projects, in order — gridSmith, musicVisualizer, hushBar, Tansu & Arda,
  VetApp, Theo's Gym. hushBar carries separate macOS and Windows links; the wedding site points
  at `/story/`.
- Working contact form (Web3Forms), plus direct email, WhatsApp and Linktree.
- WhatsApp button that appears only after the projects, then stays. (One exception, and a
  deliberate one: v37 drives the gate from a CSS scroll timeline rather than from script, and a
  scroll timeline tracks position rather than remembering it — so the button also goes away again
  if you scroll back up to the hero. The rule it is serving is unchanged: nobody is offered
  WhatsApp before they have seen the work.)
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

**v16 · Handheld overworld.** A voxel town rendered from scratch on a 2D canvas through an
orthographic camera. It opens at 90° pitch, where every box's side faces have zero projected area
and the world reads as a flat grid of coloured squares; scrolling drops the pitch and swings the
yaw, and the tiles turn out to have been solid geometry all along. The render also upgrades its
hardware as you go — a ~200px backing store in four greens at the top of the page, full device
resolution in full colour by the time the work arrives. Projects are dex entries with type slabs
and stat bars; dialogue prints a character at a time.

**v17 · Scouter.** The page seen through an eyepiece: lens tint, hex mesh, corner brackets, and a
reticle that locks onto whichever project is nearest the middle of the viewport. Each one is given
a power level computed from what is actually on the card — 800 per technology, 600 per link, plus
a hand-set scope figure — and the numbers climb rather than appearing. The largest reads past the
device's range and cracks the glass, once, never under reduced motion.

**v18 · Construction paper.** Every element is a piece of card: the same fibre grain on each sheet,
torn clip-path edges rather than radii, a hard offset shadow because paper sits on paper, and a
three-frame stop-motion wobble on the cut-out pieces. A mountain town parallaxes behind in three
layers and paper snow falls as squares, not circles. The wobble is deliberately kept off body
copy — text that will not hold still is unreadable.

## Shared code

From v3 onward the translations, WhatsApp configuration and contact-form handling live in
`shared/site.js`, rather than being copied into every version. Eight copies of five hundred
lines of translation strings would guarantee they drift apart.

Consequence: **v3 and later need the `shared/` folder uploaded alongside them.** v1 and v2 stay
fully self-contained and can still be uploaded on their own.

Project cards stay written out in each version's HTML rather than generated from data at
runtime, so the content is in the page for search engines and for anyone with JavaScript off.


## The sliders (v19–v23)

One page, no scrollbar. Content advances a full viewport at a time, driven by the wheel, the arrow
keys, a swipe, the dot rail or the header nav. All five run on `shared/deck.js` and each supplies
only its own transition, written against the two things the engine publishes: `[data-state]`
(`current` / `past` / `future`) and `--offset`, a slide's signed distance from the current one.

| # | Mechanic | The feature to test |
| --- | --- | --- |
| 19 | Panels travel sideways | A **filmstrip** of every panel along the bottom — thumbnails for the work, labels for the rest. Replaces the dot rail: with ten panels, a picture you recognise beats a circle you have to count. |
| 20 | A literal stack of cards | **Drag-to-throw.** The top card follows your finger and tilts before it commits, and the next two are visible behind it so you can see how much is left. |
| 21 | Faces of a turning prism | **Direction-aware rotation.** Forward turns one way, back turns the other, so the deck has handedness instead of always looking like it is going forward. |
| 22 | A circle opening over the page | **Origin-aware reveal.** The panel opens from the exact point you pressed — the arrow, the dot, where your finger left. A keypress has no point on screen, so that one opens from the middle rather than inventing a location. |
| 23 | Panels stacked in depth | **Parallax on arrival.** You fly through the panels, and the pieces inside each one sit at different depths and separate as it lands. A starfield behind speeds up on the frames the deck is actually moving. |

### What the shared engine has to get right

A deck breaks three things by default, so `deck.js` handles all three:

- **It degrades.** Every rule that removes the scrollbar is scoped under `.deck-ready`, a class the
  script adds. With JavaScript off — or if `deck.js` simply fails to load — the same markup is an
  ordinary scrolling page and each version falls back to the standard wiring.
- **Focus does not wander off-screen.** Tabbing into a panel parked three screens away is the
  classic carousel bug. Inactive panels are `inert`, with a tabindex sweep behind it.
- **It yields.** A panel taller than the viewport keeps its own scrollbar, and the wheel will not
  change slide until that inner region has reached its end. This is what makes the contact panel
  usable on a short laptop screen, on a phone in landscape and at 200% browser zoom.

Each project gets its own panel — ten in total. That is the only honest way to fit a paragraph of
description on a phone screen that cannot scroll, and it is why the rail is built from *chapters*
rather than slides: six work panels are one dot.


## Beyond the surface (v24–v35)

Everything up to v23 varies how the same page *looks* or how you move through it. These twelve
vary something harder: what the content **is**, how you **operate** it, or what **medium** it
imitates.

### What the content is

| # | Shape | The idea |
| --- | --- | --- |
| 24 | **A tool** | The hero is a working parametric bin generator — columns, rows, height and wall thickness, a live shaded 3D preview, and a **real binary STL** you can download and print. `v24/solid.js` meshes it, renders it and exports it in about four hundred lines with no WebGL and no library. This is the only version that *proves* the "3D & Parametric Tools" service instead of claiming it. |
| 25 | **A file explorer** | Tree, tabs, gutter, minimap, status bar. Not v3's terminal — the graphical thing you actually spend the day in. The minimap is built from the real paragraph lengths of the open pane. |
| 26 | **An inbox** | Projects as threads with attachments; folders, live search, a reading pane. On a phone it becomes what a mail app becomes: a list that pushes a reader over it, with a back button. |
| 27 | **A map** | Six pins in a workshop quarter, three districts around them, roads between. Pan, zoom, click a pin. Spatial memory does real work here — people remember *where* something was. |
| 28 | **A spreadsheet** | Column letters, row numbers, a formula bar, sheet tabs. The totals row is genuinely computed from the cells it names, and it is a real `<table>` underneath, so it reads correctly to a screen reader. |
| 31 | **A board** | One infinite canvas. Zoom out and the entire portfolio is visible at once as a single shape — the only version that can show you all of it in one glance. |
| 32 | **A game** | An arena you walk around, collecting the six projects. Built around one rule: the game is a way in, never the only way. Every card is in the document from the first frame and there is a permanent one-click skip. |

### How you operate it

| # | Idea | The interesting part |
| --- | --- | --- |
| 29 | **Command palette** | Search *is* the navigation. ⌘K, Ctrl+K or `/`. The matcher is a subsequence scorer, so "gs" finds gridSmith and "wnd" finds the Windows build — a substring test finds neither. The header nav only collapses once the script has confirmed it can honour the shortcut. |
| 30 | **Torch** | The page arrives unlit and you read by moving a beam, which also finds margin notes too dark to see otherwise. The switch matters more than the effect: a remembered lights-on control, and a lit default whenever the visitor cannot aim or has asked for less motion or more contrast. |
| 35 | **Kinetic type** | One variable font, driven per letter by pointer distance across both the weight and width axes. Letter positions are measured once rather than per frame, and the loop parks when nothing is moving. |

### What medium it imitates

| # | Idea | The interesting part |
| --- | --- | --- |
| 33 | **Print-first CV** | The only version designed for paper. An A4 sheet on screen with the page breaks drawn where the printer will make them; Ctrl+P strips the navigation, prints link URLs after their text, and never splits an entry across a page. No other version has a print stylesheet at all. |
| 34 | **Risograph** | Not flat colour on textured paper — that is v18. This is *printing*: separate ink layers blended with multiply, deliberate and consistent misregistration, and photographs screened into real halftone dots. |

### Shared code

Two new shared pieces came out of these:

- **`shared/pan.js`** — the pan-and-zoom surface behind v27 and v31. Zoom about a point solved
  properly rather than corrected after the fact, two-pointer pinch, clamping so the plane can
  never be lost off-screen, and a published counter-scale so pins hold their size at any zoom.
- **`shared/content.py`** *(build-time, in the scratchpad)* — every generated version parses its
  projects, services and about copy out of `v15/index.html` rather than repeating them, so the
  content can only ever change in one place.

Both spatial versions keep a real, ordered list of everything in the markup and treat the plane as
a view onto it. A spatial layout that is *only* spatial is one most people cannot use.
