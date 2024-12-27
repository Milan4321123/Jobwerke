document.addEventListener("DOMContentLoaded", () => {
  console.log("Enhanced Dienstleistungen JS loaded!");
  
  // ========== 1) Intersection Observer Fade In ==========
  const fadeSections = document.querySelectorAll(".fade-section");
  const observerOpts = { threshold: 0.1 };
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, observerOpts);
  
  fadeSections.forEach(sec => observer.observe(sec));
  
  // ========== 2) Sticky Navbar subtle style on scroll ==========
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled-navbar");
    } else {
      navbar.classList.remove("scrolled-navbar");
    }
  });

  // ========== 3) Hamburger Menu Toggle for Mobile ==========
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");
  hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("nav-open");
  });
});