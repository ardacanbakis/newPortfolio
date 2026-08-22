/* ==========================================================================
   v36 — Liquid glass.

   Two jobs, and both are about keeping a heavy effect cheap.

   **The specular.** A pane of glass has a hotspot where the light source
   reflects off it. On a mouse the light source is the cursor, so the hotspot
   follows it. On a touchscreen there is no cursor, so the light source is
   fixed above the page and the hotspot is derived from where the pane
   currently sits in the viewport — a card near the top of the screen catches
   light near its top edge, and the highlight slides down the pane as you
   scroll past it. Same two custom properties either way; the stylesheet
   never learns which input it is being driven by.

   **The tint.** One number, `--hue`, feeds every colour in the stylesheet
   through oklch(). The slider writes it and localStorage remembers it.

   The pointer path uses one delegated listener rather than one per pane, and
   the touch path only touches panes an IntersectionObserver says are on
   screen. Both are throttled to a frame.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();
  P.revealOnScroll(".project, .service, .section-head, .about-body > *");

  const PANES = ".project, .service, .contact-form, .contact-direct, .about-media";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* ── Tint ───────────────────────────────────────────────────────────── */

  const slider = document.getElementById("hue");
  const readout = document.getElementById("hue-out");

  const setHue = (h) => {
    document.documentElement.style.setProperty("--hue", String(h));
    if (readout) readout.textContent = String(h);
    /* The theme-color meta is what paints the browser chrome on a phone, so
       it has to move with the palette or the notch area stops matching. */
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", `oklch(15% 0.035 ${h})`);
  };

  if (slider) {
    let stored = null;
    try {
      stored = localStorage.getItem("v36-hue");
    } catch {
      /* private browsing — the slider still works for this visit */
    }
    if (stored !== null && stored !== "") slider.value = stored;
    setHue(slider.value);

    slider.addEventListener("input", () => {
      setHue(slider.value);
      try {
        localStorage.setItem("v36-hue", slider.value);
      } catch {
        /* as above */
      }
    });
  }

  if (reduced) return;

  /* ── Specular: pointer ──────────────────────────────────────────────── */

  if (fine) {
    let pane = null;
    let x = 0;
    let y = 0;
    let queued = false;

    const flush = () => {
      queued = false;
      if (!pane) return;
      const r = pane.getBoundingClientRect();
      pane.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
      pane.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
    };

    document.addEventListener(
      "pointermove",
      (e) => {
        const next = e.target instanceof Element ? e.target.closest(PANES) : null;

        /* Leaving a pane has to clear it, or the last hotspot stays frozen
           in place under a card that is no longer lit. */
        if (next !== pane && pane) {
          pane.style.removeProperty("--mx");
          pane.style.removeProperty("--my");
        }

        pane = next;
        if (!pane) return;

        x = e.clientX;
        y = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(flush);
      },
      { passive: true },
    );

    return;
  }

  /* ── Specular: scroll ───────────────────────────────────────────────── */

  const panes = [...document.querySelectorAll(PANES)];
  if (!panes.length) return;

  /* Only panes actually on screen are measured. Six getBoundingClientRect
     calls a frame is nothing; forty would be a scroll janking on a phone. */
  const onScreen = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
    },
    { rootMargin: "10% 0px" },
  );
  panes.forEach((p) => io.observe(p));

  /* A fixed light source a little above the top of the window. Every pane on
     screen gets the hotspot where that light would land on it. */
  P.onScroll(() => {
    const light = -window.innerHeight * 0.15;
    onScreen.forEach((p) => {
      const r = p.getBoundingClientRect();
      if (!r.height) return;
      const pct = ((light - r.top) / r.height) * 100;
      p.style.setProperty("--mx", "50%");
      p.style.setProperty("--my", `${Math.max(-40, Math.min(140, pct))}%`);
      p.style.setProperty("--sheen", "0.75");
    });
  });
});
