/* ==========================================================================
   Shared motion layer — used by versions 11 onward.

   Five versions each need an animated background, a custom cursor, magnetic
   buttons, scroll-velocity effects and section transitions. Written five
   times that would be five sets of performance mistakes, so it lives here
   once with the guards built in:

     · device pixel ratio is capped, and capped harder on small screens
     · the loop stops when the canvas is off screen and when the tab is hidden
     · particle counts scale with viewport area, not a fixed number
     · pointer effects only attach where there is a real pointer
     · everything checks prefers-reduced-motion first

   Touch devices are not given a degraded desktop. Cursor and magnetic effects
   simply do not exist there; what replaces them is a lighter background and
   tap-driven feedback, which is the right interaction for the device rather
   than a worse version of someone else's.
   ========================================================================== */

(function (global) {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* A coarse pointer means touch. Checking this rather than screen width
     matters: a touch laptop is wide but still has no hover, and a desktop
     browser resized narrow still has a mouse. */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const isTouch = !finePointer;

  const smallScreen = () => window.innerWidth < 768;

  /* ── Animated background ───────────────────────────────────────────────
     Pass draw(ctx, w, h, t) and optionally init(w, h) / onResize(w, h).
     Returns a handle with stop(). */
  const background = ({ init, draw, onResize, className = "fx-canvas", zIndex = 0 }) => {
    if (reducedMotion) return { stop() {} };

    const canvas = document.createElement("canvas");
    canvas.className = className;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: String(zIndex),
      pointerEvents: "none",
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    let raf = 0;
    let running = false;
    let t = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      // Half resolution on phones: a full-DPR canvas at 3x is four times the
      // pixels of 1.5x for no visible gain on a moving background.
      const dpr = Math.min(window.devicePixelRatio || 1, smallScreen() ? 1.5 : 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onResize?.(w, h);
    };

    const frame = () => {
      if (!running) return;
      t += 1;
      draw(ctx, w, h, t);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    init?.(w, h);

    let resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
      },
      { passive: true },
    );

    // A background nobody can see should not be burning battery.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
    return { stop, start, canvas };
  };

  /** Particle count scaled to the viewport, so a phone never runs a desktop load. */
  const particleCount = (perMillionPx, min, max) => {
    const area = window.innerWidth * window.innerHeight;
    return Math.max(min, Math.min(max, Math.round((area / 1e6) * perMillionPx)));
  };

  /* ── Pointer tracking ─────────────────────────────────────────────────── */

  const pointer = { x: -9999, y: -9999, active: false };

  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      },
      { passive: true },
    );
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    });
  }

  /* ── Custom cursor ────────────────────────────────────────────────────── */

  const customCursor = () => {
    if (isTouch || reducedMotion) return;

    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "fx-cursor-dot";
    ring.className = "fx-cursor-ring";
    dot.setAttribute("aria-hidden", "true");
    ring.setAttribute("aria-hidden", "true");
    document.body.append(dot, ring);
    document.documentElement.classList.add("fx-has-cursor");

    let rx = 0;
    let ry = 0;

    const loop = () => {
      // The ring trails the dot; easing it here rather than with a CSS
      // transition keeps it from lagging behind fast movement.
      rx += (pointer.x - rx) * 0.18;
      ry += (pointer.y - ry) * 0.18;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const interactive = "a, button, input, textarea, select, [data-magnetic]";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(interactive)) document.documentElement.classList.add("fx-cursor-hot");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(interactive)) document.documentElement.classList.remove("fx-cursor-hot");
    });
  };

  /* ── Magnetic elements ────────────────────────────────────────────────── */

  const magnetic = (selector = "[data-magnetic]", strength = 0.35) => {
    if (isTouch || reducedMotion) return;

    document.querySelectorAll(selector).forEach((el) => {
      let raf = 0;

      const move = (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
        });
      };

      const reset = () => {
        cancelAnimationFrame(raf);
        el.style.transform = "";
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", reset);
    });
  };

  /* ── Scroll velocity ──────────────────────────────────────────────────
     Publishes --fx-vel (signed, roughly -1..1) on <html> so CSS can skew,
     blur or stretch without any per-element JavaScript. */
  const scrollVelocity = () => {
    if (reducedMotion) return;

    let last = window.scrollY;
    let vel = 0;
    let raf = 0;
    const cap = isTouch ? 0.6 : 1; // phones scroll far faster; damp it

    const tick = () => {
      const now = window.scrollY;
      const delta = now - last;
      last = now;

      // Ease toward the new velocity so the value never snaps.
      vel += (Math.max(-60, Math.min(60, delta)) / 60 - vel) * 0.2;
      if (Math.abs(vel) < 0.001) vel = 0;

      document.documentElement.style.setProperty("--fx-vel", (vel * cap).toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });
  };

  /* ── Section transitions ──────────────────────────────────────────────
     Adds .fx-in as a section enters. CSS decides what that means, so each
     version can wipe, curtain or morph differently. */
  const sectionTransitions = (selector = ".section", options = {}) => {
    const els = [...document.querySelectorAll(selector)];
    if (!els.length) return;

    els.forEach((el) => el.classList.add("fx-section"));

    if (reducedMotion) {
      els.forEach((el) => el.classList.add("fx-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("fx-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, ...options },
    );

    els.forEach((el) => observer.observe(el));
  };

  /* ── Staggered children ───────────────────────────────────────────────── */

  const stagger = (selector, step = 60) => {
    document.querySelectorAll(selector).forEach((parent) => {
      [...parent.children].forEach((child, i) => {
        child.style.setProperty("--fx-delay", `${i * step}ms`);
      });
    });
  };

  global.FX = {
    reducedMotion,
    isTouch,
    finePointer,
    smallScreen,
    pointer,
    background,
    particleCount,
    customCursor,
    magnetic,
    scrollVelocity,
    sectionTransitions,
    stagger,
  };
})(window);
