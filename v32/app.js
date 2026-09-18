/* ==========================================================================
   v32 — Playable.

   A small top-down arena: walk into a marker and its project card opens
   below. Keyboard, and a thumb-stick that only appears once a touch happens.

   The constraint the whole file is written under is that **the game is
   optional**. Every card is in the document, in order, from the first frame.
   The rack of slots above them is clickable whether or not you have found
   anything. The skip button scrolls straight past the arena. Nothing is ever
   locked behind play — a portfolio that has to be beaten is a portfolio most
   people close.

   Under prefers-reduced-motion the arena does not run at all and the page is
   the document with a still image of the field behind the heading.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();

  const arena = document.getElementById("arena");
  const canvas = document.getElementById("field");
  const scoreOut = document.getElementById("score");
  const hint = document.getElementById("controls-hint");
  const stick = document.getElementById("stick");
  const skip = document.getElementById("skip-game");
  const collection = document.getElementById("collection");

  const ORDER = ["gridsmith", "musicvisualizer", "hushbar", "wedding", "vetapp", "gym"];
  const slots = new Map(
    [...document.querySelectorAll(".slot")].map((s) => [s.dataset.slot, s]),
  );

  /* ── Opening a card ───────────────────────────────────────────────────
     The one path both the game and the rack go through, so a card opened by
     walking into it and a card opened by clicking behave identically. */

  const found = new Set();

  const open = (id, { scroll = true } = {}) => {
    const card = document.querySelector(`[data-card="${id}"]`);
    if (!card) return;

    document.querySelectorAll(".card.landed").forEach((c) => c.classList.remove("landed"));
    card.classList.add("landed");

    if (ORDER.includes(id)) {
      found.add(id);
      slots.get(id)?.classList.add("found");
      if (scoreOut) scoreOut.textContent = String(found.size);
      // Same rule as every other version: the button appears once the
      // visitor has actually seen the work.
      document.querySelector(".whatsapp-float")?.classList.add("revealed");
    }

    if (scroll) card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  };

  document.querySelectorAll("[data-open]").forEach((b) => {
    b.addEventListener("click", () => open(b.dataset.open));
  });

  skip?.addEventListener("click", () => {
    collection?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    collection?.querySelector(".collection-title")?.focus?.();
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || reduced) {
    hint?.classList.add("gone");
    return;
  }

  /* ══ The arena ══════════════════════════════════════════════════════════
     World units, not pixels. The field is a fixed 1000 × 640 and the camera
     scales it to whatever the window is, so the game plays identically on a
     phone and a monitor rather than giving a wide screen more room to see. */

  const W = 1000;
  const H = 640;

  const ctx = canvas.getContext("2d");
  let dpr = 1;
  let scale = 1;
  let ox = 0;
  let oy = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = arena.clientWidth;
    const h = arena.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Cover, not contain: letterboxing an arena wastes the screen it is
    // supposed to fill.
    scale = Math.max(w / W, h / H);
    ox = (w - W * scale) / 2;
    oy = (h - H * scale) / 2;
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ── The field ────────────────────────────────────────────────────────
     Walls are rectangles, markers are the six projects. Both hand-placed:
     a generated layout would put a marker behind a wall often enough to be a
     problem, and there are only ten of them. */

  const WALLS = [
    [0, 0, W, 18], [0, H - 18, W, 18], [0, 0, 18, H], [W - 18, 0, 18, H],
    [220, 150, 22, 180], [220, 150, 180, 22],
    [600, 120, 22, 200],
    [380, 420, 240, 22],
    [740, 340, 22, 200],
    [120, 470, 180, 22],
  ];

  const MARKERS = [
    { id: "gridsmith", x: 140, y: 100 },
    { id: "musicvisualizer", x: 500, y: 220 },
    { id: "hushbar", x: 860, y: 140 },
    { id: "wedding", x: 340, y: 300 },
    { id: "vetapp", x: 690, y: 520 },
    { id: "gym", x: 900, y: 470 },
  ].map((m, i) => ({ ...m, no: i + 1, taken: false, phase: Math.random() * 6.28 }));

  /* Placed in the one column that is clear all the way up — x ≈ 340, between
     the wall at 220 and the one at 380. Starting in the middle put the player
     directly under a wall, which meant the first thing anyone did was walk
     into it. */
  const player = { x: 340, y: H - 80, vx: 0, vy: 0, r: 15, face: 0 };
  const sparks = [];

  /* ── Input ────────────────────────────────────────────────────────────── */

  const keys = new Set();
  const MOVE = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };

  document.addEventListener("keydown", (event) => {
    const el = document.activeElement;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    const dir = MOVE[event.key];
    if (!dir) return;
    // Only steal the arrow keys while the arena is actually on screen —
    // below it, they have to scroll the page.
    if (arena.getBoundingClientRect().bottom < window.innerHeight * 0.4) return;
    event.preventDefault();
    keys.add(dir);
    hint?.classList.add("gone");
  });

  document.addEventListener("keyup", (event) => {
    const dir = MOVE[event.key];
    if (dir) keys.delete(dir);
  });

  /* Thumb stick: appears where the finger lands, follows it, and disappears
     on release. */
  let touch = null;

  arena.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    if (event.target.closest("button, a")) return;
    const r = arena.getBoundingClientRect();
    touch = { id: event.pointerId, x: event.clientX - r.left, y: event.clientY - r.top, dx: 0, dy: 0 };
    stick.style.left = touch.x + "px";
    stick.style.top = touch.y + "px";
    stick.classList.add("on");
    hint?.classList.add("gone");
  });

  arena.addEventListener("pointermove", (event) => {
    if (!touch || event.pointerId !== touch.id) return;
    const r = arena.getBoundingClientRect();
    const dx = event.clientX - r.left - touch.x;
    const dy = event.clientY - r.top - touch.y;
    const dist = Math.hypot(dx, dy) || 1;
    const capped = Math.min(dist, 55);
    touch.dx = (dx / dist) * (capped / 55);
    touch.dy = (dy / dist) * (capped / 55);
    stick.style.setProperty("--nx", ((dx / dist) * capped).toFixed(1) + "px");
    stick.style.setProperty("--ny", ((dy / dist) * capped).toFixed(1) + "px");
  });

  const dropStick = () => {
    touch = null;
    stick.classList.remove("on");
    stick.style.setProperty("--nx", "0px");
    stick.style.setProperty("--ny", "0px");
  };

  arena.addEventListener("pointerup", dropStick);
  arena.addEventListener("pointercancel", dropStick);

  /* ── Physics ──────────────────────────────────────────────────────────
     Axis-separated collision: move on x, push out of anything hit, then move
     on y and do the same. Resolving both at once is what makes a character
     stick on corners. */

  const hits = (x, y, r) =>
    WALLS.find((w) => x + r > w[0] && x - r < w[0] + w[2] && y + r > w[1] && y - r < w[1] + w[3]);

  const step = (dt) => {
    let ax = 0;
    let ay = 0;

    if (keys.has("left")) ax -= 1;
    if (keys.has("right")) ax += 1;
    if (keys.has("up")) ay -= 1;
    if (keys.has("down")) ay += 1;
    if (touch) {
      ax += touch.dx;
      ay += touch.dy;
    }

    const len = Math.hypot(ax, ay);
    if (len > 1) {
      ax /= len;
      ay /= len;
    }

    const SPEED = 340;
    player.vx += (ax * SPEED - player.vx) * Math.min(1, dt * 12);
    player.vy += (ay * SPEED - player.vy) * Math.min(1, dt * 12);

    if (Math.abs(player.vx) > 6 || Math.abs(player.vy) > 6) {
      player.face = Math.atan2(player.vy, player.vx);
    }

    const nx = player.x + player.vx * dt;
    if (!hits(nx, player.y, player.r)) player.x = nx;
    else player.vx = 0;

    const ny = player.y + player.vy * dt;
    if (!hits(player.x, ny, player.r)) player.y = ny;
    else player.vy = 0;

    player.x = Math.max(player.r, Math.min(W - player.r, player.x));
    player.y = Math.max(player.r, Math.min(H - player.r, player.y));

    // Pickups.
    for (const m of MARKERS) {
      m.phase += dt * 2.4;
      if (m.taken) continue;
      if (Math.hypot(m.x - player.x, m.y - player.y) > 30) continue;

      m.taken = true;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        sparks.push({ x: m.x, y: m.y, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, life: 1 });
      }
      open(m.id);
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.92;
      s.vy *= 0.92;
      s.life -= dt * 1.6;
      if (s.life <= 0) sparks.splice(i, 1);
    }
  };

  /* ── Drawing ──────────────────────────────────────────────────────────── */

  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    // Floor grid.
    ctx.strokeStyle = "rgba(234, 238, 251, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Walls.
    ctx.fillStyle = "#1c2439";
    ctx.strokeStyle = "rgba(92, 225, 176, 0.28)";
    for (const wl of WALLS) {
      ctx.fillRect(wl[0], wl[1], wl[2], wl[3]);
      ctx.strokeRect(wl[0] + 0.5, wl[1] + 0.5, wl[2] - 1, wl[3] - 1);
    }

    // Markers, bobbing. A taken one leaves a dim ring so the field still
    // reads as a map of where you have been.
    for (const m of MARKERS) {
      const bob = Math.sin(m.phase) * 4;

      if (m.taken) {
        ctx.strokeStyle = "rgba(255, 209, 102, 0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }

      ctx.fillStyle = "rgba(255, 209, 102, 0.14)";
      ctx.beginPath();
      ctx.arc(m.x, m.y + bob, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(m.x, m.y + bob, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0a0c14";
      ctx.font = "600 13px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(m.no), m.x, m.y + bob + 1);
    }

    // Sparks.
    for (const s of sparks) {
      ctx.fillStyle = `rgba(255, 209, 102, ${s.life.toFixed(2)})`;
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
    }

    // The player: a disc with a nose showing which way it is facing.
    ctx.fillStyle = "#5ce1b0";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#052018";
    ctx.beginPath();
    ctx.arc(
      player.x + Math.cos(player.face) * 7,
      player.y + Math.sin(player.face) * 7,
      5, 0, Math.PI * 2,
    );
    ctx.fill();

    ctx.restore();
    void t;
  };

  /* ── Loop ─────────────────────────────────────────────────────────────
     Stops when the arena scrolls off screen or the tab is hidden. There is a
     whole document below this; running a game loop behind it would be a
     battery cost for something nobody is looking at. */

  let last = performance.now();
  let running = false;
  let raf = 0;

  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw(now);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? start() : stop()),
      { threshold: 0.15 },
    ).observe(arena);
  } else {
    start();
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  draw(0);
});
