/* ==========================================================================
   v24 — the geometry engine behind the hero.

   A real parametric solid, built from the controls: a Gridfinity-proportioned
   bin with a chosen number of compartments, a chosen height and a chosen wall
   thickness. It is meshed as triangles, rendered here with a small perspective
   rasteriser, and exported as a binary STL a printer will actually accept.

   No WebGL and no library — for a few hundred triangles a painter's sort on a
   2D canvas is both simpler and entirely fast enough, and it keeps the page's
   "no build step, nothing to install" rule intact.

   The one modelling decision worth writing down: the top face of a bin is a
   rectangle with holes in it, which cannot be a single quad. It is tessellated
   as a grid frame — full-width bars at every wall line, and short bars filling
   the gaps between them — so the frame is covered exactly once with no
   overlapping geometry for the exporter to choke on.

   Hung off window.Solid.
   ========================================================================== */

(function (global) {
  "use strict";

  /* Gridfinity's numbers, which is the point: this is the same grid gridSmith
     works in, not an invented one. */
  const CELL = 42;   // mm, one grid unit across
  const UNIT = 7;    // mm, one height unit

  /* ── Meshing ─────────────────────────────────────────────────────────────
     Everything is built from quads, each emitted as two triangles with an
     outward normal. Winding is consistent so back-face culling and the STL
     both agree about which side is out. */

  const build = ({ cols, rows, height, wall }) => {
    const W = cols * CELL;
    const D = rows * CELL;
    const H = height * UNIT;
    const floor = Math.max(wall, 1);

    const tris = [];

    /* A quad given four corners in counter-clockwise order seen from
       outside. The normal is computed rather than passed, so a mistake in the
       corner order shows up as a shading error instead of silently producing
       an STL with inverted faces. */
    const quad = (a, b, c, d) => {
      tris.push([a, b, c], [a, c, d]);
    };

    // Centre the model on the origin so orbiting feels like turning an object
    // rather than swinging around one.
    const x0 = -W / 2;
    const x1 = W / 2;
    const z0 = -D / 2;
    const z1 = D / 2;

    // ── Outer shell ──────────────────────────────────────────────────────
    quad([x0, 0, z1], [x1, 0, z1], [x1, H, z1], [x0, H, z1]);   // front  (+z)
    quad([x1, 0, z0], [x0, 0, z0], [x0, H, z0], [x1, H, z0]);   // back   (−z)
    quad([x1, 0, z1], [x1, 0, z0], [x1, H, z0], [x1, H, z1]);   // right  (+x)
    quad([x0, 0, z0], [x0, 0, z1], [x0, H, z1], [x0, H, z0]);   // left   (−x)
    quad([x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]);   // bottom (−y)

    // ── Compartments ─────────────────────────────────────────────────────
    // Wall lines: the x and z positions where material remains on top.
    const xs = [];
    const zs = [];
    for (let i = 0; i <= cols; i++) xs.push(x0 + i * CELL);
    for (let j = 0; j <= rows; j++) zs.push(z0 + j * CELL);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const ax = xs[i] + wall;
        const bx = xs[i + 1] - wall;
        const az = zs[j] + wall;
        const bz = zs[j + 1] - wall;
        if (bx <= ax || bz <= az) continue;

        // The cavity floor faces up.
        quad([ax, floor, az], [bx, floor, az], [bx, floor, bz], [ax, floor, bz]);

        // Cavity walls, wound so their normals point inward — into the hole,
        // which is "outside" the solid.
        quad([ax, floor, bz], [bx, floor, bz], [bx, H, bz], [ax, H, bz]);       // −z face of the far wall
        quad([bx, floor, az], [ax, floor, az], [ax, H, az], [bx, H, az]);       // +z face of the near wall
        quad([bx, floor, bz], [bx, floor, az], [bx, H, az], [bx, H, bz]);       // −x face of the right wall
        quad([ax, floor, az], [ax, floor, bz], [ax, H, bz], [ax, H, az]);       // +x face of the left wall
      }
    }

    /* ── The top frame ───────────────────────────────────────────────────
       Bars along every wall line. The z-bars run the full width; the x-bars
       fill only the gaps between them, so nothing is covered twice. */

    for (let j = 0; j <= rows; j++) {
      const za = j === 0 ? zs[0] : zs[j] - wall;
      const zb = j === rows ? zs[rows] : zs[j] + wall;
      quad([x0, H, za], [x1, H, za], [x1, H, zb], [x0, H, zb]);
    }

    for (let i = 0; i <= cols; i++) {
      const xa = i === 0 ? xs[0] : xs[i] - wall;
      const xb = i === cols ? xs[cols] : xs[i] + wall;

      for (let j = 0; j < rows; j++) {
        const za = zs[j] + wall;
        const zb = zs[j + 1] - wall;
        if (zb <= za) continue;
        quad([xa, H, za], [xb, H, za], [xb, H, zb], [xa, H, zb]);
      }
    }

    /* ── Material ────────────────────────────────────────────────────────
       Outer volume minus the cavities. An honest figure, not an estimate:
       every cavity is a box and the arithmetic is exact. */

    const cavity = Math.max(0, CELL - 2 * wall);
    const volume = W * D * H - cols * rows * cavity * cavity * Math.max(0, H - floor);

    return { tris, W, D, H, volume: volume / 1000 };  // volume in cm³
  };

  /* ── Rendering ───────────────────────────────────────────────────────────
     Perspective projection, back-face culling, painter's sort, flat shading
     from one light. Nothing here needs a depth buffer: a convex-ish solid
     sorted by centroid depth is correct for every angle this thing is ever
     seen from. */

  const renderer = (host, palette) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let mesh = null;
    let yaw = -0.62;
    let pitch = 0.52;
    let dist = 260;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.max(2, Math.round(w * dpr));
      canvas.height = Math.max(2, Math.round(h * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };

    const draw = () => {
      if (!mesh || !w || !h) return;

      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);

      // Frame the model whatever its size, so changing the column count does
      // not send it off the edge of the stage.
      const span = Math.max(mesh.W, mesh.D, mesh.H);
      const zoom = (Math.min(w, h) * 0.62 * (dist / 260)) / span;
      const focal = 900;

      const project = (p) => {
        const x = p[0] * cy - p[2] * sy;
        const z = p[0] * sy + p[2] * cy;
        const y = p[1] - mesh.H / 2;
        const yy = y * cp - z * sp;
        const zz = y * sp + z * cp + focal;
        const s = (focal / Math.max(1, zz)) * zoom;
        return [w / 2 + x * s, h / 2 - yy * s, zz];
      };

      const faces = [];

      for (const t of mesh.tris) {
        const a = project(t[0]);
        const b = project(t[1]);
        const c = project(t[2]);

        // Signed area in screen space: negative means we are looking at the
        // back of the triangle, so it is skipped.
        const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
        if (area >= 0) continue;

        // Shading uses the world normal, not the screen one, so the light
        // stays fixed while the model turns.
        const n = normal(t);
        const shade = 0.34 + 0.66 * Math.max(0, n[0] * 0.42 + n[1] * 0.84 + n[2] * 0.34);

        faces.push({ a, b, c, depth: (a[2] + b[2] + c[2]) / 3, shade });
      }

      faces.sort((p, q) => q.depth - p.depth);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const f of faces) {
        ctx.beginPath();
        ctx.moveTo(f.a[0], f.a[1]);
        ctx.lineTo(f.b[0], f.b[1]);
        ctx.lineTo(f.c[0], f.c[1]);
        ctx.closePath();
        const fill = mix(palette.dark, palette.light, f.shade);
        ctx.fillStyle = fill;
        // Stroking the same path closes the hairline seams antialiasing
        // leaves between adjacent triangles.
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fill();
      }
    };

    const normal = (t) => {
      const ux = t[1][0] - t[0][0], uy = t[1][1] - t[0][1], uz = t[1][2] - t[0][2];
      const vx = t[2][0] - t[0][0], vy = t[2][1] - t[0][1], vz = t[2][2] - t[0][2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      return [nx / len, ny / len, nz / len];
    };

    const mix = (a, b, t) =>
      "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * t) + "," +
      Math.round(a[1] + (b[1] - a[1]) * t) + "," +
      Math.round(a[2] + (b[2] - a[2]) * t) + ")";

    /* ── Orbit ───────────────────────────────────────────────────────────── */

    let dragging = false;
    let lx = 0;
    let ly = 0;

    host.addEventListener("pointerdown", (e) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      host.setPointerCapture?.(e.pointerId);
      host.classList.add("dragging");
    });

    host.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      yaw += (e.clientX - lx) * 0.01;
      // Clamped short of straight down: past vertical the model turns inside
      // out and the shading inverts.
      pitch = Math.max(-0.2, Math.min(1.35, pitch + (e.clientY - ly) * 0.008));
      lx = e.clientX;
      ly = e.clientY;
      draw();
    });

    const stop = () => {
      dragging = false;
      host.classList.remove("dragging");
    };
    host.addEventListener("pointerup", stop);
    host.addEventListener("pointercancel", stop);

    host.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        dist = Math.max(150, Math.min(430, dist - e.deltaY * 0.35));
        draw();
      },
      { passive: false },
    );

    window.addEventListener("resize", () => {
      resize();
      draw();
    }, { passive: true });

    resize();

    return {
      set(next) {
        mesh = next;
        draw();
      },
      draw,
      spin(by) {
        yaw += by;
        draw();
      },
      get mesh() {
        return mesh;
      },
    };
  };

  /* ── Binary STL ──────────────────────────────────────────────────────────
     84-byte header, then 50 bytes per triangle. Binary rather than ASCII
     because an ASCII STL of this model is roughly six times the size for no
     benefit, and every slicer reads both. */

  const stl = (mesh) => {
    const count = mesh.tris.length;
    const buffer = new ArrayBuffer(84 + count * 50);
    const view = new DataView(buffer);

    const header = "Parametric bin - ardacanbakis.com";
    for (let i = 0; i < header.length; i++) view.setUint8(i, header.charCodeAt(i));
    view.setUint32(80, count, true);

    let o = 84;
    for (const t of mesh.tris) {
      const ux = t[1][0] - t[0][0], uy = t[1][1] - t[0][1], uz = t[1][2] - t[0][2];
      const vx = t[2][0] - t[0][0], vy = t[2][1] - t[0][1], vz = t[2][2] - t[0][2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;

      view.setFloat32(o, nx, true);
      view.setFloat32(o + 4, ny, true);
      view.setFloat32(o + 8, nz, true);
      o += 12;

      // STL is Z-up; the model is built Y-up, so the axes are swapped on the
      // way out rather than the model being built in a system nothing else
      // uses.
      for (const p of t) {
        view.setFloat32(o, p[0], true);
        view.setFloat32(o + 4, -p[2], true);
        view.setFloat32(o + 8, p[1], true);
        o += 12;
      }

      view.setUint16(o, 0, true);
      o += 2;
    }

    return new Blob([buffer], { type: "model/stl" });
  };

  global.Solid = { build, renderer, stl, CELL, UNIT };
})(window);
