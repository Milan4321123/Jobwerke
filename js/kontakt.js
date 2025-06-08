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
  const radioMessageHr = document.getElementById('hr-anliegen-message');
  const radioAppointmentHr = document.getElementById('hr-anliegen-appointment');
  const appointmentFields = document.getElementById('appointment-fields');

  function toggleAppointmentFields() {
    if (!appointmentFields) return;
    const isGerAppointment = radioAppointmentGer && radioAppointmentGer.checked;
    const isEnAppointment  = radioAppointmentEn  && radioAppointmentEn.checked;
    const isHrAppointment  = radioAppointmentHr  && radioAppointmentHr.checked;
    if (isGerAppointment || isEnAppointment || isHrAppointment) {
      appointmentFields.style.display = 'block';
    } else {
      appointmentFields.style.display = 'none';
    }
  }

  // If the radio buttons exist, watch for changes
  [radioMessageGer, radioAppointmentGer, radioMessageEn, radioAppointmentEn, radioMessageHr, radioAppointmentHr].forEach(r => {
    if (r) r.addEventListener('change', toggleAppointmentFields);
  });
  toggleAppointmentFields(); // run once on load

  // 4) LANGUAGE TOGGLE + SCROLL PRESERVATION (Three Languages)
  const urlParams = new URLSearchParams(window.location.search);
  let currentLang = urlParams.get('lang') || 'de';
  const germanDivs = document.querySelectorAll('.german');
  const englishDivs = document.querySelectorAll('.english');
  const croatianDivs = document.querySelectorAll('.croatian');

  // Language state: 0=German, 1=English, 2=Croatian
  let currentLangIndex = 0;
  if (currentLang === 'en') currentLangIndex = 1;
  else if (currentLang === 'hr') currentLangIndex = 2;

  function updateLanguageDisplay() {
    // Hide all first
    germanDivs.forEach(el => el.classList.add('hidden'));
    englishDivs.forEach(el => el.classList.add('hidden'));
    croatianDivs.forEach(el => el.classList.add('hidden'));

    // Show current language
    if (currentLangIndex === 0) {
      germanDivs.forEach(el => el.classList.remove('hidden'));
    } else if (currentLangIndex === 1) {
      englishDivs.forEach(el => el.classList.remove('hidden'));
    } else if (currentLangIndex === 2) {
      croatianDivs.forEach(el => el.classList.remove('hidden'));
    }
  }

  // Initial display
  updateLanguageDisplay();

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
    // Set initial button text
    const buttonTexts = ['English', 'Hrvatski', 'Deutsch'];
    langBtn.textContent = buttonTexts[currentLangIndex];

    langBtn.addEventListener('click', () => {
      const currentScrollY = window.pageYOffset;
      const docHeight = document.body.scrollHeight || 1;
      const ratio = currentScrollY / docHeight;

      // Cycle through languages: German -> English -> Croatian -> German
      currentLangIndex = (currentLangIndex + 1) % 3;
      const langCodes = ['de', 'en', 'hr'];
      const newLang = langCodes[currentLangIndex];

      urlParams.set('lang', newLang);
      urlParams.set('scrollRatio', ratio.toFixed(4));

      window.location.search = urlParams.toString();
    });
  }
});