/* ==========================================================================
   v24 — the configurator.

   Wires the controls to solid.js and keeps the readouts honest. The whole
   version rests on one claim — that the thing in the hero is real — so the
   numbers under it have to be computed from the same mesh that is drawn and
   exported, never from a separate estimate that could drift away from it.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const S = window.Solid;
  if (!P) return;

  P.wireStandardPage();

  const stage = document.getElementById("stage");
  if (!S || !stage) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const view = S.renderer(stage, {
    dark: [26, 32, 40],
    light: [120, 214, 255],
  });

  const controls = {
    cols: document.getElementById("c-cols"),
    rows: document.getElementById("c-rows"),
    height: document.getElementById("c-height"),
    wall: document.getElementById("c-wall"),
  };

  const outs = {
    cols: document.getElementById("o-cols"),
    rows: document.getElementById("o-rows"),
    height: document.getElementById("o-height"),
    wall: document.getElementById("o-wall"),
  };

  const size = document.getElementById("s-size");
  const volume = document.getElementById("s-volume");
  const tris = document.getElementById("s-tris");
  const note = document.getElementById("studio-note");

  let mesh = null;

  const update = () => {
    const params = {
      cols: Number(controls.cols.value),
      rows: Number(controls.rows.value),
      height: Number(controls.height.value),
      wall: Number(controls.wall.value),
    };

    outs.cols.textContent = params.cols;
    outs.rows.textContent = params.rows;
    outs.height.textContent = params.height + " u";
    outs.wall.textContent = params.wall.toFixed(1) + " mm";

    mesh = S.build(params);
    view.set(mesh);

    size.textContent = `${mesh.W} × ${mesh.D} × ${mesh.H} mm`;
    volume.textContent = mesh.volume.toFixed(1) + " cm³";
    tris.textContent = mesh.tris.length.toLocaleString("en-US");
  };

  Object.values(controls).forEach((c) => c.addEventListener("input", update));
  update();

  /* ── Export ───────────────────────────────────────────────────────────
     A real file. The object URL is revoked on the next frame — the download
     has already been handed to the browser by then, and leaving it alive
     pins the whole buffer in memory for the life of the page. */

  document.getElementById("download-stl")?.addEventListener("click", () => {
    if (!mesh) return;

    const blob = S.stl(mesh);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bin-${controls.cols.value}x${controls.rows.value}x${controls.height.value}u.stl`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    requestAnimationFrame(() => URL.revokeObjectURL(url));

    if (note) {
      note.textContent =
        `Saved ${a.download} — ${(blob.size / 1024).toFixed(0)} KB, ${mesh.tris.length} triangles.`;
    }
  });

  /* ── Idle spin ────────────────────────────────────────────────────────
     Only until the visitor touches it: a model that keeps turning while you
     are trying to look at one face is an annoyance, not a flourish. */

  if (reduced) return;

  let idle = true;
  const hint = document.getElementById("stage-hint");

  const stopIdle = () => {
    idle = false;
    hint?.style.setProperty("opacity", "0");
  };

  stage.addEventListener("pointerdown", stopIdle, { once: true });
  stage.addEventListener("wheel", stopIdle, { once: true, passive: true });

  const spin = () => {
    if (idle && !document.hidden) view.spin(0.0032);
    requestAnimationFrame(spin);
  };

  requestAnimationFrame(spin);
});
