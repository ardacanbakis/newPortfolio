/* ==========================================================================
   v23 — Fly-through.

   The travel is in the stylesheet. This adds the field you travel through:
   points that stream toward you, faster on the frames where the deck is
   actually moving, so the background and the panels agree about the journey.
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

  /* Boost decays rather than switching off, so the field eases back to its
     cruising speed instead of stopping dead when the panel lands. */
  let boost = 0;
  deck?.on(() => {
    boost = 1;
  });

  const COUNT = FX.particleCount(90, 40, 190);
  let stars = [];
  let vw = 0;
  let vh = 0;

  const seed = (star, far) => {
    star.x = (Math.random() - 0.5) * 2;
    star.y = (Math.random() - 0.5) * 2;
    star.z = far ? 1 : Math.random();
    star.hue = Math.random() < 0.22 ? "124, 92, 255" : "238, 240, 246";
    return star;
  };

  FX.background({
    zIndex: 0,
    className: "fx-canvas starfield",

    init(w, h) {
      vw = w;
      vh = h;
      stars = Array.from({ length: COUNT }, () => seed({}, false));
    },

    onResize(w, h) {
      vw = w;
      vh = h;
    },

    draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      boost *= 0.94;

      const cx = w / 2;
      const cy = h * 0.45;
      const speed = 0.0012 + boost * 0.02;

      for (const s of stars) {
        s.z -= speed;
        if (s.z <= 0.02) seed(s, true);

        // Perspective divide: the whole effect is this one line.
        const k = 0.6 / s.z;
        const x = cx + s.x * k * vw * 0.5;
        const y = cy + s.y * k * vh * 0.5;
        if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;

        const size = Math.max(0.4, (1 - s.z) * 2.4);
        const alpha = Math.min(0.75, (1 - s.z) * 0.8);

        ctx.fillStyle = "rgba(" + s.hue + ", " + alpha.toFixed(3) + ")";
        ctx.fillRect(x, y, size, size);
      }
    },
  });
});
