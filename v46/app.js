/* ==========================================================================
   v46 — Orbit.

   A launch. The hero is on the pad at night; the first projects are the climb
   through the atmosphere; the middle of the work is orbit, with the planet
   filling the bottom of the frame; the services are the transfer burn that
   takes you away from it; the contact form is out in the dark with nothing
   but stars.

   The stars are real three-dimensional points, not sprites at random
   positions. Each has an x, y and z in a box in front of the camera, and is
   projected with an honest perspective divide every frame. That is what buys
   the two things a flat starfield can never do: stars near the camera sweep
   past faster than distant ones with no per-layer bookkeeping, and the whole
   field converges on a vanishing point during the burn, so acceleration
   *looks* like acceleration.

   Stars that pass behind the camera are recycled to the far plane rather
   than respawned at random, so the field has a constant density and never
   visibly refills.
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
  const rnd = S.prng(46000000);

  const DEPTH = 900;   // far plane
  const NEAR = 12;     // stars closer than this are recycled
  const FOV = 420;

  const stars = Array.from({ length: 460 }, () => ({
    x: (rnd() - 0.5) * 1600,
    y: (rnd() - 0.5) * 1600,
    z: rnd() * DEPTH,
    /* A little colour: most stars are white, a few are warm or blue. A field
       of pure white points reads as dust on the lens. */
    tint: rnd(),
  }));

  /* Nebula blobs, in the same projected space so they sit among the stars
     rather than on a separate plane behind them. */
  const NEBULA = Array.from({ length: 5 }, () => ({
    x: (rnd() - 0.5) * 1400,
    y: (rnd() - 0.5) * 1000,
    z: 240 + rnd() * 560,
    r: 220 + rnd() * 320,
    hue: rnd(),
  }));

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Launch pad",  tr: "Rampa",        es: "Plataforma" } },
      { at: 0.14, label: { en: "Ascent",      tr: "Tırmanış",     es: "Ascenso" } },
      { at: 0.40, label: { en: "Low orbit",   tr: "Alçak yörünge", es: "Órbita baja" } },
      { at: 0.66, label: { en: "Transfer",    tr: "Transfer",     es: "Transferencia" } },
      { at: 0.86, label: { en: "Deep space",  tr: "Derin uzay",   es: "Espacio profundo" } },
    ],
  });

  let clock = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;
    const cx = w / 2;
    const cy = h * 0.46;

    /* Speed is not monotonic: you are slow on the pad, fastest during the
       ascent and the transfer burn, and nearly still in orbit — which is what
       makes the burn read as a burn rather than as a background that has
       always been moving. */
    const ascent = S.band(0.02, 0.16, 0.3, 0.44, u);
    const burn = S.band(0.58, 0.68, 0.8, 0.9, u);
    const speed = 12 + ascent * 340 + burn * 420 + u * 26;
    root.style.setProperty("--burn", Math.max(ascent, burn).toFixed(3));

    /* Sky: the atmosphere is the colour, and it thins out with altitude. */
    const air = 1 - S.smoothstep(0.06, 0.4, u);
    const sky = S.mix([4, 6, 15], [16, 34, 72], air);
    ctx.fillStyle = S.rgb(sky);
    ctx.fillRect(0, 0, w, h);

    /* ── Nebulae ───────────────────────────────────────────────────────
       Behind the stars, and only out where the air has gone. */
    const deep = S.smoothstep(0.45, 0.85, u);
    if (deep > 0.02) {
      for (let i = 0; i < NEBULA.length; i++) {
        const n = NEBULA[i];
        n.z -= speed * dt * 0.25;
        if (n.z < 40) n.z += DEPTH;
        const k = FOV / n.z;
        const x = cx + n.x * k;
        const y = cy + n.y * k;
        const r = n.r * k;
        if (r < 4) continue;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const c = n.hue < 0.4 ? "120,90,200" : n.hue < 0.75 ? "200,80,140" : "60,140,200";
        g.addColorStop(0, `rgba(${c},${0.1 * deep})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ── Stars ─────────────────────────────────────────────────────────
       Drawn as a streak from where the star was last frame to where it is
       now. At low speed that is a dot; at high speed it is a trail, for free,
       with no separate "warp" mode to switch into. */
    const visible = S.smoothstep(0.0, 0.22, u) * 0.4 + S.smoothstep(0.1, 0.45, u) * 0.6;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const prevZ = s.z;
      s.z -= speed * dt;
      if (s.z < NEAR) {
        s.z += DEPTH;
        continue; // skip the frame it wraps on, or it draws a streak across the screen
      }

      const k = FOV / s.z;
      const x = cx + s.x * k;
      const y = cy + s.y * k;
      if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;

      const pk = FOV / prevZ;
      const px = cx + s.x * pk;
      const py = cy + s.y * pk;

      /* Nearer stars are brighter and bigger. 1 - z/DEPTH is the cheapest
         honest approximation of that. */
      const near = 1 - s.z / DEPTH;
      const a = visible * (0.15 + near * 0.85);
      const colour =
        s.tint < 0.72 ? "255,255,255" : s.tint < 0.88 ? "255,226,190" : "196,216,255";

      ctx.strokeStyle = `rgba(${colour},${a})`;
      ctx.lineWidth = 0.5 + near * 1.8;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    /* ── The planet ────────────────────────────────────────────────────
       On the pad you are standing on it, so it is simply the ground. As you
       climb it curves; in orbit it is a limb across the bottom of the frame;
       on the transfer it shrinks and falls away. One circle, whose centre and
       radius are functions of u. */
    const groundY = h * (0.86 + u * 0.4);
    const radius = h * (14 - S.smoothstep(0.1, 0.9, u) * 13.2);
    const centreY = groundY + radius;
    const falls = S.smoothstep(0.62, 1, u);

    if (radius > 12 && falls < 0.99) {
      const y = centreY + falls * h * 1.3;

      /* Atmosphere: a bright rim just outside the disc. Drawn first so the
         planet covers its inner half, which is why it reads as a shell of air
         rather than as a halo. */
      const glow = ctx.createRadialGradient(cx, y, radius * 0.985, cx, y, radius * 1.06);
      glow.addColorStop(0, `rgba(120,190,255,${0.55 * (1 - falls)})`);
      glow.addColorStop(1, "rgba(120,190,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, y, radius * 1.07, 0, Math.PI * 2);
      ctx.fill();

      /* The planet itself, lit from the upper left so the terminator runs
         across it. */
      const disc = ctx.createRadialGradient(
        cx - radius * 0.4, y - radius * 0.5, radius * 0.05,
        cx, y, radius,
      );
      disc.addColorStop(0, "#2f6f9c");
      disc.addColorStop(0.45, "#1d4a6e");
      disc.addColorStop(0.8, "#0d2338");
      disc.addColorStop(1, "#05101c");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, Math.PI * 2);
      ctx.fill();

      /* Cloud bands, only close enough to see them. */
      if (radius > h * 1.2) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.16 * (1 - falls);
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 6; i++) {
          const by = y - radius + (i + 0.5) * (radius * 0.12) + Math.sin(clock * 0.1 + i) * 6;
          ctx.beginPath();
          ctx.ellipse(cx + Math.sin(i * 2.1) * radius * 0.2, by, radius * 0.7, radius * 0.02, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    /* ── The pad ───────────────────────────────────────────────────────
       Only at the very beginning: a gantry silhouette that gives the launch
       somewhere to have started from. */
    const pad = 1 - S.smoothstep(0, 0.12, u);
    if (pad > 0.01) {
      ctx.globalAlpha = pad;
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, h * 0.88, w, h * 0.12);
      ctx.fillRect(w * 0.14, h * 0.5, 10, h * 0.4);
      ctx.fillRect(w * 0.14, h * 0.5, w * 0.06, 8);
      ctx.fillRect(w * 0.82, h * 0.62, 8, h * 0.28);
      ctx.globalAlpha = 1;
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
