/**************************************************************
  (Updated) SomePage.js
  Incorporates scroll-ratio preservation for language toggle
**************************************************************/

// 1) NAV TOGGLE (HAMBURGER)
const mobileToggle = document.getElementById('mobileToggle');
const navbarMenu = document.getElementById('navbarMenu');

if (mobileToggle && navbarMenu) {
  mobileToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('nav-open');
  });
}

// 2) DETECT & APPLY CURRENT LANGUAGE VIA ?lang=de / ?lang=en + optional scrollRatio
const params = new URLSearchParams(window.location.search);
let currentLang = params.get('lang') || 'de';  // default to 'de' if none

// If there's a scrollRatio param, parse and scroll there
if (params.has('scrollRatio')) {
  const ratio = parseFloat(params.get('scrollRatio'));
  setTimeout(() => {
    const docHeight = Math.max(document.body.scrollHeight, 1);
    const scrollY = Math.round(ratio * docHeight);
    window.scrollTo(0, scrollY);
  }, 50);
}

// Find all German & English sections
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');

// If the user has ?lang=en, hide German, show English; else show German
let isGerman = (currentLang !== 'en');
if (isGerman) {
  germanDivs.forEach(el => el.classList.remove('hidden'));
  englishDivs.forEach(el => el.classList.add('hidden'));
} else {
  germanDivs.forEach(el => el.classList.add('hidden'));
  englishDivs.forEach(el => el.classList.remove('hidden'));
}

// 3) LANGUAGE TOGGLE BUTTON
const langToggleBtn = document.getElementById('toggleLang');
if (langToggleBtn) {
  // Update button text
  langToggleBtn.textContent = isGerman ? 'English' : 'Deutsch';

  langToggleBtn.addEventListener('click', () => {
    // (a) Remember current scroll ratio
    const currentScrollY = window.pageYOffset;
    const docHeight = Math.max(document.body.scrollHeight, 1);
    const ratio = currentScrollY / docHeight;

    // (b) Flip language
    isGerman = !isGerman;
    const newLang = isGerman ? 'de' : 'en';

    // (c) Update URL param => ?lang= & ?scrollRatio=
    params.set('lang', newLang);
    params.set('scrollRatio', ratio.toFixed(4));

    // (d) Force reload with updated params
    window.location.search = params.toString();
  });
}

// 4) OPTIONAL: UPDATE NAV LINKS FOR THE CURRENT LANG
// If you want your links to keep the same ?lang= param
const navLinks = document.querySelectorAll('[data-nav-link]');
navLinks.forEach(link => {
  const linkPage = link.getAttribute('data-nav-link');
  // e.g., "home", "services", etc. => adapt to your real filenames
  let baseUrl = '#';
  if (linkPage === 'home') baseUrl = 'index.html';
  else if (linkPage === 'services') baseUrl = 'dienstleistungen.html';
  // ...and so on...

  const newParams = new URLSearchParams(window.location.search);
  newParams.set('lang', isGerman ? 'de' : 'en');
  link.href = baseUrl + '?' + newParams.toString();
});

// 5) TYPING EFFECT (GERMAN + ENGLISH)
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

// 6) SHOW MORE/LESS (KERNLEISTUNGEN) – BOTH GERMAN & EN
const toggleButtons = document.querySelectorAll('.kl-text-col .btn-toggle');
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const extraText = btn.parentElement.querySelector('.extra-text');
    if (!extraText) return;
    if (extraText.style.display === 'block') {
      extraText.style.display = 'none';
      btn.textContent = isGerman ? 'Mehr anzeigen' : 'Show more';
    } else {
      extraText.style.display = 'block';
      btn.textContent = isGerman ? 'Weniger anzeigen' : 'Show less';
    }
  });
});

// 7) FAQ ITEM TOGGLE
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach(item => {
  const question = item.querySelector(".faq-question");
  question.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});