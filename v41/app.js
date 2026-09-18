/* ==========================================================================
   v41 — Day cycle.

   One horizon, seen from dawn to the small hours. Moving through the content
   moves the sun: it rises over the projects, stands highest at the work, sets
   behind the services and is gone by the time you reach the contact form,
   which happens under stars.

   Almost none of this is canvas. The sky is a CSS gradient whose stops are
   custom properties, and the only thing the script computes is the colour of
   those stops and the position of one disc on an arc. That matters: a sky is
   a full-screen fill, and a full-screen fill repainted at sixty frames a
   second on a phone is the most expensive thing you can ask a canvas to do
   for the least visible return. The compositor can do a gradient for free.

   The canvas is left with the two things a gradient cannot do — stars, and
   the band of cloud on the horizon — and both of them stop drawing when the
   world stops moving.
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

  /* ── The palette ──────────────────────────────────────────────────────
     Five skies, sampled continuously. Each is three stops: zenith, middle,
     horizon. Picking them by eye from photographs rather than by rotating a
     hue is the whole reason this reads as a sky — the middle of a real dawn
     is not the average of its top and bottom. */
  const ZENITH  = [[26, 30, 62], [86, 118, 178], [92, 152, 214], [46, 52, 104], [7, 9, 24]];
  const MIDDLE  = [[92, 74, 118], [150, 186, 224], [158, 202, 232], [126, 78, 106], [16, 20, 44]];
  const HORIZON = [[232, 142, 96], [214, 226, 238], [222, 234, 243], [236, 128, 72], [32, 30, 58]];

  const SUN   = [[255, 196, 130], [255, 244, 214], [255, 252, 236], [255, 150, 92], [214, 226, 248]];
  const LAND  = [[22, 18, 34], [46, 54, 62], [58, 68, 74], [30, 22, 36], [8, 9, 20]];

  const root = document.documentElement;
  const cv = S.canvas(stageEl);

  /* Stars are generated once from a fixed seed. They are a constellation, not
     confetti: they must be in the same place every visit, or the night sky
     changes shape when you switch language and repaint. */
  const rnd = S.prng(20260918);
  const STARS = Array.from({ length: 220 }, () => ({
    x: rnd(),
    y: rnd() * 0.72,
    r: 0.4 + rnd() * 1.2,
    /* Each star twinkles on its own clock. Shared phase would pulse the whole
       sky like a heartbeat. */
    phase: rnd() * Math.PI * 2,
    speed: 0.6 + rnd() * 1.6,
  }));

  const CLOUDS = Array.from({ length: 14 }, () => ({
    x: rnd(),
    y: 0.44 + rnd() * 0.2,
    w: 0.12 + rnd() * 0.26,
    h: 0.012 + rnd() * 0.03,
    drift: 0.004 + rnd() * 0.012,
  }));

  let clock = 0;

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Dawn",    tr: "Şafak",     es: "Amanecer" } },
      { at: 0.18, label: { en: "Morning", tr: "Sabah",     es: "Mañana" } },
      { at: 0.42, label: { en: "Noon",    tr: "Öğle",      es: "Mediodía" } },
      { at: 0.66, label: { en: "Dusk",    tr: "Gün batımı", es: "Atardecer" } },
      { at: 0.84, label: { en: "Night",   tr: "Gece",      es: "Noche" } },
    ],
  });

  const draw = (u, dt) => {
    clock += dt;

    const zen = S.ramp(ZENITH, u);
    const mid = S.ramp(MIDDLE, u);
    const hor = S.ramp(HORIZON, u);
    const sun = S.ramp(SUN, u);
    const land = S.ramp(LAND, u);

    /* Handed to CSS rather than painted. The sky, the plate tint, the rule
       colours and the sun's own glow all read these. */
    root.style.setProperty("--sky-zenith", S.rgb(zen));
    root.style.setProperty("--sky-mid", S.rgb(mid));
    root.style.setProperty("--sky-horizon", S.rgb(hor));
    root.style.setProperty("--sun", S.rgb(sun));
    root.style.setProperty("--land", S.rgb(land));

    /* The sun tracks a half-circle from the left horizon to the right, and
       keeps going below it — so "night" is not the sun being hidden, it is
       the sun being somewhere you can see it has gone. */
    const angle = Math.PI * (0.06 + u * 1.08);
    root.style.setProperty("--sun-x", (50 - Math.cos(angle) * 46).toFixed(2) + "%");
    root.style.setProperty("--sun-y", (78 - Math.sin(angle) * 62).toFixed(2) + "%");

    /* Daylight drives everything else: how bright the text plate has to be,
       how visible the stars are, how long the shadows on the ridge run. */
    const day = S.clamp(Math.sin(angle) * 1.25, 0, 1);
    root.style.setProperty("--daylight", day.toFixed(3));

    const { ctx, w, h } = cv;
    ctx.clearRect(0, 0, w, h);

    /* ── Stars ─────────────────────────────────────────────────────────
       Only drawn once the sky is dark enough to hold them, and faded by the
       same daylight number, so they arrive as the sun goes rather than being
       switched on at a threshold. */
    const night = 1 - day;
    if (night > 0.05) {
      for (let i = 0; i < STARS.length; i++) {
        const s = STARS[i];
        const twinkle = 0.65 + 0.35 * Math.sin(clock * s.speed + s.phase);
        ctx.globalAlpha = night * night * twinkle;
        ctx.fillStyle = "#e8eeff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ── Cloud band ────────────────────────────────────────────────────
       Soft ellipses lit from wherever the sun currently is: warm and bright
       when it is low behind them, flat grey at noon, gone at night. */
    const cloudLight = S.band(0.0, 0.14, 0.72, 0.9, u);
    if (cloudLight > 0.02) {
      const tint = S.mix(hor, [255, 255, 255], 0.35);
      for (let i = 0; i < CLOUDS.length; i++) {
        const c = CLOUDS[i];
        const x = ((c.x + clock * c.drift) % 1.3 - 0.15) * w;
        ctx.globalAlpha = cloudLight * 0.32;
        ctx.fillStyle = S.rgb(tint);
        ctx.beginPath();
        ctx.ellipse(x, c.y * h, c.w * w, c.h * h, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ── Ridge ─────────────────────────────────────────────────────────
       Two silhouettes, the far one lighter, so the horizon has depth. The
       profile is deterministic — a mountain range that reshuffles between
       repaints is a bug you can see. */
    const ridge = (base, amp, seed, colour, alpha) => {
      const r = S.prng(seed);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 12; x += 12) {
        const n =
          Math.sin(x * 0.0032 + seed) * 0.5 +
          Math.sin(x * 0.0091 + seed * 1.7) * 0.32 +
          (r() - 0.5) * 0.18;
        ctx.lineTo(x, h * base - n * amp * h);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    ridge(0.80, 0.055, 7, S.rgb(S.mix(land, hor, 0.42)), 0.9);
    ridge(0.88, 0.075, 3, S.rgb(land), 1);
  };

  const render = stage.onFrame(draw);
  void render;

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
