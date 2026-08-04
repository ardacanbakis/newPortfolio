# newPortfolio

Two design directions for [ardacanbakis.com](https://www.ardacanbakis.com/), sharing the same
content.

## Live preview

| | |
| --- | --- |
| **Version chooser** | <https://ardacanbakis.github.io/newPortfolio/> |
| **Version 1** — current styling, refreshed | <https://ardacanbakis.github.io/newPortfolio/v1/> |
| **Version 2** — yin-yang | <https://ardacanbakis.github.io/newPortfolio/v2/> |

Published by `.github/workflows/deploy-pages.yml`, which redeploys on every push to this branch.
Locally, open `index.html` at the root to preview both side by side.

| | |
| --- | --- |
| **`v1/`** | The current site's styling, kept intact and brought up to date. |
| **`v2/`** | A yin-yang themed redesign. |

Both are plain HTML, CSS and JavaScript — no build step, so either folder can be uploaded to
CyberPanel as-is.

---

## Before this goes live

### 1. Connect the contact form

The form posts to [Web3Forms](https://web3forms.com) (free, no account limits, no server needed).

1. Enter your email at <https://web3forms.com> — they email you an access key.
2. In `v1/index.html`, find this line and paste the key in:

   ```html
   <input type="hidden" name="access_key" value="YOUR-WEB3FORMS-ACCESS-KEY" />
   ```

Until a real key is in place the form tells visitors to email directly instead of silently
failing.

### 2. Choose the WhatsApp opening message

Set `WHATSAPP_STYLE` near the top of `v1/portfolio.js`. Four are written and translated into
English, Turkish and Spanish, so the message follows the visitor's chosen language:

| Style | English text |
| --- | --- |
| `project` | "Hi Arda! I saw your portfolio and I'd like to talk about a project." |
| `quote` *(current)* | "Hi Arda! I'd like to get a quote for a website / web app." |
| `casual` | "Hello Arda 👋 Coming from ardacanbakis.com — I have a question." |
| `hiring` | "Hi Arda! I'd like to talk to you about a role / collaboration." |

Use `"blank"` to open an empty chat instead. The number itself is `WHATSAPP_NUMBER` on the line
above.

### 3. Swap in real project screenshots

The five newest projects use generated placeholder art in `v1/assets/projects/`. Replacing them
needs no code changes — drop in a file with the same basename:

```
gridsmith.svg  musicvisualizer.svg  budgetsim.svg  stlsmith.svg
digitalmuseum.svg  hushbar.svg  wedding.svg
```

If you use `.png` or `.jpg` instead, update the `src` in `v1/index.html` to match. Anything close
to 8:5 crops cleanly; other ratios are centre-cropped to fit.

### 4. Confirm three URLs

These were inferred from the repositories rather than confirmed, so check them:

- `https://ardacanbakis.github.io/gridSmith/`
- `https://ardacanbakis.github.io/musicVisualizer/`
- `https://ardacanbakis.github.io/digitalMuseum/`

Confirmed already: stlSmith and hushBar (from their READMEs), and
`wedding.ardacanbakis.com/story/`. budgetSim links to its repository — swap in the Vercel URL if
you'd rather point at the deployment.

---

## What changed in v1

**Projects** — replaced the old three with nine, each with a description, technology tags and
links:

1. gridSmith · 2. musicVisualizer · 3. budgetSim · 4. stlSmith · 5. digitalMuseum ·
6. hushBar *(separate macOS and Windows repo links)* · 7. Tansu & Arda Wedding *(links to
`/story/`)* · 8. VetApp · 9. Theo's Gym

**Contact** — a real form (name, email, subject, message) with inline validation, a honeypot
field, and status messages in all three languages, alongside direct email, WhatsApp and Linktree
links.

**WhatsApp** — a floating button, bottom right, with a pulse animation and hover tooltip. Also
appears in the contact panel and the footer.

**Footer** — ported from gridSmith's welcome screen: a centred row of circular social icons above
"Created with ♥ by Arda Canbakış". Uses inline SVG like gridSmith does, so it still renders if the
icon CDN is unavailable. Adds Stack Overflow, Medium, Linktree and WhatsApp to gridSmith's
original six.

### Fixes

- **Theme toggle was broken.** Two listeners toggled two different class names (`dark` and
  `dark-theme`) but only `dark-theme` had styles, so the first click did nothing visible. Now one
  listener, one class.
- **`section { max-height: 100vh }`** clipped any section taller than the viewport. Removed.
- **`scroll-behavior: smooth` on `*`** applied to every element instead of the scroll container.
  Moved to `html`.
- Spanish translations were missing several keys.
- Copyright year is generated, not hardcoded.

### Additions

- Theme and language choices persist in `localStorage`; first-time visitors get their system
  theme and browser language.
- Meta description, Open Graph and Twitter cards, canonical URL, and Person structured data.
- Scroll-reveal animations, active-section nav highlighting, a back-to-top button, and a header
  shadow on scroll.
- Accessibility: skip link, ARIA labels, visible focus states, and full
  `prefers-reduced-motion` support.
- Services expanded from three to four, adding **3D & Parametric Tools** to reflect gridSmith and
  stlSmith.

---

## What v2 is

Same content, same nine projects, same footer — a different idea about how to present them.

**The page is the symbol.** It opens deep and dark, ends bright and light, and turns over at a
flowing S-curve seam roughly two-thirds of the way down, with a jade-ringed yin-yang medallion
sitting in the curve.

**Yin and yang mean something here.** The Craft section splits into a literal light card and dark
card: *Frontend & Design* against *Backend & Systems*. The concept carries the message that you
work across the whole stack.

Also: serif headings (Playfair Display) over a sans body (Inter), a jade-leaning blue accent that
brightens on dark and deepens on light, a fixed side-rail of dot navigation that re-colours as the
page turns, and a full-screen overlay menu on mobile.

### How the inversion actually works

The obvious approach — interpolating the background from black to white and the text from white to
black on scroll — does not survive contact with a reader. Both colours pass through mid-grey at the
same moment. Measured, the midpoint came out as `rgb(163,164,163)` text on `rgb(94,95,95)`: a
contrast ratio near 1:1, i.e. invisible.

So the tone changes in **full-contrast bands** instead. Each section declares its own palette, the
bands drift steadily lighter down the page, and the actual dark-to-light flip happens inside a
divider — at the seam, where a curve is already drawing the eye. It reads as one continuous
inversion, and measured across the whole page the text/background contrast never drops below
**15.3:1** (WCAG AA wants 4.5:1).

To configure v2, edit `v2/app.js` and `v2/styles.css`:

- **WhatsApp message** — `WHATSAPP_STYLE`, same four options as v1.
- **Contact form** — same Web3Forms `access_key` placeholder in `v2/index.html`.
- **Colours** — the `--band-1` … `--band-6` and `--yin-*` / `--yang-*` variables at the top of
  `v2/styles.css`. Changing the accent is two values.

---

## Responsive behaviour

Both versions use the same breakpoint ladder:

| Width | Target | Layout |
| --- | --- | --- |
| ≥1281px | Desktop | Three project columns; v2 shows its side rail |
| 1024–1280 | Small laptop, tablet landscape | Three columns, tighter padding |
| 768–1023 | Tablet portrait | Two columns; v2 switches to the hamburger |
| 600–767 | Large phone landscape, small tablet | Single column, nav behind the hamburger |
| 430–599 | Large phones | Single column, full-width buttons |
| 360–429 | Standard phones | Reduced type scale, condensed footer |
| ≤359 | Small phones | Smallest scale; v2 drops the wordmark for the controls |

Plus a rule for phones held sideways (`orientation: landscape` under 520px tall), which drops
the full-height hero so a 380px-tall screen isn't spent entirely on the title.

Verified in a headless browser at eleven widths from 320px to 1440px: no horizontal overflow and
no unreachable navigation at any of them.

### Bugs this uncovered

- **v2 tablets had no navigation at all.** The side rail was hidden below 1100px but the
  hamburger only appeared below 760px, so every width in between — every tablet — had neither.
  Both now switch at the same point.
- **`minmax(33rem, 1fr)` overflowed small phones.** An auto-fit track still demands its minimum
  when the container is narrower, so cards pushed past the viewport at 320px. Now
  `minmax(min(33rem, 100%), 1fr)`.
- **v1's cycling job title printed on top of "Web Developer".** The space for it was reserved by
  a fixed `margin-left` tuned for the desktop font size. It is now an inline-grid whose track
  measures itself against all three words, with the reveal done by `clip-path` so each word keeps
  its full width.
- **v1's logo, hamburger and theme toggle were icon-font glyphs.** If the icon CDN is slow or
  blocked — which happens on mobile connections — the hamburger renders as nothing and there is
  no way to open the menu. All three are now inline SVG.
- **`100vh` sections** counted the space the phone's URL bar occupies. Now `100svh`.
- Touch targets are sized in px rather than rem, since the root font-size shrinks on small
  screens and rem-based controls would get smaller exactly where fingers need them biggest.
- v1's mobile drawer inherited `justify-content: space-between` from the desktop bar, spreading
  four links down the full height, and had no way to dismiss it by tapping outside. Both fixed.

## Known limitations

Fonts and icons still load from Google Fonts and cdnjs. Self-hosting them would remove two
third-party requests and make the site faster and more private — worth doing, but it changes the
asset pipeline, so it is left as a follow-up.

The two folders duplicate their assets and translation strings so that either can be uploaded on
its own. Once you pick a version, the other can simply be deleted.
