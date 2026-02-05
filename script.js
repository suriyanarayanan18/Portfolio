const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

// close menu when a link is clicked
menu.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "a") {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".reveal");
  if (!el) return;

  // small delay so it feels intentional
  setTimeout(() => el.classList.add("is-visible"), 300);
});
