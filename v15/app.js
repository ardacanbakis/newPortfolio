/* v15 — Isometric parallax world.

   A drawn isometric landscape that shifts as you scroll and as the pointer
   moves. Three depth layers move at different rates, which is what sells the
   depth — a single layer just slides.

   On touch there is no pointer to follow, so the parallax is driven by scroll
   alone. Device orientation would be the obvious substitute, but it needs a
   permission prompt on iOS and tilting a phone to read a page is not a
   trade anyone wants. */

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
  FX.stagger(".projects, .services", 70);

  const LAYERS = [
    { tile: 132, depth: 0.03, colour: "rgba(148, 163, 184, 0.32)", lift: 26 },
    { tile: 84, depth: 0.07, colour: "rgba(129, 140, 248, 0.3)", lift: 16 },
    { tile: 52, depth: 0.13, colour: "rgba(56, 189, 248, 0.26)", lift: 9 },
  ];

  /* One isometric diamond. Drawing the top face plus two sides gives the
     blocks their solidity without needing any real 3D. */
  const diamond = (ctx, x, y, tw, th, lift) => {
    ctx.beginPath();
    ctx.moveTo(x, y - th / 2);
    ctx.lineTo(x + tw / 2, y);
    ctx.lineTo(x, y + th / 2);
    ctx.lineTo(x - tw / 2, y);
    ctx.closePath();
    ctx.stroke();

    if (lift > 0) {
      ctx.beginPath();
      ctx.moveTo(x - tw / 2, y);
      ctx.lineTo(x - tw / 2, y + lift);
      ctx.lineTo(x, y + th / 2 + lift);
      ctx.lineTo(x, y + th / 2);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + tw / 2, y);
      ctx.lineTo(x + tw / 2, y + lift);
      ctx.lineTo(x, y + th / 2 + lift);
      ctx.lineTo(x, y + th / 2);
      ctx.closePath();
      ctx.stroke();
    }
  };

  let px = 0;
  let py = 0;

  FX.background({
    zIndex: 0,
    draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      // Ease toward the pointer so the world glides rather than snapping.
      const tx = FX.pointer.active ? (FX.pointer.x / w - 0.5) * 2 : 0;
      const ty = FX.pointer.active ? (FX.pointer.y / h - 0.5) * 2 : 0;
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;

      const scroll = window.scrollY;

      LAYERS.forEach((layer, i) => {
        const tw = layer.tile;
        const th = layer.tile / 2;

        // Each layer drifts by a different fraction of the scroll and the
        // pointer — that difference is the parallax.
        const ox = px * 40 * (i + 1);
        const oy = py * 26 * (i + 1) - scroll * layer.depth;

        ctx.strokeStyle = layer.colour;
        ctx.lineWidth = 1;

        const cols = Math.ceil(w / tw) + 3;
        const rows = Math.ceil(h / th) + 6;
        const shift = ((oy % th) + th) % th;

        for (let r = -2; r < rows; r++) {
          for (let c = -2; c < cols; c++) {
            const x = c * tw + (r % 2 ? tw / 2 : 0) + (((ox % tw) + tw) % tw);
            const y = r * th - shift;
            // Sparse, deterministic placement: a hash keeps the same blocks
            // raised every frame instead of flickering.
            const raised = ((c * 928371 + r * 1237) % 11) === 0;
            diamond(ctx, x, y, tw, th, raised ? layer.lift : 0);
          }
        }
      });
    },
  });
});
