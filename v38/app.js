/* ==========================================================================
   v38 — Morph.

   The index and the detail views live in one document. Moving between them
   is a DOM change wrapped in `document.startViewTransition`, and the browser
   does the animation: it snapshots the page before and after, matches up any
   elements that share a `view-transition-name`, and tweens between the two.

   The one thing this file has to get right is *when* the names exist. A name
   has to be unique across the document at each snapshot, so the thumbnail
   carries it while the old state is captured and the detail image carries it
   while the new one is — which means the handover happens inside the update
   callback, between the two captures. Naming both at once produces no
   transition at all and a console warning, and is the usual reason a
   hand-rolled version of this does nothing.

   Everything degrades. Without `startViewTransition` the same callback runs
   directly and the view swaps instantly. Without script at all the cards are
   still links to the live projects and the page is still a page.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();
  P.revealOnScroll(".project, .service, .section-head, .about-body > *");

  const root = document.documentElement;
  const canTransition = typeof document.startViewTransition === "function";

  /** Run `update`, animated if the browser can, instantly if it cannot. */
  const transition = (update, marker) => {
    if (!canTransition) {
      update();
      return Promise.resolve();
    }
    if (marker) root.classList.add(marker);
    const vt = document.startViewTransition(update);
    return vt.finished.finally(() => marker && root.classList.remove(marker));
  };

  /* ── Theme ──────────────────────────────────────────────────────────── */

  const toggle = document.getElementById("theme-toggle");

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    toggle?.setAttribute("aria-pressed", String(theme === "light"));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7f6f4" : "#111114");
  };

  let stored = null;
  try {
    stored = localStorage.getItem("v38-theme");
  } catch {
    /* private browsing — the toggle still works for this visit */
  }
  setTheme(stored === "light" || stored === "dark" ? stored : "dark");

  toggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";

    /* The circle grows from the button that was pressed, so the new theme
       arrives from the control that asked for it rather than from nowhere. */
    const r = toggle.getBoundingClientRect();
    root.style.setProperty("--cx", `${((r.left + r.width / 2) / window.innerWidth) * 100}%`);
    root.style.setProperty("--cy", `${((r.top + r.height / 2) / window.innerHeight) * 100}%`);

    transition(() => setTheme(next), "theme-swap");

    try {
      localStorage.setItem("v38-theme", next);
    } catch {
      /* as above */
    }
  });

  /* ── The index → detail morph ───────────────────────────────────────── */

  const cards = [...document.querySelectorAll(".project")];
  const panels = [...document.querySelectorAll(".detail")];
  if (!cards.length || !panels.length) return;

  const panelFor = (id) => panels.find((d) => d.dataset.detail === id);
  const cardFor = (id) => cards.find((c) => c.dataset.project === id);

  let openId = null;

  /* Every card gets its own way in. It is added here rather than in the
     markup because without this script it would be a button that does
     nothing — the links beside it already go somewhere real. */
  cards.forEach((card) => {
    const body = card.querySelector(".project-body");
    const title = card.querySelector(".project-title");
    if (!body || !title) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-open";
    btn.innerHTML =
      '<span data-i18n="viewDetails">View details</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btn.setAttribute("aria-label", `View details — ${title.textContent.trim()}`);
    body.appendChild(btn);
  });

  P.applyLanguage(P.lang);

  const names = (el, mediaName, titleName) => {
    const media = el.querySelector("img");
    const title = el.querySelector(".project-title, .detail-title");
    if (media) media.style.viewTransitionName = mediaName;
    if (title) title.style.viewTransitionName = titleName;
  };

  const open = (id, viaHistory) => {
    const card = cardFor(id);
    const panel = panelFor(id);
    if (!card || !panel || openId === id) return;

    names(card, "vt-media", "vt-title");

    transition(() => {
      names(card, "", "");
      names(panel, "vt-media", "vt-title");

      panels.forEach((d) => (d.hidden = d !== panel));
      root.classList.add("detail-open");
      window.scrollTo({ top: 0, behavior: "instant" });
      openId = id;
    }, "morphing").then(() => {
      panel.querySelector(".detail-back")?.focus({ preventScroll: true });
    });

    if (!viaHistory) history.pushState({ project: id }, "", `#p-${id}`);
  };

  const close = (viaHistory) => {
    const id = openId;
    if (!id) return;

    const card = cardFor(id);
    const panel = panelFor(id);
    if (!panel) return;

    names(panel, "vt-media", "vt-title");

    transition(() => {
      names(panel, "", "");
      if (card) names(card, "vt-media", "vt-title");

      panel.hidden = true;
      root.classList.remove("detail-open");
      openId = null;
    }, "morphing").then(() => {
      /* The names have to come back off the card once the transition is over,
         or the next one finds them already taken. */
      if (card) {
        names(card, "", "");
        card.querySelector(".project-open")?.focus({ preventScroll: true });
        card.scrollIntoView({ block: "center", behavior: "instant" });
      }
    });

    if (!viaHistory) history.pushState({}, "", "#projects");
  };

  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    if (target.closest(".detail-back")) {
      close(false);
      return;
    }

    const opener = target.closest(".project-open");
    if (opener) {
      open(opener.closest(".project").dataset.project, false);
      return;
    }

    /* The whole card is a target, except the links on it, which go where
       they say they go. */
    const card = target.closest(".project");
    if (card && !target.closest("a")) open(card.dataset.project, false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openId) close(false);
  });

  /* Back and forward carry state. A hash typed or pasted into the address bar
     of a page that is already open does not, so the hash is the fallback —
     otherwise a shared link only works on a cold load. */
  window.addEventListener("popstate", (e) => {
    const fromState = e.state && e.state.project;
    const fromHash = location.hash.startsWith("#p-") ? location.hash.slice(3) : null;
    const id = fromState || fromHash;
    if (id && panelFor(id)) open(id, true);
    else close(true);
  });

  /* A shared link lands straight on the detail, with no transition to run
     because there is no previous view to come from. */
  const initial = location.hash.startsWith("#p-") ? location.hash.slice(3) : null;
  if (initial && panelFor(initial)) {
    const panel = panelFor(initial);
    panels.forEach((d) => (d.hidden = d !== panel));
    root.classList.add("detail-open");
    openId = initial;
    history.replaceState({ project: initial }, "", `#p-${initial}`);
  }
});
