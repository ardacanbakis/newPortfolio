/* ==========================================================================
   v35 — Kinetic type.

   Each letter of the headline reads its own weight and width from how close
   the cursor is to it. Three things make that cheap enough to run at sixty
   frames a second on a phone:

   1. **Letter positions are measured once**, not per frame. They only change
      on resize or a language switch, and both are handled explicitly. Calling
      getBoundingClientRect on forty spans every frame is what makes this
      effect a byword for jank.

   2. **The loop stops.** It runs while the pointer is moving and for a
      moment after, then parks. A headline nobody is touching does not need
      sixty frames a second.

   3. **Values are quantised** to whole units before being written. The
      browser cannot tell the difference between weight 412 and 412.7, but it
      does have to re-resolve the font either way.

   No pointer at all — a phone, a keyboard — gets a slow wave travelling
   through the word instead, so the idea is still visible.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  P.wireStandardPage();

  const reduced = FX ? FX.reducedMotion : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = FX ? FX.finePointer : window.matchMedia("(pointer: fine)").matches;

  const target = document.querySelector(".hero-name");
  if (!target) return;

  /* ── Split ────────────────────────────────────────────────────────────
     The original text is kept on the element so a language switch can
     re-split from a known-good source rather than from spans it already
     wrote. */

  target.classList.add("kinetic");
  let letters = [];

  const split = () => {
    const text = target.dataset.text || (target.dataset.text = target.textContent.trim());
    target.textContent = "";
    letters = [];

    for (const chr of text) {
      const span = document.createElement("span");
      if (chr === " ") {
        span.className = "sp";
        span.textContent = " ";
      } else {
        span.className = "ch";
        span.textContent = chr;
        letters.push({ el: span, x: 0, y: 0, w: -1, d: -1 });
      }
      target.appendChild(span);
    }

    // The word is one label for assistive technology; the letters are decor.
    target.setAttribute("aria-label", text);
    measure();
  };

  /* ── Measure ──────────────────────────────────────────────────────────
     Centres in page coordinates, so scrolling does not invalidate them —
     only a resize or a re-split does. */

  const measure = () => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    for (const letter of letters) {
      const r = letter.el.getBoundingClientRect();
      letter.x = r.left + r.width / 2 + scrollX;
      letter.y = r.top + r.height / 2 + scrollY;
    }
  };

  split();

  /* ── Axes ─────────────────────────────────────────────────────────────
     Roboto Flex runs wght 100–1000 and wdth 25–151. The ranges used here are
     narrower on purpose: the extremes of a width axis stop being the same
     typeface, and a headline that reaches them looks broken rather than
     responsive. */

  const REACH = 260;       // px at which a letter stops noticing the cursor
  const WGHT = [260, 900];
  const WDTH = [88, 132];

  const apply = (letter, force) => {
    const w = Math.round(WGHT[0] + (WGHT[1] - WGHT[0]) * force);
    const d = Math.round(WDTH[0] + (WDTH[1] - WDTH[0]) * force);
    // Quantised, and skipped entirely when nothing changed.
    if (w === letter.w && d === letter.d) return;
    letter.w = w;
    letter.d = d;
    letter.el.style.setProperty("--w", w);
    letter.el.style.setProperty("--x", d);
  };

  if (reduced) {
    letters.forEach((l) => apply(l, 0.72));
    return;
  }

  /* ── The loop ─────────────────────────────────────────────────────────── */

  let px = -9999;
  let py = -9999;
  let running = false;
  let idleUntil = 0;

  const frame = (now) => {
    let moved = false;

    for (const letter of letters) {
      const dx = letter.x - px;
      const dy = letter.y - py;
      // Squared distance: the comparison does not need the square root, and
      // this runs once per letter per frame.
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 1 - dist / REACH);
      // easeOutQuad, so the falloff is a soft hill rather than a cone.
      apply(letter, force * (2 - force));
      moved = true;
    }

    if (now < idleUntil && moved) requestAnimationFrame(frame);
    else {
      running = false;
      // Settle back to the resting weight rather than freezing mid-push.
      letters.forEach((l) => apply(l, 0));
    }
  };

  const wake = () => {
    idleUntil = performance.now() + 600;
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };

  /* The instruction only exists when there is something to instruct. Created
     here rather than in the markup because "move your cursor" is meaningless
     on a page whose script has not loaded. */
  if (fine) {
    const hint = document.createElement("p");
    hint.className = "kinetic-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = "Move across the name";
    target.after(hint);
  }

  if (fine) {
    window.addEventListener(
      "pointermove",
      (event) => {
        px = event.clientX + window.scrollX;
        py = event.clientY + window.scrollY;
        wake();
        document.documentElement.style.setProperty("--hint", "0");
      },
      { passive: true },
    );
  } else {
    /* No pointer: a wave travels through the word instead, so the idea is
       still legible on a phone. */
    const t0 = performance.now();
    const wave = (now) => {
      const t = (now - t0) / 1400;
      letters.forEach((letter, i) => {
        const phase = t - i * 0.08;
        const force = Math.max(0, Math.sin(phase) ** 6);
        apply(letter, force);
      });
      requestAnimationFrame(wave);
    };
    requestAnimationFrame(wave);
  }

  /* ── Keeping the measurements honest ──────────────────────────────────── */

  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    },
    { passive: true },
  );

  // A different language is a different word, and every letter has moved.
  P.onLanguageChange(() => {
    delete target.dataset.text;
    split();
  });

  // Web fonts arrive after first paint and change every letter's width.
  if (document.fonts?.ready) document.fonts.ready.then(measure);

  if (FX) {
    FX.customCursor();
    FX.magnetic();
  }
});
