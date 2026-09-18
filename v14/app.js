/* v14 — Generative flow field.

   Particles follow a slowly rotating vector field and leave trails. The
   trails come from painting a translucent rectangle over the previous frame
   rather than clearing it, so old strokes fade instead of vanishing — the
   whole image is the accumulation.

   The noise is a small hand-written value-noise rather than a library: it is
   a few dozen lines and avoids a dependency for something used once. */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  P.wireStandardPage();
  if (!FX) return;

  FX.customCursor();
  FX.magnetic();
  FX.scrollVelocity();
  FX.sectionTransitions(".section");
  FX.stagger(".projects, .services", 60);

  /* ── Value noise ────────────────────────────────────────────────────── */

  const PERM = new Uint8Array(512);
  (() => {
    const p = Uint8Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [p[i], p[j]] = [p[j], p[i]];
    }
    PERM.set(p);
    PERM.set(p, 256);
  })();

  const fade = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const hash = (x, y) => PERM[(PERM[x & 255] + (y & 255)) & 255] / 255;

  const noise = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    return lerp(
      lerp(hash(xi, yi), hash(xi + 1, yi), xf),
      lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), xf),
      yf,
    );
  };

  /* ── The field ──────────────────────────────────────────────────────── */

  let agents = [];
  let W = 0;
  let H = 0;

  const seed = (w, h) => {
    W = w;
    H = h;
    const n = FX.particleCount(260, 90, 420);
    agents = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      life: Math.random() * 240,
    }));
  };

  FX.background({
    init: seed,
    onResize: seed,
    draw(ctx, w, h, t) {
      // Fade the previous frame rather than clearing: this is what leaves
      // trails and makes the field read as drawn rather than animated.
      ctx.fillStyle = "rgba(12, 12, 12, 0.055)";
      ctx.fillRect(0, 0, w, h);

      const scale = 0.0022;
      const drift = t * 0.0009;

      ctx.lineWidth = 1;

      for (const a of agents) {
        const angle = noise(a.x * scale + drift, a.y * scale) * Math.PI * 4;
        const nx = a.x + Math.cos(angle) * 1.5;
        const ny = a.y + Math.sin(angle) * 1.5;

        ctx.strokeStyle = "rgba(255, 122, 69, 0.19)";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        a.x = nx;
        a.y = ny;
        a.life -= 1;

        // Respawn when a particle wanders off or its life runs out, so the
        // field keeps regenerating instead of draining to the edges.
        if (a.life < 0 || a.x < 0 || a.x > W || a.y < 0 || a.y > H) {
          a.x = Math.random() * W;
          a.y = Math.random() * H;
          a.life = 180 + Math.random() * 240;
        }
      }
    },
  });
});
