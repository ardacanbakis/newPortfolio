/* v7 — Interactive 3D.
   Content, translations, WhatsApp config and the contact form live in
   ../shared/site.js; this file only wires up what is specific to the layout. */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) {
    console.warn("shared/site.js did not load — the page is still readable.");
    return;
  }

  /* Language */
  const switcher = document.getElementById("language-switcher");
  switcher.value = P.initialLanguage();
  P.applyLanguage(switcher.value);
  switcher.addEventListener("change", () => P.applyLanguage(switcher.value));

  /* Contact form */
  P.wireContactForm(document.getElementById("contact-form"));

  /* Mobile menu */
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* Header state + active section + WhatsApp gate */
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

  P.revealOnScroll(".project, .service, .about-media, .about-body, .contact-grid");

  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* A hand-rolled wireframe — no 3D library, so nothing extra to download.
     Projects orbit as labelled nodes; the whole thing is decorative and
     aria-hidden, and it never starts when reduced motion is requested. */
  const canvas = document.getElementById("scene");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d");
    const nodes = [...document.querySelectorAll(".project-title")].map((el, i, all) => ({
      label: el.textContent.trim(),
      phi: (i / all.length) * Math.PI * 2,
      theta: (i % 3) * 0.6 - 0.6,
    }));

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const r = Math.min(w, h) * 0.32;
      ctx.clearRect(0, 0, w, h);
      t += 0.0032;

      const pts = nodes.map((n) => {
        const phi = n.phi + t;
        const x = Math.cos(phi) * Math.cos(n.theta);
        const y = Math.sin(n.theta);
        const z = Math.sin(phi) * Math.cos(n.theta);
        const scale = 1 / (2.4 - z);
        return { x: w / 2 + x * r * scale * 2.4, y: h / 2 + y * r * scale * 2.4, z, scale, label: n.label };
      });

      // Edges first so the nodes sit on top.
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d > r * 1.5) continue;
          ctx.strokeStyle = `rgba(125, 211, 252, ${0.16 * (1 - d / (r * 1.5))})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }

      pts
        .slice()
        .sort((a, b) => a.z - b.z)
        .forEach((p) => {
          const alpha = 0.35 + (p.z + 1) * 0.32;
          ctx.fillStyle = `rgba(125, 211, 252, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5 + p.scale * 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (p.z > -0.2) {
            ctx.fillStyle = `rgba(226, 240, 255, ${alpha * 0.75})`;
            ctx.font = `${10 + p.scale * 4}px "Space Grotesk", system-ui, sans-serif`;
            ctx.fillText(p.label, p.x + 10, p.y + 4);
          }
        });

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();

    // Stop the loop whenever the hero is off screen — no point burning battery
    // animating something nobody can see.
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!raf) draw();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
    }).observe(canvas);
  }
});
