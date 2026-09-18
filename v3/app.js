/* ==========================================================================
   Arda Canbakış — portfolio (v3, "terminal")

   The shell drives a page that already exists. Commands scroll to and flag
   real sections rather than printing strings, which keeps one copy of the
   content: the same markup serves search engines, screen readers and anyone
   with JavaScript off. The prompt is revealed only once this file runs, so
   nothing on screen ever promises interactivity that isn't there.

   Translations, WhatsApp configuration and the contact form live in
   ../shared/site.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) {
    // shared/site.js failed to load. The page is still perfectly readable, so
    // say nothing and leave the prompt hidden.
    console.warn("shared/site.js did not load — running without the shell.");
    return;
  }

  /* ── Language ───────────────────────────────────────────────────────── */

  const languageSwitcher = document.getElementById("language-switcher");
  const initial = P.initialLanguage();
  languageSwitcher.value = initial;
  P.applyLanguage(initial);

  languageSwitcher.addEventListener("change", () => {
    P.applyLanguage(languageSwitcher.value);
    print(`language → ${P.lang}`, "green");
  });

  /* ── Contact form ───────────────────────────────────────────────────── */

  P.wireContactForm(document.getElementById("contact-form"));

  /* ── Shell ──────────────────────────────────────────────────────────── */

  const stream = document.getElementById("stream");
  const promptForm = document.getElementById("prompt");
  const input = document.getElementById("cmd");
  const boot = document.getElementById("boot");

  // Only now does the prompt appear: it does nothing without this script.
  promptForm.hidden = false;

  /** Append a line of shell output just above the prompt. */
  const print = (text, tone) => {
    const line = document.createElement("p");
    line.className = "muted small";
    if (tone) line.style.color = `var(--${tone})`;
    line.textContent = text;
    stream.appendChild(line);
    line.scrollIntoView({ block: "center" });
  };

  /** Echo the command the way a shell would. */
  const echo = (raw) => {
    const line = document.createElement("p");
    line.className = "cmd-echo";
    const mark = document.createElement("span");
    mark.className = "prompt-mark";
    mark.textContent = "$";
    line.append(mark, " " + raw);
    stream.appendChild(line);
  };

  /** Scroll to a section and flag it, so it is obvious something happened. */
  const goTo = (id) => {
    const section = document.getElementById(id);
    if (!section) return false;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    section.classList.remove("flash");
    // Reflow so the animation restarts even if the class was just removed.
    void section.offsetWidth;
    section.classList.add("flash");
    return true;
  };

  const HELP = [
    "help            this list",
    "projects, ls    the work",
    "about, whoami   who I am",
    "services        what I can build for you",
    "contact         get in touch",
    "cv              open my CV",
    "github          open my GitHub",
    "whatsapp        open a WhatsApp chat",
    "lang <en|tr|es> switch language",
    "top             back to the start",
    "clear           reset the output",
  ];

  const openExternal = (url) => window.open(url, "_blank", "noopener");

  const commands = {
    help: () => HELP.forEach((line) => print(line)),
    "?": () => commands.help(),

    projects: () => goTo("projects"),
    ls: () => goTo("projects"),
    work: () => goTo("projects"),

    about: () => goTo("about"),
    whoami: () => goTo("about"),

    services: () => goTo("services"),
    contact: () => goTo("contact"),

    cv: () => openExternal("assets/ArdaCanbakisCv.pdf"),
    github: () => openExternal("https://github.com/ardacanbakis"),
    whatsapp: () => openExternal(P.whatsappHref()),

    top: () => window.scrollTo({ top: 0, behavior: "smooth" }),

    clear: () => {
      // Remove only what the shell printed; the document itself stays put.
      stream.querySelectorAll(".shell-line").forEach((el) => el.remove());
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    lang: (arg) => {
      if (!P.translations[arg]) {
        print(`lang: unknown language "${arg}" — try en, tr or es`, "red");
        return;
      }
      languageSwitcher.value = arg;
      P.applyLanguage(arg);
      print(`language → ${arg}`, "green");
    },
  };

  const run = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    echo(trimmed);

    const [name, ...rest] = trimmed.toLowerCase().split(/\s+/);
    const command = commands[name];

    if (!command) {
      print(`${name}: command not found — type "help" for the list`, "red");
      return;
    }

    command(rest.join(" "));
  };

  // Everything the shell adds is tagged so `clear` can remove exactly that.
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && !node.classList.contains("block")) {
          node.classList.add("shell-line");
        }
      });
    });
  });
  observer.observe(stream, { childList: true });

  promptForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
  });

  document.getElementById("chips").addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    run(chip.dataset.cmd);
  });

  /* Typing anywhere on the page focuses the prompt, the way a console does —
     but never while the visitor is filling in the contact form, and never for
     shortcuts like Ctrl+F. */
  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.length !== 1) return;

    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    input.focus();
  });

  /* ── Boot sequence ──────────────────────────────────────────────────── */

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    // A short type-on for the tagline only. The rest of the page is already
    // rendered, so nothing important waits on this.
    const tagline = boot.querySelector(".muted");
    const full = tagline.textContent.trim();
    let i = 0;
    tagline.textContent = "";
    const tick = () => {
      tagline.textContent = full.slice(0, (i += 2));
      if (i < full.length) requestAnimationFrame(tick);
      else tagline.textContent = full;
    };
    requestAnimationFrame(tick);

    // Retyping on every language switch would be irritating; do it once.
    P.onLanguageChange(() => {
      tagline.textContent = P.t("tagline");
    });
  }

  /* ── WhatsApp gate, reveals, footer year ────────────────────────────── */

  const updateWhatsapp = P.gateWhatsappAfter(
    document.getElementById("projects"),
    document.querySelector(".whatsapp-float"),
  );

  P.onScroll(updateWhatsapp);
  P.revealOnScroll(".entry, .services li");

  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
