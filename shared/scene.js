/* ==========================================================================
   Scene — the world clock behind versions 41 to 50.

   These ten versions are decks: one screen, no scrollbar, content advancing a
   panel at a time. What makes them different from versions 19 to 23 is that
   the background is not a backdrop, it is a *place*, and moving through the
   content moves you through it — down a mineshaft, along a railway, from dawn
   to midnight, from the surface of the sea to the bottom of it.

   That needs something the deck engine deliberately does not provide. A deck
   publishes a discrete index: panel 4, panel 5. A world needs a continuous
   position, because the sun has to glide rather than jump and the train has
   to keep moving while you read. So this file sits on top of the deck and
   turns its index into a number that eases.

   What it provides, and why each piece is here rather than in ten copies:

   * **A critically-damped spring**, not a tween. A tween has a duration, so
     changing target halfway through it either restarts or fights itself; skip
     three panels quickly on a tween and the world lurches. A spring has no
     duration — it always moves from wherever it is toward wherever the target
     now is, so rapid navigation reads as momentum instead of as a stutter.

   * **A loop that stops.** It runs while the spring is still settling, and
     otherwise only for renderers that declare themselves ambient — rain,
     starfields, water. Everything else parks the moment the world arrives,
     which on a phone is the difference between a scene and a heater.

   * **One canvas helper.** Device pixel ratio capped (harder on small
     screens), resize handled with a debounce, context re-scaled after every
     resize. Ten hand-rolled copies of this is ten chances to ship a canvas
     that is blurry on a Retina screen or a 4x-oversampled one that drops
     frames on a mid-range Android.

   * **Reduced motion, taken seriously.** The spring snaps, the ambient loop
     never starts, and each scene is asked to draw exactly one frame per
     change. The place still changes as you move through the content; it just
     does not move on its own.

   Hung off window.Scene.
   ========================================================================== */

