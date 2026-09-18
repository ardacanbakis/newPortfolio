/* ==========================================================================
   v31 — Infinite canvas.

   The pan and zoom are shared/pan.js. This file measures the board, jumps to
   nodes, and draws the minimap.

   The measurement is the part worth doing carefully: the world bounds come
   from the nodes' real positions and sizes, read once after layout, so
   "fit everything" actually fits everything and the minimap is to scale.
   Hardcoding a guess at the bounds is what makes most canvases have empty
   space on one side and clipped content on the other.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireChrome();

  const board = document.getElementById("board");
  const canvas = document.getElementById("canvas");
  const nodes = [...document.querySelectorAll(".node")];
  const jumps = [...document.querySelectorAll("[data-goto]")];
  const minimap = document.getElementById("board-minimap");
  const level = document.getElementById("zoom-level");

  if (!board || !window.Pan || !nodes.length) {
    P.wireStandardPage();
    return;
  }

  /* ── Measure ──────────────────────────────────────────────────────────
     Positions come from the style attribute; heights have to be measured,
     because they depend on how the text wrapped. */

  const boxes = nodes.map((node) => {
    const x = parseFloat(node.style.getPropertyValue("--x"));
    const y = parseFloat(node.style.getPropertyValue("--y"));
    const w = parseFloat(node.style.getPropertyValue("--w"));
    return { node, x, y, w, h: node.offsetHeight, id: node.dataset.node };
  });

  const bounds = () => {
    const pad = 120;
    const minX = Math.min(...boxes.map((b) => b.x)) - pad;
    const minY = Math.min(...boxes.map((b) => b.y)) - pad;
    const maxX = Math.max(...boxes.map((b) => b.x + b.w)) + pad;
    const maxY = Math.max(...boxes.map((b) => b.y + b.h)) + pad;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };

  let world = bounds();

  const pan = window.Pan.create({
    viewport: board,
    plane: canvas,
    world,
    min: 0.18,
    max: 1.9,
  });

  /* ── Minimap ──────────────────────────────────────────────────────────── */

  const marks = new Map();

  const buildMinimap = () => {
    if (!minimap) return;
    marks.forEach((m) => m.remove());
    marks.clear();

    const view = minimap.querySelector(".minimap-view");

    boxes.forEach((b) => {
      const i = document.createElement("i");
      i.style.left = (((b.x - world.x) / world.w) * 100).toFixed(2) + "%";
      i.style.top = (((b.y - world.y) / world.h) * 100).toFixed(2) + "%";
      i.style.width = ((b.w / world.w) * 100).toFixed(2) + "%";
      i.style.height = ((b.h / world.h) * 100).toFixed(2) + "%";
      minimap.insertBefore(i, view);
      marks.set(b.id, i);
    });
  };

  const drawView = ({ x, y, k }) => {
    if (level) level.textContent = Math.round(k * 100) + "%";

    const view = minimap?.querySelector(".minimap-view");
    if (!view) return;

    // The canvas origin sits at the centre of the board, so a world point's
    // screen position is centre + world · k + translate.
    const left = (-x - board.clientWidth / 2 - world.x * k) / k;
    const top = (-y - board.clientHeight / 2 - world.y * k) / k;

    view.style.left = ((left / world.w) * 100).toFixed(2) + "%";
    view.style.top = ((top / world.h) * 100).toFixed(2) + "%";
    view.style.width = ((board.clientWidth / k / world.w) * 100).toFixed(2) + "%";
    view.style.height = ((board.clientHeight / k / world.h) * 100).toFixed(2) + "%";
  };

  buildMinimap();
  pan.on(drawView);

  /* ── Jumping ──────────────────────────────────────────────────────────── */

  const WORK = new Set(["gridsmith", "musicvisualizer", "hushbar", "wedding", "vetapp", "gym"]);

  const goTo = (id) => {
    const box = boxes.find((b) => b.id === id);
    if (!box) return;

    jumps.forEach((j) => j.classList.toggle("active", j.dataset.goto === id));
    nodes.forEach((n) => n.classList.toggle("targeted", n.dataset.node === id));
    marks.forEach((m, key) => m.classList.toggle("on", key === id));

    // Zoom to a scale where the node comfortably fills the board, capped so a
    // narrow node does not fly to a comical magnification.
    const k = Math.min(1.1, Math.max(0.5, (board.clientWidth * 0.72) / box.w));
    pan.focus(box.x + box.w / 2, box.y + box.h / 2, k);

    history.replaceState(null, "", "#" + id);
    if (WORK.has(id)) document.querySelector(".whatsapp-float")?.classList.add("revealed");
  };

  jumps.forEach((j) => j.addEventListener("click", () => goTo(j.dataset.goto)));

  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      const what = button.dataset.zoom;
      if (what === "in") pan.zoomBy(1.3);
      else if (what === "out") pan.zoomBy(1 / 1.3);
      else pan.fit();
    });
  });

  board.addEventListener("dblclick", (event) => {
    if (event.target.closest("a, button, input, textarea")) return;
    pan.fit();
  });

  const NAV = { home: "home", projects: "gridsmith", about: "about", services: "services", contact: "contact" };

  document.querySelectorAll("#nav a[data-nav]").forEach((a) => {
    a.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelectorAll("#nav a").forEach((l) => l.classList.toggle("active", l === a));
      goTo(NAV[a.dataset.nav]);
    });
  });

  /* ── Keeping the measurements honest ──────────────────────────────────
     Node heights change when the text rewraps, which happens on a resize, on
     a language change, and once when the web font finally arrives. */

  const remeasure = () => {
    boxes.forEach((b) => (b.h = b.node.offsetHeight));
    world = bounds();
    pan.setWorld(world);
    buildMinimap();
    drawView(pan.view);
  };

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(remeasure, 150);
  }, { passive: true });

  P.onLanguageChange(() => setTimeout(remeasure, 40));
  if (document.fonts?.ready) document.fonts.ready.then(remeasure);

  /* ── Start ────────────────────────────────────────────────────────────── */

  const hash = location.hash.replace("#", "");
  if (boxes.some((b) => b.id === hash)) goTo(hash);
  else pan.fit(0.88, 0);
});
