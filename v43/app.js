/* ==========================================================================
   v43 — Weather.

   You are indoors, at a window, and the weather outside turns while you read:
   a clear morning over the hero, drizzle by the first projects, a downpour
   through the middle of the work, snow over the services, fog by the time you
   reach the contact form.

   Two canvases, because they are doing opposite jobs.

   The back one is the weather itself — one particle array, reused. Rain and
   snow are the same particles with different physics and a different draw
   call, which is why the transition between them is a slide rather than a
   cut: for a moment the drops are already slowing and widening into flakes.

   The front one is the glass. It starts fogged and you can wipe it with a
   finger or the cursor — a `destination-out` stroke through the condensation
   layer. It very slowly fogs back over, so a window cleared five panels ago
   has misted again by the time you return to it, which is the detail that
   makes it feel like glass rather than a scratch card.
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
  const sky = S.canvas(stageEl);
  const glass = S.canvas(stageEl, { className: "scene-canvas scene-glass" });
  const root = document.documentElement;
  const rnd = S.prng(430430);

  /* Sky colours for the five weathers, sampled continuously. */
  const TOP = [[138, 176, 208], [124, 140, 158], [74, 84, 96], [128, 136, 148], [154, 158, 162]];
  const BOT = [[206, 226, 238], [176, 186, 196], [116, 126, 138], [196, 202, 210], [188, 190, 192]];

  /* Hills behind the rain, so there is a world out there and not just a
     gradient with lines over it. */
  const HILLS = [
    { base: 0.74, amp: 0.07, seed: 11, tint: 0.34 },
    { base: 0.82, amp: 0.05, seed: 29, tint: 0.62 },
  ];

  const N = 320;
  const drops = Array.from({ length: N }, () => ({
    x: rnd(),
    y: rnd(),
    z: 0.35 + rnd() * 0.65,   // depth: near drops are longer, faster, brighter
    sway: rnd() * Math.PI * 2,
    swaySpeed: 0.6 + rnd() * 1.4,
  }));

  let clock = 0;
  let fogLevel = 1;
  let glassReady = false;

  /* ── The window ───────────────────────────────────────────────────────
     Painting the condensation is the expensive half, so it is only repainted
     when it actually changes: when it has fogged up a little more, or when
     someone wipes it. Between those it is left exactly as it is. */
  const paintFog = () => {
    const { ctx, w, h } = glass;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(226,238,246,0.72)");
    g.addColorStop(0.55, "rgba(214,230,240,0.52)");
    g.addColorStop(1, "rgba(226,238,246,0.74)");
    ctx.fillStyle = g;
    ctx.globalAlpha = fogLevel;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    glassReady = true;
  };

  const wipe = (x, y, r) => {
    if (!glassReady) paintFog();
    const { ctx } = glass;
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.6, "rgba(0,0,0,0.75)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  };

  let lastWipe = null;
  const onMove = (e) => {
    const r = glass.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const radius = Math.min(96, Math.max(48, r.width * 0.05));

    /* Interpolate between samples: a fast pointer produces widely spaced
       events, and dabbing a circle at each one draws a dotted line rather
       than a smear. */
    if (lastWipe) {
      const dx = x - lastWipe.x;
      const dy = y - lastWipe.y;
      const steps = Math.min(24, Math.ceil(Math.hypot(dx, dy) / (radius * 0.35)));
      for (let i = 1; i <= steps; i++) {
        wipe(lastWipe.x + (dx * i) / steps, lastWipe.y + (dy * i) / steps, radius);
      }
    }
    wipe(x, y, radius);
    lastWipe = { x, y };
  };

  /* The stage is pointer-events: none so it never eats a click; the listener
     goes on the window instead and simply reads coordinates. */
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onMove, { passive: true });
  window.addEventListener("pointerleave", () => { lastWipe = null; }, { passive: true });

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Clear",     tr: "Açık",     es: "Despejado" } },
      { at: 0.16, label: { en: "Drizzle",   tr: "Çiseleme", es: "Llovizna" } },
      { at: 0.40, label: { en: "Downpour",  tr: "Sağanak",  es: "Aguacero" } },
      { at: 0.66, label: { en: "Snow",      tr: "Kar",      es: "Nieve" } },
      { at: 0.86, label: { en: "Fog",       tr: "Sis",      es: "Niebla" } },
    ],
  });

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = sky;

    /* Four weights, one per phenomenon, all continuous. Nothing is ever
       switched on: at u = 0.55 there is still a little rain in the snow. */
    const rain = S.band(0.08, 0.22, 0.52, 0.66, u);
    const heavy = S.band(0.3, 0.42, 0.56, 0.68, u);
    const snow = S.band(0.55, 0.68, 0.86, 0.95, u);
    const fog = S.smoothstep(0.76, 0.95, u);

    const top = S.ramp(TOP, u);
    const bot = S.ramp(BOT, u);
    root.style.setProperty("--sky-top", S.rgb(top));
    root.style.setProperty("--sky-bot", S.rgb(bot));
    root.style.setProperty("--fog", fog.toFixed(3));

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, S.rgb(top));
    g.addColorStop(1, S.rgb(bot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    /* Hills, washed out by however much fog there is. */
    for (let i = 0; i < HILLS.length; i++) {
      const hill = HILLS[i];
      const colour = S.mix(S.mix(top, [40, 48, 56], hill.tint), bot, fog * 0.85);
      ctx.fillStyle = S.rgb(colour);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 14; x += 14) {
        const n =
          Math.sin(x * 0.0038 + hill.seed) * 0.6 +
          Math.sin(x * 0.0115 + hill.seed * 2.1) * 0.3;
        ctx.lineTo(x, h * hill.base - n * hill.amp * h);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    /* ── Precipitation ─────────────────────────────────────────────────
       One array. Rain falls fast and nearly straight; snow falls slowly and
       wanders. A particle's contribution is weighted by both, so during the
       changeover the same particle is drawn twice — faintly as a streak and
       faintly as a flake — and the weather dissolves instead of cutting. */
    const wet = Math.max(rain, heavy);
    if (wet > 0.01 || snow > 0.01) {
      const wind = Math.sin(clock * 0.21) * 0.06 + 0.05;

      for (let i = 0; i < N; i++) {
        const d = drops[i];
        const speed = (0.55 + d.z * 1.5) * (0.25 + wet * 0.95) + (0.06 + d.z * 0.1) * snow;
        d.y += speed * dt;
        d.x += wind * dt * (0.3 + wet) + Math.sin(clock * d.swaySpeed + d.sway) * 0.0016 * snow;

        if (d.y > 1.05) { d.y -= 1.1; d.x = rnd(); }
        if (d.x > 1.05) d.x -= 1.1;
        if (d.x < -0.05) d.x += 1.1;

        const px = d.x * w;
        const py = d.y * h;

        if (wet > 0.01) {
          const len = (8 + d.z * 26) * (0.4 + heavy * 0.9);
          ctx.strokeStyle = `rgba(226,238,248,${0.10 + d.z * 0.34 * wet})`;
          ctx.lineWidth = 0.6 + d.z * 1.1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + wind * len * 6, py + len);
          ctx.stroke();
        }

        if (snow > 0.01) {
          ctx.fillStyle = `rgba(255,255,255,${(0.2 + d.z * 0.6) * snow})`;
          ctx.beginPath();
          ctx.arc(px, py, 0.9 + d.z * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    /* ── Fog ───────────────────────────────────────────────────────────
       Three drifting bands at different heights and speeds, which reads as
       depth; a single flat wash reads as the canvas losing opacity. */
    if (fog > 0.01) {
      for (let i = 0; i < 3; i++) {
        const y = h * (0.42 + i * 0.19) + Math.sin(clock * (0.07 + i * 0.03)) * h * 0.02;
        const band = ctx.createLinearGradient(0, y - h * 0.22, 0, y + h * 0.26);
        band.addColorStop(0, "rgba(206,210,214,0)");
        band.addColorStop(0.5, `rgba(206,210,214,${0.42 * fog})`);
        band.addColorStop(1, "rgba(206,210,214,0)");
        ctx.fillStyle = band;
        ctx.fillRect(0, y - h * 0.22, w, h * 0.48);
      }
    }

    /* ── Condensation ──────────────────────────────────────────────────
       Creeps back at about one per cent a second, and only repaints when the
       change is big enough to see. Repainting a full-screen gradient every
       frame to add a thousandth of an alpha is the kind of thing that turns a
       laptop fan on for no visible reason. */
    const target = 0.25 + 0.72 * Math.max(wet, snow * 0.8, fog);
    const next = fogLevel + (target - fogLevel) * Math.min(1, dt * 0.35);
    if (!glassReady || Math.abs(next - fogLevel) > 0.012) {
      fogLevel = next;
      paintFog();
    } else {
      fogLevel = next;
    }
  });

  window.addEventListener("resize", () => {
    const a = sky.resize();
    const b = glass.resize();
    if (b) { glassReady = false; paintFog(); }
    if (a || b) stage.poke();
  }, { passive: true });
});
