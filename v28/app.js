/* ==========================================================================
   v28 — Spreadsheet.

   Cell selection, the formula bar, arrow-key movement between cells, and the
   sheet tabs.

   The one thing that would make the whole conceit hollow is a totals row with
   the numbers typed into it, so the totals are recomputed here from the cells
   they claim to sum. Change a project's technologies in the markup and the
   total changes with it, because the formula is real.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireChrome();

  const sheets = [...document.querySelectorAll("[data-sheet]")];
  const tabs = [...document.querySelectorAll("[data-sheet-tab]")];
  const cellref = document.getElementById("cellref");
  const formula = document.getElementById("formula");

  if (!sheets.length) {
    P.wireStandardPage();
    return;
  }

  /* ── Addressing ───────────────────────────────────────────────────────
     A1 notation from the cell's real position in the table, so the reference
     in the bar is the one a spreadsheet would give it. */

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /* The row number printed in the gutter, not the element's position among
     <tr> — there are two header rows above the data, so the two disagree by
     exactly the amount that makes every formula wrong. */
  const rowNumber = (row) => Number(row?.querySelector(".rownum")?.textContent) || 0;

  const findRow = (table, n) =>
    [...table.querySelectorAll("tr")].find((r) => rowNumber(r) === n);

  const addressOf = (cell) => {
    const row = cell.closest("tr");
    if (!row) return "";
    // The row-number cell is not a column, so it does not count.
    const cells = [...row.children].filter((c) => !c.classList.contains("rownum"));
    const col = cells.indexOf(cell);
    return (LETTERS[col] || "?") + rowNumber(row);
  };

  /* ── Selection ────────────────────────────────────────────────────────── */

  let selected = null;

  const select = (cell) => {
    if (!cell) return;
    selected?.classList.remove("sel");
    selected = cell;
    cell.classList.add("sel");

    if (cellref) cellref.textContent = addressOf(cell);
    if (formula) {
      // A cell with no formula shows its own contents, which is exactly what
      // a spreadsheet does with a literal.
      formula.textContent = cell.dataset.formula || cell.textContent.trim().slice(0, 200);
    }
  };

  /* ── Movement ─────────────────────────────────────────────────────────
     Arrow keys walk the grid the way they do in a spreadsheet: same column,
     next row; same row, next selectable cell. */

  const selectable = (table) => [...table.querySelectorAll("td[tabindex]")];

  const move = (dx, dy) => {
    if (!selected) return;
    const table = selected.closest("table");
    if (!table) return;

    const row = selected.closest("tr");
    const rows = [...table.querySelectorAll("tr")];
    const ri = rows.indexOf(row);

    if (dy !== 0) {
      // Walk rows until one has a selectable cell in a similar position.
      const cells = [...row.children].filter((c) => !c.classList.contains("rownum"));
      const ci = cells.indexOf(selected);

      for (let i = ri + dy; i >= 0 && i < rows.length; i += dy) {
        const next = [...rows[i].children].filter((c) => !c.classList.contains("rownum"));
        const target = next[ci] || next.find((c) => c.hasAttribute("tabindex"));
        if (target?.hasAttribute("tabindex")) {
          target.focus();
          select(target);
          return;
        }
      }
      return;
    }

    const all = selectable(table);
    const i = all.indexOf(selected);
    const target = all[i + dx];
    if (target) {
      target.focus();
      select(target);
    }
  };

  document.addEventListener("click", (event) => {
    const cell = event.target.closest("td[tabindex]");
    // A link inside a cell is still a link; selecting is what a click on the
    // rest of the cell means.
    if (cell && !event.target.closest("a")) select(cell);
  });

  document.addEventListener("focusin", (event) => {
    const cell = event.target.closest?.("td[tabindex]");
    if (cell) select(cell);
  });

  document.addEventListener("keydown", (event) => {
    if (!selected || !document.activeElement?.closest?.("td[tabindex]")) return;

    const moves = {
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
    };

    const m = moves[event.key];
    if (!m) return;
    event.preventDefault();
    move(m[0], m[1]);
  });

  /* ── Totals ───────────────────────────────────────────────────────────
     Actually computed. The formula on the cell names the range, the range is
     resolved against the table, and the sum is written back — so the number
     in the totals row is never a claim, it is a result. */

  const rangeCells = (table, range) => {
    const m = /^([A-Z])(\d+):([A-Z])(\d+)$/.exec(range);
    if (!m) return [];

    const [, c1, r1, c2, r2] = m;
    const from = LETTERS.indexOf(c1);
    const to = LETTERS.indexOf(c2);
    const out = [];

    for (let r = Number(r1); r <= Number(r2); r++) {
      const row = findRow(table, r);
      if (!row) continue;
      const cells = [...row.children].filter((c) => !c.classList.contains("rownum"));
      for (let c = from; c <= to; c++) if (cells[c]) out.push(cells[c]);
    }

    return out;
  };

  const recompute = () => {
    document.querySelectorAll('[data-formula^="=SUM("]').forEach((cell) => {
      const table = cell.closest("table");
      const range = cell.dataset.formula.slice(5, -1);
      const cells = rangeCells(table, range).filter((c) => c !== cell);
      const total = cells.reduce((sum, c) => {
        const n = parseFloat(c.textContent);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);
      cell.textContent = String(total);
    });
  };

  recompute();

  /* ── Sheets ───────────────────────────────────────────────────────────── */

  const showSheet = (key) => {
    sheets.forEach((s) => (s.hidden = s.dataset.sheet !== key));
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.sheetTab === key));
    history.replaceState(null, "", "#" + key);

    // Same gate as everywhere else: the button appears once the work has
    // been looked at.
    if (key === "projects") {
      document.querySelector(".whatsapp-float")?.classList.add("revealed");
    }

    const first = document.querySelector('[data-sheet="' + key + '"] td[tabindex]');
    if (first) select(first);
    else if (formula) {
      formula.textContent = "";
      if (cellref) cellref.textContent = "—";
    }
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => showSheet(tab.dataset.sheetTab)));

  const NAV = { home: "projects", projects: "projects", about: "about", services: "services", contact: "contact" };

  document.querySelectorAll("#nav a[data-nav]").forEach((a) => {
    a.addEventListener("click", (event) => {
      const key = NAV[a.dataset.nav];
      if (!sheets.some((s) => s.dataset.sheet === key)) return;
      event.preventDefault();
      showSheet(key);
      document.querySelectorAll("#nav a").forEach((l) => l.classList.toggle("active", l === a));
    });
  });

  // A language change rewrites the note cells, and the counts they feed.
  P.onLanguageChange(recompute);

  const hash = location.hash.replace("#", "");
  showSheet(sheets.some((s) => s.dataset.sheet === hash) ? hash : "projects");
});
