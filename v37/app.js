/* ==========================================================================
   v37 — Native scroll.

   The claim this version makes is that no script reads the scroll position.
   That claim has to survive a browser that cannot honour it, so the wiring
   is a fork rather than a boast:

     native path — `wireChrome()`. Language, contact form, menu drawer,
     footer year. Not one of those has anything to do with scrolling, and
     nothing else runs. The reveals, the reading bar, the hero exit, the
     active nav link and the WhatsApp gate are all CSS.

     fallback path — `wireStandardPage()`, the same scripted behaviour every
     other version uses. Taken when scroll-driven animations are missing, and
     also when the visitor has asked for reduced motion: the stylesheet turns
     the native animations off in that case, and the WhatsApp button is gated
     by one of them, so the script has to take the gate back over.

   Feature-detecting rather than sniffing means the fallback disappears on its
   own as browsers catch up, without this file changing.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  const native =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("animation-timeline", "view()") &&
    CSS.supports("timeline-scope", "--x");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (native && !reduced) {
    P.wireChrome();
    return;
  }

  P.wireStandardPage();
  P.revealOnScroll(".project, .service, .section-head, .about-body > *");
});
