/* ==========================================================================
   v27 — Map.

   The pan and zoom are shared/pan.js. This file is the geography: which pin
   opens which place, keeping the pins the right size on screen at any zoom,
   and making sure the list and the map always agree about what is selected.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireChrome();

  const viewport = document.getElementById("viewport");
  const plane = document.getElementById("plane");
  const sheet = document.getElementById("sheet");
  const pins = [...document.querySelectorAll(".pin")];
  const places = [...document.querySelectorAll(".place")];
  const jumps = [...document.querySelectorAll("[data-goto]")];

  if (!viewport || !window.Pan) {
    P.wireStandardPage();
    return;
  }

  const pan = window.Pan.create({
    viewport,
    plane,
    world: { x: 0, y: 0, w: 2000, h: 1400 },
    min: 0.28,
    max: 2.4,
  });

  /* Pins hold their size on screen. --inv is the reciprocal of the zoom, so
     a label reads the same whether the map is at a quarter scale or double. */
  pan.on(({ k }) => plane.style.setProperty("--inv", (1 / k).toFixed(4)));

  /* ── Opening a place ──────────────────────────────────────────────────── */

  const WORK = new Set(["gridsmith", "musicvisualizer", "hushbar", "wedding", "vetapp", "gym"]);
  let open = null;

  const show = (id, { move = true } = {}) => {
    const place = places.find((p) => p.dataset.place === id);
    if (!place) return;

    open = id;
    places.forEach((p) => p.classList.toggle("active", p === place));
    pins.forEach((p) => p.classList.toggle("active", p.dataset.pin === id));
    jumps.forEach((j) => j.classList.toggle("active", j.dataset.goto === id));

    sheet.classList.add("open");
    sheet.querySelector(".sheet-scroll").scrollTop = 0;
    history.replaceState(null, "", "#place-" + id);

    if (WORK.has(id)) document.querySelector(".whatsapp-float")?.classList.add("revealed");

    if (!move) return;

    const pin = pins.find((p) => p.dataset.pin === id);
    if (!pin) return;

    /* Centre the pin in whatever part of the viewport the sheet leaves
       visible — on a wide screen the sheet takes the right-hand side, so
       centring on the whole viewport would put the pin underneath it. */
    const wx = parseFloat(pin.style.getPropertyValue("--x"));
    const wy = parseFloat(pin.style.getPropertyValue("--y"));
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const k = Math.max(pan.view.k, 0.85);

    pan.focus(wx + (wide ? 230 / k : 0), wy + (wide ? 0 : -160 / k), k);
  };

  const close = () => {
    open = null;
    sheet.classList.remove("open");
    pins.forEach((p) => p.classList.remove("active"));
    jumps.forEach((j) => j.classList.remove("active"));
    history.replaceState(null, "", location.pathname);
  };

  pins.forEach((pin) => {
    pin.addEventListener("click", () => {
      // A drag that happens to end on a pin is not a click on it.
      if (pan.dragged) return;
      show(pin.dataset.pin);
    });
  });

  jumps.forEach((j) => j.addEventListener("click", () => show(j.dataset.goto)));
  sheet.querySelector(".sheet-close")?.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) close();
  });

  /* ── Zoom controls ────────────────────────────────────────────────────── */

  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      const what = button.dataset.zoom;
      if (what === "in") pan.zoomBy(1.35);
      else if (what === "out") pan.zoomBy(1 / 1.35);
      else pan.fit();
    });
  });

  /* ── Nav ──────────────────────────────────────────────────────────────── */

  const NAV = { home: null, projects: "gridsmith", about: "about", services: "services", contact: "contact" };

  document.querySelectorAll("#nav a[data-nav]").forEach((a) => {
    a.addEventListener("click", (event) => {
      event.preventDefault();
      const id = NAV[a.dataset.nav];
      document.querySelectorAll("#nav a").forEach((l) => l.classList.toggle("active", l === a));
      if (id) show(id);
      else {
        close();
        pan.fit();
      }
    });
  });

  /* ── Start ────────────────────────────────────────────────────────────── */

  pan.fit(0.92, 0);

  const hash = location.hash.replace("#place-", "");
  if (places.some((p) => p.dataset.place === hash)) show(hash);
});
