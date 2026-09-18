/* ==========================================================================
   v45 — Depth.

   A dive. The hero floats just under the surface with the light still
   breaking overhead; the work is down on the reef; the services are in the
   twilight zone where the last blue goes; the contact form is at the bottom,
   lit only by the things that make their own light.

   The physics of it is one number: how much daylight is left. Everything
   else is derived from that, which is what keeps a dive from looking like a
   background that merely gets darker.

     * Light falls off exponentially, not linearly. Half of it is gone in the
       first ten metres and the last of it lingers for hundreds — so the top
       of the dive changes fast and the bottom changes slowly, which is what
       makes the descent feel long.
     * Red goes first. The palette desaturates toward blue-green as it darkens
       rather than fading to grey, because that is the actual reason deep
       water is blue.
     * Caustics only exist while there is a surface to make them.
     * Bioluminescence only exists once there is no daylight to drown it, and
       it answers the pointer — the one thing down there that reacts to you.
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
  const rnd = S.prng(45045045);

  const MAX_DEPTH = 1100; // metres at the bottom of the deck

  /* Marine snow: always falling, always there, at every depth. The one
     constant of the whole dive. */
  const SNOW = Array.from({ length: 150 }, () => ({
    x: rnd(),
    y: rnd(),
    z: 0.25 + rnd() * 0.75,
    drift: (rnd() - 0.5) * 0.02,
  }));

  /* Bioluminescent plankton. Each has its own pulse, and a little extra
     brightness when the pointer is near it. */
  const BIO = Array.from({ length: 90 }, () => ({
    x: rnd(),
    y: rnd(),
    phase: rnd() * Math.PI * 2,
    speed: 0.35 + rnd() * 0.9,
    r: 0.8 + rnd() * 2.2,
    vx: (rnd() - 0.5) * 0.012,
    vy: (rnd() - 0.5) * 0.012,
  }));

  /* The reef, as a silhouette profile generated once. */
  const REEF = [];
  for (let i = 0; i < 26; i++) {
    REEF.push({
      x: rnd(),
      w: 0.04 + rnd() * 0.12,
      h: 0.1 + rnd() * 0.3,
      lean: (rnd() - 0.5) * 0.5,
    });
  }

  let pointer = { x: -1, y: -1 };
  window.addEventListener("pointermove", (e) => {
    pointer = { x: e.clientX, y: e.clientY };
  }, { passive: true });

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Surface",        tr: "Yüzey",           es: "Superficie" } },
      { at: 0.16, label: { en: "Sunlit zone",    tr: "Işık bölgesi",    es: "Zona de luz" } },
      { at: 0.42, label: { en: "The reef",       tr: "Resif",           es: "El arrecife" } },
      { at: 0.66, label: { en: "Twilight zone",  tr: "Alacakaranlık",   es: "Zona crepuscular" } },
      { at: 0.86, label: { en: "Midnight zone",  tr: "Gece bölgesi",    es: "Zona de medianoche" } },
    ],
  });

  let clock = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;
    const depth = u * MAX_DEPTH;

    /* Beer–Lambert, roughly. The constant is the whole feel of the dive: at
       /40 the water was black by the time you reached the reef and the second
       half of the descent had nothing left to change. /160 keeps a readable
       blue through the reef and the twilight zone and goes truly dark only at
       the bottom. */
    const light = Math.exp(-depth / 160);
    root.style.setProperty("--light", light.toFixed(4));
    root.style.setProperty("--metres", String(Math.round(depth)));

    /* Red is absorbed within a few metres, green within tens. Taking the
       channels down at different rates is the whole colour story. */
    const r = 28 * Math.exp(-depth / 30);
    const g = 104 * Math.exp(-depth / 110);
    const b = 165 * Math.exp(-depth / 420);

    const top = [Math.round(r + 24), Math.round(g + 40), Math.round(b + 48)];
    const bot = [Math.round(r * 0.4), Math.round(g * 0.45), Math.round(b * 0.6)];
    root.style.setProperty("--water", S.rgb(top));

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, S.rgb(top));
    grad.addColorStop(1, S.rgb(bot));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* ── Surface and caustics ──────────────────────────────────────────
       Only while the surface is still overhead. The caustic net is three
       sine fields at different scales summed and thresholded — cheap, and
       close enough to the real interference pattern to be convincing. */
    const nearSurface = S.smoothstep(170, 0, depth);
    if (nearSurface > 0.01) {
      const rows = 26;
      ctx.lineWidth = 2;
      for (let i = 0; i < rows; i++) {
        const fy = i / rows;
        const y = fy * h * 0.75;
        /* Bands fade with how far down the screen they are as well as with
           depth, so the light converges toward the surface. */
        const strength = nearSurface * (1 - fy) * 0.5;
        if (strength < 0.01) continue;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const n =
            Math.sin(x * 0.011 + clock * 0.9 + i * 0.7) +
            Math.sin(x * 0.027 - clock * 1.3 + i * 1.9) * 0.6 +
            Math.sin(x * 0.005 + clock * 0.4) * 0.8;
          ctx.lineTo(x, y + n * 7);
        }
        ctx.strokeStyle = `rgba(190,240,255,${strength * 0.12})`;
        ctx.stroke();
      }

      /* The underside of the surface itself. */
      const sky = ctx.createLinearGradient(0, -h * 0.1, 0, h * 0.42);
      sky.addColorStop(0, `rgba(198,238,252,${nearSurface * 0.55})`);
      sky.addColorStop(1, "rgba(198,238,252,0)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.42);
    }

    /* ── Reef ──────────────────────────────────────────────────────────
       Rises into frame around the project panels and is gone by the twilight
       zone, so passing it is an event rather than a fixture. */
    const reefHere = S.band(0.2, 0.34, 0.5, 0.64, u);
    if (reefHere > 0.01) {
      const base = h * (1.24 - reefHere * 0.34);
      ctx.fillStyle = `rgba(${Math.round(r * 0.5)},${Math.round(g * 0.4)},${Math.round(b * 0.5)},0.92)`;
      for (let i = 0; i < REEF.length; i++) {
        const c = REEF[i];
        const x = c.x * w;
        const height = c.h * h * reefHere;
        ctx.beginPath();
        ctx.moveTo(x - (c.w * w) / 2, base);
        ctx.quadraticCurveTo(x + c.lean * w * 0.06, base - height, x, base - height);
        ctx.quadraticCurveTo(x - c.lean * w * 0.06, base - height, x + (c.w * w) / 2, base);
        ctx.closePath();
        ctx.fill();
      }
    }

    /* ── Marine snow ───────────────────────────────────────────────────
       Falling, so it rises past a descending camera — which is the cue that
       tells you *you* are the thing moving. */
    for (let i = 0; i < SNOW.length; i++) {
      const p = SNOW[i];
      p.y -= (0.02 + p.z * 0.05) * dt;
      p.x += p.drift * dt;
      if (p.y < -0.02) { p.y += 1.04; p.x = rnd(); }
      ctx.fillStyle = `rgba(226,244,250,${0.06 + p.z * 0.16})`;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 0.5 + p.z * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Bioluminescence ───────────────────────────────────────────────
       Appears only once the daylight has gone, and answers the pointer: get
       close and they flare. */
    const dark = 1 - S.clamp(light * 3, 0, 1);
    if (dark > 0.02) {
      for (let i = 0; i < BIO.length; i++) {
        const p = BIO[i];
        p.x = (p.x + p.vx * dt + 1) % 1;
        p.y = (p.y + p.vy * dt + 1) % 1;

        const px = p.x * w;
        const py = p.y * h;
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(clock * p.speed + p.phase));

        let excite = 0;
        if (pointer.x >= 0) {
          const d = Math.hypot(px - pointer.x, py - pointer.y);
          excite = S.clamp(1 - d / 170, 0, 1);
        }

        const a = dark * (pulse * 0.5 + excite * 0.9);
        if (a < 0.02) continue;

        const rad = p.r * (1 + excite * 2.4);
        const glow = ctx.createRadialGradient(px, py, 0, px, py, rad * 6);
        glow.addColorStop(0, `rgba(150,255,226,${a * 0.75})`);
        glow.addColorStop(1, "rgba(150,255,226,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, rad * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
