/**************************************************************
  (Updated) dienstleistungen.js
  Incorporates three-language support: German, English, Croatian
**************************************************************/

// 1) NAV TOGGLE (HAMBURGER)
const mobileToggle = document.getElementById('mobileToggle');
const navbarMenu = document.getElementById('navbarMenu');

if (mobileToggle && navbarMenu) {
  mobileToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('nav-open');
  });
}

// 2) DETECT & APPLY CURRENT LANGUAGE VIA ?lang=de / ?lang=en / ?lang=hr + optional scrollRatio
const params = new URLSearchParams(window.location.search);
let currentLangParam = params.get('lang') || 'de';  // default to 'de' if none

// Map URL parameters to currentLang index
let currentLang = 0; // 0 = German, 1 = English, 2 = Croatian
if (currentLangParam === 'en') currentLang = 1;
else if (currentLangParam === 'hr') currentLang = 2;

// If there's a scrollRatio param, parse and scroll there
if (params.has('scrollRatio')) {
  const ratio = parseFloat(params.get('scrollRatio'));
  setTimeout(() => {
    const docHeight = Math.max(document.body.scrollHeight, 1);
    const scrollY = Math.round(ratio * docHeight);
    window.scrollTo(0, scrollY);
  }, 50);
}

// Find all German, English & Croatian sections
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');
const croatianDivs = document.querySelectorAll('.croatian');

// Function to update language display
function updateLanguageDisplay() {
  germanDivs.forEach(el => el.classList.toggle('hidden', currentLang !== 0));
  englishDivs.forEach(el => el.classList.toggle('hidden', currentLang !== 1));
  croatianDivs.forEach(el => el.classList.toggle('hidden', currentLang !== 2));
}

// Initial language display
updateLanguageDisplay();

// 3) LANGUAGE TOGGLE BUTTON
const langToggleBtn = document.getElementById('toggleLang');
if (langToggleBtn) {
  // Set initial button text based on current language
  const buttonTexts = ['English', 'Hrvatski', 'Deutsch'];
  langToggleBtn.textContent = buttonTexts[currentLang];

  langToggleBtn.addEventListener('click', () => {
    // (a) Remember current scroll ratio
    const currentScrollY = window.pageYOffset;
    const docHeight = Math.max(document.body.scrollHeight, 1);
    const ratio = currentScrollY / docHeight;

    // (b) Cycle to next language
    currentLang = (currentLang + 1) % 3;
    
    // Map currentLang to URL parameter
    const langParams = ['de', 'en', 'hr'];
    const newLang = langParams[currentLang];

    // (c) Update URL param => ?lang= & ?scrollRatio=
    params.set('lang', newLang);
    params.set('scrollRatio', ratio.toFixed(4));

    // (d) Force reload with updated params
    window.location.search = params.toString();
  });
}

// 4) TYPING EFFECT (GERMAN + ENGLISH + CROATIAN)
// ================== GERMAN ===================
const textArrayDe = [
  "Qualität & Verantwortung.",
  "Service-Teams in unserem Unternehmen.",
  "Keine Arbeitnehmerüberlassung.",
  "Individuell auf Sie zugeschnitten."
];
const typingTextElDe = document.getElementById("typingTextDe");
let indexDe = 0, charDe = 0;
let currentDe = textArrayDe[indexDe];
let deletingDe = false;
let delayDe = 120;

function typeEffectDe() {
  if (!typingTextElDe) return;
  if (!deletingDe && charDe < currentDe.length) {
    typingTextElDe.textContent = currentDe.substring(0, charDe + 1);
    charDe++;
    setTimeout(typeEffectDe, delayDe);
  } else if (deletingDe && charDe > 0) {
    typingTextElDe.textContent = currentDe.substring(0, charDe - 1);
    charDe--;
    setTimeout(typeEffectDe, 40);
  } else {
    if (!deletingDe && charDe === currentDe.length) {
      setTimeout(() => {
        deletingDe = true;
        typeEffectDe();
      }, 1200);
    } else if (deletingDe && charDe === 0) {
      deletingDe = false;
      indexDe = (indexDe + 1) % textArrayDe.length;
      currentDe = textArrayDe[indexDe];
      setTimeout(typeEffectDe, 300);
    }
  }
}
typeEffectDe(); // start German typing

