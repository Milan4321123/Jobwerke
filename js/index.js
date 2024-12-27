document.addEventListener("DOMContentLoaded", () => {
  console.log("Index (Home) JS loaded!");

  // ===== FADE-IN ON SCROLL (Intersection Observer) =====
  const fadeSections = document.querySelectorAll(".fade-section");
  const observerOptions = { threshold: 0.1 };
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeSections.forEach(section => observer.observe(section));

  // ===== STICKY NAVBAR COLOR CHANGE ON SCROLL =====
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  });

  // ===== MOBILE NAV TOGGLE =====
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");

  hamburgerBtn.addEventListener("click", () => {
    // toggles the nav menu
    navbarMenu.classList.toggle("nav-open");
  });

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS (OPTIONAL) =====
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 70, // offset for navbar
          behavior: "smooth"
        });
      }
    });
  });
});