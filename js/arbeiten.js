document.addEventListener("DOMContentLoaded", () => {
  console.log("WOW Arbeiten JS loaded!");

  // ========== 1) Fade in on scroll using Intersection Observer ==========
  const fadeSections = document.querySelectorAll(".fade-section");
  const obsOptions = { threshold: 0.1 };
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, obsOptions);
  fadeSections.forEach(sec => obs.observe(sec));

  // ========== 2) Sticky Navbar subtle style on scroll ==========
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled-navbar");
    } else {
      navbar.classList.remove("scrolled-navbar");
    }
  });

  // ========== 3) Tilt Effect on .tilt elements (No library) ==========
  const tiltElements = document.querySelectorAll(".tilt");

  tiltElements.forEach(el => {
    el.addEventListener("mousemove", handleTilt);
    el.addEventListener("mouseleave", resetTilt);
  });

  function handleTilt(e) {
    const { offsetWidth, offsetHeight } = this;
    const centerX = this.offsetLeft + offsetWidth / 2;
    const centerY = this.offsetTop + offsetHeight / 2;
    const mouseX = e.pageX - centerX;
    const mouseY = e.pageY - centerY;
    const rotateX = (mouseY / offsetHeight) * 8;  // tilt strength
    const rotateY = (-mouseX / offsetWidth) * 8;
    this.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function resetTilt() {
    this.style.transform = "rotateX(0deg) rotateY(0deg)";
    this.style.transition = "transform 0.6s ease";
    setTimeout(() => {
      this.style.transition = "";
    }, 600);
  }

  // ========== 4) Hamburger Toggle for Mobile Navigation ==========
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");

  hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("menu-open");
    hamburgerBtn.classList.toggle("active");
  });
});