// ================== ENGLISH ===================
const textArrayEn = [
  "Quality & Responsibility.",
  "Service teams employed by us.",
  "No Worker Leasing.",
  "Tailored to your needs."
];
const typingTextElEn = document.getElementById("typingTextEn");
let indexEn = 0, charEn = 0;
let currentEn = textArrayEn[indexEn];
let deletingEn = false;
let delayEn = 120;

function typeEffectEn() {
  if (!typingTextElEn) return;
  if (!deletingEn && charEn < currentEn.length) {
    typingTextElEn.textContent = currentEn.substring(0, charEn + 1);
    charEn++;
    setTimeout(typeEffectEn, delayEn);
  } else if (deletingEn && charEn > 0) {
    typingTextElEn.textContent = currentEn.substring(0, charEn - 1);
    charEn--;
    setTimeout(typeEffectEn, 40);
  } else {
    if (!deletingEn && charEn === currentEn.length) {
      setTimeout(() => {
        deletingEn = true;
        typeEffectEn();
      }, 1200);
    } else if (deletingEn && charEn === 0) {
      deletingEn = false;
      indexEn = (indexEn + 1) % textArrayEn.length;
      currentEn = textArrayEn[indexEn];
      setTimeout(typeEffectEn, 300);
    }
  }
}
typeEffectEn(); // start English typing

// ================== CROATIAN ===================
const textArrayHr = [
  "Kvaliteta i odgovornost.",
  "Uslužni timovi zaposleni kod nas.",
  "Bez iznajmljivanja radnika.",
  "Prilagođeno vašim potrebama."
];
const typingTextElHr = document.getElementById("typingTextHr");
let indexHr = 0, charHr = 0;
let currentHr = textArrayHr[indexHr];
let deletingHr = false;
let delayHr = 120;

function typeEffectHr() {
  if (!typingTextElHr) return;
  if (!deletingHr && charHr < currentHr.length) {
    typingTextElHr.textContent = currentHr.substring(0, charHr + 1);
    charHr++;
    setTimeout(typeEffectHr, delayHr);
  } else if (deletingHr && charHr > 0) {
    typingTextElHr.textContent = currentHr.substring(0, charHr - 1);
    charHr--;
    setTimeout(typeEffectHr, 40);
  } else {
    if (!deletingHr && charHr === currentHr.length) {
      setTimeout(() => {
        deletingHr = true;
        typeEffectHr();
      }, 1200);
    } else if (deletingHr && charHr === 0) {
      deletingHr = false;
      indexHr = (indexHr + 1) % textArrayHr.length;
      currentHr = textArrayHr[indexHr];
      setTimeout(typeEffectHr, 300);
    }
  }
}
typeEffectHr(); // start Croatian typing

// 5) SHOW MORE/LESS (KERNLEISTUNGEN) – ALL THREE LANGUAGES
const toggleButtons = document.querySelectorAll('.kl-text-col .btn-toggle');
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const extraText = btn.parentElement.querySelector('.extra-text');
    if (!extraText) return;
    
    const showMoreTexts = ['Mehr anzeigen', 'Show more', 'Prikaži više'];
    const showLessTexts = ['Weniger anzeigen', 'Show less', 'Prikaži manje'];
    
    if (extraText.style.display === 'block') {
      extraText.style.display = 'none';
      btn.textContent = showMoreTexts[currentLang];
    } else {
      extraText.style.display = 'block';
      btn.textContent = showLessTexts[currentLang];
    }
  });
});

// 6) FAQ ITEM TOGGLE
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach(item => {
  const question = item.querySelector(".faq-question");
  question.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});
