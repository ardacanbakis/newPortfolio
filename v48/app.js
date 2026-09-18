/* ==========================================================================
   v48 — Playhouse.

   A stage. Each chapter is a set, and moving between them is a scene change
   with the machinery visible: the lights go down, the flats fly out on the
   bar, the new ones come in, the lights come back up.

   The flying is the point, and it is driven by distance rather than by
   events. Every flat knows which scene it belongs to; how far down it hangs
   is a function of how close the world position is to that scene. So a set
   is never "switched" — it descends as you approach it and lifts as you
   leave, two sets briefly share the bar, and the change reads as stagehands
   rather than as a cut.

   The lights dim in the middle of a move for the same reason: `--dim` is the
   distance between the scene you are nearest and the scene you have asked
   for, so the deeper the move the darker the blackout, and stepping one panel
   barely dips at all.
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
  const rnd = S.prng(48480000);

  /* Five sets, each at a position in the world. */
  const SETS = [
    { at: 0.0,  cloth: [[24, 20, 40], [58, 36, 62]],   key: [255, 196, 150] },
    { at: 0.26, cloth: [[16, 34, 28], [36, 68, 44]],   key: [190, 255, 190] },
    { at: 0.5,  cloth: [[46, 30, 22], [92, 60, 40]],   key: [255, 214, 150] },
    { at: 0.74, cloth: [[20, 26, 46], [48, 62, 104]],  key: [170, 200, 255] },
    { at: 1.0,  cloth: [[6, 6, 16], [14, 14, 34]],     key: [200, 210, 255] },
  ];

  /* Flats: cut-out shapes hung on the bar, three per set. `kind` picks the
     silhouette; everything else is geometry. */
  const FLATS = [];
  SETS.forEach((set, si) => {
    for (let i = 0; i < 3; i++) {
      FLATS.push({
        set: si,
        x: 0.1 + i * 0.4 + (rnd() - 0.5) * 0.12,
        w: 0.2 + rnd() * 0.22,
        h: 0.42 + rnd() * 0.3,
        kind: si,
        shade: 0.55 + rnd() * 0.4,
        /* Stagger the lines so three flats do not descend as one board. */
        lag: rnd() * 0.06,
      });
    }
  });

  const MOTES = Array.from({ length: 70 }, () => ({
    x: rnd(),
    y: rnd(),
    v: 0.008 + rnd() * 0.03,
    r: 0.5 + rnd() * 1.3,
    sway: rnd() * Math.PI * 2,
  }));

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Act I · Prologue",  tr: "I. Perde · Önsöz", es: "Acto I · Prólogo" } },
      { at: 0.18, label: { en: "Act II · The work", tr: "II. Perde · İşler", es: "Acto II · La obra" } },
      { at: 0.44, label: { en: "Act III · Interior", tr: "III. Perde · İç mekân", es: "Acto III · Interior" } },
      { at: 0.66, label: { en: "Act IV · The city", tr: "IV. Perde · Şehir", es: "Acto IV · La ciudad" } },
      { at: 0.86, label: { en: "Act V · Night",     tr: "V. Perde · Gece",  es: "Acto V · Noche" } },
    ],
  });

  let clock = 0;
  let prevU = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;

    /* How fast the world is moving, normalised. This is the blackout: a long
       jump dims hard, a single step barely dips. */
    const speed = dt > 0 ? Math.abs(u - prevU) / dt : 0;
    prevU = u;
    const dim = S.clamp(speed * 2.6, 0, 0.82);
    root.style.setProperty("--dim", dim.toFixed(3));

    /* Which set we are nearest, for the cloth colour. */
    let nearest = 0;
    let best = 9;
    SETS.forEach((s, i) => {
      const d = Math.abs(s.at - u);
      if (d < best) { best = d; nearest = i; }
    });

    /* Backcloth: interpolated between the two nearest sets so the sky behind
       the flats changes continuously. */
    const lo = SETS[Math.max(0, nearest - (u < SETS[nearest].at ? 1 : 0))];
    const hi = SETS[Math.min(SETS.length - 1, nearest + (u >= SETS[nearest].at ? 1 : 0))];
    const span = hi.at - lo.at || 1;
    const f = S.clamp((u - lo.at) / span, 0, 1);

    const clothTop = S.mix(lo.cloth[0], hi.cloth[0], f);
    const clothBot = S.mix(lo.cloth[1], hi.cloth[1], f);
    const key = S.mix(lo.key, hi.key, f);
    root.style.setProperty("--key", S.rgb(key));

    const g = ctx.createLinearGradient(0, 0, 0, h * 0.86);
    g.addColorStop(0, S.rgb(clothTop));
    g.addColorStop(1, S.rgb(clothBot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const deck_y = h * 0.86;   // the stage floor line

    /* ── Flats on the bar ──────────────────────────────────────────────
       `drop` is 1 when the flat is fully in, 0 when it is flown out above
       the proscenium. Distance-driven, so nothing has to be told to move. */
    for (let i = 0; i < FLATS.length; i++) {
      const fl = FLATS[i];
      const set = SETS[fl.set];
      const d = Math.abs(u - set.at);
      const drop = S.clamp(1 - (d - fl.lag) / 0.2, 0, 1);
      if (drop <= 0.005) continue;

      const height = fl.h * h;
      const top = deck_y - height * drop;
      const x = fl.x * w;
      const width = fl.w * w;

      ctx.fillStyle = S.rgb(S.mix(clothBot, [8, 8, 12], fl.shade));

      if (fl.kind === 1) {
        /* Trees. */
        ctx.beginPath();
        ctx.moveTo(x, deck_y);
        ctx.lineTo(x + width * 0.5, top);
        ctx.lineTo(x + width, deck_y);
        ctx.closePath();
        ctx.fill();
      } else if (fl.kind === 3) {
        /* Rooftops. */
        ctx.fillRect(x, top, width, deck_y - top);
        ctx.fillStyle = "rgba(255,214,150,0.5)";
        for (let k = 0; k < 4; k++) {
          for (let j = 0; j < 3; j++) {
            if ((i * 7 + k * 3 + j) % 3 === 0) {
              ctx.fillRect(x + 12 + j * 26, top + 18 + k * 30, 10, 13);
            }
          }
        }
      } else if (fl.kind === 2) {
        /* Interior: a flat with a doorway cut in it. */
        ctx.fillRect(x, top, width, deck_y - top);
        ctx.fillStyle = S.rgb(clothTop);
        ctx.fillRect(x + width * 0.36, deck_y - height * 0.5 * drop, width * 0.28, height * 0.5 * drop);
      } else {
        /* Plain drapes for the prologue and the night. */
        ctx.beginPath();
        ctx.moveTo(x, top);
        for (let s = 0; s <= 8; s++) {
          const t = s / 8;
          ctx.lineTo(x + t * width, top + Math.sin(t * Math.PI * 3) * 10);
        }
        ctx.lineTo(x + width, deck_y);
        ctx.lineTo(x, deck_y);
        ctx.closePath();
        ctx.fill();
      }
    }

    /* ── The deck ──────────────────────────────────────────────────────── */
    const floor = ctx.createLinearGradient(0, deck_y, 0, h);
    floor.addColorStop(0, "rgba(40,30,24,1)");
    floor.addColorStop(1, "rgba(14,10,8,1)");
    ctx.fillStyle = floor;
    ctx.fillRect(0, deck_y, w, h - deck_y);

    /* ── Lanterns ──────────────────────────────────────────────────────
       Three beams from the bar. Drawn as cones with `lighter` compositing so
       where two overlap they add, which is what stage light does and what a
       plain alpha fill conspicuously does not. */
    const lit = 1 - dim;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const originX = w * (0.2 + i * 0.3);
      const aim = originX + Math.sin(clock * 0.2 + i) * w * 0.02;
      const beam = ctx.createRadialGradient(originX, -h * 0.1, 0, originX, -h * 0.1, h * 1.25);
      const k = i === 1 ? key : S.mix(key, [255, 255, 255], 0.4);
      beam.addColorStop(0, S.rgb(k, 0.3 * lit));
      beam.addColorStop(0.55, S.rgb(k, 0.09 * lit));
      beam.addColorStop(1, S.rgb(k, 0));
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(originX, -h * 0.05);
      ctx.lineTo(aim - w * 0.22, h);
      ctx.lineTo(aim + w * 0.22, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    /* Dust hanging in the beams — the detail that makes stage light visible
       as light rather than as a gradient. */
    for (let i = 0; i < MOTES.length; i++) {
      const m = MOTES[i];
      m.y = (m.y + m.v * dt) % 1;
      const x = (m.x + Math.sin(clock * 0.3 + m.sway) * 0.01) * w;
      ctx.fillStyle = S.rgb(key, 0.24 * lit);
      ctx.beginPath();
      ctx.arc(x, m.y * h, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* The blackout itself. */
    if (dim > 0.01) {
      ctx.fillStyle = `rgba(0,0,0,${dim})`;
      ctx.fillRect(0, 0, w, h);
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
