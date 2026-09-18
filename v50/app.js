/* ==========================================================================
   v50 — Service lift.

   Each chapter is a floor. You are in the car; the doors open onto whatever
   is on this level, and when you move they close, the shaft rushes past, and
   they open again somewhere else.

   The doors are DOM and the shaft is canvas, and that split is the whole
   design. Doors are two rectangles that slide — a CSS transition does that
   better than any draw loop, and gets sub-pixel positioning and compositor
   acceleration for free. What is *beyond* the doors is different on every
   floor and moving in between, which is canvas work.

   The state that joins them is one number: how fast the world is currently
   travelling. Above a threshold the doors are shut and the shaft is drawn;
   below it they open on the floor you have arrived at. Nothing is scheduled,
   nothing is queued, and interrupting a journey halfway — pressing another
   floor while the car is moving — does the right thing without a single piece
   of extra logic, because there was never a sequence to interrupt.
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
  const rnd = S.prng(50505050);

  /* The car: two doors and a frame, built here so a page without JavaScript
     is not full of empty lift parts. */
  const doorL = document.createElement("div");
  const doorR = document.createElement("div");
  doorL.className = "door door-l";
  doorR.className = "door door-r";
  stageEl.append(doorL, doorR);

  const FLOORS = [
    { at: 0.0,  n: 1, wall: [58, 48, 40],  light: [255, 206, 140], kind: "lobby" },
    { at: 0.26, n: 3, wall: [40, 52, 62],  light: [180, 226, 255], kind: "studio" },
    { at: 0.5,  n: 5, wall: [48, 44, 54],  light: [210, 200, 240], kind: "archive" },
    { at: 0.74, n: 7, wall: [56, 50, 42],  light: [255, 196, 120], kind: "workshop" },
    { at: 1.0,  n: 9, wall: [30, 44, 64],  light: [150, 190, 240], kind: "roof" },
  ];

  /* Shaft furniture: beams and cable brackets at fixed world heights, so the
     shaft has structure going past rather than a moving texture. */
  const BEAMS = Array.from({ length: 40 }, (_, i) => ({
    y: i / 40,
    w: 0.5 + rnd() * 0.5,
  }));

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Lobby",     tr: "Giriş",    es: "Vestíbulo" } },
      { at: 0.2,  label: { en: "Studio",    tr: "Stüdyo",   es: "Estudio" } },
      { at: 0.44, label: { en: "Archive",   tr: "Arşiv",    es: "Archivo" } },
      { at: 0.66, label: { en: "Workshop",  tr: "Atölye",   es: "Taller" } },
      { at: 0.88, label: { en: "Roof",      tr: "Çatı",     es: "Azotea" } },
    ],
  });

  let prevU = 0;
  let shaftY = 0;
  let clock = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;

    const velocity = dt > 0 ? Math.abs(u - prevU) / dt : 0;
    prevU = u;

    /* Travelling, 0 to 1. The doors follow it inverted, with a threshold low
       enough that a single-floor hop still closes them — otherwise short
       moves look like the car sliding sideways with the doors open. */
    const travel = S.clamp(velocity * 5.5, 0, 1);
    const open = 1 - S.smoothstep(0.06, 0.3, travel);
    root.style.setProperty("--doors", open.toFixed(3));
    root.style.setProperty("--travel", travel.toFixed(3));

    /* Nearest floor, for the indicator and for what is behind the doors. */
    let near = 0;
    let best = 9;
    FLOORS.forEach((f, i) => {
      const d = Math.abs(f.at - u);
      if (d < best) { best = d; near = i; }
    });
    const floor = FLOORS[near];
    root.style.setProperty("--floor", String(floor.n));
    root.style.setProperty("--light", S.rgb(floor.light));

    ctx.clearRect(0, 0, w, h);

    if (travel > 0.04) {
      /* ── The shaft ───────────────────────────────────────────────────
         Concrete, with beams going past. Direction follows travel direction,
         and the blur of speed is done by simply drawing the beams as long
         smears rather than by any filter. */
      ctx.fillStyle = "#15181c";
      ctx.fillRect(0, 0, w, h);

      shaftY = (shaftY + velocity * dt * 3.4) % 1;
      const smear = 6 + travel * 90;

      for (let i = 0; i < BEAMS.length; i++) {
        const b = BEAMS[i];
        const y = (((b.y + shaftY) % 1) + 1) % 1 * (h + smear) - smear * 0.5;
        ctx.fillStyle = `rgba(92,104,116,${0.22 + b.w * 0.3})`;
        ctx.fillRect(0, y, w, 3 + smear * 0.12);
      }

      /* Guide rails either side — the fixed things that prove the car is what
         is moving. */
      ctx.fillStyle = "rgba(150,164,178,0.32)";
      ctx.fillRect(w * 0.08, 0, 5, h);
      ctx.fillRect(w * 0.92 - 5, 0, 5, h);

      /* A work lamp going by every so often. */
      const lampY = ((shaftY * 3) % 1) * h;
      const lamp = ctx.createRadialGradient(w * 0.5, lampY, 0, w * 0.5, lampY, h * 0.45);
      lamp.addColorStop(0, "rgba(255,206,140,0.22)");
      lamp.addColorStop(1, "rgba(255,206,140,0)");
      ctx.fillStyle = lamp;
      ctx.fillRect(0, 0, w, h);
    } else {
      /* ── A floor ─────────────────────────────────────────────────────
         What is beyond the doors: a back wall, a light source, and two or
         three silhouettes that say which floor this is. Deliberately spare —
         it is glimpsed through a gap, not toured. */
      const wall = floor.wall;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, S.rgb(S.mix(wall, floor.light, 0.22)));
      g.addColorStop(1, S.rgb(S.mix(wall, [0, 0, 0], 0.5)));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 0.8);
      glow.addColorStop(0, S.rgb(floor.light, 0.3));
      glow.addColorStop(1, S.rgb(floor.light, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      const y = h * 0.78;

      if (floor.kind === "lobby") {
        ctx.fillRect(w * 0.1, y - h * 0.22, w * 0.05, h * 0.22);      // plant pot stem
        ctx.beginPath();
        ctx.arc(w * 0.125, y - h * 0.24, h * 0.09, 0, Math.PI * 2);   // foliage
        ctx.fill();
        ctx.fillRect(w * 0.62, y - h * 0.1, w * 0.3, h * 0.1);        // desk
      } else if (floor.kind === "studio") {
        ctx.fillRect(w * 0.16, y - h * 0.16, w * 0.26, h * 0.16);     // bench
        ctx.fillRect(w * 0.22, y - h * 0.3, w * 0.14, h * 0.13);      // monitor
        ctx.fillRect(w * 0.64, y - h * 0.34, w * 0.2, h * 0.34);      // shelf
      } else if (floor.kind === "archive") {
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(w * (0.08 + i * 0.18), y - h * 0.46, w * 0.12, h * 0.46);
        }
      } else if (floor.kind === "workshop") {
        ctx.fillRect(w * 0.12, y - h * 0.14, w * 0.4, h * 0.14);      // workbench
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(w * (0.58 + i * 0.05), y - h * 0.26 - (i % 3) * h * 0.04, w * 0.02, h * 0.26);
        }
      } else {
        /* Roof: sky instead of a wall, and a parapet. */
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.8);
        sky.addColorStop(0, "#1a2c4a");
        sky.addColorStop(1, "#5c7ba4");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h * 0.8);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, h * 0.78, w, h * 0.22);
        for (let i = 0; i < 9; i++) {
          ctx.fillRect(w * (0.03 + i * 0.11), h * 0.7, w * 0.05, h * 0.08);
        }
      }
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
