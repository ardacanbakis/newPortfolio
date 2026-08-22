/* ==========================================================================
   v16 — page behaviour.

   Three jobs, in order of how much they matter:

   1. Drive the camera and the palette from the scroll position. One number,
      derived purely from scrollY, decides the pitch, the yaw, the colour
      progress and the render resolution — so scrolling back up rewinds the
      whole effect exactly instead of replaying it.

   2. Dress the shared content in the theme: tech tags become type slabs,
      each project grows a level and four stat bars, and dialogue prints a
      character at a time.

   3. Everything else — language, form, menu, footer — is the shared wiring.

   All of it is enhancement. With this file removed the page is a complete,
   readable document in four shades of green.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  P.wireStandardPage();

  /* ── Palette ──────────────────────────────────────────────────────────
     Interpolated here rather than with color-mix() in the stylesheet: it
     keeps the CSS legible, makes the no-JavaScript fallback exactly the
     handheld palette, and means the values are written once per step rather
     than resolved by every rule on every frame. */

  const RAMP = {
    "--gb-ink": ["#081820", "#1b2430"],
    "--gb-mid": ["#346856", "#7d8a99"],
    "--gb-soft": ["#88c070", "#dfe7ef"],
    "--gb-paper": ["#e0f8d0", "#f7f9fb"],
    "--gb-accent": ["#081820", "#c8372d"],
  };

  const mix = (a, b, t) => {
    const n = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
    return (
      "#" +
      [0, 1, 2]
        .map((i) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t).toString(16).padStart(2, "0"))
        .join("")
    );
  };

  let paletteStep = -1;

  const setPalette = (col) => {
    // Twenty-four steps: fine enough to read as a fade, coarse enough that
    // the whole page is not restyled sixty times a second.
    const step = Math.round(col * 24);
    if (step === paletteStep) return;
    paletteStep = step;

    const t = step / 24;
    for (const key in RAMP) root.style.setProperty(key, mix(RAMP[key][0], RAMP[key][1], t));
  };

  /* ── The world ────────────────────────────────────────────────────────
     Straight down and four colours at the top of the page; tilted, turned
     and in full colour by the time the work arrives. */

  const world = window.Voxel ? window.Voxel.create(document.getElementById("world")) : null;

  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  let camDrift = 0;

  const updateWorld = () => {
    const vh = window.innerHeight;
    const y = window.scrollY;

    const turn = easeInOut(clamp01(y / (vh * 1.25)));
    const col = clamp01(y / (vh * 1.5));

    root.style.setProperty("--col", col.toFixed(3));
    // Once the text arrives the world steps back and becomes wallpaper.
    root.style.setProperty("--world-op", (1 - clamp01((y - vh * 0.5) / (vh * 0.9)) * 0.8).toFixed(3));
    root.style.setProperty("--hint-op", clamp01(1 - y / 200).toFixed(3));
    setPalette(col);

    world?.setProgress({
      // 90° is exactly top-down, where the side faces vanish and the world
      // reads as the flat tile map it is pretending to be.
      pitch: Math.PI / 2 - turn * 0.66,
      yaw: -turn * 0.72 + camDrift,
      col,
    });
  };

  P.onScroll(updateWorld);

  /* A slow idle orbit so the world never looks like a still. Cheap: the
     renderer is already running its own loop, this only moves the camera. */
  if (!reduced && world) {
    const drift = (now) => {
      camDrift = Math.sin(now / 7000) * 0.07;
      updateWorld();
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  }

  /* ── Type slabs ───────────────────────────────────────────────────────
     Each technology gets a fixed colour, the way the games colour a type.
     A lookup rather than a hash: hashed colours put two greens next to each
     other often enough to look like a bug. */

  const TYPES = {
    react: ["#7ac0e8", "#10222c"],
    typescript: ["#6390f0", "#0b1430"],
    "three.js": ["#a98ff3", "#170b30"],
    webassembly: ["#b7b7ce", "#1a1a24"],
    webgl: ["#f4a261", "#2b1405"],
    "web audio": ["#d685ad", "#2c0c1c"],
    glsl: ["#ee8130", "#2a0f00"],
    "spotify api": ["#7ac74c", "#0f2408"],
    swift: ["#f2795f", "#2b0d05"],
    appkit: ["#c9c2a5", "#22200f"],
    coreaudio: ["#96d9d2", "#082623"],
    "c#": ["#a382d6", "#170c28"],
    "next.js": ["#c8c8c8", "#111111"],
    supabase: ["#5fd39a", "#062318"],
    "postgresql rls": ["#6390f0", "#0b1430"],
    i18n: ["#f2d24b", "#2b2404"],
    "spring boot": ["#8fd14f", "#12240a"],
    java: ["#e07a5f", "#2a0d05"],
    postgresql: ["#6390f0", "#0b1430"],
    javascript: ["#f7d02c", "#2b2404"],
    css: ["#7fb3f5", "#0b1a30"],
    bootstrap: ["#b18cf0", "#190a30"],
  };

  document.querySelectorAll(".project-tags li").forEach((li) => {
    const pair = TYPES[li.textContent.trim().toLowerCase()];
    if (!pair) return;
    li.style.setProperty("--tag", pair[0]);
    li.style.setProperty("--tag-ink", pair[1]);
  });

  /* ── Level and stats ──────────────────────────────────────────────────
     Built here rather than written into the markup six times over: the
     numbers already live on the article as data attributes, and generating
     the bars from them keeps the two from drifting apart. */

  const STAT_LABELS = ["SCOPE", "DEPTH", "CRAFT", "SPEED"];
  const STAT_MAX = 150;

  document.querySelectorAll(".project").forEach((project) => {
    const body = project.querySelector(".project-body");
    const title = project.querySelector(".project-title");
    const entry = project.querySelector(".dex-entry");
    if (!body || !title || !entry) return;

    const lv = document.createElement("span");
    lv.className = "dex-lv";
    lv.textContent = "LV " + (project.dataset.lv || "5");
    title.after(lv);

    const stats = document.createElement("div");
    stats.className = "dex-stats";

    (project.dataset.stats || "").split(",").forEach((raw, i) => {
      const value = parseInt(raw, 10);
      if (!Number.isFinite(value)) return;
      const row = document.createElement("div");
      row.className = "dex-stat";
      row.innerHTML =
        "<span>" + STAT_LABELS[i] + "</span><i></i><b>" + value + "</b>";
      row.querySelector("i").style.setProperty(
        "--fill-target",
        Math.round((value / STAT_MAX) * 100) + "%",
      );
      stats.appendChild(row);
    });

    entry.after(stats);
  });

  /* Bars fill on arrival, not on load — an animation nobody sees is just a
     slower page. */
  const fillBars = (scope) => {
    scope.querySelectorAll(".dex-stat i").forEach((bar) => {
      bar.style.setProperty("--fill", bar.style.getPropertyValue("--fill-target"));
    });
  };

  /* ── Typewriter ───────────────────────────────────────────────────────
     Dialogue prints a character at a time. The full text stays in the DOM
     until this takes over, so the page is complete for search engines and
     for anyone with scripting off. */

  const typeOut = (el) => {
    if (el.dataset.typed) return;
    el.dataset.typed = "1";

    const text = el.textContent;
    if (reduced || text.length < 4) return;

    // Freeze the height first: text arriving one character at a time would
    // otherwise reflow the whole card on every frame.
    el.style.minHeight = el.offsetHeight + "px";
    el.classList.add("typing");
    el.textContent = "";

    // Longer entries print faster, so no single box outstays its welcome.
    const perChar = Math.max(6, Math.min(20, 2000 / text.length));
    let i = 0;

    const step = () => {
      // A few characters per tick keeps the timer count low without making
      // the effect look like it is jumping.
      i = Math.min(text.length, i + 2);
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, perChar * 2);
      else el.style.minHeight = "";
    };

    step();
  };

  const typers = [...document.querySelectorAll("[data-type]")];

  /* A language change replaces the text wholesale, so the effect is retired
     rather than restarted — re-typing six paragraphs because someone chose
     Turkish would be an odd thing to inflict on them. */
  P.onLanguageChange(() => {
    typers.forEach((el) => {
      el.dataset.typed = "1";
      el.classList.remove("typing");
      el.style.minHeight = "";
    });
  });

  /* ── Reveals ──────────────────────────────────────────────────────────── */

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.matches("[data-type]")) typeOut(el);
          if (el.matches(".project")) fillBars(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.25 },
    );

    typers.forEach((el) => io.observe(el));
    document.querySelectorAll(".project").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".project").forEach(fillBars);
  }

  /* ── The encounter ────────────────────────────────────────────────────
     One pass of the old battle wipe as the work arrives. Bars close and
     open once; there is no flashing, and under reduced motion it never
     runs at all. */

  const encounter = document.getElementById("encounter");
  const projects = document.getElementById("projects");

  const CRY = {
    en: "A wild PROJECT appeared!",
    tr: "Vahşi bir PROJE belirdi!",
    es: "¡Un PROYECTO salvaje apareció!",
  };

  if (encounter && projects && !reduced && "IntersectionObserver" in window) {
    for (let i = 0; i < 12; i++) {
      const bar = document.createElement("span");
      bar.style.setProperty("--i", String(i));
      encounter.appendChild(bar);
    }

    const cry = document.createElement("p");
    cry.className = "encounter-cry";
    cry.setAttribute("aria-hidden", "true");
    document.body.appendChild(cry);

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();

        cry.textContent = CRY[P.lang] || CRY.en;
        encounter.classList.add("play");
        cry.classList.add("play");

        // Nothing left to do once it has run; take both out of the way so
        // they cannot intercept anything.
        setTimeout(() => {
          encounter.classList.remove("play");
          cry.remove();
        }, 2200);
      },
      { threshold: 0.08 },
    );

    io.observe(projects);
  }

  /* ── Level meter ──────────────────────────────────────────────────────── */

  const fill = document.getElementById("exp-fill");
  const lvOut = document.getElementById("exp-lv");

  if (fill && lvOut) {
    P.onScroll(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp01(window.scrollY / max) : 0;
      fill.style.width = (p * 100).toFixed(1) + "%";
      lvOut.textContent = String(2 + Math.floor(p * 8));
    });
  }

  /* ── Trainer card clock ───────────────────────────────────────────────
     Play time, counted from arrival. It is the one number on the card that
     is honestly live. */

  const clock = document.getElementById("tc-time");
  if (clock) {
    const started = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - started) / 1000);
      clock.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    };
    tick();
    setInterval(tick, 1000);
  }

  updateWorld();
});
