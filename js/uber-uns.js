document.addEventListener("DOMContentLoaded", () => {
  console.log("Über uns (WOW) JS loaded!");
  
  // ====== 1) Fade-in on scroll (Intersection Observer) ======
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

  // ====== 2) Sticky Navbar subtle style on scroll ======
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled-navbar");
    } else {
      navbar.classList.remove("scrolled-navbar");
    }
  });

  // ====== 3) Parallax-like effect on hero image or shapes (optional) ======
  const heroBanner = document.getElementById("heroBanner");
  if (heroBanner) {
    window.addEventListener("scroll", () => {
      const offset = window.scrollY * 0.2;
      const bgImg = heroBanner.querySelector(".hero-banner__bg img");
      if (bgImg) {
        bgImg.style.transform = `translateY(${offset}px) scale(1.02)`;
      }
    });
  }

  // ====== 4) Hamburger Menu Toggle for Mobile ======
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");
  hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("nav-open");
  });
});