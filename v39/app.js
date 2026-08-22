/* ==========================================================================
   v39 — Container.

   Almost nothing here. That is the point: the layouts, the popovers and the
   positioning are all the platform's job now, so the only script on the page
   is the workbench in the hero — a handle that changes one container's width
   so you can watch the card inside it re-lay-out while the window holds
   still.

   The readout comes from a ResizeObserver rather than from the drag maths,
   so it reports the width the card actually got — including when the frame
   hits its own min-width, or when the window resizes underneath it, neither
   of which the pointer knows about.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();
  P.revealOnScroll(".card, .cq-service, .section-head, .about-body > *");

  const frame = document.getElementById("bench-frame");
  const grip = document.getElementById("bench-grip");
  const readout = document.getElementById("bench-size");
  if (!frame || !grip) return;

  const MIN = 240;

  const stage = () => frame.parentElement.getBoundingClientRect().width - 36;

  const setWidth = (px) => {
    const max = stage();
    const w = Math.max(MIN, Math.min(max, px));
    frame.style.setProperty("--bench-w", `${Math.round(w)}px`);
    grip.setAttribute("aria-valuenow", String(Math.round(w)));
  };

  /* Start a little under the feature breakpoint, so the first thing a visitor
     does with the handle is cross one. */
  setWidth(Math.min(660, stage()));

  if (typeof ResizeObserver === "function" && readout) {
    new ResizeObserver(([entry]) => {
      readout.textContent = String(Math.round(entry.contentRect.width));
    }).observe(frame);
  } else if (readout) {
    readout.textContent = String(Math.round(frame.getBoundingClientRect().width));
  }

  /* ── Drag ───────────────────────────────────────────────────────────── */

  let dragging = false;

  grip.addEventListener("pointerdown", (e) => {
    dragging = true;
    grip.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  grip.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    setWidth(e.clientX - frame.getBoundingClientRect().left);
  });

  const stop = (e) => {
    if (!dragging) return;
    dragging = false;
    try {
      grip.releasePointerCapture(e.pointerId);
    } catch {
      /* the capture is already gone — nothing to release */
    }
  };

  grip.addEventListener("pointerup", stop);
  grip.addEventListener("pointercancel", stop);

  /* ── Keyboard ───────────────────────────────────────────────────────── */

  /* role="slider" is a promise that the arrow keys work, so they do. */
  grip.addEventListener("keydown", (e) => {
    const w = frame.getBoundingClientRect().width;
    const step = e.shiftKey ? 60 : 20;

    if (e.key === "ArrowLeft") setWidth(w - step);
    else if (e.key === "ArrowRight") setWidth(w + step);
    else if (e.key === "Home") setWidth(MIN);
    else if (e.key === "End") setWidth(stage());
    else return;

    e.preventDefault();
  });

  /* A window resize can leave the frame wider than the stage it sits in. */
  window.addEventListener("resize", () => setWidth(frame.getBoundingClientRect().width), {
    passive: true,
  });
});
