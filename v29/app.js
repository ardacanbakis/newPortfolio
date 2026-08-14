/* ==========================================================================
   v29 — Command palette.

   Everything on the site is an entry: the five sections, the six projects and
   each of their links, the CV, the three languages, email and WhatsApp. One
   fuzzy query reaches all of it.

   The matcher is a subsequence scorer, not a substring test. "gs" should find
   gridSmith and "wnd" should find the Windows build of hushBar — a substring
   test finds neither, and a Levenshtein distance is both slower and wrong for
   this shape of query. Consecutive hits, word-boundary hits and hits near the
   start all score higher, which is what makes the first result usually right.

   The index is rebuilt on a language change: entries carry the translated
   label, so searching in Turkish has to match Turkish.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();

  const root = document.documentElement;

  /* ── Fuzzy match ──────────────────────────────────────────────────────
     Returns null for no match, or { score, marked } where marked is the
     label with the matched characters wrapped so they can be highlighted. */

  const fuzzy = (query, text) => {
    if (!query) return { score: 0, marked: escapeHtml(text) };

    const q = query.toLowerCase();
    const t = text.toLowerCase();

    let score = 0;
    let ti = 0;
    let run = 0;
    const hits = [];

    for (let qi = 0; qi < q.length; qi++) {
      const chr = q[qi];
      if (chr === " ") continue;

      let found = -1;
      while (ti < t.length) {
        if (t[ti] === chr) {
          found = ti;
          break;
        }
        ti++;
      }

      if (found === -1) return null;

      // Consecutive characters are what distinguishes a real match from an
      // accidental scatter of letters across a long string.
      run = hits.length && hits[hits.length - 1] === found - 1 ? run + 1 : 0;
      score += 1 + run * 4;

      // A hit at the start of a word is worth more than one mid-word.
      const before = found === 0 ? " " : t[found - 1];
      if (/[\s\-_/.&·]/.test(before)) score += 6;
      if (found === 0) score += 8;

      hits.push(found);
      ti = found + 1;
    }

    // Shorter labels win ties: "About" should beat "About this project".
    score -= text.length * 0.05;

    // Build the highlight without a second pass over the string.
    let marked = "";
    let last = 0;
    for (const h of hits) {
      marked += escapeHtml(text.slice(last, h)) + "<b>" + escapeHtml(text[h]) + "</b>";
      last = h + 1;
    }
    marked += escapeHtml(text.slice(last));

    return { score, marked };
  };

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ── Icons ────────────────────────────────────────────────────────────── */

  const ICON = {
    section: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7h6l2 2h10v10H3z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
    action: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m5 12 5 5L19 7"/></svg>',
  };

  /* ── Index ────────────────────────────────────────────────────────────
     Built from the live DOM rather than from a second list of the same
     content, so it cannot drift from the page and it is already translated. */

  let entries = [];

  const buildIndex = () => {
    entries = [];

    document.querySelectorAll("#nav a[data-nav]").forEach((a) => {
      entries.push({
        group: "Sections",
        icon: ICON.section,
        title: a.textContent.trim(),
        sub: "#" + a.dataset.nav,
        go: () => document.getElementById(a.dataset.nav)?.scrollIntoView({ behavior: "smooth" }),
        hint: "Jump",
      });
    });

    document.querySelectorAll(".project").forEach((project) => {
      const title = project.querySelector(".project-title")?.textContent.trim() || "";
      const desc = project.querySelector(".project-desc")?.textContent.trim() || "";
      const tags = [...project.querySelectorAll(".project-tags li")].map((li) => li.textContent.trim());

      entries.push({
        group: "Work",
        icon: ICON.project,
        title,
        // Tags are searchable too: typing "swift" should find hushBar.
        search: title + " " + tags.join(" "),
        sub: tags.join(" · "),
        go: () => project.scrollIntoView({ behavior: "smooth", block: "center" }),
        hint: "Show",
        desc,
      });

      project.querySelectorAll(".project-links a").forEach((link) => {
        entries.push({
          group: "Links",
          icon: ICON.link,
          title: title + " — " + link.textContent.trim(),
          sub: link.href.replace(/^https?:\/\//, ""),
          go: () => window.open(link.href, "_blank", "noopener"),
          hint: "Open",
        });
      });
    });

    document.querySelectorAll(".contact-direct .direct-row").forEach((row) => {
      entries.push({
        group: "Contact",
        icon: ICON.link,
        title: row.textContent.trim(),
        sub: row.href.startsWith("mailto:") ? "Email" : "External",
        go: () => row.click(),
        hint: "Open",
      });
    });

    const cv = document.querySelector('a[href$="ArdaCanbakisCv.pdf"]');
    if (cv) {
      entries.push({
        group: "Actions",
        icon: ICON.action,
        title: cv.textContent.trim(),
        sub: "PDF",
        go: () => window.open(cv.href, "_blank", "noopener"),
        hint: "Open",
      });
    }

    [["English", "en"], ["Türkçe", "tr"], ["Español", "es"]].forEach(([label, code]) => {
      entries.push({
        group: "Actions",
        icon: ICON.action,
        title: label,
        search: label + " language dil idioma " + code,
        sub: code.toUpperCase(),
        go: () => {
          const sw = document.getElementById("language-switcher");
          if (!sw) return;
          sw.value = code;
          sw.dispatchEvent(new Event("change"));
        },
        hint: "Switch",
      });
    });
  };

  buildIndex();
  P.onLanguageChange(() => {
    buildIndex();
    if (open) render(input.value);
  });

  /* ── Markup ───────────────────────────────────────────────────────────── */

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "palette-trigger";
  trigger.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
    "<span>Search</span><kbd>⌘K</kbd>";
  trigger.setAttribute("aria-label", "Search the site");
  document.querySelector(".header-actions")?.prepend(trigger);

  const palette = document.createElement("div");
  palette.className = "palette";
  palette.setAttribute("role", "dialog");
  palette.setAttribute("aria-modal", "true");
  palette.setAttribute("aria-label", "Search");
  palette.innerHTML =
    '<div class="palette-box">' +
    '<div class="palette-field">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
    '<input type="text" id="palette-input" autocomplete="off" spellcheck="false" ' +
    'placeholder="Search projects, sections, links…" role="combobox" aria-expanded="true" ' +
    'aria-controls="palette-list" aria-autocomplete="list" />' +
    '<span class="palette-esc">esc</span>' +
    "</div>" +
    '<div class="palette-list" id="palette-list" role="listbox" aria-label="Results"></div>' +
    '<div class="palette-foot"><span><kbd>↑↓</kbd>navigate</span><span><kbd>↵</kbd>open</span>' +
    "<span><kbd>esc</kbd>close</span></div>" +
    "</div>";
  document.body.appendChild(palette);

  const input = palette.querySelector("input");
  const list = palette.querySelector(".palette-list");

  root.classList.add("palette-ready");

  /* ── Render ───────────────────────────────────────────────────────────── */

  let results = [];
  let selected = 0;
  let open = false;

  const render = (query) => {
    const scored = [];

    for (const entry of entries) {
      const hit = fuzzy(query, entry.search || entry.title);
      if (!hit) continue;
      // Highlighting is done against the title, which is what is shown; a
      // match found in the tags still lists, just without marks.
      const shown = entry.search && entry.search !== entry.title
        ? fuzzy(query, entry.title)
        : hit;
      scored.push({ ...entry, score: hit.score, marked: shown ? shown.marked : escapeHtml(entry.title) });
    }

    scored.sort((a, b) => b.score - a.score);
    results = scored.slice(0, 40);
    selected = 0;

    if (!results.length) {
      list.innerHTML = '<p class="palette-empty">Nothing matches that.</p>';
      return;
    }

    let html = "";
    let group = null;

    results.forEach((entry, i) => {
      if (entry.group !== group) {
        group = entry.group;
        html += '<p class="palette-group">' + escapeHtml(group) + "</p>";
      }
      html +=
        '<button type="button" class="palette-item" role="option" id="palette-opt-' + i + '" ' +
        'aria-selected="false" data-i="' + i + '">' +
        '<span class="palette-icon" aria-hidden="true">' + entry.icon + "</span>" +
        '<span class="palette-text"><span class="palette-title">' + entry.marked + "</span>" +
        (entry.sub ? '<span class="palette-sub">' + escapeHtml(entry.sub) + "</span>" : "") +
        "</span>" +
        '<span class="palette-go">' + escapeHtml(entry.hint || "Go") + "</span>" +
        "</button>";
    });

    list.innerHTML = html;
    highlight();
  };

  const items = () => [...list.querySelectorAll(".palette-item")];

  const highlight = () => {
    items().forEach((el, i) => {
      const on = i === selected;
      el.classList.toggle("selected", on);
      el.setAttribute("aria-selected", String(on));
      if (on) {
        el.scrollIntoView({ block: "nearest" });
        input.setAttribute("aria-activedescendant", el.id);
      }
    });
  };

  const run = (i) => {
    const entry = results[i];
    if (!entry) return;
    close();
    // After the dialog has gone, so a scroll target is not fighting the
    // overlay's own scroll lock.
    requestAnimationFrame(() => entry.go());
  };

  /* ── Open and close ───────────────────────────────────────────────────
     The element that had focus is remembered and given it back, which is the
     part of a dialog people notice only when it is missing. */

  let lastFocus = null;

  const openPalette = () => {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    palette.classList.add("open");
    root.classList.add("palette-open");
    input.value = "";
    render("");
    input.focus();
  };

  const close = () => {
    if (!open) return;
    open = false;
    palette.classList.remove("open");
    root.classList.remove("palette-open");
    input.removeAttribute("aria-activedescendant");
    lastFocus?.focus?.();
  };

  trigger.addEventListener("click", openPalette);

  palette.addEventListener("click", (event) => {
    if (event.target === palette) close();
  });

  list.addEventListener("click", (event) => {
    const item = event.target.closest(".palette-item");
    if (item) run(Number(item.dataset.i));
  });

  list.addEventListener("pointermove", (event) => {
    const item = event.target.closest(".palette-item");
    if (!item) return;
    const i = Number(item.dataset.i);
    if (i === selected) return;
    selected = i;
    highlight();
  });

  input.addEventListener("input", () => render(input.value));

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
      event.preventDefault();
      selected = (selected + 1) % Math.max(1, results.length);
      highlight();
    } else if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
      event.preventDefault();
      selected = (selected - 1 + results.length) % Math.max(1, results.length);
      highlight();
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(selected);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      // The dialog holds one focusable thing; keeping focus in it is a
      // one-line trap rather than a full sweep of the subtree.
      event.preventDefault();
    }
  });

  document.addEventListener("keydown", (event) => {
    const el = document.activeElement;
    const typing = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

    if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      open ? close() : openPalette();
      return;
    }

    // "/" is the other convention, but only when it is not being typed into
    // something.
    if (event.key === "/" && !typing && !open) {
      event.preventDefault();
      openPalette();
    }
  });
});
