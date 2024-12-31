document.addEventListener("DOMContentLoaded", () => {
  console.log("Kontakt JS loaded!");

  // (A) Fade-in on scroll
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

  // (B) Sticky navbar on scroll (optional)
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled-navbar");
    } else {
      navbar.classList.remove("scrolled-navbar");
    }
  });

  // (C) Mobile nav toggle
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");
  hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("nav-open");
  });

  // (D) Parallax hero (optional)
  const parallaxHero = document.getElementById("parallaxHero");
  if (parallaxHero) {
    window.addEventListener("scroll", () => {
      const offset = window.scrollY * 0.3;
      const heroImg = parallaxHero.querySelector("img");
      if (heroImg) {
        heroImg.style.transform = `translateY(${offset}px)`;
      }
    });
  }

  // (E) Appointment fields toggle
  const radioMessage = document.getElementById("anliegen-message");
  const radioAppointment = document.getElementById("anliegen-appointment");
  const appointmentFields = document.getElementById("appointment-fields");

  function toggleAppointmentFields() {
    if (radioAppointment.checked) {
      appointmentFields.style.display = "block";
    } else {
      appointmentFields.style.display = "none";
    }
  }
  radioMessage.addEventListener("change", toggleAppointmentFields);
  radioAppointment.addEventListener("change", toggleAppointmentFields);

  // (F) Form submission logic
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("yourname").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("msg").value.trim();
      const honeypot = document.getElementById("hp").value; // hidden field

      // If honeypot was filled, it's likely spam
      if (honeypot) {
        console.warn("Spam/honeypot triggered. Aborting submission.");
        return;
      }

      // Basic validation
      if (!name || !email || !message) {
        alert("Bitte füllen Sie Name, E-Mail und Nachricht aus.");
        return;
      }

      // If user wants an appointment, date + time are required
      const wantsAppointment = radioAppointment.checked;
      let terminDate = "";
      let terminTime = "";
      if (wantsAppointment) {
        terminDate = document.getElementById("terminDate").value.trim();
        terminTime = document.getElementById("terminTime").value.trim();
        if (!terminDate || !terminTime) {
          alert("Bitte geben Sie Datum und Uhrzeit für den Termin an.");
          return;
        }
      }

      // Example payload to send to your backend (if you have an API endpoint)
      const payload = {
        name,
        email,
        message,
        wantsAppointment,
        terminDate,
        terminTime
      };

      try {
        // Example fetch call (adjust the URL to your real endpoint)
        const response = await fetch("http://localhost:3000/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Server returned status " + response.status);
        }
        const data = await response.json();

        if (data.success) {
          // On success, redirect to a "thank you" page
          window.location.href = "danke.html?success=1";
        } else {
          window.location.href = "danke.html?error=1";
        }
      } catch (err) {
        console.error("Network or server error:", err);
        window.location.href = "danke.html?error=1";
      }
    });
  }
});