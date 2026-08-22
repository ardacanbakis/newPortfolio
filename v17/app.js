/* ==========================================================================
   v17 — scouter behaviour.

   The power level is not a decoration with a made-up number behind it. It is
   computed from what is actually on each card:

       power = 800 × technologies + 600 × links + scope

   The first two are counted out of the DOM, so adding a technology to a
   project raises its reading. `scope` is the one hand-set figure — the part
   a count of tags cannot know — and it lives on the article in the markup.

   One project reads past the device's range. That is the moment the whole
   version is built around, so it is deliberately reserved for the largest
   piece of work rather than being triggered at random.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const FX = window.FX;
  if (!P) return;

  const root = document.documentElement;

  P.wireStandardPage();

  /* ── Power levels ─────────────────────────────────────────────────────── */

  const PER_TECH = 800;
  const PER_LINK = 600;
  const RANGE = 9000; // what the device can read before it fails

  const projects = [...document.querySelectorAll(".project")];

  const powerOf = (project) => {
    const tech = project.querySelectorAll(".project-tags li").length;
    const links = project.querySelectorAll(".project-links a").length;
    const scope = parseInt(project.dataset.scope || "0", 10) || 0;
    return tech * PER_TECH + links * PER_LINK + scope;
  };

  const readings = new Map();
  let total = 0;

  projects.forEach((project) => {
    const value = powerOf(project);
    readings.set(project, value);
    total += value;

    const body = project.querySelector(".project-body");
    const title = project.querySelector(".project-title");
    if (!body || !title) return;

    const row = document.createElement("div");
    row.className = "power";
    // Dashes, not a zero: an unscanned card has no reading yet, and a bare
    // 0 reads as a broken counter rather than as "not measured".
    row.innerHTML =
      '<span class="power-label">POWER LEVEL</span><span class="power-value">- - - -</span>';
    title.after(row);

    if (value > RANGE) project.classList.add("over");
  });

  /* ── Counters ─────────────────────────────────────────────────────────
     Numbers climb rather than appearing. Driven by one shared clock instead
     of a timer per element, so six cards scrolling past at once is still one
     animation frame's worth of work. */

  const counters = [];

  const countTo = (el, value, ms) => {
    counters.push({ el, value, ms, started: performance.now() });
    if (counters.length === 1) requestAnimationFrame(runCounters);
  };

  const runCounters = (now) => {
    for (let i = counters.length - 1; i >= 0; i--) {
      const c = counters[i];
      const t = Math.min(1, (now - c.started) / c.ms);
      // easeOutQuart: fast at first, then settling on the final digits.
      const eased = 1 - Math.pow(1 - t, 4);
      c.el.textContent = Math.round(c.value * eased).toLocaleString("en-US");
      if (t >= 1) counters.splice(i, 1);
    }
    if (counters.length) requestAnimationFrame(runCounters);
  };

  /* ── Reticle ──────────────────────────────────────────────────────────
     Locks onto whichever card is nearest the middle of the viewport. Its
     geometry is written as custom properties so the movement is a single
     CSS transition rather than a position update every frame. */

  const scouter = document.querySelector(".scouter");
  const reticle = document.getElementById("reticle");
  const roValue = document.getElementById("ro-value");
  const roTarget = document.getElementById("ro-target");
  const roBar = document.getElementById("ro-bar");

  const reduced = FX?.reducedMotion;
  let locked = null;
  let cracked = false;

  const scanned = new WeakSet();

  const updateReticle = () => {
    if (!reticle) return;

    const mid = window.innerHeight * 0.48;
    let best = null;
    let bestDist = Infinity;

    for (const project of projects) {
      const r = project.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = project;
      }
    }

    /* Nothing in view: the reticle and the readout both stand down. Leaving
       a panel parked in the corner of a fixed overlay would cover a piece of
       every section below the work, permanently, for no information. */
    if (!best) {
      reticle.style.setProperty("--ro", "0");
      scouter?.classList.remove("scanning");
      locked?.classList.remove("locked");
      locked = null;
      return;
    }

    scouter?.classList.add("scanning");

    const r = best.getBoundingClientRect();
    // Inset a little: corner marks sitting exactly on the border read as
    // part of the card rather than as something aimed at it.
    reticle.style.setProperty("--rx", Math.round(r.left - 10) + "px");
    reticle.style.setProperty("--ry", Math.round(r.top - 10) + "px");
    reticle.style.setProperty("--rw", Math.round(r.width + 20) + "px");
    reticle.style.setProperty("--rh", Math.round(r.height + 20) + "px");
    reticle.style.setProperty("--ro", "1");

    if (best === locked) return;

    locked?.classList.remove("locked");
    best.classList.add("locked");
    locked = best;

    const value = readings.get(best) || 0;
    const name = best.querySelector(".project-title")?.textContent.trim() || "";

    if (roTarget) roTarget.textContent = name.toUpperCase();
    if (roBar) roBar.style.width = Math.min(100, (value / RANGE) * 100).toFixed(1) + "%";
    if (roValue) {
      if (reduced) roValue.textContent = value.toLocaleString("en-US");
      else countTo(roValue, value, 700);
    }

    scouter?.classList.toggle("overload", value > RANGE);

    /* Over range. Once only, and never under reduced motion — a crack
       animation and a flashing alarm is exactly the sort of thing that
       setting exists to switch off. */
    if (value > RANGE && !cracked && !reduced) {
      cracked = true;
      scouter?.classList.add("cracked");
      setTimeout(() => {
        scouter?.classList.remove("cracked");
        scouter?.classList.remove("overload");
      }, 4200);
    }
  };

  /* ── Scanning the cards ───────────────────────────────────────────────
     Deliberately not tied to the reticle. The reticle locks onto whichever
     card is nearest the middle of the viewport, and on a three-column grid
     that is one card per row for as long as the row is on screen — so four
     of the six would never have been read. Each card counts up on its own
     arrival instead, and the reticle goes on doing the aiming. */

  const scan = (project) => {
    if (scanned.has(project)) return;
    scanned.add(project);

    const out = project.querySelector(".power-value");
    const value = readings.get(project) || 0;
    if (!out) return;

    if (reduced) out.textContent = value.toLocaleString("en-US");
    else countTo(out, value, 1100);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          scan(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.3 },
    );
    projects.forEach((project) => io.observe(project));
  } else {
    projects.forEach(scan);
  }

  /* ── Total, in the hero ───────────────────────────────────────────────── */

  const heroPower = document.getElementById("hero-power");
  if (heroPower) {
    if (reduced) heroPower.textContent = total.toLocaleString("en-US");
    else countTo(heroPower, total, 1800);
  }

  /* ── Charge meters ────────────────────────────────────────────────────── */

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("charged");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );
    document.querySelectorAll(".service").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".service").forEach((el) => el.classList.add("charged"));
  }

  /* ── Scroll ───────────────────────────────────────────────────────────── */

  P.onScroll(updateReticle);
  window.addEventListener("resize", updateReticle, { passive: true });

  if (!FX) return;

  FX.customCursor();
  FX.magnetic();
  FX.sectionTransitions();

  /* Speed lines need an unsigned velocity; fx.js publishes a signed one, and
     CSS abs() is still too new to depend on. */
  if (!reduced) {
    const lines = document.createElement("div");
    lines.className = "speedlines";
    lines.setAttribute("aria-hidden", "true");
    document.body.appendChild(lines);

    const pump = () => {
      const vel = parseFloat(getComputedStyle(root).getPropertyValue("--fx-vel")) || 0;
      // Nothing below a real flick registers, so an ordinary read is calm.
      const speed = Math.max(0, Math.min(1, (Math.abs(vel) - 0.22) * 2.2));
      root.style.setProperty("--speed", speed.toFixed(3));
      requestAnimationFrame(pump);
    };

    FX.scrollVelocity();
    requestAnimationFrame(pump);
  }

  /* ── Aura ─────────────────────────────────────────────────────────────
     Ki rising off the page: upward streaks that accelerate, plus the
     occasional arc between two of them. Counts scale with viewport area, so
     a phone never runs a desktop load. */

  const COUNT = FX.particleCount(70, 26, 130);
  let motes = [];
  let vw = 0;
  let vh = 0;

  const spawn = (mote) => {
    mote.x = Math.random() * vw;
    mote.y = vh + Math.random() * vh * 0.5;
    mote.len = 12 + Math.random() * 46;
    mote.speed = 1.1 + Math.random() * 3.2;
    mote.w = 1 + Math.random() * 2.2;
    mote.warm = Math.random() < 0.42;
    mote.a = 0.16 + Math.random() * 0.4;
    return mote;
  };

  FX.background({
    zIndex: 0,
    className: "fx-canvas aura",

    init(w, h) {
      vw = w;
      vh = h;
      motes = Array.from({ length: COUNT }, () => spawn({}));
      // Scatter them up the screen so the first second is not an empty page.
      motes.forEach((m) => (m.y = Math.random() * (vh + 200)));
    },

    onResize(w, h) {
      vw = w;
      vh = h;
    },

    draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const m of motes) {
        m.y -= m.speed;
        // Ki accelerates as it rises rather than drifting at a constant rate.
        m.speed += 0.012;
        if (m.y + m.len < -20) spawn(m);

        ctx.strokeStyle = m.warm
          ? "rgba(240, 160, 60, " + m.a + ")"
          : "rgba(122, 246, 138, " + m.a + ")";
        ctx.lineWidth = m.w;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x, m.y + m.len);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
    },
  });
});
