/* ==========================================================================
   v40 — Zine.

   One number per frame. The five backdrop planes all read `--plane` off the
   root and multiply it by their own `--depth` in CSS, so the script does not
   touch five elements sixty times a second — it writes one custom property
   and the compositor does the rest.

   The planes are fixed, so their offset is a function of scroll position and
   nothing else: no measuring, no layout reads, nothing that could force a
   reflow inside a scroll handler.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();
  P.revealOnScroll(".project, .service, .section-head, .about-body > *");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;

  P.onScroll(() => {
    /* Negative, so the planes travel *up* as the page comes down — the same
       direction as the content, only slower. Each plane's --depth scales it. */
    root.style.setProperty("--plane", `${-window.scrollY}px`);
  });
});
