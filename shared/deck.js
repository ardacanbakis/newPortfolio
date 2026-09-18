/* ==========================================================================
   Deck — the slider engine behind versions 19 to 23.

   These versions have no scrollbar. Content advances one full-viewport panel
   at a time, driven by the wheel, the arrow keys, a swipe, the dot rail or
   the header nav. All five share this file and differ only in how a panel
   arrives, which is expressed entirely in CSS: the engine writes the index
   and a state on each slide, and the version's stylesheet decides whether
   that means sliding sideways, rotating a prism or zooming through.

   Three things this has to get right, because a deck breaks them by default:

   1. **It must degrade.** Nothing here is required to read the page. The
      rules that kill the scrollbar live under `.deck-ready`, a class this
      file adds; with JavaScript off the same markup is an ordinary scrolling
      document.

   2. **Focus must not wander off-screen.** Tabbing into a panel that is
      parked three screens to the left is the classic carousel bug. Inactive
      slides are marked `inert`, with an explicit tabindex sweep behind it
      for browsers that do not support the attribute.

   3. **It must yield.** A panel whose content is taller than the viewport
      keeps its own scrollbar, and the wheel only changes slide once that
      inner region has reached its end — otherwise a long contact form on a
      short laptop screen would be unreachable.

   Hung off window.Deck.
   ========================================================================== */

