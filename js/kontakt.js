// public/js/kontakt.js
document.addEventListener('DOMContentLoaded', () => {

  /* 1) MOBILE NAVBAR TOGGLE (optional) */
  const mobileToggle = document.getElementById('mobileToggle');
  const navbarMenu = document.getElementById('navbarMenu');
  if (mobileToggle && navbarMenu) {
    mobileToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('nav-open');
    });
  }

  /* 2) FADE-IN OBSERVER (optional if you want fade animations) */
  const fadeSections = document.querySelectorAll('.fade-section');
  const observerOptions = { threshold: 0.1 };
  const fadeObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeSections.forEach(sec => fadeObserver.observe(sec));

  /* 3) SHOW/HIDE APPOINTMENT FIELDS */
  // German radio IDs:  anliegen-message, anliegen-appointment
  // English radio IDs: en-anliegen-message, en-anliegen-appointment
  const radioMessage = document.getElementById('anliegen-message')
                     || document.getElementById('en-anliegen-message');
  const radioAppointment = document.getElementById('anliegen-appointment')
                        || document.getElementById('en-anliegen-appointment');
  const appointmentFields = document.getElementById('appointment-fields');

  function toggleAppointmentFields() {
    if (!appointmentFields) return;
    if (radioAppointment && radioAppointment.checked) {
      appointmentFields.style.display = 'block';
    } else {
      appointmentFields.style.display = 'none';
    }
  }

  if (radioMessage && radioAppointment) {
    radioMessage.addEventListener('change', toggleAppointmentFields);
    radioAppointment.addEventListener('change', toggleAppointmentFields);
    toggleAppointmentFields(); // run once on load
  }

  /* 4) DETECT LANG FROM URL ?lang=de or ?lang=en */
  const urlParams = new URLSearchParams(window.location.search);
  let currentLang = urlParams.get('lang');
  if (!currentLang) currentLang = 'de'; // fallback

  // Show/hide .german vs .english sections
  const germanDivs = document.querySelectorAll('.german');
  const englishDivs = document.querySelectorAll('.english');
  let isGerman = (currentLang !== 'en');

  if (isGerman) {
    germanDivs.forEach(el => el.classList.remove('hidden'));
    englishDivs.forEach(el => el.classList.add('hidden'));
  } else {
    germanDivs.forEach(el => el.classList.add('hidden'));
    englishDivs.forEach(el => el.classList.remove('hidden'));
  }

  /* 5) LANGUAGE TOGGLE BUTTON + SCROLL PRESERVATION */
  const langBtn = document.getElementById('toggleLang');
  if (langBtn) {
    langBtn.textContent = isGerman ? 'English' : 'Deutsch';
    langBtn.addEventListener('click', () => {
      // Save user’s current scroll position as a ratio
      const currentScrollY = window.pageYOffset;
      const docHeight = document.body.scrollHeight || 1;
      const ratio = currentScrollY / docHeight;

      // Flip language
      isGerman = !isGerman;
      const newLang = isGerman ? 'de' : 'en';

      // Update URL with ?lang= + ?scrollRatio=
      urlParams.set('lang', newLang);
      urlParams.set('scrollRatio', ratio.toFixed(4));

      // Reload the page with updated search params
      window.location.search = urlParams.toString();
    });
  }

  // If there's a ?scrollRatio= param, restore scroll after reload
  if (urlParams.has('scrollRatio')) {
    const ratio = parseFloat(urlParams.get('scrollRatio'));
    setTimeout(() => {
      const docHeight = document.body.scrollHeight || 1;
      const scrollY = Math.round(docHeight * ratio);
      window.scrollTo(0, scrollY);
    }, 50);
  }

  /* 6) CONTACT FORM SUBMISSION */
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather field values (German OR English placeholders)
    const name = form.querySelector('input[placeholder="Ihr Name"]')?.value
              || form.querySelector('input[placeholder="Your Name"]')?.value
              || "";
    const email = form.querySelector('#email')?.value || "";
    const msgField = form.querySelector('#msg');
    const message = msgField ? msgField.value.trim() : "";

    const hp = form.querySelector('#hp')?.value || ""; // honeypot

    // Check if user selected "appointment" in either language
    const radioAppointmentGer = document.getElementById('anliegen-appointment');
    const radioAppointmentEn  = document.getElementById('en-anliegen-appointment');
    const wantsAppointment = (
      (radioAppointmentGer && radioAppointmentGer.checked) ||
      (radioAppointmentEn && radioAppointmentEn.checked)
    ) ? true : false;

    let terminDate = "";
    let terminTime = "";
    if (wantsAppointment) {
      // If found in German section
      const dateGer = document.querySelector('.german #terminDate');
      const timeGer = document.querySelector('.german #terminTime');
      // If found in English section
      const dateEn  = document.querySelector('.english #terminDate');
      const timeEn  = document.querySelector('.english #terminTime');

      // Use whichever is not empty
      if (dateGer && dateGer.value) terminDate = dateGer.value;
      if (timeGer && timeGer.value) terminTime = timeGer.value;
      if (dateEn && dateEn.value) terminDate = dateEn.value;
      if (timeEn && timeEn.value) terminTime = timeEn.value;
    }

    // Build payload
    const payload = {
      name,
      email,
      message,
      hp,
      wantsAppointment,
      terminDate,
      terminTime,
    };

    try {
      // POST to /send-email
      const res = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Fehler beim Absenden: " + (data.msg || ''));
        return;
      }

      // Success
      if (wantsAppointment) {
        // The user chose "Einen Termin vereinbaren"
        window.location.href = "danke.html?success=1&appointment=1";
      } else {
        // The user just sent a message
        window.location.href = "danke.html?success=1";
      }
      // Hide appointment fields again if needed
      toggleAppointmentFields();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Serverfehler. Bitte später erneut versuchen.");
    }
  });
});