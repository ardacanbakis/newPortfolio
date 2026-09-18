/* ==========================================================================
   v47 — Window seat.

   You are on a train and it does not stop. The hero pulls out of a city; the
   work runs through the suburbs and out into open country; the services are
   a tunnel; the contact form comes out onto the coast.

   The important decision here is that the regions are *places along a line*,
   not states of a switch. The world has a single coordinate — how far the
   train has come — and every region owns a stretch of it. Reading moves you
   along that line quickly; sitting still moves you along it slowly, because
   the train is still running. So you never see a landscape change; you see
   the city end and the fields begin, with the last warehouses of one still in
   frame as the first hedges of the next arrive. No crossfade, no ghosting,
   nothing to blend.

   Scenery is generated per slot from a hash of the slot's index, not from a
   sequential generator. That means slot 412 is the same hill whether you
   arrived at it forwards, backwards, or by jumping straight to the contact
   panel — which a sequential generator cannot promise, and is the usual
   reason an infinite side-scroller flickers when you seek.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  const S = window.Scene;
  if (!P) return;

  /* Two separate fallbacks, because they fail at different levels.

     No deck engine at all — the page is an ordinary scrolling document and
     gets the standard wiring.

     Deck but no Scene — the version still works completely as a deck; it just
     has no scenery. Folding these two cases together (the obvious `!deck ||
     !S`) would have left a page that is one screen with no scrollbar being
     wired as though it scrolled, which is how you end up with a WhatsApp gate
     that never opens. */
  const deck = window.Deck ? window.Deck.create() : null;
  if (!deck) {
    P.wireStandardPage();
    return;
  }

  P.wireChrome();
  P.gateWhatsappAfterChapter(deck, "projects", document.querySelector(".whatsapp-float"));

  if (!S) return;

  const stageEl = document.getElementById("stage");
  const cv = S.canvas(stageEl);
  const root = document.documentElement;

  /* Integer hash → [0,1). Position-addressed rather than sequential, so any
     slot can be evaluated on its own. */
  const hash = (i, salt) => {
    let x = (i * 374761393 + salt * 668265263) | 0;
    x = (x ^ (x >> 13)) * 1274126177;
    x = x ^ (x >> 16);
    return ((x >>> 0) % 100000) / 100000;
  };

  const REGION_LEN = 5200;       // world units per region
  const REGIONS = ["city", "suburb", "fields", "tunnel", "coast"];
  const regionAt = (x) => REGIONS[Math.min(REGIONS.length - 1, Math.max(0, Math.floor(x / REGION_LEN)))];

  const SKY = {
    city:   [[46, 54, 78], [92, 104, 134]],
    suburb: [[74, 96, 132], [158, 180, 206]],
    fields: [[104, 152, 196], [196, 220, 232]],
    tunnel: [[10, 10, 14], [16, 16, 22]],
    coast:  [[188, 156, 132], [240, 206, 170]],
  };

  const stage = S.stage(deck, {
    ambient: true,
    places: [
      { at: 0.0,  label: { en: "Leaving the city", tr: "Şehirden çıkış", es: "Saliendo de la ciudad" } },
      { at: 0.2,  label: { en: "Suburbs",          tr: "Banliyö",        es: "Afueras" } },
      { at: 0.4,  label: { en: "Open country",     tr: "Kırlar",         es: "Campo abierto" } },
      { at: 0.6,  label: { en: "Tunnel",           tr: "Tünel",          es: "Túnel" } },
      { at: 0.8,  label: { en: "The coast",        tr: "Sahil",          es: "La costa" } },
    ],
  });

  let clock = 0;

  stage.onFrame((u, dt) => {
    clock += dt;
    const { ctx, w, h } = cv;

    /* Where the train is. Reading is most of it; the rest is the train
       continuing to run while you sit there. The drift is deliberately small
       — over a minute of reading it moves you a fifth of a region, enough to
       feel alive and not enough to carry you somewhere else. */
    const worldX = u * REGION_LEN * (REGIONS.length - 0.35) + clock * 16;
    const region = regionAt(worldX + w * 0.5);
    const inTunnel = region === "tunnel";
    root.style.setProperty("--tunnel", inTunnel ? "1" : "0");

    /* ── Sky ───────────────────────────────────────────────────────────
       Interpolated between the region you are in and the next one, by how
       far through the current region you are. This is the only crossfade in
       the scene and it is the one thing that should fade: the sky has no
       edges. */
    const rIndex = Math.min(REGIONS.length - 1, Math.floor((worldX + w * 0.5) / REGION_LEN));
    const nextR = REGIONS[Math.min(REGIONS.length - 1, rIndex + 1)];
    const frac = S.smoothstep(0.72, 1, ((worldX + w * 0.5) % REGION_LEN) / REGION_LEN);
    const a = SKY[REGIONS[Math.max(0, rIndex)]] || SKY.city;
    const b = SKY[nextR];

    const top = S.mix(a[0], b[0], frac);
    const bot = S.mix(a[1], b[1], frac);
    root.style.setProperty("--sky", S.rgb(top));

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, S.rgb(top));
    g.addColorStop(1, S.rgb(bot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const horizon = h * 0.7;

    /* ── One parallax layer ────────────────────────────────────────────
       `speed` is how fast the layer passes: distant hills barely move, the
       trackside barrier tears past. Each layer walks the slots that are
       currently on screen and asks each slot's own region what it should be.
       Nothing is stored between frames. */
    const layer = (speed, slotW, baseY, draw) => {
      const offset = worldX * speed;
      const first = Math.floor(offset / slotW) - 1;
      const count = Math.ceil(w / slotW) + 3;
      for (let n = 0; n < count; n++) {
        const i = first + n;
        const x = i * slotW - offset;
        draw(i, x, slotW, baseY, regionAt(i * slotW / speed));
      }
    };

    if (!inTunnel) {
      /* Far hills — one continuous ridge rather than slots, because hills do
         not have edges. */
      ctx.fillStyle = S.rgb(S.mix(top, [60, 78, 72], 0.5));
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 16; x += 16) {
        const wx = (x + worldX * 0.08) * 0.004;
        const n = Math.sin(wx) * 0.5 + Math.sin(wx * 2.7 + 1.3) * 0.28;
        ctx.lineTo(x, horizon - 26 - n * 44);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      /* Middle distance: the buildings, houses, trees and sea that actually
         say which region this is. */
      layer(0.34, 96, horizon, (i, x, sw, y, reg) => {
        const r1 = hash(i, 11);
        const r2 = hash(i, 29);

        if (reg === "city") {
          const bh = 60 + r1 * 210;
          ctx.fillStyle = S.rgb(S.mix(top, [22, 26, 38], 0.82));
          ctx.fillRect(x, y - bh, sw * 0.86, bh);
          /* Lit windows: a fixed grid, each on or off by its own hash, so the
             same building has the same windows lit every time. */
          ctx.fillStyle = "rgba(255,214,140,0.75)";
          for (let wy = 0; wy < Math.floor(bh / 22); wy++) {
            for (let wx = 0; wx < 3; wx++) {
              if (hash(i * 97 + wy * 7 + wx, 3) > 0.62) {
                ctx.fillRect(x + 8 + wx * 24, y - bh + 10 + wy * 22, 9, 11);
              }
            }
          }
        } else if (reg === "suburb") {
          const bh = 34 + r1 * 46;
          ctx.fillStyle = S.rgb(S.mix(top, [44, 40, 46], 0.76));
          ctx.fillRect(x + 10, y - bh, sw * 0.6, bh);
          ctx.beginPath();
          ctx.moveTo(x + 4, y - bh);
          ctx.lineTo(x + 10 + sw * 0.3, y - bh - 24);
          ctx.lineTo(x + 16 + sw * 0.6, y - bh);
          ctx.closePath();
          ctx.fill();
          if (r2 > 0.6) {
            ctx.fillStyle = "rgba(255,214,140,0.7)";
            ctx.fillRect(x + 22, y - bh + 12, 10, 12);
          }
        } else if (reg === "fields") {
          if (r1 > 0.55) {
            const th = 40 + r2 * 60;
            ctx.fillStyle = S.rgb(S.mix(top, [30, 54, 36], 0.86));
            ctx.beginPath();
            ctx.ellipse(x + sw * 0.4, y - th * 0.7, th * 0.42, th * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(x + sw * 0.4 - 3, y - th * 0.4, 6, th * 0.4);
          }
        } else if (reg === "coast") {
          /* Sea rather than objects: one flat plane with a glitter line. */
          ctx.fillStyle = "rgba(42,92,126,0.9)";
          ctx.fillRect(x, y - 6, sw + 1, h - y + 6);
          if (r1 > 0.72) {
            ctx.fillStyle = "rgba(255,236,206,0.5)";
            ctx.fillRect(x + r2 * sw, y + 10 + r1 * 40, 10 + r2 * 20, 2);
          }
        }
      });

      /* Ground, and the near barrier that tears past. */
      ctx.fillStyle = S.rgb(S.mix(bot, [40, 46, 38], 0.7));
      ctx.fillRect(0, horizon, w, h - horizon);

      layer(1.9, 68, h * 0.9, (i, x, sw, y) => {
        ctx.fillStyle = "rgba(16,20,26,0.85)";
        ctx.fillRect(x, y - 54, 7, 54);
      });
    } else {
      /* ── Tunnel ────────────────────────────────────────────────────
         Black, with service lamps going by. The lamps are the only way to
         tell you are still moving, which is exactly what a tunnel is like. */
      ctx.fillStyle = "#0a0a0e";
      ctx.fillRect(0, 0, w, h);

      layer(2.6, 260, h * 0.42, (i, x, sw, y) => {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 120);
        glow.addColorStop(0, "rgba(255,196,120,0.5)");
        glow.addColorStop(1, "rgba(255,196,120,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,214,150,0.9)";
        ctx.fillRect(x - 3, y - 10, 6, 20);
      });

      /* The tunnel wall rushing past close to the glass. */
      layer(3.4, 40, 0, (i, x, sw) => {
        ctx.fillStyle = `rgba(255,255,255,${0.012 + hash(i, 5) * 0.03})`;
        ctx.fillRect(x, 0, sw * 0.5, h);
      });
    }

    /* ── Reflection ────────────────────────────────────────────────────
       In a tunnel the glass stops being a window and becomes a mirror. A pair
       of soft warm smudges where the carriage lights would be is enough to
       say so — a literal reflected interior would be a second scene. */
    if (inTunnel) {
      for (let i = 0; i < 3; i++) {
        const x = w * (0.22 + i * 0.3);
        const y = h * 0.26;
        const r = ctx.createRadialGradient(x, y, 0, x, y, h * 0.3);
        r.addColorStop(0, "rgba(255,226,178,0.1)");
        r.addColorStop(1, "rgba(255,226,178,0)");
        ctx.fillStyle = r;
        ctx.fillRect(x - h * 0.3, y - h * 0.3, h * 0.6, h * 0.6);
      }
    }
  });

  window.addEventListener("resize", () => {
    if (cv.resize()) stage.poke();
  }, { passive: true });
});
