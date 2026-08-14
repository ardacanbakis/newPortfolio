/* ==========================================================================
   v30 — Torch.

   Three jobs: move the beam, offer the switch, and know when not to bother.

   The beam is written as two custom properties on the root and nothing else
   moves — no element is repositioned, no layout is read. The values are
   eased toward the pointer rather than snapped to it, which is the difference
   between carrying a lamp and teleporting one.

   The switch is the important part. The default is only "unlit" when a beam
   is actually usable: a fine pointer, no reduced-motion preference, no
   high-contrast preference. Everything else opens lit, and whatever the
   visitor chooses is remembered.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();

  const root = document.documentElement;
  const ask = (q) => window.matchMedia(q).matches;

  const reduced = ask("(prefers-reduced-motion: reduce)");
  const contrast = ask("(prefers-contrast: more)");
  const noPointer = ask("(any-pointer: none)");
  const coarse = !ask("(pointer: fine)");

  /* Anyone who cannot aim, or has said they want less, gets a lit page. */
  const mustBeLit = reduced || contrast || noPointer;

  const STORE = "v30-lights";
  const saved = (() => {
    try {
      return localStorage.getItem(STORE);
    } catch {
      return null;
    }
  })();

  let lit = mustBeLit || saved === "on";

  /* ── Markup ───────────────────────────────────────────────────────────── */

  const dark = document.createElement("div");
  dark.className = "dark";
  dark.setAttribute("aria-hidden", "true");

  const glow = document.createElement("div");
  glow.className = "glow";
  glow.setAttribute("aria-hidden", "true");

  document.body.append(glow, dark);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "lights";
  button.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>' +
    '<span class="off-label">Lights on</span><span class="on-label">Lights off</span>';
  document.querySelector(".header-actions")?.prepend(button);

  const applyLights = () => {
    root.classList.toggle("lit", lit);
    button.setAttribute("aria-pressed", String(lit));
  };

  button.addEventListener("click", () => {
    lit = !lit;
    applyLights();
    try {
      localStorage.setItem(STORE, lit ? "on" : "off");
    } catch {
      /* private mode — the choice simply does not persist */
    }
  });

  applyLights();

  /* ── Marginalia ───────────────────────────────────────────────────────
     Real sentences in the document, placed next to the thing they annotate.
     They are readable to a screen reader and to search engines whatever the
     lighting is doing. */

  const NOTES = {
    gridsmith: "The hardest part was not the geometry — it was making the geometry fast enough to feel live.",
    musicvisualizer: "Onset detection is the difference between a visualiser and a light show.",
    hushbar: "Written twice, from scratch, because a wrapper would not have flipped the hardware flag.",
    wedding: "Row-level security means a wrong link returns nothing, not someone else's invitation.",
    vetapp: "The first thing I built that other people had to use every day.",
    gym: "Where I learned that a layout is not finished until it survives a phone.",
  };

  document.querySelectorAll(".project").forEach((project) => {
    const text = NOTES[project.dataset.project];
    if (!text) return;
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = text;
    project.querySelector(".project-body")?.appendChild(note);
  });

  if (mustBeLit) return;

  /* ── The beam ─────────────────────────────────────────────────────────
     Eased toward the pointer. The loop parks when the beam has caught up and
     nothing is moving, so an idle tab is not running an animation frame. */

  const hint = document.createElement("p");
  hint.className = "torch-hint";
  hint.setAttribute("aria-hidden", "true");
  hint.textContent = coarse ? "Drag to look around" : "Move the light";
  document.body.appendChild(hint);

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight * 0.4;
  let x = tx;
  let y = ty;
  let running = false;

  // A coarse pointer aims worse and covers what it points at, so the beam is
  // wider and sits above the finger rather than under it.
  const LIFT = coarse ? 70 : 0;
  root.style.setProperty("--r", coarse ? "150px" : "190px");

  const step = () => {
    const dx = tx - x;
    const dy = ty - y;
    x += dx * 0.18;
    y += dy * 0.18;

    root.style.setProperty("--mx", x.toFixed(1) + "px");
    root.style.setProperty("--my", y.toFixed(1) + "px");

    if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) requestAnimationFrame(step);
    else running = false;
  };

  const aim = (cx, cy) => {
    tx = cx;
    ty = cy - LIFT;
    root.style.setProperty("--hint", "0");
    if (running) return;
    running = true;
    requestAnimationFrame(step);
  };

  window.addEventListener("pointermove", (e) => aim(e.clientX, e.clientY), { passive: true });
  window.addEventListener("pointerdown", (e) => aim(e.clientX, e.clientY), { passive: true });

  /* Keyboard users get the beam brought to whatever they focused, so tabbing
     through the page is not tabbing through the dark. */
  document.addEventListener(
    "focusin",
    (event) => {
      if (lit) return;
      const r = event.target.getBoundingClientRect?.();
      if (!r || (!r.width && !r.height)) return;
      aim(r.left + r.width / 2, r.top + r.height / 2 + LIFT);
    },
    true,
  );

  step();
});
