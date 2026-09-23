import "@fontsource-variable/manrope";
const messages = {
  general:
    "Olá! Quero analisar a presença digital da minha empresa com a ORVION.",
  diagnosis:
    "Olá! Quero descobrir onde minha empresa pode estar perdendo oportunidades na internet.",
};
document.querySelectorAll("[data-message]").forEach((link) => {
  link.href = `https://wa.me/5527999408858?text=${encodeURIComponent(messages[link.dataset.message])}`;
});
document.querySelector("#year").textContent = new Date().getFullYear();
const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#navigation");
function closeMenu(restoreFocus = false) {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Abrir menu");
  header.classList.remove("menu-open");
  if (restoreFocus) menu.focus();
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  header.classList.toggle("menu-open", open);
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true")
    closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener("focusout", () =>
  queueMicrotask(() => {
    if (!header.contains(document.activeElement)) closeMenu();
  }),
);
matchMedia("(min-width: 901px)").addEventListener("change", () => closeMenu());
let scrollPending = false;
function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
  scrollPending = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateHeader);
    }
  },
  { passive: true },
);
updateHeader();
const progress = document.querySelector(".scroll-progress");
let previousScrollY = window.scrollY;
let scrollDirection = "down";
let scrollFrame = false;
let directionTimer;
function updateScrollEffects() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  const currentY = window.scrollY;
  if (Math.abs(currentY - previousScrollY) > 2) {
    scrollDirection = currentY > previousScrollY ? "down" : "up";
    document.documentElement.dataset.scrollDirection = scrollDirection;
    clearTimeout(directionTimer);
    directionTimer = setTimeout(() => {
      document.documentElement.dataset.scrollDirection = "still";
    }, 180);
  }
  previousScrollY = currentY;
  document.documentElement.style.setProperty("--page-progress", `${amount * 100}%`);
  document.documentElement.style.setProperty("--scroll-shift", `${amount * 180}px`);
  progress?.setAttribute("aria-valuenow", String(Math.round(amount * 100)));
  scrollFrame = false;
}
window.addEventListener("scroll", () => {
  if (!scrollFrame) {
    scrollFrame = true;
    requestAnimationFrame(updateScrollEffects);
  }
}, { passive: true });
window.addEventListener("resize", updateScrollEffects, { passive: true });
updateScrollEffects();
const options = [...document.querySelectorAll(".analysis-item")];
function syncOptions() {
  document.querySelector(".analysis-options").classList.toggle(
    "has-selection",
    options.some((item) => item.open),
  );
  options.forEach((item) =>
    item
      .querySelector("summary")
      .setAttribute("aria-expanded", String(item.open)),
  );
}
options.forEach((item, index) => {
  const summary = item.querySelector("summary");
  const body = item.querySelector(".analysis-body");
  body.id = `analysis-panel-${index}`;
  summary.setAttribute("aria-controls", body.id);
  summary.addEventListener("click", () => {
    if (!item.open)
      options.forEach((other) => {
        if (other !== item) other.open = false;
      });
  });
  item.addEventListener("toggle", syncOptions);
});
syncOptions();
// Visible by default: no JS/observer must never hide page content.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let observer;
function configureMotion() {
  observer?.disconnect();
  const elements = document.querySelectorAll(".reveal");
  elements.forEach((element, index) => {
    element.classList.remove("waiting");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 75}ms`);
  });
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        entry.target.classList.toggle("waiting", !entry.isIntersecting);
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      }),
    { threshold: 0.08, rootMargin: "0px 0px -12% 0px" },
  );
  elements.forEach((element) => observer.observe(element));
}
configureMotion();
reducedMotion.addEventListener("change", configureMotion);
if ("IntersectionObserver" in window) {
  const art = document.querySelector(".hero-art");
  let visible = true;
  const syncPause = () =>
    art.classList.toggle("paused", !visible || document.hidden);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPause();
  }).observe(art);
  document.addEventListener("visibilitychange", syncPause);
}
