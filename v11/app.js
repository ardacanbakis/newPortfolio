/* v11 — Particle constellation.

   A field of drifting points that link to their neighbours and lean away from
   the cursor. Content, translations and the contact form come from
   ../shared/site.js; the motion layer from ../shared/fx.js. */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  /* ── Standard page wiring ───────────────────────────────────────────── */

  const switcher = document.getElementById("language-switcher");
  switcher.value = P.initialLanguage();
  P.applyLanguage(switcher.value);
  switcher.addEventListener("change", () => P.applyLanguage(switcher.value));

  P.wireContactForm(document.getElementById("contact-form"));

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  const header = document.querySelector(".site-header");
  const links = [...nav.querySelectorAll("a")];
  const sections = links.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
  const gate = P.gateWhatsappAfter(
    document.getElementById("projects"),
    document.querySelector(".whatsapp-float"),
  );

  P.onScroll(() => {
    header.classList.toggle("scrolled", window.scrollY > 20);
    let active = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) active = i;
    });
    links.forEach((a, i) => a.classList.toggle("active", i === active));
    gate();
  });

  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── Motion layer ───────────────────────────────────────────────────── */

  if (!FX) return;

  FX.customCursor();
  FX.magnetic();
  FX.scrollVelocity();
  FX.sectionTransitions(".section");
  FX.stagger(".projects, .services", 70);

  /* The constellation. Points drift, link to close neighbours, and are
     pushed gently away from the pointer — on touch there is no pointer, so
     the field simply drifts, which reads as calm rather than broken. */
  let points = [];
  const LINK = 130;

  const seed = (w, h) => {
    const n = FX.particleCount(70, 26, 110);
    points = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.7,
    }));
  };

  FX.background({
    init: seed,
    onResize: seed,
    draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap rather than bounce; bouncing makes the edges obvious.
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        if (FX.pointer.active) {
          const dx = p.x - FX.pointer.x;
          const dy = p.y - FX.pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 26000 && d2 > 1) {
            const f = (26000 - d2) / 26000;
            const d = Math.sqrt(d2);
            p.x += (dx / d) * f * 2.2;
            p.y += (dy / d) * f * 2.2;
          }
        }
      }

      // Links. O(n²) is fine at these counts and the count is capped by area.
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          ctx.strokeStyle = `rgba(125, 176, 255, ${0.3 * (1 - d / LINK)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }

      for (const p of points) {
        ctx.fillStyle = "rgba(180, 210, 255, 0.75)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  });
});
