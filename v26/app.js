/* ==========================================================================
   v26 — Inbox.

   Selection, folders, search, read state and the phone's push-and-back. The
   search filters the list the same way a mail client does — sender and
   subject, live, no submit — and it reads the translated text out of the DOM
   so searching in Turkish matches Turkish.

   Without this file the markup is a list of messages followed by their
   contents, which is a perfectly ordinary document.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireChrome();

  const root = document.documentElement;
  const rows = [...document.querySelectorAll(".msg")];
  const reads = [...document.querySelectorAll(".read")];
  const folders = [...document.querySelectorAll(".folder")];
  const search = document.getElementById("mail-search");
  const reading = document.getElementById("reading");

  if (!rows.length) {
    P.wireStandardPage();
    return;
  }

  const byId = new Map(reads.map((r) => [r.dataset.read, r]));
  const WORK = new Set(rows.filter((r) => r.dataset.folder === "work").map((r) => r.dataset.msg));

  let folder = "all";
  let query = "";
  let seenWork = false;

  /* ── Opening a message ────────────────────────────────────────────────── */

  const open = (id) => {
    const read = byId.get(id);
    if (!read) return;

    rows.forEach((r) => {
      const on = r.dataset.msg === id;
      r.classList.toggle("active", on);
      if (on) r.classList.add("seen");
    });

    reads.forEach((r) => r.classList.toggle("active", r === read));
    root.classList.add("reading-open");
    reading.scrollTop = 0;
    history.replaceState(null, "", "#" + id);

    // Same rule as everywhere else, expressed for an inbox: the button
    // appears once the visitor has actually read a project.
    if (WORK.has(id)) {
      seenWork = true;
      document.querySelector(".whatsapp-float")?.classList.add("revealed");
    }

    countFolders();
  };

  rows.forEach((row) => {
    row.querySelector(".msg-row")?.addEventListener("click", () => open(row.dataset.msg));
  });

  /* ── Back ─────────────────────────────────────────────────────────────
     Only meaningful on the phone layout, where the reader covers the list. */

  const back = document.createElement("button");
  back.type = "button";
  back.className = "mail-back";
  back.innerHTML = '<span aria-hidden="true">‹</span> Inbox';
  back.addEventListener("click", () => {
    root.classList.remove("reading-open");
    rows.find((r) => r.classList.contains("active"))?.querySelector(".msg-row")?.focus();
  });
  reading.prepend(back);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") root.classList.remove("reading-open");
  });

  /* ── Filtering ────────────────────────────────────────────────────────
     One pass that applies both the folder and the query, so the two can
     never disagree about what is visible. */

  const apply = () => {
    const q = query.trim().toLowerCase();

    rows.forEach((row) => {
      const inFolder = folder === "all" || row.dataset.folder === folder;
      const text = row.textContent.toLowerCase();
      const matches = !q || text.includes(q);
      row.hidden = !(inFolder && matches);
    });

    countFolders();
  };

  const countFolders = () => {
    folders.forEach((button) => {
      const key = button.dataset.folder;
      const count = rows.filter(
        (r) => (key === "all" || r.dataset.folder === key) && !r.classList.contains("seen"),
      ).length;
      const out = button.querySelector(".folder-count");
      if (out) out.textContent = count || "";
    });
  };

  folders.forEach((button) => {
    button.addEventListener("click", () => {
      folder = button.dataset.folder;
      folders.forEach((b) => b.classList.toggle("active", b === button));
      apply();

      // A folder with exactly one message opens it, because making someone
      // click twice to reach the only thing there is is not a feature.
      const visible = rows.filter((r) => !r.hidden);
      if (visible.length === 1) open(visible[0].dataset.msg);
      else root.classList.remove("reading-open");
    });
  });

  search?.addEventListener("input", () => {
    query = search.value;
    apply();
  });

  /* The header nav maps onto folders. */
  const NAV = { home: "all", projects: "work", about: "about", services: "services", contact: "contact" };

  document.querySelectorAll("#nav a[data-nav]").forEach((a) => {
    a.addEventListener("click", (event) => {
      const key = NAV[a.dataset.nav];
      const button = folders.find((b) => b.dataset.folder === key);
      if (!button) return;
      event.preventDefault();
      button.click();
      document.querySelectorAll("#nav a").forEach((l) => l.classList.toggle("active", l === a));
    });
  });

  /* A language change rewrites every subject line, so a live query has to be
     re-applied against the new text. */
  P.onLanguageChange(apply);

  /* ── Start ────────────────────────────────────────────────────────────
     Deep link first, then the first message — but on a phone, where opening
     a message covers the list, start on the list instead. */

  const hash = location.hash.replace("#", "");
  const first = byId.has(hash) ? hash : rows[0].dataset.msg;

  apply();
  open(first);

  if (window.matchMedia("(max-width: 767px)").matches && !byId.has(hash)) {
    root.classList.remove("reading-open");
    // Opening it marked it read; on the phone nobody has seen it yet.
    rows[0].classList.remove("seen");
    countFolders();
  }
});
