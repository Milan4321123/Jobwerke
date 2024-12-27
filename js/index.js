document.addEventListener("DOMContentLoaded", () => {
  console.log("Index (Home) JS loaded!");

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

  // ====== 2) Sticky Navbar color change on scroll ======
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  });

  // ====== 3) Smooth scroll for anchor links (optional) ======
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