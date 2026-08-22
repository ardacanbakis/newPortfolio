/* ==========================================================================
   Pan — the pan-and-zoom surface behind v27 (map) and v31 (canvas).

   Both versions replace scrolling with a plane you move around, and both need
   exactly the same things done correctly, so it is done once here:

   · **Zoom about a point.** Scaling about the origin and then correcting is
     the usual approach and it always drifts. This solves for the translation
     that keeps the world point under the cursor exactly where it was.
   · **Pinch.** Two pointers, tracked by id, using the distance between them.
     Without this a phone can pan but never zoom, which makes a plane bigger
     than the screen a dead end.
   · **Clamping.** You cannot lose the plane. Whatever you drag or zoom, the
     content stays at least partly on screen.
   · **A counter-scale.** Published as --inv so a version can keep pin labels
     and hit targets the same size on screen at any zoom.

   The transform is written as three custom properties rather than as a style
   string, so the stylesheet owns how they compose and this file never has to
   know whether a version wants a translate before or after its scale.

   Hung off window.Pan.
   ========================================================================== */

(function (global) {
  "use strict";

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  const create = (options) => {
    const viewport = options.viewport;
    const plane = options.plane;
    if (!viewport || !plane) return null;

    const min = options.min ?? 0.35;
    const max = options.max ?? 2.6;
    // The plane's own size in world units. For a fixed-size map this is the
    // map; for an open canvas it is the bounding box of everything on it.
    let world = options.world || { x: 0, y: 0, w: plane.offsetWidth, h: plane.offsetHeight };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const listeners = [];

    let x = 0;
    let y = 0;
    let k = 1;

    /* ── Writing the view ─────────────────────────────────────────────────
       Clamped so at least a quarter of the viewport is always over content.
       A plane you can throw off the edge of the screen and never find again
       is the single most common failure of this interaction. */

    const write = () => {
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const w = world.w * k;
      const h = world.h * k;

      // If the content is smaller than the viewport, centre it rather than
      // letting it wander.
      if (w <= vw) x = (vw - w) / 2 - world.x * k;
      else x = clamp(x, vw * 0.25 - w - world.x * k, vw * 0.75 - world.x * k);

      if (h <= vh) y = (vh - h) / 2 - world.y * k;
      else y = clamp(y, vh * 0.25 - h - world.y * k, vh * 0.75 - world.y * k);

      plane.style.setProperty("--px", x.toFixed(2) + "px");
      plane.style.setProperty("--py", y.toFixed(2) + "px");
      plane.style.setProperty("--k", k.toFixed(4));
      plane.style.setProperty("--inv", (1 / k).toFixed(4));

      listeners.forEach((fn) => fn({ x, y, k }));
    };

    /* Screen point → world point. Everything below is written in terms of
       this, which is what keeps the zoom honest. */
    const toWorld = (clientX, clientY) => {
      const r = viewport.getBoundingClientRect();
      return {
        wx: (clientX - r.left - x) / k,
        wy: (clientY - r.top - y) / k,
      };
    };

    /* ── Zoom about a point ───────────────────────────────────────────────
       Solve for the translation that leaves the world point under the cursor
       where it was: screen = world · k + t, so t = screen − world · k'. */

    const zoomAt = (clientX, clientY, factor) => {
      const next = clamp(k * factor, min, max);
      if (next === k) return;

      const r = viewport.getBoundingClientRect();
      const sx = clientX - r.left;
      const sy = clientY - r.top;
      const { wx, wy } = toWorld(clientX, clientY);

      k = next;
      x = sx - wx * k;
      y = sy - wy * k;
      write();
    };

    const zoomBy = (factor) => {
      const r = viewport.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
    };

    /* ── Animated moves ───────────────────────────────────────────────────
       Used by "go to this place" and by fit(). Eased in script rather than
       with a CSS transition because a transition on the transform would also
       lag every drag frame behind the finger. */

    let animating = 0;

    const glide = (tx, ty, tk, ms = 520) => {
      cancelAnimationFrame(animating);

      if (reduced || ms === 0) {
        x = tx;
        y = ty;
        k = tk;
        write();
        return;
      }

      const x0 = x;
      const y0 = y;
      const k0 = k;
      const start = performance.now();

      const step = (now) => {
        const t = Math.min(1, (now - start) / ms);
        // easeInOutCubic — the move should start and end at rest.
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        x = x0 + (tx - x0) * e;
        y = y0 + (ty - y0) * e;
        k = k0 + (tk - k0) * e;
        write();
        if (t < 1) animating = requestAnimationFrame(step);
      };

      animating = requestAnimationFrame(step);
    };

    /* Centre a world point, optionally at a given zoom. */
    const focus = (wx, wy, tk = k, ms) => {
      const scale = clamp(tk, min, max);
      glide(viewport.clientWidth / 2 - wx * scale, viewport.clientHeight / 2 - wy * scale, scale, ms);
    };

    const fit = (padding = 0.9, ms) => {
      const scale = clamp(
        Math.min(viewport.clientWidth / world.w, viewport.clientHeight / world.h) * padding,
        min,
        max,
      );
      focus(world.x + world.w / 2, world.y + world.h / 2, scale, ms);
    };

    /* ── Drag ─────────────────────────────────────────────────────────────
       Pointers tracked by id so a second finger starts a pinch rather than
       fighting the first one for the pan. */

    const pointers = new Map();
    let last = null;
    let pinch = 0;
    let moved = false;

    viewport.addEventListener("pointerdown", (event) => {
      // Anything interactive keeps its own click.
      if (event.target.closest("a, button, input, textarea, select")) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      viewport.setPointerCapture?.(event.pointerId);
      moved = false;

      if (pointers.size === 1) {
        last = { x: event.clientX, y: event.clientY };
        viewport.classList.add("dragging");
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinch);
        pinch = dist;
        moved = true;
        return;
      }

      if (!last) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;

      x += dx;
      y += dy;
      last = { x: event.clientX, y: event.clientY };
      cancelAnimationFrame(animating);
      write();
    });

    const release = (event) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (pointers.size === 0) {
        last = null;
        viewport.classList.remove("dragging");
      } else {
        const [first] = [...pointers.values()];
        last = { x: first.x, y: first.y };
      }
    };

    viewport.addEventListener("pointerup", release);
    viewport.addEventListener("pointercancel", release);

    /* ── Wheel ────────────────────────────────────────────────────────────
       A trackpad pinch arrives as a wheel event with ctrlKey set; an ordinary
       two-finger scroll arrives without it and should pan, not zoom. */

    viewport.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        cancelAnimationFrame(animating);

        if (event.ctrlKey || options.wheelZoom) {
          zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * 0.002));
        } else {
          x -= event.deltaX;
          y -= event.deltaY;
          write();
        }
      },
      { passive: false },
    );

    /* ── Keyboard ─────────────────────────────────────────────────────────
       The plane is a widget, so it answers arrows when it has focus. The
       version's own index list is the primary route; this is for someone who
       has tabbed onto the map itself. */

    viewport.tabIndex = viewport.tabIndex >= 0 ? viewport.tabIndex : 0;

    viewport.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 220 : 80;
      const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      const m = moves[event.key];

      if (m) {
        event.preventDefault();
        x += m[0];
        y += m[1];
        write();
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomBy(1.2);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomBy(1 / 1.2);
      } else if (event.key === "0") {
        event.preventDefault();
        fit();
      }
    });

    let resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => write(), 120);
      },
      { passive: true },
    );

    write();

    return {
      focus,
      fit,
      zoomBy,
      zoomAt,
      toWorld,
      write,
      setWorld: (next) => {
        world = next;
        write();
      },
      /* True when the last gesture actually moved the plane — a version uses
         this to tell a drag from a click on a pin. */
      get dragged() {
        return moved;
      },
      get view() {
        return { x, y, k };
      },
      on: (fn) => {
        listeners.push(fn);
        fn({ x, y, k });
      },
      reduced,
    };
  };

  global.Pan = { create };
})(window);
