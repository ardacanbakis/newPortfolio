/* ==========================================================================
   v21 — Prism.

   The rotation is in the stylesheet. This adds the motion layer: a slow wire
   grid behind the faces, a custom cursor and magnetic buttons.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  const deck = window.Deck ? window.Deck.create() : null;

  if (!deck) {
    P.wireStandardPage();
  } else {
    P.wireChrome();
    P.gateWhatsappAfterChapter(deck, "projects", document.querySelector(".whatsapp-float"));
  }

  if (!FX) return;

  FX.customCursor();
  FX.magnetic();

  /* A perspective grid receding to a vanishing point, drifting sideways. The
     lines are spaced by a power so they bunch toward the horizon the way a
     real one does — an evenly spaced grid reads as a ladder, not a plane. */

  const ROWS = 14;
  const COLS = 16;

  FX.background({
    zIndex: 0,
    className: "fx-canvas prism-grid",

    draw(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);

      const horizon = h * 0.52;
      const drift = (t * 0.00004) % 1;

      ctx.lineWidth = 1;

      // Lines running away from you.
      for (let r = 1; r <= ROWS; r++) {
        const p = Math.pow((r + drift) / ROWS, 2.4);
        const y = horizon + p * (h - horizon);
        if (y > h) continue;
        ctx.strokeStyle = "rgba(110, 231, 240, " + (0.3 * (1 - p * 0.65)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Lines running toward the vanishing point.
      const vx = w / 2;
      for (let c = 0; c <= COLS; c++) {
        const x = (c / COLS) * w * 2.4 - w * 0.7;
        ctx.strokeStyle = "rgba(110, 231, 240, 0.13)";
        ctx.beginPath();
        ctx.moveTo(vx, horizon);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    },
  });
});
