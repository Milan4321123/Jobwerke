/***************************************************************
  kontakt.js - Minimal logic for Kontakt page
***************************************************************/

// 1) MOBILE NAV TOGGLE
const mobileToggle = document.getElementById('mobileToggle');
const navbarMenu = document.getElementById('navbarMenu');

if(mobileToggle && navbarMenu) {
  mobileToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('nav-open');
  });
}

// 2) LANGUAGE TOGGLE
const langBtn = document.getElementById('toggleLang');
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');
let isGerman = true;

if(langBtn) {
  langBtn.addEventListener('click', () => {
    isGerman = !isGerman;
    germanDivs.forEach(div => div.classList.toggle('hidden', !isGerman));
    englishDivs.forEach(div => div.classList.toggle('hidden', isGerman));
    langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  });
}

// 3) TOGGLE APPOINTMENT FIELDS (IF ANY)
const radioMsgDe = document.getElementById('message');
const radioApptDe = document.getElementById('appoint');
const appointmentFields = document.getElementById('appointment-fields');

// For EN (if needed)
const radioMsgEn = document.getElementById('en-anliegen-message');
const radioApptEn = document.getElementById('en-anliegen-appointment');
const appointmentFieldsEn = document.getElementById('appointment-fields-en');

function toggleAppointmentFields() {
  // German
  if(radioMsgDe && radioApptDe && appointmentFields) {
    appointmentFields.style.display = radioApptDe.checked ? 'block' : 'none';
  }
  // English
  if(radioMsgEn && radioApptEn && appointmentFieldsEn) {
    appointmentFieldsEn.style.display = radioApptEn.checked ? 'block' : 'none';
  }
}

// Attach events if they exist
if(radioMsgDe) {
  radioMsgDe.addEventListener('change', toggleAppointmentFields);
  radioApptDe.addEventListener('change', toggleAppointmentFields);
}
if(radioMsgEn) {
  radioMsgEn.addEventListener('change', toggleAppointmentFields);
  radioApptEn.addEventListener('change', toggleAppointmentFields);
}

// Init on page load
toggleAppointmentFields();