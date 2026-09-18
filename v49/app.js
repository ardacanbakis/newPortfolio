/* ==========================================================================
   v49 — Viewfinder.

   The site seen through a camera on a tripod. Nothing in front of the lens
   moves; what changes is the shot. The hero is a wide establishing frame with
   everything sharp; the work racks focus forward through the middle distance;
   the services are a close shot with the background gone to nothing; the
   contact form is the last frame of the day at a stop and a half under.

   Depth of field is done honestly rather than faked with a gradient. The
   scene is four planes at real distances, the lens has a focus distance and
   an aperture, and each plane's blur is computed from the standard circle-of-
   confusion relationship — how far it is from the plane of focus, divided by
   how forgiving the aperture is. Open the aperture and the background goes
   further out; stop down and everything sharpens. That is why the rack reads
   as a lens and not as a filter: the near and far planes go soft at different
   rates, exactly as they should.

   This is the one scene in the set that does not animate on its own — a
   camera on a tripod holds still — so its loop parks between shots and the
   page costs nothing while you read.
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
  const rnd = S.prng(49490000);

  /* Four planes, in metres. Far to near, so the near ones paint last. */
  const PLANES = [
    { d: 60,  y: 0.60, colour: [104, 126, 148], kind: "ridge" },
    { d: 18,  y: 0.74, colour: [66, 86, 104],   kind: "trees" },
    { d: 6,   y: 0.88, colour: [38, 48, 58],    kind: "wall" },
    { d: 1.4, y: 1.02, colour: [16, 20, 26],    kind: "grass" },
  ];

  /* Deterministic detail for each plane. */
  PLANES.forEach((p, i) => {
    p.items = Array.from({ length: 26 }, (_, n) => ({
      x: n / 26 + (rnd() - 0.5) * 0.03,
      h: 0.3 + rnd() * 0.7,
      w: 0.4 + rnd() * 0.9,
      seed: rnd(),
    }));
    p.i = i;
  });

  /* The five shots. `focus` is the distance the lens is set to and `f` is the
     aperture — small number, shallow depth of field. */
  const SHOTS = [
    { at: 0.0,  focus: 60,  f: 8,   iso: 100, shutter: "1/250", ev: 0 },
    { at: 0.26, focus: 18,  f: 4,   iso: 200, shutter: "1/160", ev: 0 },
    { at: 0.5,  focus: 6,   f: 2,   iso: 400, shutter: "1/125", ev: -0.3 },
    { at: 0.74, focus: 1.4, f: 1.4, iso: 800, shutter: "1/60",  ev: -0.7 },
    { at: 1.0,  focus: 3,   f: 1.8, iso: 3200, shutter: "1/25", ev: -1.5 },
  ];

  const lerpShot = (u) => {
    let i = 0;
    for (let k = 0; k < SHOTS.length - 1; k++) if (u >= SHOTS[k].at) i = k;
    const a = SHOTS[i];
    const b = SHOTS[Math.min(SHOTS.length - 1, i + 1)];
    const t = S.clamp((u - a.at) / ((b.at - a.at) || 1), 0, 1);
    return {
      focus: S.lerp(a.focus, b.focus, t),
      f: S.lerp(a.f, b.f, t),
      iso: Math.round(S.lerp(a.iso, b.iso, t)),
      ev: S.lerp(a.ev, b.ev, t),
      shutter: t < 0.5 ? a.shutter : b.shutter,
    };
  };

  const stage = S.stage(deck, {
    /* A tripod does not drift. No ambient loop: the scene is repainted while
       the rack is happening and then parks. */
    ambient: false,
    places: [
      { at: 0.0,  label: { en: "Wide · f/8",   tr: "Geniş · f/8",  es: "General · f/8" } },
      { at: 0.2,  label: { en: "Medium · f/4", tr: "Orta · f/4",   es: "Medio · f/4" } },
      { at: 0.44, label: { en: "Close · f/2",  tr: "Yakın · f/2",  es: "Corto · f/2" } },
      { at: 0.66, label: { en: "Macro · f/1.4", tr: "Makro · f/1.4", es: "Macro · f/1.4" } },
      { at: 0.88, label: { en: "Last light",   tr: "Son ışık",     es: "Última luz" } },
    ],
  });

  stage.onFrame((u) => {
    const { ctx, w, h } = cv;
    const shot = lerpShot(u);

    /* Exposure: the sky and the planes are graded by --ev, so the last shot
       of the day is genuinely darker rather than just bluer. */
    const exposure = Math.pow(2, shot.ev);
    root.style.setProperty("--ev", shot.ev.toFixed(2));
    root.style.setProperty("--fstop", shot.f.toFixed(1));
    root.style.setProperty("--iso", String(shot.iso));

    const dusk = S.smoothstep(0.7, 1, u);
    const skyTop = S.mix([132, 168, 200], [42, 44, 74], dusk).map((c) => Math.round(c * exposure));
    const skyBot = S.mix([206, 222, 232], [188, 122, 88], dusk).map((c) => Math.round(c * exposure));

    ctx.filter = "none";
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, S.rgb(skyTop));
    g.addColorStop(1, S.rgb(skyBot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    /* ── The planes ────────────────────────────────────────────────────
       Circle of confusion, simplified: how far this plane is from the plane
       of focus in *relative* terms, divided by the f-number. Dividing by the
       f-number is what makes a wide aperture blur more, and taking the
       distance ratio rather than the difference is what makes a plane at 60 m
       stay sharp while one at 1.4 m goes to mush when you focus at 6 m. */
    for (let i = 0; i < PLANES.length; i++) {
      const plane = PLANES[i];
      const ratio = Math.abs(Math.log(plane.d / shot.focus));
      const coc = S.clamp((ratio * 9) / shot.f, 0, 26);
      ctx.filter = coc > 0.4 ? `blur(${coc.toFixed(2)}px)` : "none";

      /* Haze: distant planes sit further into the atmosphere. */
      const haze = S.clamp(plane.d / 80, 0, 0.7);
      const colour = S.mix(plane.colour, skyBot, haze).map((c) => Math.round(c * exposure));
      ctx.fillStyle = S.rgb(colour);

      const baseY = plane.y * h;

      if (plane.kind === "ridge") {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 12; x += 12) {
          const n = Math.sin(x * 0.0041) * 0.55 + Math.sin(x * 0.0113 + 2) * 0.3;
          ctx.lineTo(x, baseY - n * h * 0.1);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      } else if (plane.kind === "trees") {
        ctx.fillRect(0, baseY, w, h - baseY);
        for (const it of plane.items) {
          const x = it.x * w;
          const th = it.h * h * 0.16;
          ctx.beginPath();
          ctx.moveTo(x - th * 0.3, baseY);
          ctx.lineTo(x, baseY - th);
          ctx.lineTo(x + th * 0.3, baseY);
          ctx.closePath();
          ctx.fill();
        }
      } else if (plane.kind === "wall") {
        ctx.fillRect(0, baseY, w, h - baseY);
        /* A low wall with gaps — something with a recognisable edge, so the
           moment it comes into focus is unmistakable. */
        for (const it of plane.items) {
          if (it.seed > 0.7) continue;
          ctx.fillRect(it.x * w, baseY - h * 0.05 * it.h, w * 0.03 * it.w, h * 0.05 * it.h);
        }
      } else {
        ctx.fillRect(0, baseY - h * 0.1, w, h);
        for (const it of plane.items) {
          const x = it.x * w;
          ctx.beginPath();
          ctx.moveTo(x, baseY);
          ctx.quadraticCurveTo(x + it.w * 14, baseY - h * 0.11 * it.h, x + it.w * 26, baseY - h * 0.16 * it.h);
          ctx.lineWidth = 3;
          ctx.strokeStyle = S.rgb(colour);
          ctx.stroke();
        }
      }
    }

    ctx.filter = "none";

    /* ── Grain ─────────────────────────────────────────────────────────
       Rises with ISO, which rises as the light goes. Drawn as sparse dots
       rather than per-pixel noise: a full-frame ImageData pass for a texture
       nobody looks at directly is not worth the milliseconds. */
    const grain = S.clamp((shot.iso - 100) / 3100, 0, 1);
    if (grain > 0.02) {
      const n = Math.round(grain * 1400);
      const gr = S.prng(9001);
      for (let i = 0; i < n; i++) {
        const x = gr() * w;
        const y = gr() * h;
        ctx.fillStyle = gr() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
        ctx.fillRect(x, y, 1.4, 1.4);
      }
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
