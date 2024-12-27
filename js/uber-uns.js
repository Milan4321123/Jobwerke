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
        navbar.style.background = "rgba(255,255,255,0.95)";
        navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
      } else {
        navbar.style.background = "rgba(255,255,255,0.8)";
        navbar.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
      }
    });
  
    // ====== 3) (Optional) Parallax-like effect on hero image or shapes ======
    const heroBanner = document.getElementById("heroBanner");
    if (heroBanner) {
      window.addEventListener("scroll", () => {
        const offset = window.scrollY * 0.2;
        heroBanner.querySelector(".hero-banner__bg img").style.transform = 
          `translateY(${offset}px) scale(1.02)`;
      });
    }
  });