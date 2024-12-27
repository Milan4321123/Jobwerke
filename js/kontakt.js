document.addEventListener("DOMContentLoaded", () => {
    console.log("Kontakt WOW JS loaded!");
  
    // ========== 1) Fade-in on scroll (Intersection Observer) ==========
    const fadeElems = document.querySelectorAll(".fade-section");
    const fadeObsOpts = { threshold: 0.1 };
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, fadeObsOpts);
    fadeElems.forEach(elem => fadeObserver.observe(elem));
  
    // ========== 2) Sticky navbar style on scroll ==========
    const navbar = document.getElementById("mainNavbar");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        navbar.classList.add("scrolled-navbar");
      } else {
        navbar.classList.remove("scrolled-navbar");
      }
    });
  
    // ========== 3) Parallax for hero background (optional) ==========
    const parallaxHero = document.getElementById("parallaxHero");
    if (parallaxHero) {
      window.addEventListener("scroll", () => {
        const offset = window.scrollY * 0.3; 
        parallaxHero.children[0].style.transform = `translateY(${offset}px)`;
      });
    }
  
    // ========== 4) (Optional) Form Submit Handler ========== 
    // Just a placeholder - handle the form logic here if needed
    const form = document.querySelector(".contact-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Vielen Dank für Ihre Nachricht! Wir melden uns schnellstmöglich bei Ihnen.");
        form.reset();
      });
    }
  });