(function (global) {
  "use strict";

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Hermite ramp. 0 below `a`, 1 above `b`, smooth in between. */
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a || 1), 0, 1);
    return t * t * (3 - 2 * t);
  };

  /** A ramp that is 1 only inside [b, c], used to fade a feature in and out
      of a scene as the world passes through it. */
  const band = (a, b, c, d, x) => smoothstep(a, b, x) * (1 - smoothstep(c, d, x));

  /** Mix two "r,g,b" triples. Kept as arrays rather than CSS strings so a
      scene can interpolate a five-stop palette without parsing anything. */
  const mix = (c1, c2, t) => [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];

  const rgb = (c, a) => (a === undefined ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`);

  /** Sample a palette of N colours at position u in [0,1]. */
  const ramp = (stops, u) => {
    const x = clamp(u, 0, 1) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(x));
    return mix(stops[i], stops[i + 1], x - i);
  };

  /* A small deterministic generator. Scenery has to be identical on every
     load and in every language — a mountain range that reshuffles when you
     switch to Turkish reads as a bug, and a procedural world that cannot be
     reproduced cannot be debugged. */
  const prng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  };

  /* ── Canvas ─────────────────────────────────────────────────────────── */

  /**
   * A canvas sized to its parent in CSS pixels and backed at device
   * resolution, with the context pre-scaled so everything drawn afterwards is
   * in CSS pixels and nothing has to think about dpr again.
   */
  const canvas = (parent, options = {}) => {
    const el = document.createElement("canvas");
    el.className = options.className || "scene-canvas";
    parent.appendChild(el);

    const ctx = el.getContext("2d", { alpha: options.alpha !== false });
    const state = { canvas: el, ctx, w: 0, h: 0, dpr: 1 };

    const resize = () => {
      const r = parent.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));

      /* Two caps, not one. A phone at dpr 3 backing a full-screen canvas is
         asking for nine times the fill rate of a CSS-pixel one, which is
         where a scene stops holding sixty frames. */
      const cap = w < 600 ? 1.5 : 2;
      const dpr = Math.min(global.devicePixelRatio || 1, cap);

      if (w === state.w && h === state.h && dpr === state.dpr) return false;

      state.w = w;
      state.h = h;
      state.dpr = dpr;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = w + "px";
      el.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    resize();
    state.resize = resize;
    return state;
  };

  /* ── The world clock ────────────────────────────────────────────────── */

  /**
   * @param {object} deck    a window.Deck instance
   * @param {object} options
   *   places   – [{ at: 0..1, label, i18n }] named positions in the world
   *   stiffness– spring constant; higher arrives sooner
   *   ambient  – true if the scene animates when nothing is moving
   */
  const stage = (deck, options = {}) => {
    const reduced =
      deck.reduced || global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const last = Math.max(1, deck.length - 1);
    const frames = [];
    const places = options.places || [];
    /* Tuned by watching the world fall behind. A critically damped spring
       settles in roughly 4/sqrt(k) seconds, so k=9 takes about a second and a
       half — press next five times quickly and the scene is still three
       panels back when you have started reading. k=22 lands in about 0.85s,
       which still trails enough to read as momentum without ever feeling
       like the background belongs to a different page. */
    const stiffness = options.stiffness || 22;
    const ambient = !!options.ambient && !reduced;

    const root = document.documentElement;
    const placeEl = document.getElementById("scene-place");

    let target = deck.index / last;
    let u = target;
    let velocity = 0;
    let running = false;
    let lastTime = 0;
    let visible = true;
    let placeIndex = -1;

    /* The world publishes itself to CSS as well as to the renderers. A scene
       that is mostly a sky does not need a canvas at all — it needs one
       number and a gradient that reads it. */
    const publish = () => {
      root.style.setProperty("--u", u.toFixed(4));
      root.style.setProperty("--slide", (u * last).toFixed(3));
    };

    /* Place names live with the scene rather than in the shared dictionary.
       "Twilight zone", "Cutting bed", "Fourth floor — archive" are vocabulary
       belonging to one world; putting fifty of them into site.js would make
       every other version carry strings it can never use. So a place takes
       its own translations inline:

           { at: 0.42, label: { en: "Noon", tr: "Öğle", es: "Mediodía" } }

       A bare string is accepted too, for a label that is the same everywhere.

       Note the deliberate absence of data-i18n: applyLanguage() sets
       textContent from the shared dictionary, so a data-i18n here would be
       overwritten with nothing the moment the language changed. */
    const labelFor = (p) => {
      if (typeof p.label === "string") return p.label;
      const lang = (global.Portfolio && global.Portfolio.lang) || "en";
      return p.label[lang] || p.label.en || "";
    };

    const namePlace = (force) => {
      if (!places.length || !placeEl) return;
      let n = 0;
      places.forEach((p, i) => {
        if (u >= p.at - 0.0001) n = i;
      });
      if (n === placeIndex && !force) return;
      placeIndex = n;
      placeEl.textContent = labelFor(places[n]);
      placeEl.dataset.place = String(n);
    };

    const draw = (dt) => {
      for (let i = 0; i < frames.length; i++) frames[i](u, dt);
    };

    const tick = (now) => {
      if (!running) return;

      /* Clamped, because a backgrounded tab hands you a delta of several
         seconds on the frame it wakes up and an unclamped spring integrates
         that into a world that has jumped somewhere absurd. */
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;

      const k = stiffness;
      const c = 2 * Math.sqrt(k); // critical damping: arrives without overshoot
      velocity += (-k * (u - target) - c * velocity) * dt;
      u += velocity * dt;

      const settled = Math.abs(u - target) < 0.0004 && Math.abs(velocity) < 0.0015;
      if (settled) {
        u = target;
        velocity = 0;
      }

      publish();
      namePlace();
      draw(dt);

      if (settled && !ambient) {
        running = false;
        lastTime = 0;
        return;
      }
      global.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !visible) return;
      running = true;
      lastTime = 0;
      global.requestAnimationFrame(tick);
    };

    deck.on((i) => {
      target = i / last;
      if (reduced) {
        u = target;
        velocity = 0;
        publish();
        namePlace();
        draw(0);
        return;
      }
      start();
    });

    /* A hidden tab keeps no world running. */
    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      if (visible && (ambient || u !== target)) start();
      else running = false;
    });

    let resizeTimer = 0;
    global.addEventListener(
      "resize",
      () => {
        global.clearTimeout(resizeTimer);
        resizeTimer = global.setTimeout(() => {
          frames.forEach((f) => f.onResize && f.onResize());
          publish();
          if (reduced) draw(0);
          else start();
        }, 120);
      },
      { passive: true },
    );

    if (global.Portfolio) global.Portfolio.onLanguageChange(() => namePlace(true));

    publish();

    return {
      get u() {
        return u;
      },
      get slide() {
        return u * last;
      },
      reduced,
      /** Register a per-frame renderer. Returns an unsubscribe. */
      onFrame(fn) {
        frames.push(fn);
        if (reduced) {
          publish();
          namePlace();
          fn(u, 0);
        } else {
          start();
        }
        return () => {
          const i = frames.indexOf(fn);
          if (i >= 0) frames.splice(i, 1);
        };
      },
      /** Ask for a frame from outside — a pointer moved, a resize landed. */
      poke() {
        if (reduced) draw(0);
        else start();
      },
      namePlace,
    };
  };

  global.Scene = { stage, canvas, clamp, lerp, smoothstep, band, mix, rgb, ramp, prng };
})(window);
