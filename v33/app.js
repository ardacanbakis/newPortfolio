/* ==========================================================================
   v33 — Print-first CV.

   Almost nothing to do: the version is a stylesheet. The one behaviour is the
   print button, and one measurement — telling the visitor how many sheets of
   paper they are about to use, which is the kind of thing you only find out
   after wasting three of them.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const P = window.Portfolio;
  if (!P) return;

  P.wireStandardPage();

  const button = document.getElementById("print-cv");
  if (!button) return;

  button.addEventListener("click", () => window.print());

  /* The sheet is one continuous element that the browser paginates, so the
     page count is its height over the height of a page. Both are read from
     the stylesheet rather than hardcoded here, so changing the paper size is
     a one-line change in one place. */
  const sheet = document.querySelector(".sheet");
  const label = document.createElement("span");
  label.className = "cv-pages";
  label.setAttribute("aria-hidden", "true");

  const measure = () => {
    if (!sheet) return;
    const pageHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--page-h"),
    ) * parseFloat(getComputedStyle(document.documentElement).fontSize);

    if (!pageHeight) return;
    const pages = Math.max(1, Math.ceil(sheet.scrollHeight / pageHeight));
    label.textContent = pages + (pages === 1 ? " page" : " pages");
    if (!label.isConnected) button.after(label);
  };

  measure();
  window.addEventListener("resize", measure, { passive: true });
  P.onLanguageChange(measure);
});
