/* v12 — Liquid mesh gradient.

   Large soft colour fields drift and blend into each other. Drawn as radial
   gradients rather than blurred shapes: a canvas blur filter over a
   full-screen layer repaints expensively every frame, while a radial gradient
   is soft by construction and costs almost nothing. */

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
  FX.stagger(".projects, .services", 80);

  const PALETTE = [
    [168, 85, 247],
    [236, 72, 153],
    [56, 189, 248],
    [251, 146, 60],
  ];

  let blobs = [];

  const seed = (w, h) => {
    const count = FX.smallScreen() ? 3 : 4;
    blobs = Array.from({ length: count }, (_, i) => ({
      colour: PALETTE[i % PALETTE.length],
      // Each blob gets its own slow orbit; different periods stop them ever
      // settling into a repeating pattern.
      cx: Math.random(),
      cy: Math.random(),
      ax: 0.18 + Math.random() * 0.16,
      ay: 0.16 + Math.random() * 0.16,
      sx: 0.00021 + Math.random() * 0.00019,
      sy: 0.00017 + Math.random() * 0.00021,
      phase: Math.random() * Math.PI * 2,
      r: (FX.smallScreen() ? 0.55 : 0.42) * Math.max(w, h),
    }));
  };

  FX.background({
    init: seed,
    onResize: seed,
    draw(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);
      // 'lighter' lets overlaps bloom into new colours the way mixing light
      // does, which is what makes it read as liquid rather than as stickers.
      ctx.globalCompositeOperation = "lighter";

      for (const b of blobs) {
        const x = (b.cx + Math.cos(t * b.sx + b.phase) * b.ax) * w;
        const y = (b.cy + Math.sin(t * b.sy + b.phase) * b.ay) * h;

        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        const [r, gr, bl] = b.colour;
        g.addColorStop(0, `rgba(${r}, ${gr}, ${bl}, 0.5)`);
        g.addColorStop(0.55, `rgba(${r}, ${gr}, ${bl}, 0.14)`);
        g.addColorStop(1, `rgba(${r}, ${gr}, ${bl}, 0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    },
  });
});
