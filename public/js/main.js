/* =========================
   Cutler Site JS
   File: src/js/main.js
   Minimal: mobile nav + year + small polish
   ========================= */

(function () {
  "use strict";

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  // Set footer year
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Guard if elements missing
  if (!nav || !toggle) return;

  function setExpanded(isExpanded) {
    toggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  }

  function openNav() {
    nav.classList.add("is-open");
    setExpanded(true);

    // Prevent background scrolling on mobile when menu open
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    nav.classList.remove("is-open");
    setExpanded(false);

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function isNavOpen() {
    return nav.classList.contains("is-open");
  }

  // Toggle click
  toggle.addEventListener("click", function () {
    if (isNavOpen()) closeNav();
    else openNav();
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isNavOpen()) {
      closeNav();
      toggle.focus();
    }
  });

  // Close after clicking a link (mobile UX)
  nav.addEventListener("click", function (e) {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const link = target.closest("a");
    if (!link) return;

    // Only auto-close on narrow screens
    if (window.matchMedia("(max-width: 980px)").matches) {
      closeNav();
    }
  });

  // Close if resizing to desktop
  window.addEventListener("resize", function () {
    if (!window.matchMedia("(max-width: 980px)").matches && isNavOpen()) {
      closeNav();
      setExpanded(false);
    }
  });

  // Optional: add a subtle "scrolled" attribute for future styling
  // (No CSS required now, but keeps it ready.)
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.setAttribute("data-scrolled", "true");
    else header.removeAttribute("data-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