(function (global) {
  "use strict";

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  const create = (options = {}) => {
    const root = options.root || document.querySelector("[data-deck]");
    if (!root) return null;

    const slides = [...root.querySelectorAll("[data-slide]")];
    if (!slides.length) return null;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const listeners = [];

    let index = 0;
    let locked = false;

    document.documentElement.classList.add("deck-ready");
    if (reduced) document.documentElement.classList.add("deck-instant");
    root.style.setProperty("--count", String(slides.length));

    /* ── Chapters ───────────────────────────────────────────────────────
       Slides carry a data-chapter naming the section they belong to, so six
       project panels can be six steps but one dot. The rail is built from
       the chapters, not from the slides — twelve identical dots tell a
       visitor nothing about where they are. */

    const chapters = [];
    slides.forEach((slide, i) => {
      const name = slide.dataset.chapter || slide.id || String(i);
      let chapter = chapters.find((c) => c.name === name);
      if (!chapter) {
        chapter = {
          name,
          label: slide.dataset.chapterLabel || name,
          i18n: slide.dataset.chapterI18n || "",
          from: i,
          to: i,
        };
        chapters.push(chapter);
      }
      chapter.to = i;
      slide.dataset.chapterIndex = String(chapters.indexOf(chapter));
    });

    const chapterOf = (i) => Number(slides[i].dataset.chapterIndex || 0);

    /* ── Applying an index ──────────────────────────────────────────────── */

    const apply = (next, previous) => {
      root.style.setProperty("--i", String(next));
      root.dataset.index = String(next);
      root.dataset.chapter = String(chapterOf(next));
      // Which way we came, so a transition can be asymmetric.
      root.dataset.dir = next > previous ? "forward" : next < previous ? "back" : "none";

      slides.forEach((slide, i) => {
        const state = i === next ? "current" : i < next ? "past" : "future";
        slide.dataset.state = state;
        slide.style.setProperty("--offset", String(i - next));
        // Distance, capped. A version that wants to draw the next couple of
        // panels can select on this rather than parsing --offset out of the
        // serialised style attribute, which would also match --offset: 10.
        slide.dataset.near = String(Math.min(3, Math.abs(i - next)));

        const hidden = i !== next;
        // inert covers focus, pointer events and the accessibility tree in
        // one attribute where it is supported.
        if ("inert" in HTMLElement.prototype) slide.inert = hidden;
        else {
          slide.setAttribute("aria-hidden", String(hidden));
          slide
            .querySelectorAll("a, button, input, textarea, select, [tabindex]")
            .forEach((el) => {
              if (hidden) {
                if (!el.hasAttribute("data-deck-tabindex")) {
                  el.setAttribute("data-deck-tabindex", el.getAttribute("tabindex") || "");
                }
                el.setAttribute("tabindex", "-1");
              } else {
                const restore = el.getAttribute("data-deck-tabindex");
                if (restore) el.setAttribute("tabindex", restore);
                else el.removeAttribute("tabindex");
                el.removeAttribute("data-deck-tabindex");
              }
            });
        }
      });

      listeners.forEach((fn) => fn(next, previous, slides[next]));
    };

    /* ── Movement ───────────────────────────────────────────────────────
       A short lock after each move. Without it a single trackpad flick —
       which fires dozens of wheel events — walks through the whole deck. */

    const go = (to, { silent = false } = {}) => {
      const next = clamp(to, 0, slides.length - 1);
      if (next === index) return;

      const previous = index;
      index = next;
      apply(next, previous);

      if (!silent) {
        const id = slides[next].dataset.hash || slides[next].id;
        if (id) history.replaceState(null, "", "#" + id);
      }

      locked = true;
      setTimeout(() => (locked = false), reduced ? 60 : 520);
    };

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    /* Jump to whichever slide starts a chapter — what a nav link means. */
    const goToChapter = (name) => {
      const chapter = chapters.find((c) => c.name === name);
      if (chapter) go(chapter.from);
      return !!chapter;
    };

    const goToId = (id) => {
      const i = slides.findIndex((s) => (s.dataset.hash || s.id) === id);
      if (i >= 0) {
        go(i);
        return true;
      }
      return goToChapter(id);
    };

    /* ── Yielding to inner scroll ───────────────────────────────────────
       Returns true when the event happened inside a region that can still
       scroll in the direction asked for. A panel taller than the viewport
       has to be readable before it will hand the wheel back. */

    const scrollableAncestor = (target, delta) => {
      let el = target;
      while (el && el !== root && el.nodeType === 1) {
        const style = getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1) {
          const atTop = el.scrollTop <= 0;
          const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if ((delta > 0 && !atEnd) || (delta < 0 && !atTop)) return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    /* ── Wheel ──────────────────────────────────────────────────────────
       Both axes: a horizontal deck should also answer a trackpad's sideways
       swipe, and a mouse only ever produces deltaY. */

    root.addEventListener(
      "wheel",
      (event) => {
        const delta =
          Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        if (Math.abs(delta) < 8) return;
        if (scrollableAncestor(event.target, delta)) return;

        event.preventDefault();
        if (locked) return;
        delta > 0 ? next() : prev();
      },
      { passive: false },
    );

    /* ── Keyboard ───────────────────────────────────────────────────────── */

    document.addEventListener("keydown", (event) => {
      const el = document.activeElement;
      // Never steal a key from something the visitor is typing into.
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const keys = {
        ArrowRight: next,
        ArrowDown: next,
        PageDown: next,
        ArrowLeft: prev,
        ArrowUp: prev,
        PageUp: prev,
        Home: () => go(0),
        End: () => go(slides.length - 1),
        " ": () => (event.shiftKey ? prev() : next()),
      };

      const action = keys[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    });

    /* ── Drag and swipe ─────────────────────────────────────────────────
       One pointer handler for touch, pen and mouse. The threshold is in
       viewport units so a swipe means the same gesture on a phone as on a
       desktop; `--drag` is published live so a version can follow the finger
       if it wants to. */

    let startX = 0;
    let startY = 0;
    let dragging = false;

    root.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest("a, button, input, textarea, select, [data-no-drag]")) return;
        startX = event.clientX;
        startY = event.clientY;
        dragging = true;
        // Versions that follow the finger need to know to drop their
        // transition for the duration, or it fights the live value.
        root.dataset.dragging = "true";
      },
      { passive: true },
    );

    root.addEventListener(
      "pointermove",
      (event) => {
        if (!dragging) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const travel = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        root.style.setProperty("--drag", (travel / window.innerWidth).toFixed(4));
      },
      { passive: true },
    );

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      delete root.dataset.dragging;
      root.style.setProperty("--drag", "0");

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const travel = horizontal ? dx : dy;
      const threshold = (horizontal ? window.innerWidth : window.innerHeight) * 0.12;

      if (Math.abs(travel) < threshold) return;
      if (!horizontal && scrollableAncestor(event.target, -travel)) return;
      travel < 0 ? next() : prev();
    };

    root.addEventListener("pointerup", endDrag, { passive: true });
    root.addEventListener("pointercancel", () => {
      dragging = false;
      delete root.dataset.dragging;
      root.style.setProperty("--drag", "0");
    });

    /* ── Rail ───────────────────────────────────────────────────────────
       Built here rather than written into five copies of the markup, and
       built from the chapters so it stays legible however many panels a
       section turns out to need. */

    const rail = root.querySelector("[data-rail]") || document.querySelector("[data-rail]");
    let railButtons = [];

    if (rail) {
      chapters.forEach((chapter, i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "deck-dot";
        button.dataset.chapter = chapter.name;
        // The label carries the same i18n key the nav link uses, so the rail
        // is translated by the ordinary language pass rather than by a second
        // mechanism that would have to be kept in step with it.
        const i18n = chapter.i18n ? ' data-i18n="' + chapter.i18n + '"' : "";
        button.innerHTML =
          '<span class="deck-dot-mark" aria-hidden="true"></span>' +
          "<span class=\"deck-dot-label\"" + i18n + ">" + chapter.label + "</span>";
        button.setAttribute("aria-label", chapter.label);
        button.addEventListener("click", () => go(chapter.from));
        rail.appendChild(button);
        railButtons.push(button);
        void i;
      });
    }

    /* ── Prev / next / counter ──────────────────────────────────────────── */

    document.querySelectorAll("[data-deck-prev]").forEach((b) => b.addEventListener("click", prev));
    document.querySelectorAll("[data-deck-next]").forEach((b) => b.addEventListener("click", next));

    const counterNow = document.querySelector("[data-deck-now]");
    const counterAll = document.querySelector("[data-deck-total]");
    const progress = document.querySelector("[data-deck-progress]");
    if (counterAll) counterAll.textContent = String(slides.length).padStart(2, "0");

    /* ── Nav links ──────────────────────────────────────────────────────
       The header keeps working as a set of anchors: with the deck running
       they select a chapter, and without it they are ordinary in-page links
       to sections that are still there. */

    /* Every in-page anchor, not just the header: the hero's "Projects"
       button and the skip link are the same gesture as a nav click, and a
       deck that only answered the nav would leave them scrolling a page that
       cannot scroll. */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.dataset.nav || link.getAttribute("href").slice(1);
        if (id && goToId(id)) event.preventDefault();
      });
    });

    window.addEventListener("hashchange", () => {
      const id = location.hash.replace("#", "");
      if (id) goToId(id);
    });

    /* ── Chrome that follows the index ──────────────────────────────────── */

    const navLinks = [...document.querySelectorAll("#nav a[data-nav]")];

    listeners.push((i) => {
      const chapter = chapterOf(i);
      railButtons.forEach((b, c) => {
        b.classList.toggle("active", c === chapter);
        b.setAttribute("aria-current", c === chapter ? "true" : "false");
      });
      navLinks.forEach((a) => {
        const c = chapters.findIndex((ch) => ch.name === a.dataset.nav);
        a.classList.toggle("active", c === chapter);
      });
      if (counterNow) counterNow.textContent = String(i + 1).padStart(2, "0");
      // The "there is more" hint retires as soon as the visitor moves.
      document.documentElement.classList.toggle("deck-moved", i > 0);
      if (progress) {
        progress.style.setProperty(
          "--progress",
          slides.length > 1 ? (i / (slides.length - 1)).toFixed(4) : "1",
        );
      }
    });

    /* ── Start ──────────────────────────────────────────────────────────
       Deep links first: arriving at #contact should open on the contact
       panel, not animate through nine others to get there. */

    apply(0, 0);

    const hash = location.hash.replace("#", "");
    if (hash) {
      const target = slides.findIndex((s) => (s.dataset.hash || s.id) === hash);
      const chapter = chapters.find((c) => c.name === hash);
      const start = target >= 0 ? target : chapter ? chapter.from : 0;
      if (start > 0) {
        index = start;
        apply(start, start);
      }
    }

    return {
      go,
      goToId,
      goToChapter,
      next,
      prev,
      slides,
      chapters,
      get index() {
        return index;
      },
      get length() {
        return slides.length;
      },
      on: (fn) => {
        listeners.push(fn);
        fn(index, index, slides[index]);
      },
      reduced,
    };
  };

  global.Deck = { create };
})(window);
