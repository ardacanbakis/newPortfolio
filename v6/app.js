/* v6 — Bento grid dashboard.
   Content, translations, WhatsApp config and the contact form live in
   ../shared/site.js; this file only wires up what is specific to the layout. */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) {
    console.warn("shared/site.js did not load — the page is still readable.");
    return;
  }

  /* Language */
  const switcher = document.getElementById("language-switcher");
  switcher.value = P.initialLanguage();
  P.applyLanguage(switcher.value);
  switcher.addEventListener("change", () => P.applyLanguage(switcher.value));

  /* Contact form */
  P.wireContactForm(document.getElementById("contact-form"));

  /* Mobile menu */
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* Header state + active section + WhatsApp gate */
  const header = document.querySelector(".site-header");
  const links = [...nav.querySelectorAll("a")];
  const sections = links.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);

  const gate = P.gateWhatsappAfter(
    document.getElementById("projects"),
    document.querySelector(".whatsapp-float"),
  );

  P.onScroll(() => {
    header.classList.toggle("scrolled", window.scrollY > 20);

    let active = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) active = i;
    });
    links.forEach((a, i) => a.classList.toggle("active", i === active));

    gate();
  });

  P.revealOnScroll(".project, .service, .about-media, .about-body, .contact-grid");

  const year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());
});
