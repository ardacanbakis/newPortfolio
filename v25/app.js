/* ==========================================================================
   v25 — File explorer.

   Tabs, pane switching, the gutter and the minimap. All of it is layered on
   top of a document that already works: the panes are in the markup and the
   tree items are ordinary in-page links, so with this file removed the page
   is a long, readable, correctly-ordered document.

   The minimap is the only part with any real thinking in it. It is built from
   the actual paragraphs of the pane it is showing — bar widths from line
   lengths — rather than being a decorative gradient, and it is rebuilt only
   when the pane changes, never on scroll.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireChrome();

  const root = document.documentElement;
  const panes = [...document.querySelectorAll("[data-pane]")];
  if (!panes.length) {
    P.wireStandardPage();
    return;
  }

  root.classList.add("ide-ready");

  const tabsEl = document.getElementById("tabs");
  const treeEl = document.getElementById("tree");
  const gutter = document.getElementById("gutter");
  const minimap = document.getElementById("minimap");
  const panesEl = document.querySelector(".panes");
  const stFile = document.getElementById("st-file");
  const stLang = document.getElementById("st-lang");
  const stPos = document.getElementById("st-pos");
  const side = document.querySelector(".ide-side");

  const byId = new Map(panes.map((p) => [p.dataset.pane, p]));

  /* Which files count as work, for the WhatsApp gate below. */
  const PROJECT_PANES = new Set(
    panes.map((p) => p.dataset.pane).filter((id) => !["readme", "services", "contact"].includes(id)),
  );
  let seenWork = false;

  /* Open tabs, in the order they were opened — the same rule an editor uses.
     README starts open because a workspace with no file showing is a puzzle. */
  let openTabs = ["readme"];
  let active = "readme";

  /* ── Tabs ─────────────────────────────────────────────────────────────── */

  const renderTabs = () => {
    tabsEl.innerHTML = "";

    openTabs.forEach((id) => {
      const pane = byId.get(id);
      if (!pane) return;

      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab" + (id === active ? " active" : "");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(id === active));
      tab.innerHTML =
        "<span>" + pane.dataset.file + "</span>" +
        (openTabs.length > 1 ? '<span class="tab-close" aria-hidden="true">×</span>' : "");

      tab.addEventListener("click", (event) => {
        if (event.target.classList.contains("tab-close")) {
          closeTab(id);
          return;
        }
        show(id);
      });

      tabsEl.appendChild(tab);
    });
  };

  const closeTab = (id) => {
    if (openTabs.length <= 1) return;
    const i = openTabs.indexOf(id);
    openTabs = openTabs.filter((t) => t !== id);
    // Focus the neighbour, the way every editor does.
    if (active === id) show(openTabs[Math.min(i, openTabs.length - 1)]);
    else renderTabs();
  };

  /* ── Showing a pane ───────────────────────────────────────────────────── */

  const show = (id) => {
    const pane = byId.get(id);
    if (!pane) return;

    // There is no scroll position to gate the WhatsApp button on, so the rule
    // becomes the same thing expressed for this navigation model: once a
    // project file has actually been opened.
    if (PROJECT_PANES.has(id)) {
      seenWork = true;
      document.querySelector(".whatsapp-float")?.classList.add("revealed");
    }

    active = id;
    if (!openTabs.includes(id)) openTabs.push(id);

    panes.forEach((p) => p.classList.toggle("active", p === pane));

    treeEl?.querySelectorAll(".tree-file").forEach((li) => {
      li.classList.toggle("open", li.dataset.open === id);
    });

    if (stFile) stFile.textContent = pane.dataset.file;
    if (stLang) stLang.textContent = pane.dataset.lang || "text";

    renderTabs();
    drawGutter(pane);
    drawMinimap(pane);
    panesEl.scrollTop = 0;
    history.replaceState(null, "", "#pane-" + id);
    side?.classList.remove("open");
  };

  /* ── Gutter ───────────────────────────────────────────────────────────
     Enough numbers to fill the visible height, no more. Numbering every
     paragraph of a document nobody is editing would be a lie about what the
     lines are. */

  const drawGutter = () => {
    if (!gutter) return;
    const lines = Math.ceil(gutter.clientHeight / 22) + 2;
    let html = "";
    for (let i = 1; i <= lines; i++) html += i + "<br>";
    gutter.innerHTML = html;
  };

  /* ── Minimap ──────────────────────────────────────────────────────────── */

  const drawMinimap = (pane) => {
    if (!minimap) return;
    minimap.innerHTML = "";

    const blocks = pane.querySelectorAll("h1, h2, p, li, .json-line");
    const frag = document.createDocumentFragment();

    blocks.forEach((block) => {
      const text = block.textContent.trim();
      if (!text) return;
      // One bar per ~60 characters, so a long paragraph reads as a block of
      // lines rather than a single stripe.
      const lines = Math.max(1, Math.ceil(text.length / 60));
      const heading = /^H[12]$/.test(block.tagName);

      for (let i = 0; i < lines; i++) {
        const bar = document.createElement("i");
        if (heading) bar.className = "h";
        // The last line of a paragraph is short, like real text.
        const width = i === lines - 1 ? 30 + ((text.length % 40) / 40) * 55 : 78 + (i % 3) * 7;
        bar.style.width = width.toFixed(0) + "%";
        frag.appendChild(bar);
      }
    });

    const view = document.createElement("div");
    view.className = "minimap-view";
    minimap.append(frag, view);
    positionView();
  };

  const positionView = () => {
    const view = minimap?.querySelector(".minimap-view");
    if (!view || !panesEl) return;

    const ratio = panesEl.clientHeight / Math.max(1, panesEl.scrollHeight);
    const top = panesEl.scrollTop / Math.max(1, panesEl.scrollHeight);
    view.style.height = (ratio * 100).toFixed(2) + "%";
    view.style.top = (top * 100).toFixed(2) + "%";
  };

  /* ── Position readout ─────────────────────────────────────────────────
     The line number is derived from the scroll position, which is honest:
     there is no caret, and pretending there is one would be worse than
     reporting where you are looking. */

  let ticking = false;
  panesEl?.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        positionView();
        if (stPos) stPos.textContent = "Ln " + (Math.floor(panesEl.scrollTop / 22) + 1) + ", Col 1";
        ticking = false;
      });
    },
    { passive: true },
  );

  /* ── Tree ─────────────────────────────────────────────────────────────── */

  treeEl?.querySelectorAll(".tree-file").forEach((li) => {
    li.querySelector("button")?.addEventListener("click", () => show(li.dataset.open));
  });

  treeEl?.querySelectorAll(".tree-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
    });
  });

  /* Anything else that points at a pane opens it rather than jumping. */
  document.querySelectorAll("[data-open]").forEach((el) => {
    if (el.classList.contains("tree-file")) return;
    el.addEventListener("click", (event) => {
      event.preventDefault();
      show(el.dataset.open);
    });
  });

  /* The header nav maps onto the files it corresponds to. */
  const NAV = { home: "readme", projects: "gridsmith", about: "readme", services: "services", contact: "contact" };

  document.querySelectorAll("#nav a[data-nav]").forEach((a) => {
    a.addEventListener("click", (event) => {
      const id = NAV[a.dataset.nav];
      if (!byId.has(id)) return;
      event.preventDefault();
      show(id);
      document.querySelectorAll("#nav a").forEach((l) => l.classList.toggle("active", l === a));
    });
  });

  /* ── Drawer, for the widths where the tree cannot be permanent ────────── */

  const drawer = document.createElement("button");
  drawer.type = "button";
  drawer.className = "tree-open";
  drawer.innerHTML = '<span aria-hidden="true">⌗</span> Files';
  drawer.setAttribute("aria-controls", "tree");
  drawer.addEventListener("click", () => {
    const open = side?.classList.toggle("open");
    drawer.setAttribute("aria-expanded", String(!!open));
  });
  document.body.appendChild(drawer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") side?.classList.remove("open");
  });

  /* ── Start ────────────────────────────────────────────────────────────── */

  const fromHash = location.hash.replace("#pane-", "");
  show(byId.has(fromHash) ? fromHash : "readme");

  window.addEventListener(
    "resize",
    () => {
      drawGutter();
      positionView();
    },
    { passive: true },
  );
});
