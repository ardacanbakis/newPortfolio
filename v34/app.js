/* ==========================================================================
   v34 — Risograph.

   The printing is all in the stylesheet. The one thing worth doing in script
   is the ink rotation: each project is printed in a different drum, assigned
   from its position rather than at random, so the sequence is stable between
   loads and between languages.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();

  /* Three drums, cycled. A random assignment would put two pinks next to
     each other often enough to look like a mistake rather than a press run. */
  const DRUMS = ["#ff48b0", "#0078bf", "#2b2a28"];

  document.querySelectorAll(".project").forEach((project, i) => {
    const media = project.querySelector(".project-media");
    if (media) media.style.setProperty("--drum", DRUMS[i % DRUMS.length]);
    project.style.setProperty("--card-ink", DRUMS[(i + 1) % DRUMS.length]);
  });

  document.querySelectorAll(".service").forEach((service, i) => {
    service.style.setProperty("--card-ink", DRUMS[i % 2]);
  });
});
