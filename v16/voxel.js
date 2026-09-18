/* ==========================================================================
   v16 — the overworld.

   A small voxel renderer written from scratch on a 2D canvas. There is no
   WebGL and no library: the whole scene is axis-aligned boxes, projected
   orthographically and painted back to front.

   Two things make it a homage rather than a pastiche:

   1. The camera starts at 90° pitch — straight down — where every box's side
      faces have zero projected area, so the world reads as a flat grid of
      coloured squares. Exactly the old tile map. As you scroll the pitch
      drops and the yaw swings round, and the tiles turn out to have been
      solid geometry the whole time.

   2. The render upgrades its hardware as you go. At the top of the page the
      canvas backing store is about two hundred pixels across and every colour
      is snapped to the four greens of an original handheld screen. By the
      projects it is at full device resolution in full colour. The scene never
      changes; only the machine drawing it does.

   Hung off window.Voxel — app.js drives it with a scroll progress value.
   ========================================================================== */

(function (global) {
  "use strict";

  /* ── The map ────────────────────────────────────────────────────────────
     A town with a path loop, a house, water, two tall-grass patches and a
     wall of trees. Twenty by sixteen: big enough to read as a place, small
     enough that the per-frame quad count stays in the low thousands. */

  const MAP = [
    "TTTTTTTTTTTTTTTTTTTT",
    "T..................T",
    "T..GGG....HHHHH....T",
    "T..GGG....HHdHH....T",
    "T..GGG....ppppp....T",
    "T....ppppppppppp...T",
    "T....p.........p...T",
    "Tff..p..GGGGG..p..fT",
    "Tff..p..GGGGG..p..fT",
    "T....p.........p...T",
    "T....pppp...pppp...T",
    "T.......p...p......T",
    "T.wwww..p...p...rr.T",
    "T.wwww..pppppppppp.T",
    "T.wwww.............T",
    "TTTTTTTTTTTTTTTTTTTT",
  ];

  const COLS = MAP[0].length;
  const ROWS = MAP.length;

  /* The four shades of an original handheld screen, darkest first. Every
     surface names one of these as well as its true colour, so the palette
     crossfade never has to guess a luminance.

     Not the literal hardware values: those put the two lightest shades about
     six percent apart, which is faithful and unreadable — grass and a dirt
     path come out the same colour. This is the evenly-spaced green ramp the
     pixel-art community settled on for the same machine, and a map drawn in
     it can actually be read. */
  const DMG = ["#081820", "#346856", "#88c070", "#e0f8d0"];

  const GRASS = { h: 0.3, col: "#57a84b", dmg: 2 };
  const FLOWERS = ["#e46b8b", "#f2d24b", "#f3f1ea"];

  /* The route the walker takes, in (col, row). Every leg runs along path
     tiles, so it never wanders through the water. */
  const ROUTE = [
    [5, 5], [15, 5], [15, 10], [12, 10], [12, 13],
    [8, 13], [8, 10], [5, 10],
  ];

  /* ── Colour ─────────────────────────────────────────────────────────── */

  const hexToRgb = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];

  const DMG_RGB = DMG.map(hexToRgb);

  /* Resolved once per palette step and cached. Three string concatenations
     per box per frame is the one thing here that would actually show up in a
     profile, so the cache is cleared when the palette moves, not per call. */
  let cache = new Map();
  let cacheCol = -1;

  const shade = (hex, dmgIdx, face, col) => {
    if (col !== cacheCol) {
      cache = new Map();
      cacheCol = col;
    }

    const key = hex + dmgIdx + face;
    const hit = cache.get(key);
    if (hit) return hit;

    // At col = 0 a darker face steps down the four-shade ramp rather than
    // multiplying, so the handheld look stays honestly four colours.
    const mul = face === 0 ? 1 : face === 1 ? 0.78 : 0.58;
    const [dr, dg, db] = DMG_RGB[Math.max(0, dmgIdx - face)];
    const [r, g, b] = hexToRgb(hex);

    const out =
      "rgb(" +
      Math.round(dr + (r * mul - dr) * col) + "," +
      Math.round(dg + (g * mul - dg) * col) + "," +
      Math.round(db + (b * mul - db) * col) + ")";

    cache.set(key, out);
    return out;
  };

  /* ── Scene ──────────────────────────────────────────────────────────────
     A box is [x0, x1, y0, y1, z0, z1, colour, dmg, col, row]. Every box has
     a single-cell footprint recorded in the last two slots, which is what
     lets the paint order below be exact rather than approximately right. */

  const SCENE = [];
  const push = (x, z, y0, y1, w, hex, dmg) =>
    SCENE.push([
      x + (1 - w) / 2, x + (1 + w) / 2,
      y0, y1,
      z + (1 - w) / 2, z + (1 + w) / 2,
      hex, dmg, x, z,
    ]);

  /* Cells whose surface height moves every frame, and the SCENE index of the
     box to move. */
  const LIVE = [];

  for (let row = 0; row < ROWS; row++) {
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[row][c];

      if (ch === "p") {
        push(c, row, 0, 0.22, 1, "#d9c78d", 3);
      } else if (ch === "w") {
        push(c, row, 0, 0.16, 1, "#3f7fd0", 1);
        LIVE.push({ i: SCENE.length - 1, kind: "w", x: c, z: row });
      } else if (ch === "T") {
        push(c, row, 0, GRASS.h, 1, GRASS.col, GRASS.dmg);
        push(c, row, 0.3, 1.05, 0.34, "#6b4a2b", 0);
        push(c, row, 0.9, 2.35, 1.55, "#2f7d3a", 1);
      } else if (ch === "H" || ch === "d") {
        push(c, row, 0, GRASS.h, 1, GRASS.col, GRASS.dmg);
        if (ch === "d") {
          push(c, row, 0.3, 1.75, 1, "#7a5230", 0);
        } else {
          push(c, row, 0.3, 2.5, 1, "#e6ddc9", 3);
          push(c, row, 2.5, 3.0, 1.22, "#b8402f", 0);
        }
      } else if (ch === "G") {
        push(c, row, 0, GRASS.h, 1, GRASS.col, GRASS.dmg);
        push(c, row, 0, 0.78, 1, "#3c8d3f", 1);
        LIVE.push({ i: SCENE.length - 1, kind: "G", x: c, z: row });
      } else if (ch === "r") {
        push(c, row, 0, GRASS.h, 1, GRASS.col, GRASS.dmg);
        push(c, row, 0.25, 0.85, 0.82, "#8f8f8f", 1);
      } else if (ch === "f") {
        push(c, row, 0, GRASS.h, 1, GRASS.col, GRASS.dmg);
        push(c, row, 0.3, 0.58, 0.34, FLOWERS[(row * 7 + c * 3) % 3], 3);
      } else {
        push(c, row, 0, GRASS.h, 1, GRASS.col, GRASS.dmg);
      }
    }
  }

  /* ── Paint order ────────────────────────────────────────────────────────
     Painter's algorithm on the footprint, not the centroid. Sorting by the
     depth of the box's base and only then by height is what keeps a tall tree
     behind a hedge from being painted over the top of it — the bug a naive
     centroid sort produces the moment the camera tilts.

     The order is a function of the yaw alone — the pitch scales every cell's
     depth by the same cosine and cannot reorder anything — so it is memoised
     against a quantised yaw. Sixty-four buckets over the camera's whole
     travel means at most a handful of sorts in a session instead of one per
     frame, and a sixty-fourth of a radian is far too small a step to show. */

  const ORDERS = new Map();

  const orderFor = (yaw) => {
    const bucket = Math.round(yaw * 32);
    const hit = ORDERS.get(bucket);
    if (hit) return hit;

    // Depth over the footprint is x·sinθ + z·cosθ; paint the largest first.
    const kx = Math.sin(bucket / 32);
    const kz = Math.cos(bucket / 32);

    const idx = SCENE.map((_, i) => i);
    idx.sort((a, b) => {
      const A = SCENE[a];
      const B = SCENE[b];
      const d = (B[8] * kx + B[9] * kz) - (A[8] * kx + A[9] * kz);
      if (Math.abs(d) > 1e-9) return d;
      return A[2] - B[2];
    });

    ORDERS.set(bucket, idx);
    return idx;
  };

  const legLengths = ROUTE.map((a, i) => {
    const b = ROUTE[(i + 1) % ROUTE.length];
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  });
  const ROUTE_LENGTH = legLengths.reduce((s, n) => s + n, 0);

  /* ── Renderer ───────────────────────────────────────────────────────── */

  const create = (host) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: false });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = () => window.innerWidth < 768;

    let step = 0;        // quantised palette / resolution step, 0..8
    let running = false;
    let raf = 0;
    let lastDraw = 0;

    const cam = { pitch: Math.PI / 2, yaw: 0, col: 0 };

    /* Resolution is a function of the palette progress: about 0.14 backing
       pixels per CSS pixel at the top of the page — roughly two hundred
       across on a laptop, close to the original screen — rising to real
       device pixels once the colour is in. */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
      const s = 0.14 + (dpr - 0.14) * (step / 8);
      canvas.width = Math.max(2, Math.round(host.clientWidth * s));
      canvas.height = Math.max(2, Math.round(host.clientHeight * s));
    };

    /* ── Projection ────────────────────────────────────────────────────
       Orthographic. For yaw θ and pitch φ the camera basis is
         forward = ( sinθcosφ, −sinφ, cosθcosφ )
         right   = ( cosθ,      0,   −sinθ )
         up      = ( sinθsinφ,  cosφ, cosθsinφ )
       and screen x = p·right, screen y = −p·up. At φ = 90° the vertical
       term drops out of both, which is the flat tile map. */

    let st = 0, ct = 1, sp = 1, cp = 0;
    let ox = 0, oy = 0, zoom = 1;
    let order = orderFor(0);

    const sx = (x, y, z) => (x * ct - z * st) * zoom + ox;
    const sy = (x, y, z) => -(x * st * sp + y * cp + z * ct * sp) * zoom + oy;

    /* Fit the world into the canvas at the current angle. Projecting the
       eight corners of the bounding box is enough for an orthographic
       camera: the extremes of a convex hull are always corners. */
    const frameWorld = () => {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < 8; i++) {
        const x = i & 1 ? COLS : 0;
        const y = i & 2 ? 3.1 : -1.2;
        const z = i & 4 ? ROWS : 0;
        const px = x * ct - z * st;
        const py = -(x * st * sp + y * cp + z * ct * sp);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }

      const w = canvas.width;
      const h = canvas.height;
      // Over-scale a little: the world should bleed off the edges rather
      // than float in the middle of the page like a diagram.
      const pad = 1.1;
      zoom = Math.min(w / ((maxX - minX) * pad), h / ((maxY - minY) * pad));
      ox = w / 2 - ((minX + maxX) / 2) * zoom;
      oy = h / 2 - ((minY + maxY) / 2) * zoom;
    };

    const quad = (ax, ay, bx, by, cx, cy, dx, dy, fill) => {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.lineTo(dx, dy);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      // Stroking the path we already built closes the hairline seams
      // antialiasing leaves between neighbouring quads. Cheaper than the
      // alternative of inflating every polygon.
      ctx.strokeStyle = fill;
      ctx.stroke();
    };

    /* Up to three faces per box: the top, plus whichever X and Z face turns
       toward the camera. A face is visible when its outward normal points
       against the view direction; with pitch in 0..90 that reduces to the
       signs of sinθ and cosθ. */
    const drawBox = (b, col) => {
      const x0 = b[0], x1 = b[1], y0 = b[2], y1 = b[3], z0 = b[4], z1 = b[5];
      const hex = b[6], dmg = b[7];

      const ax = sx(x0, y1, z0), ay = sy(x0, y1, z0);
      const bx = sx(x1, y1, z0), by = sy(x1, y1, z0);
      const cx = sx(x1, y1, z1), cy = sy(x1, y1, z1);
      const dx = sx(x0, y1, z1), dy = sy(x0, y1, z1);

      quad(ax, ay, bx, by, cx, cy, dx, dy, shade(hex, dmg, 0, col));

      if (st < -0.002) {
        quad(bx, by, cx, cy, sx(x1, y0, z1), sy(x1, y0, z1),
          sx(x1, y0, z0), sy(x1, y0, z0), shade(hex, dmg, 1, col));
      } else if (st > 0.002) {
        quad(dx, dy, ax, ay, sx(x0, y0, z0), sy(x0, y0, z0),
          sx(x0, y0, z1), sy(x0, y0, z1), shade(hex, dmg, 1, col));
      }

      if (ct < -0.002) {
        quad(cx, cy, dx, dy, sx(x0, y0, z1), sy(x0, y0, z1),
          sx(x1, y0, z1), sy(x1, y0, z1), shade(hex, dmg, 2, col));
      } else if (ct > 0.002) {
        quad(ax, ay, bx, by, sx(x1, y0, z0), sy(x1, y0, z0),
          sx(x0, y0, z0), sy(x0, y0, z0), shade(hex, dmg, 2, col));
      }
    };

    /* ── The walker ────────────────────────────────────────────────────
       Four boxes on a fixed route. An original figure built from primitives:
       nobody's character, just a person on a path. */

    const walkerBox = [0, 0, 0, 0, 0, 0, "", 0, 0, 0];

    const drawWalker = (time, col) => {
      let dist = (time * 0.55) % ROUTE_LENGTH;
      let i = 0;
      while (dist > legLengths[i]) {
        dist -= legLengths[i];
        i = (i + 1) % ROUTE.length;
      }

      const a = ROUTE[i];
      const b = ROUTE[(i + 1) % ROUTE.length];
      const f = legLengths[i] ? dist / legLengths[i] : 0;
      const x = a[0] + (b[0] - a[0]) * f;
      const z = a[1] + (b[1] - a[1]) * f;

      // A two-frame step, like a sprite: the bob snaps rather than eases.
      const base = 0.22 + (Math.floor(time * 5) % 2 ? 0.055 : 0);

      const parts = [
        [base, base + 0.3, 0.34, "#2b4a8b", 0],
        [base + 0.3, base + 0.66, 0.46, "#d94f3d", 1],
        [base + 0.66, base + 1.0, 0.4, "#f0c9a0", 3],
        [base + 0.96, base + 1.12, 0.52, "#d94f3d", 0],
      ];

      for (const [y0, y1, w, hex, dmg] of parts) {
        walkerBox[0] = x + (1 - w) / 2;
        walkerBox[1] = x + (1 + w) / 2;
        walkerBox[2] = y0;
        walkerBox[3] = y1;
        walkerBox[4] = z + (1 - w) / 2;
        walkerBox[5] = z + (1 + w) / 2;
        walkerBox[6] = hex;
        walkerBox[7] = dmg;
        drawBox(walkerBox, col);
      }
    };

    /* ── Frame ─────────────────────────────────────────────────────────── */

    const render = (time) => {
      st = Math.sin(cam.yaw);
      ct = Math.cos(cam.yaw);
      sp = Math.sin(cam.pitch);
      cp = Math.cos(cam.pitch);

      frameWorld();
      order = orderFor(cam.yaw);

      const col = Math.round(cam.col * 24) / 24;

      ctx.fillStyle = shade("#8fc7ea", 3, 0, col);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = Math.max(0.5, zoom * 0.02);
      ctx.lineJoin = "round";

      // The chunk of ground the town sits on. Always furthest back, so it is
      // drawn first and left out of the sort.
      drawBox([0, COLS, -1.3, 0, 0, ROWS, "#6b4a2b", 0], col);

      if (!reduced) {
        for (let i = 0; i < LIVE.length; i++) {
          const cell = LIVE[i];
          const box = SCENE[cell.i];
          box[3] = cell.kind === "w"
            ? 0.16 + Math.sin(time * 2.1 + cell.x * 0.7 + cell.z * 0.5) * 0.05
            : 0.78 + Math.sin(time * 1.6 + cell.x * 0.9 + cell.z * 0.6) * 0.08;
        }
      }

      for (let i = 0; i < order.length; i++) drawBox(SCENE[order[i]], col);

      drawWalker(reduced ? 6.2 : time, col);
    };

    /* ── Loop ──────────────────────────────────────────────────────────
       Full rate while the world is the subject; a quarter of that once it
       has faded back to being wallpaper behind the text. */

    const tick = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      const interval = cam.col < 0.55 ? 0 : small() ? 50 : 40;
      if (now - lastDraw < interval) return;
      lastDraw = now;

      render(now / 1000);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* The palette step also changes the backing-store size, so it is
       quantised: resizing a canvas on every scroll frame would throw the
       whole surface away sixty times a second. */
    const setProgress = ({ pitch, yaw, col }) => {
      cam.pitch = pitch;
      cam.yaw = yaw;
      cam.col = col;

      const next = Math.round(col * 8);
      if (next !== step) {
        step = next;
        resize();
      }
      if (reduced) render(6.2);
    };

    let resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resize();
          if (reduced) render(6.2);
        }, 150);
      },
      { passive: true },
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    if (reduced) {
      // One frame, at an angle that shows the geometry rather than hiding it.
      cam.pitch = 0.95;
      cam.yaw = -0.6;
      cam.col = 1;
      step = 8;
      resize();
      render(6.2);
    } else {
      resize();
      start();
    }

    return { setProgress, start, stop, reduced, canvas };
  };

  global.Voxel = { create, MAP, COLS, ROWS, DMG };
})(window);
