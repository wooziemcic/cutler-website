/* =========================
   Cutler Phase 2A Widgets Base
   - Small, dependency-free helpers
   - Designed for static-site embedding
========================= */

const SVG_NS = "http://www.w3.org/2000/svg";

// Tags we create for charts/diagrams that must be in SVG namespace.
// (Safe to include extra tags; only SVG ones use createElementNS.)
const SVG_TAGS = new Set([
  "svg",
  "g",
  "path",
  "polyline",
  "polygon",
  "line",
  "rect",
  "circle",
  "ellipse",
  "text",
  "tspan",
  "defs",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "title",
  "desc"
]);

export async function fetchJSON(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return await res.json();
}

export function el(tag, attrs = {}, children = []) {
  // FIX: SVG must be created with createElementNS, otherwise it won't render.
  const isSvg = SVG_TAGS.has(tag);
  const node = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);

  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") {
      // In SVG, className is SVGAnimatedString in some browsers; set attribute instead.
      node.setAttribute("class", String(v));
    } else if (k === "text") {
      node.textContent = v;
    } else if (k === "html") {
      // Only meaningful for HTML nodes; safe no-op for SVG in most cases but keep behavior.
      node.innerHTML = v;
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2), v);
    } else {
      node.setAttribute(k, String(v));
    }
  }

  for (const c of (Array.isArray(children) ? children : [children])) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }

  return node;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function prefersReducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function observeReveal(root, className = "ccm-reveal") {
  if (!root) return;

  // If IntersectionObserver isn't available, just show.
  if (!("IntersectionObserver" in window)) {
    root.classList.add("is-visible");
    return;
  }

  root.classList.add(className);
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          root.classList.add("is-visible");
          io.disconnect();
          break;
        }
      }
    },
    { threshold: 0.18 }
  );

  io.observe(root);
}

export function formatPct(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  // Keep it calm: whole percent.
  return `${Math.round(v)}%`;
}
