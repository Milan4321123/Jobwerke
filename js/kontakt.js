document.addEventListener("DOMContentLoaded", () => {
  console.log("Kontakt WOW JS loaded!");

  // ========== 1) Fade-in on scroll ==========
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

  // ========== 3) Mobile Nav (Hamburger) Toggle ==========
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navbarMenu = document.getElementById("navbarMenu");
  hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("nav-open");
  });

  // ========== 4) Parallax Hero BG (optional) ==========
  const parallaxHero = document.getElementById("parallaxHero");
  if (parallaxHero) {
    window.addEventListener("scroll", () => {
      const offset = window.scrollY * 0.3;
      parallaxHero.children[0].style.transform = `translateY(${offset}px)`;
    });
  }

  // ========== 5) Show/hide appointment fields ==========
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

  // Listen for changes on the radio buttons
  radioMessage.addEventListener("change", toggleAppointmentFields);
  radioAppointment.addEventListener("change", toggleAppointmentFields);

  // ========== 6) Form Submission ==========
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("msg").value.trim();

      // Honeypot
      const honeypot = document.getElementById("hp").value;
      if (honeypot) {
        console.warn("Spam detected. Aborting submission.");
        return;
      }

      if (!name || !email || !message) {
        alert("Bitte füllen Sie Name, Email und Nachricht aus.");
        return;
      }

      // Check if the user wants an appointment
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

      // Construct payload
      const payload = {
        name,
        email,
        message,
        wantsAppointment,
        terminDate,
        terminTime
      };

      try {
        const response = await fetch("http://localhost:3000/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.success) {
          alert("Nachricht erfolgreich gesendet! Vielen Dank.");
          form.reset();
          // Hide appointment fields after reset
          appointmentFields.style.display = "none";
          // Optionally switch radio back to message-only
          radioMessage.checked = true;
        } else {
          alert("Fehler beim Senden. Bitte versuchen Sie es erneut.");
        }
      } catch (err) {
        console.error("Error sending data:", err);
        alert("Netzwerkfehler. Bitte später erneut versuchen.");
      }
    });
  }
});