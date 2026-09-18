/* ==========================================================================
   v20 — Card stack.

   Nothing here but the shared bootstrap: the stack, the drag-follow and the
   throw are all in the stylesheet, driven by --drag and data-dragging from
   deck.js. That is the point of splitting the engine out — a version whose
   idea is entirely visual should not need a script of its own.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  const deck = window.Deck ? window.Deck.create() : null;

  if (!deck) {
    P.wireStandardPage();
    return;
  }

  P.wireChrome();
  P.gateWhatsappAfterChapter(deck, "projects", document.querySelector(".whatsapp-float"));
});
