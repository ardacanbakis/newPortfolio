/* ==========================================================================
   v22 — Iris.

   The one job here is the origin. The reveal circle in the stylesheet grows
   from --ox / --oy, and this file decides what those are: wherever the
   visitor last touched the page.

   A click on the "next" arrow opens from the arrow. A tap on a rail dot
   opens from the dot. A swipe opens from where the finger left. A keypress
   has no point on the screen at all, so it falls back to the middle —
   inventing a location for it would be a lie about what the visitor did.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  const root = document.documentElement;
  const deck = window.Deck ? window.Deck.create() : null;

  if (!deck) {
    P.wireStandardPage();
    return;
  }

  P.wireChrome();
  P.gateWhatsappAfterChapter(deck, "projects", document.querySelector(".whatsapp-float"));

  /* ── Origin ───────────────────────────────────────────────────────────
     Captured on the way down, in the capture phase, so it is already set by
     the time the click handler that changes slide runs. */

  let originX = null;
  let originY = null;

  const remember = (event) => {
    if (event.clientX === undefined) return;
    originX = event.clientX;
    originY = event.clientY;
  };

  document.addEventListener("pointerdown", remember, { capture: true, passive: true });
  document.addEventListener("pointerup", remember, { capture: true, passive: true });

  // A keyboard move has no point on the screen; the next reveal after one
  // opens from the centre rather than from a stale click three panels ago.
  document.addEventListener("keydown", () => {
    originX = null;
    originY = null;
  });

  /* ── Ping ─────────────────────────────────────────────────────────────── */

  const ping = document.createElement("span");
  ping.className = "iris-ping";
  ping.setAttribute("aria-hidden", "true");
  document.body.appendChild(ping);

  /* ── Reveal ───────────────────────────────────────────────────────────
     `settled` is what closes the panel that was covered. It is added a beat
     after the reveal finishes rather than on the same frame, because the
     stylesheet's zero-duration transition is what makes the close invisible
     and it needs the reveal to be over first. */

  const IRIS = 800;
  let settleTimer = 0;

  deck.on((i, previous) => {
    if (i === previous) return;

    const x = originX === null ? window.innerWidth / 2 : originX;
    const y = originY === null ? window.innerHeight / 2 : originY;

    root.style.setProperty("--ox", Math.round(x) + "px");
    root.style.setProperty("--oy", Math.round(y) + "px");

    deck.slides.forEach((s) => s.classList.remove("settled"));

    if (!deck.reduced) {
      ping.style.left = x + "px";
      ping.style.top = y + "px";
      ping.classList.remove("on");
      // Reading offsetWidth restarts the animation; without it a second move
      // to the same place would not replay.
      void ping.offsetWidth;
      ping.classList.add("on");
    }

    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      deck.slides.forEach((s, n) => {
        if (n !== deck.index) s.classList.add("settled");
      });
    }, IRIS + 60);
  });
});
