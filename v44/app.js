/* ==========================================================================
   v44 — Seasons.

   One tree, one year. The hero is bare late winter; buds break over the first
   projects; the middle of the work is high summer; the services turn and
   fall; the contact form is under snow.

   The tree is grown once, not drawn every frame. A recursive generator walks
   out from the trunk producing a flat list of segments — each with its start,
   end, thickness and generation — and a list of tip positions. That list is
   the tree. Every frame after that is just deciding what colour the segments
   are and which tips currently carry a leaf, which is why a few thousand
   branches cost nothing to animate.

   The six projects hang on it as fruit, one per project panel, on the six
   tips furthest from the trunk. They light as you reach their panel — the
   one place in this set where the scene points at the content rather than
   merely surrounding it.
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

  const SKY  = [[210, 220, 226], [196, 220, 224], [168, 206, 220], [214, 200, 172], [222, 226, 232]];
  const HAZE = [[236, 232, 222], [226, 236, 226], [220, 234, 238], [238, 224, 200], [242, 244, 248]];
  const BARK = [[76, 62, 52], [82, 66, 54], [86, 70, 56], [78, 62, 50], [92, 84, 80]];
  const LEAF_A = [[196, 216, 176], [150, 196, 120], [86, 152, 78], [214, 150, 58], [186, 118, 52]];
  const LEAF_B = [[224, 208, 226], [186, 214, 150], [58, 122, 62], [186, 92, 44], [148, 84, 46]];

  /* ── Growing the tree ─────────────────────────────────────────────────
     Coordinates are fractions of the canvas, so the tree survives a resize
     without being regrown — a tree that reshuffles its branches when you
     rotate a phone is not a tree. */
  let segments = [];
  let tips = [];

  const grow = () => {
    segments = [];
    tips = [];
    const rnd = S.prng(44081991);

    const branch = (x, y, angle, len, width, depth) => {
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      segments.push({ x, y, x2, y2, w: width, depth });

      if (depth >= 9 || len < 0.012) {
        tips.push({ x: x2, y: y2, angle, seed: rnd() });
        return;
      }

      /* Two children, occasionally three. The spread narrows with depth,
         which is what stops a recursive tree from looking like a firework. */
      const forks = depth > 2 && rnd() > 0.82 ? 3 : 2;
      const spread = 0.5 - depth * 0.03;

      for (let i = 0; i < forks; i++) {
        const t = forks === 1 ? 0 : i / (forks - 1) - 0.5;
        const a = angle + t * spread * 2 + (rnd() - 0.5) * 0.24;
        branch(x2, y2, a, len * (0.72 + rnd() * 0.12), width * 0.7, depth + 1);
      }
    };

    /* Sized so the *whole* tree is in frame — crown clear of the top of the
       reading plate, foot standing on the ground line. The first attempt used
       a longer trunk and a wider fork angle and produced a canopy that ran off
       both edges with no trunk visible, which reads as hedges rather than as
       one tree. */
    branch(0.5, 0.94, -Math.PI / 2, 0.145, 0.019, 0);

    /* Fruit go on the six tips that reach highest and widest — the ones you
       would actually be able to see. Sorted deterministically, so project 1
       is always on the same branch. */
    const ranked = tips
      .map((t, i) => ({ i, score: (1 - t.y) + Math.abs(t.x - 0.5) * 0.6 }))
      .sort((a, b) => b.score - a.score);

    const chosen = [];
    for (const r of ranked) {
      const t = tips[r.i];
      /* Spread them out: no two fruit closer than 9% of the canvas, or they
         read as one bunch rather than six pieces of work. */
      if (chosen.every((c) => Math.hypot(c.x - t.x, c.y - t.y) > 0.06)) chosen.push(t);
      if (chosen.length === 6) break;
    }
    fruit = chosen;
  };

  let fruit = [];
  grow();

  const rnd2 = S.prng(7788);
  const FALLING = Array.from({ length: 90 }, () => ({
    x: rnd2(),
    y: rnd2(),
    r: 2 + rnd2() * 3.4,
    spin: rnd2() * Math.PI * 2,
    spinV: (rnd2() - 0.5) * 2.4,
    vy: 0.03 + rnd2() * 0.07,
    sway: rnd2() * Math.PI * 2,
  }));

  /* Which project panel is current, so the right fruit can light. Slides 1-6
     of the deck are the six projects. */
  let activeProject = -1;
  deck.on((i) => {
    const slide = deck.slides[i];
    activeProject = slide && slide.dataset.chapter === "projects" ? i - 1 : -1;
  });

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Late winter", tr: "Kış sonu", es: "Fin de invierno" } },
      { at: 0.16, label: { en: "Bud break",   tr: "Tomurcuk", es: "Brotación" } },
      { at: 0.38, label: { en: "High summer", tr: "Yaz",      es: "Pleno verano" } },
      { at: 0.64, label: { en: "Turning",     tr: "Sonbahar", es: "Otoño" } },
      { at: 0.86, label: { en: "First snow",  tr: "İlk kar",  es: "Primera nieve" } },
    ],
  });

  let clock = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;

    const sky = S.ramp(SKY, u);
    const haze = S.ramp(HAZE, u);
    const bark = S.ramp(BARK, u);
    const leafA = S.ramp(LEAF_A, u);
    const leafB = S.ramp(LEAF_B, u);

    root.style.setProperty("--sky", S.rgb(sky));
    root.style.setProperty("--haze", S.rgb(haze));
    root.style.setProperty("--leaf", S.rgb(leafB));

    /* Foliage: none in winter at either end, full in summer. The tree is bare
       at u=0 and bare again at u=1, which is what makes it a year. */
    const foliage = S.band(0.06, 0.34, 0.6, 0.88, u);
    const snow = S.smoothstep(0.8, 0.97, u);
    const fall = S.band(0.58, 0.68, 0.9, 1.0, u);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, S.rgb(sky));
    g.addColorStop(1, S.rgb(haze));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    /* The ground. White once the snow has come. */
    const groundY = h * 0.94;
    ctx.fillStyle = S.rgb(S.mix(S.mix(haze, [120, 128, 104], 0.5), [246, 248, 252], snow));
    ctx.fillRect(0, groundY, w, h - groundY);

    /* ── Branches ──────────────────────────────────────────────────────
       Drawn thickest-first so a thin twig never paints over a limb it grew
       from. The wind is one number applied by depth, so the trunk is rigid
       and the outermost twigs move most. */
    const wind = Math.sin(clock * 0.6) * 0.5 + Math.sin(clock * 1.31) * 0.22;
    ctx.lineCap = "round";
    ctx.strokeStyle = S.rgb(bark);

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      const sway = (s.depth / 9) ** 2 * wind * 0.006;
      ctx.lineWidth = Math.max(0.6, s.w * w);
      ctx.beginPath();
      ctx.moveTo(s.x * w + sway * w * 0.4, s.y * h);
      ctx.lineTo((s.x2 + sway) * w, s.y2 * h);
      ctx.stroke();
    }

    /* ── Leaves ────────────────────────────────────────────────────────── */
    if (foliage > 0.01) {
      for (let i = 0; i < tips.length; i++) {
        const t = tips[i];
        /* Each tip leafs at its own moment, spread over the season, so the
           canopy fills in rather than appearing. */
        const local = S.clamp((foliage - t.seed * 0.35) / 0.65, 0, 1);
        if (local <= 0.02) continue;

        const sway = wind * 0.006;
        const x = (t.x + sway) * w;
        const y = t.y * h;
        const r = (2.2 + t.seed * 3.4) * local;
        ctx.fillStyle = S.rgb(S.mix(leafA, leafB, t.seed), 0.86);
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.5, r, t.angle + wind * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ── Fruit ─────────────────────────────────────────────────────────
       Six, one per project, lit when its panel is the one you are reading. */
    for (let i = 0; i < fruit.length; i++) {
      const f = fruit[i];
      const lit = activeProject === i ? 1 : 0.22;
      const x = (f.x + wind * 0.006) * w;
      const y = f.y * h + 3;
      const r = 4 + lit * 4.5;

      if (lit > 0.5) {
        ctx.fillStyle = "rgba(226,96,72,0.22)";
        ctx.beginPath();
        ctx.arc(x, y, r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(212,72,54,${0.35 + lit * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── What is in the air ────────────────────────────────────────────
       The same particles are leaves in autumn and flakes in winter: they
       tumble and spin when they are leaves, drift flat when they are snow. */
    const loose = Math.max(fall, snow);
    if (loose > 0.01) {
      for (let i = 0; i < FALLING.length; i++) {
        const p = FALLING[i];
        p.y = (p.y + p.vy * dt * (0.5 + fall)) % 1.08;
        p.spin += p.spinV * dt * fall;
        const x = (p.x + Math.sin(clock * 0.7 + p.sway) * 0.02) * w;
        const y = p.y * h;

        if (fall > 0.02) {
          ctx.globalAlpha = fall * 0.85;
          ctx.fillStyle = S.rgb(S.mix(leafA, leafB, (i % 7) / 7));
          ctx.beginPath();
          ctx.ellipse(x, y, p.r * 1.6, p.r * Math.abs(Math.cos(p.spin)), p.spin, 0, Math.PI * 2);
          ctx.fill();
        }
        if (snow > 0.02) {
          ctx.globalAlpha = snow * 0.9;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(x, y, p.r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
