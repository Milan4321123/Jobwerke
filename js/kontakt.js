// public/js/kontakt.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) MOBILE NAVBAR TOGGLE
  const mobileToggle = document.getElementById('mobileToggle');
  const navbarMenu = document.getElementById('navbarMenu');
  if (mobileToggle && navbarMenu) {
    mobileToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('nav-open');
    });
  }

  // 2) FADE-IN OBSERVER (for .fade-section)
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

  // 3) SHOW/HIDE APPOINTMENT FIELDS
  const radioMessageGer = document.getElementById('anliegen-message');
  const radioAppointmentGer = document.getElementById('anliegen-appointment');
  const radioMessageEn = document.getElementById('en-anliegen-message');
  const radioAppointmentEn = document.getElementById('en-anliegen-appointment');
  const appointmentFields = document.getElementById('appointment-fields');

  function toggleAppointmentFields() {
    if (!appointmentFields) return;
    const isGerAppointment = radioAppointmentGer && radioAppointmentGer.checked;
    const isEnAppointment  = radioAppointmentEn  && radioAppointmentEn.checked;
    if (isGerAppointment || isEnAppointment) {
      appointmentFields.style.display = 'block';
    } else {
      appointmentFields.style.display = 'none';
    }
  }

  // If the radio buttons exist, watch for changes
  [radioMessageGer, radioAppointmentGer, radioMessageEn, radioAppointmentEn].forEach(r => {
    if (r) r.addEventListener('change', toggleAppointmentFields);
  });
  toggleAppointmentFields(); // run once on load

  // 4) LANGUAGE TOGGLE + SCROLL PRESERVATION
  const urlParams = new URLSearchParams(window.location.search);
  let currentLang = urlParams.get('lang') || 'de';
  const germanDivs = document.querySelectorAll('.german');
  const englishDivs = document.querySelectorAll('.english');
  let isGerman = (currentLang !== 'en');

  // Show/hide .german / .english
  if (isGerman) {
    germanDivs.forEach(el => el.classList.remove('hidden'));
    englishDivs.forEach(el => el.classList.add('hidden'));
  } else {
    germanDivs.forEach(el => el.classList.add('hidden'));
    englishDivs.forEach(el => el.classList.remove('hidden'));
  }

  // If there's a scrollRatio param, restore after reload
  if (urlParams.has('scrollRatio')) {
    const ratio = parseFloat(urlParams.get('scrollRatio'));
    setTimeout(() => {
      const docHeight = document.body.scrollHeight || 1;
      const scrollY = Math.round(docHeight * ratio);
      window.scrollTo(0, scrollY);
    }, 50);
  }

  // The language toggle button
  const langBtn = document.getElementById('toggleLang');
  if (langBtn) {
    langBtn.textContent = isGerman ? 'English' : 'Deutsch';
    langBtn.addEventListener('click', () => {
      const currentScrollY = window.pageYOffset;
      const docHeight = document.body.scrollHeight || 1;
      const ratio = currentScrollY / docHeight;

      isGerman = !isGerman;
      const newLang = isGerman ? 'de' : 'en';

      urlParams.set('lang', newLang);
      urlParams.set('scrollRatio', ratio.toFixed(4));

      window.location.search = urlParams.toString();
    });
  }
});