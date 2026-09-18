/* ==========================================================================
   v42 — Descent.

   A single vertical shaft. Reading the page lowers you through it: you start
   in the open air above the pit head, the work is cut into the topsoil and
   the clay, the services are down in sandstone, and the contact form is at
   the bottom of a granite chamber six hundred metres down.

   The whole scene is one idea — the camera has a depth, and every band of
   rock knows the range of depths it occupies. Nothing is positioned; things
   are *at* a depth, and what you see is whatever the window between
   `camera` and `camera + screenHeight` happens to intersect. That is why the
   strata can be taller than the screen, why they scroll at exactly the right
   rate with no bookkeeping, and why the depth gauge is honest.

   The rock itself is procedural but never random at runtime: one seeded
   generator builds every pebble, crack and fossil once, so the shaft is the
   same shaft on every visit and in every language.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const S = window.Scene;
  if (!P) return;

  /* Two separate fallbacks, because they fail at different levels.

     No deck engine at all — the page is an ordinary scrolling document and
     gets the standard wiring.

     Deck but no Scene — the version still works completely as a deck; it just
     has no scenery. Folding these two cases together (the obvious `!deck ||
     !S`) would have left a page that is one screen with no scrollbar being
     wired as though it scrolled, which is how you end up with a WhatsApp gate
     that never opens. */
  const deck = window.Deck ? window.Deck.create() : null;
  if (!deck) {
    P.wireStandardPage();
    return;
  }

  P.wireChrome();
  P.gateWhatsappAfterChapter(deck, "projects", document.querySelector(".whatsapp-float"));

  if (!S) return;

  const stageEl = document.getElementById("stage");
  const cv = S.canvas(stageEl);
  const root = document.documentElement;

  /* ── The column ───────────────────────────────────────────────────────
     Depths in metres. `from` is the top of the band; the last one runs to the
     bottom of the world. The colours are two per band — the rock and its
     grain — so a band can be drawn as a fill plus speckle rather than as a
     flat rectangle. */
  const TOTAL = 620;
  const STRATA = [
    { from: -40, rock: [126, 160, 196], grain: [168, 196, 220], name: "air" },
    { from: 0,   rock: [74, 56, 38],    grain: [104, 82, 56],   name: "topsoil" },
    { from: 70,  rock: [124, 88, 58],   grain: [152, 112, 74],  name: "clay" },
    { from: 190, rock: [150, 122, 86],  grain: [186, 158, 116], name: "sandstone" },
    { from: 330, rock: [78, 78, 88],    grain: [104, 104, 116], name: "shale" },
    { from: 460, rock: [58, 54, 62],    grain: [86, 80, 92],    name: "granite" },
  ];

  const bandAt = (d) => {
    let b = STRATA[0];
    for (let i = 0; i < STRATA.length; i++) if (d >= STRATA[i].from) b = STRATA[i];
    return b;
  };

  /* ── Contents of the rock ─────────────────────────────────────────────
     Generated once, in world coordinates, from a fixed seed. x is a fraction
     of the shaft width so it survives a resize; y is metres. */
  const rnd = S.prng(42424242);
  const INCLUSIONS = [];
  for (let i = 0; i < 520; i++) {
    const y = -30 + rnd() * (TOTAL + 40);
    INCLUSIONS.push({
      x: rnd(),
      y,
      r: 1 + rnd() * (y > 300 ? 5 : 3.4),
      /* Flat pebbles lie down in sediment and stand up in fractured rock. */
      squash: y > 330 ? 0.4 + rnd() * 0.9 : 0.25 + rnd() * 0.35,
      tilt: (rnd() - 0.5) * 1.4,
      shade: 0.25 + rnd() * 0.6,
    });
  }

  /* Cracks: polylines that run across the shaft, denser the deeper you go. */
  const CRACKS = [];
  for (let i = 0; i < 46; i++) {
    const y = 80 + rnd() * (TOTAL - 60);
    const pts = [];
    let x = rnd();
    for (let k = 0; k < 6; k++) {
      pts.push({ x, y: y + k * (2 + rnd() * 5) });
      x += (rnd() - 0.5) * 0.24;
    }
    CRACKS.push(pts);
  }

  /* Dust falls past the camera the whole time you are underground. */
  const MOTES = Array.from({ length: 70 }, () => ({
    x: rnd(),
    y: rnd(),
    r: 0.5 + rnd() * 1.4,
    v: 0.02 + rnd() * 0.07,
    a: 0.1 + rnd() * 0.35,
  }));

  const stage = S.stage(deck, {
    ambient: true,
    /* Rock names only. The depth beside them is live, counted out of --depth
       by the stylesheet, so putting a fixed figure here too would print two
       different numbers next to each other. */
    places: [
      { at: 0.0,  label: { en: "Surface",   tr: "Yüzey",      es: "Superficie" } },
      { at: 0.14, label: { en: "Topsoil",   tr: "Üst toprak", es: "Suelo" } },
      { at: 0.36, label: { en: "Clay",      tr: "Kil",        es: "Arcilla" } },
      { at: 0.62, label: { en: "Sandstone", tr: "Kumtaşı",    es: "Arenisca" } },
      { at: 0.84, label: { en: "Granite",   tr: "Granit",     es: "Granito" } },
    ],
  });

  let clock = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;

    /* The camera looks at a window of the world `depthSpan` metres tall. */
    const depthSpan = 150;
    const camera = -30 + u * (TOTAL - depthSpan + 30);
    const mPerPx = depthSpan / h;
    const yOf = (metres) => (metres - camera) / mPerPx;

    root.style.setProperty("--depth", String(Math.round(Math.max(0, camera + depthSpan * 0.5))));

    /* How far from daylight you are. Drives the vignette, the plate and the
       colour temperature of the head-lamp glow in the stylesheet. */
    const dark = S.smoothstep(-10, 120, camera + depthSpan * 0.5);
    root.style.setProperty("--dark", dark.toFixed(3));

    /* ── Rock ──────────────────────────────────────────────────────────
       Each band drawn only where it actually meets the window. The boundary
       between two bands is a noisy line rather than a rule — geology does not
       come with a straight edge, and a straight edge is the single thing that
       makes a layered background read as a stack of divs. */
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < STRATA.length; i++) {
      const band = STRATA[i];
      const next = STRATA[i + 1];
      const top = yOf(band.from);
      const bottom = next ? yOf(next.from) : h + 40;
      if (bottom < -60 || top > h + 60) continue;

      ctx.fillStyle = S.rgb(band.rock);
      ctx.beginPath();
      ctx.moveTo(0, Math.max(-60, top));

      if (top > -60 && top < h + 60 && i > 0) {
        /* Noisy upper boundary, deterministic in world space so it does not
           crawl as the camera moves. */
        for (let x = 0; x <= w + 10; x += 10) {
          const n =
            Math.sin(x * 0.014 + band.from) * 5 +
            Math.sin(x * 0.041 + band.from * 2.3) * 2.6;
          ctx.lineTo(x, top + n);
        }
      } else {
        ctx.lineTo(w, Math.max(-60, top));
      }

      ctx.lineTo(w, Math.min(h + 60, bottom));
      ctx.lineTo(0, Math.min(h + 60, bottom));
      ctx.closePath();
      ctx.fill();
    }

    /* ── Inclusions ────────────────────────────────────────────────────
       Only those inside the window are touched. Five hundred ellipses a frame
       would be fine on a desktop and would not be on a phone. */
    for (let i = 0; i < INCLUSIONS.length; i++) {
      const p = INCLUSIONS[i];
      const y = yOf(p.y);
      if (y < -20 || y > h + 20) continue;
      const band = bandAt(p.y);
      if (band.name === "air") continue;
      ctx.globalAlpha = p.shade * 0.55;
      ctx.fillStyle = S.rgb(band.grain);
      ctx.beginPath();
      ctx.ellipse(p.x * w, y, p.r * 2.2, p.r * 2.2 * p.squash, p.tilt, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* ── Cracks ────────────────────────────────────────────────────────── */
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    for (let i = 0; i < CRACKS.length; i++) {
      const pts = CRACKS[i];
      const y0 = yOf(pts[0].y);
      if (y0 < -80 || y0 > h + 80) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * w, y0);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x * w, yOf(pts[k].y));
      ctx.stroke();
    }

    /* ── Sky, while any of it is still in frame ────────────────────────── */
    const skyBottom = yOf(0);
    if (skyBottom > 0) {
      const g = ctx.createLinearGradient(0, 0, 0, Math.min(h, skyBottom));
      g.addColorStop(0, "#9fc4e2");
      g.addColorStop(1, "#d8e6ef");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, Math.min(h, skyBottom));

      /* The lip of the pit, so the transition from air to ground is an edge
         you fall over rather than a colour change. */
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, Math.min(h, skyBottom) - 3, w, 3);
    }

    /* ── Shaft walls ───────────────────────────────────────────────────
       Two vertical gradients pulling the edges into shadow. This is what
       makes it a shaft and not a wallpaper of rock. */
    if (skyBottom < h) {
      const left = ctx.createLinearGradient(0, 0, w * 0.34, 0);
      left.addColorStop(0, "rgba(0,0,0,0.62)");
      left.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = left;
      ctx.fillRect(0, Math.max(0, skyBottom), w, h);

      const right = ctx.createLinearGradient(w, 0, w * 0.66, 0);
      right.addColorStop(0, "rgba(0,0,0,0.62)");
      right.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = right;
      ctx.fillRect(0, Math.max(0, skyBottom), w, h);
    }

    /* ── Dust ──────────────────────────────────────────────────────────
       Falls, wraps, and only exists once you are in the dark. */
    if (dark > 0.05) {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < MOTES.length; i++) {
        const m = MOTES[i];
        m.y = (m.y + m.v * dt) % 1;
        ctx.globalAlpha = m.a * dark * 0.8;
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
