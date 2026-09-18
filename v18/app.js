/* ==========================================================================
   v18 — construction paper behaviour.

   Four jobs:

     · stick a strip of tape on every sheet, and a cut-out star on every
       service, rather than writing thirty near-identical elements into the
       markup by hand
     · parallax the three layers of town against the scroll
     · fall snow, as small squares of paper rather than round particles
     · flip each project card up off the page as it arrives, the way a piece
       being laid down would

   Every one of them is decoration. With this file removed the page is a
   complete, readable document of flat coloured card.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  const root = document.documentElement;
  const reduced = FX?.reducedMotion;

  P.wireStandardPage();

  /* ── Tape ─────────────────────────────────────────────────────────────
     Two strips per sheet, at opposite corners. Generated rather than
     written out: thirty hand-placed strips would be thirty chances for one
     of them to end up in the wrong corner. */

  document
    .querySelectorAll(".project, .service, .contact-form, .contact-direct")
    .forEach((sheet, i) => {
      // Alternating so a grid of cards is not taped in lockstep.
      const corners = i % 2 ? ["tape-tr"] : ["tape-tl"];
      if (i % 3 === 0) corners.push(i % 2 ? "tape-tl" : "tape-tr");

      corners.forEach((corner) => {
        const strip = document.createElement("span");
        strip.className = "tape " + corner;
        strip.setAttribute("aria-hidden", "true");
        sheet.appendChild(strip);
      });
    });

  /* ── Service badges ───────────────────────────────────────────────────── */

  document.querySelectorAll(".service").forEach((service, i) => {
    const star = document.createElement("span");
    star.className = "badge-cut";
    star.setAttribute("aria-hidden", "true");
    star.textContent = String(i + 1).padStart(2, "0");
    service.appendChild(star);
  });

  /* ── Parallax ─────────────────────────────────────────────────────────
     One number for the whole scene. --shift runs roughly 0 → 1 down the
     page and each layer multiplies it by its own distance, so the three
     sheets of scenery can never drift out of step with each other. */

  const town = document.querySelector(".town");

  if (town && !reduced) {
    P.onScroll(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const shift = max > 0 ? window.scrollY / max : 0;
      root.style.setProperty("--shift", shift.toFixed(4));
    });
  }

  /* ── Cards laid down ──────────────────────────────────────────────────
     Each card arrives already rotated by the stylesheet, so the reveal has
     to preserve that: it animates a wrapper property rather than the
     transform, which the nth-child rules own. */

  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("laid");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll(".project, .service").forEach((el, i) => {
      el.classList.add("to-lay");
      el.style.setProperty("--lay-delay", (i % 3) * 90 + "ms");
      io.observe(el);
    });
  }

  /* ── Snow ─────────────────────────────────────────────────────────────
     Squares, not circles. Paper snow is cut with scissors, and a round
     particle would be the one thing on the page that was not. */

  if (!FX) return;

  const COUNT = FX.particleCount(60, 24, 120);
  let flakes = [];
  let vw = 0;
  let vh = 0;

  const seed = (flake, top) => {
    flake.x = Math.random() * vw;
    flake.y = top ? -20 - Math.random() * 60 : Math.random() * vh;
    flake.size = 3 + Math.random() * 6;
    flake.fall = 0.28 + Math.random() * 0.85;
    flake.sway = 0.4 + Math.random() * 1.1;
    flake.phase = Math.random() * Math.PI * 2;
    flake.spin = (Math.random() - 0.5) * 0.02;
    flake.rot = Math.random() * Math.PI;
    flake.alpha = 0.55 + Math.random() * 0.4;
    return flake;
  };

  FX.background({
    // In front of the town (0), behind the document (2).
    zIndex: 1,
    className: "fx-canvas snowfall",

    init(w, h) {
      vw = w;
      vh = h;
      flakes = Array.from({ length: COUNT }, () => seed({}, false));
    },

    onResize(w, h) {
      vw = w;
      vh = h;
    },

    draw(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);

      for (const f of flakes) {
        f.y += f.fall;
        // A slow lateral drift rather than a straight drop: paper catches
        // the air.
        f.x += Math.sin(t * 0.0006 + f.phase) * f.sway * 0.4;
        f.rot += f.spin;

        if (f.y - f.size > h) seed(f, true);
        if (f.x < -20) f.x = w + 10;
        if (f.x > w + 20) f.x = -10;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.fillStyle = "rgba(255, 255, 255, " + f.alpha + ")";
        ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size);
        ctx.restore();
      }
    },
  });
});
