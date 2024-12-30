document.addEventListener("DOMContentLoaded", () => {
  console.log("Index Page Loaded");

  // ====== FADE IN on SCROLL (IntersectionObserver) ======
  const fadeSections = document.querySelectorAll(".fade-section");
  const fadeOptions = { threshold: 0.1 };
  const fadeObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, fadeOptions);
  fadeSections.forEach(sec => fadeObserver.observe(sec));

  // ====== STICKY NAVBAR ======
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  });

  // ====== MOBILE NAV TOGGLE ======
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");

  hamburgerBtn.addEventListener("click", () => {
    // toggles the nav menu
    navbarMenu.querySelector("ul").classList.toggle("nav-open");
  });
});