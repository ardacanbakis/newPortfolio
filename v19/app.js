/* ==========================================================================
   v19 — Filmstrip.

   The deck engine does the navigation. This file adds the one thing specific
   to this version: a strip of frames built from the panels themselves, so it
   is impossible for the strip and the deck to disagree about what is where.

   If deck.js is missing the page falls back to being an ordinary scrolling
   document with the standard wiring, which is why the fallback branch calls
   wireStandardPage rather than assuming a deck exists.
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

  /* ── The strip ────────────────────────────────────────────────────────
     A work panel uses its own screenshot; everything else gets a labelled
     tile. The label comes from the chapter, so it is translated along with
     the rest of the page rather than being a second set of strings. */

  const strip = document.createElement("nav");
  strip.className = "filmstrip";
  strip.setAttribute("aria-label", "All panels");

  const frames = deck.slides.map((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "frame";

    const img = slide.querySelector(".project-media img");
    const title = slide.querySelector(".project-title, .section-title, .hero-name");
    const name = title ? title.textContent.trim() : slide.dataset.chapterLabel || "";

    if (img) {
      button.innerHTML =
        '<span class="frame-no">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<img src="' + img.getAttribute("src") + '" alt="" loading="lazy" />';
    } else {
      const chapter = deck.chapters[Number(slide.dataset.chapterIndex || 0)];
      const label = document.createElement("span");
      label.className = "frame-label";
      if (chapter?.i18n) label.setAttribute("data-i18n", chapter.i18n);
      label.textContent = chapter ? chapter.label : name;

      const no = document.createElement("span");
      no.className = "frame-no";
      no.textContent = String(i + 1).padStart(2, "0");

      button.append(no, label);
    }

    button.setAttribute("aria-label", (i + 1) + ". " + name);
    button.addEventListener("click", () => deck.go(i));
    strip.appendChild(button);
    return button;
  });

  document.body.appendChild(strip);

  // The strip is built after wireChrome, so its labels have not been through
  // a language pass yet.
  P.applyLanguage(P.lang);

  /* Keep the active frame in view. `nearest` rather than `center` so the
     strip only moves when it has to — a strip that recentres on every step
     is harder to read than one that mostly holds still. */
  deck.on((i) => {
    frames.forEach((f, n) => {
      f.classList.toggle("active", n === i);
      f.setAttribute("aria-current", n === i ? "true" : "false");
    });
    frames[i]?.scrollIntoView({
      behavior: deck.reduced ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  });
});
