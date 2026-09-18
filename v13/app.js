/* v13 — "Both Halves", the art piece.

   The choreography is a pure function of scroll position. Each act publishes
   its own progress as --p (0 → 1) and every animated property in the
   stylesheet reads that one variable. Nothing is queued or timed, so
   scrolling back up rewinds the piece exactly rather than replaying it — the
   usual failure of scroll animation driven by one-shot triggers.

   Everything here is enhancement. Without this file --p is never set, the
   CSS fallbacks apply, and the page is a finished document. */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  /* ── Language, form, footer ─────────────────────────────────────────── */

  const switcher = document.getElementById("language-switcher");
  switcher.value = P.initialLanguage();
  P.applyLanguage(switcher.value);
  switcher.addEventListener("change", () => {
    P.applyLanguage(switcher.value);
    splitName(); // the name may have changed length
  });

  P.wireContactForm(document.getElementById("contact-form"));

  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── Letter splitting ────────────────────────────────────────────────
     Each letter gets a deterministic scatter, seeded from its index. Random
     values would re-roll on every language switch and the piece would never
     look the same twice for no good reason. */

  const splitTargets = document.querySelectorAll("[data-split]");

  const splitName = () => {
    splitTargets.forEach((el) => {
      const text = el.dataset.text || (el.dataset.text = el.textContent.trim());
      el.textContent = "";

      [...text].forEach((chr, i) => {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = chr;
        // Alternating, index-derived offsets: stable across re-renders.
        span.style.setProperty("--dy", String(((i % 5) - 2) * 26 + (i % 2 ? 18 : -18)));
        span.style.setProperty("--rot", String(((i % 7) - 3) * 4));
        el.appendChild(span);
      });

      // The whole word is one label for assistive tech; the letters are decor.
      el.setAttribute("aria-label", text);
    });
  };

  splitName();

  /* ── Per-act progress ────────────────────────────────────────────────
     0 while the act is still below the fold, 1 once it has settled. Clamped
     rather than eased so the relationship to the scrollbar stays literal. */

  /* The opening act is already fully on screen at load, so a scroll-derived
     progress would sit at 1 from the first frame and its choreography would
     never play. It is excluded here and given an entrance below instead. */
  const openAct = document.querySelector(".act-open");
  const acts = [...document.querySelectorAll("[data-act]")].filter((a) => a !== openAct);

  const updateActs = () => {
    const vh = window.innerHeight;

    acts.forEach((act) => {
      const r = act.getBoundingClientRect();
      // Runs from the act's top reaching the bottom of the viewport, to it
      // reaching roughly a third of the way up.
      const raw = (vh - r.top) / (vh * 0.75);
      const p = Math.max(0, Math.min(1, raw));
      act.style.setProperty("--p", p.toFixed(3));
    });
  };

  /* ── Rail ───────────────────────────────────────────────────────────── */

  const railLinks = [...document.querySelectorAll(".rail a")];
  const railTargets = railLinks
    .map((a) => document.getElementById(a.dataset.rail))
    .filter(Boolean);

  const updateRail = () => {
    let active = 0;
    railTargets.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.4) active = i;
    });
    railLinks.forEach((a, i) => a.classList.toggle("active", i === active));
  };

  /* ── Work reveals ───────────────────────────────────────────────────── */

  const works = [...document.querySelectorAll("[data-work]")];

  if (FX?.reducedMotion) {
    works.forEach((w) => w.classList.add("in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    works.forEach((w, i) => {
      w.style.transitionDelay = `${(i % 3) * 70}ms`;
      observer.observe(w);
    });
  }

  /* ── WhatsApp gate ──────────────────────────────────────────────────── */

  const gate = P.gateWhatsappAfter(
    document.getElementById("work"),
    document.querySelector(".whatsapp-float"),
  );

  /* ── One scroll loop for all of it ──────────────────────────────────── */

  /* The cue is tied to actual scroll distance, not to an act's progress: it
     should disappear the moment the visitor takes the hint, wherever they
     happen to be. */
  const updateCue = () => {
    const fade = Math.max(0, 1 - window.scrollY / 220);
    document.documentElement.style.setProperty("--cue", fade.toFixed(3));
  };

  P.onScroll(() => {
    updateActs();
    updateRail();
    updateCue();
    gate();
  });

  window.addEventListener("resize", updateActs, { passive: true });

  /* ── Opening entrance ────────────────────────────────────────────────
     The letters assemble once, on arrival. Everything downstream still keys
     off --p, so this is the same mechanism as the scroll choreography — just
     driven by time for the one act that scroll cannot drive. */

  if (openAct) {
    if (FX?.reducedMotion) {
      openAct.style.setProperty("--p", "1");
    } else {
      openAct.style.setProperty("--p", "0");
      const started = performance.now();
      const DURATION = 1400;

      const intro = (now) => {
        const t = Math.min(1, (now - started) / DURATION);
        // easeOutCubic: quick to settle, no bounce.
        const eased = 1 - Math.pow(1 - t, 3);
        openAct.style.setProperty("--p", eased.toFixed(3));
        if (t < 1) requestAnimationFrame(intro);
      };

      requestAnimationFrame(intro);
    }
  }

  /* ── Motion layer ───────────────────────────────────────────────────── */

  if (!FX) return;

  FX.customCursor();
  FX.magnetic();
  FX.scrollVelocity();

  /* A single slow ink wash behind the type. Deliberately almost invisible:
     the piece is about the words, and a busy background would compete with
     the letter choreography rather than support it. */
  let t0 = Math.random() * 1000;

  FX.background({
    zIndex: -1,
    draw(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);

      const time = t * 0.0006 + t0;
      const cx = w * (0.5 + Math.cos(time) * 0.18);
      const cy = h * (0.45 + Math.sin(time * 0.8) * 0.16);
      const r = Math.max(w, h) * 0.55;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(232, 80, 58, 0.13)");
      g.addColorStop(0.5, "rgba(232, 80, 58, 0.04)");
      g.addColorStop(1, "rgba(232, 80, 58, 0)");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  });
});
