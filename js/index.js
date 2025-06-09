/***************************************************************************
  improved-home.js (example for your Home page or similar page)
  - Preserves scroll ratio on language toggle
  - Toggles .german / .english sections
  - Manages nav toggles & sliders
***************************************************************************/

document.addEventListener('DOMContentLoaded', () => {
    // ======================================================================
    // 1) MOBILE NAVBAR TOGGLE
    // ======================================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navbarMenu = document.getElementById('navbarMenu');
  
    if (mobileToggle && navbarMenu) {
      mobileToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('nav-open');
      });
    }
  
    // ======================================================================
    // 2) FADE-IN OBSERVER
    // ======================================================================
    const fadeElems = document.querySelectorAll('.fade-in');
    const ioOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, ioOptions);
  
    fadeElems.forEach(el => observer.observe(el));
  
    // ======================================================================
    // 3) TABS SWITCHING LOGIC (.svc-step) - Supports all languages
    // ======================================================================
    const steps = document.querySelectorAll('.svc-step');
    const panels = document.querySelectorAll('.svc-step-panel');
  
    steps.forEach(step => {
      step.addEventListener('click', () => {
        // Get the current language section we're in
        const currentSection = step.closest('.german, .english, .croatian');
        
        if (currentSection) {
          // Remove 'active' from all steps/panels within this language section
          const sectionSteps = currentSection.querySelectorAll('.svc-step');
          const sectionPanels = currentSection.querySelectorAll('.svc-step-panel');
          
          sectionSteps.forEach(s => s.classList.remove('active'));
          sectionPanels.forEach(p => p.classList.remove('active'));
  
          // Mark this step active
          step.classList.add('active');
  
          // Build panel ID from data-step attribute
          const stepNumber = step.getAttribute('data-step'); 
          const panelId = `panel-${stepNumber}`;
  
          // Activate the target panel within the same language section
          const targetPanel = currentSection.querySelector(`#${panelId}`);
          if (targetPanel) {
            targetPanel.classList.add('active');
          }
        } else {
          // Fallback to original behavior for backward compatibility
          steps.forEach(s => s.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));

          step.classList.add('active');
          
          const stepNumber = step.getAttribute('data-step'); 
          const panelId = `panel-${stepNumber}`;
          
          const targetPanel = document.getElementById(panelId);
          if (targetPanel) {
            targetPanel.classList.add('active');
          }
        }
      });
    });
  
    // ======================================================================
    // 4) TESTIMONIALS SLIDER – GERMAN
    // ======================================================================
    (function initGermanSlider() {
      const slidesDe = document.querySelectorAll('#testimonialSliderDe .testimonial-slide');
      const arrowLeftDe = document.getElementById('arrowLeftDe');
      const arrowRightDe = document.getElementById('arrowRightDe');
      const dotsDe = document.querySelectorAll('#dotsDe .dot');
  
      let currentSlideDe = 0;
  
      function showSlideDe(index) {
        slidesDe.forEach(s => s.classList.remove('active'));
        slidesDe[index].classList.add('active');
        dotsDe.forEach(d => d.classList.remove('active'));
        dotsDe[index].classList.add('active');
      }
  
      if (slidesDe.length > 0) {
        showSlideDe(currentSlideDe);
      }
  
      if (arrowLeftDe && arrowRightDe) {
        arrowLeftDe.addEventListener('click', () => {
          currentSlideDe = (currentSlideDe - 1 + slidesDe.length) % slidesDe.length;
          showSlideDe(currentSlideDe);
        });
        arrowRightDe.addEventListener('click', () => {
          currentSlideDe = (currentSlideDe + 1) % slidesDe.length;
          showSlideDe(currentSlideDe);
        });
      }
  
      dotsDe.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          currentSlideDe = idx;
          showSlideDe(idx);
        });
      });
    })();
  
    // ======================================================================
    // 5) TESTIMONIALS SLIDER – ENGLISH
    // ======================================================================
    (function initEnglishSlider() {
      const slidesEn = document.querySelectorAll('#testimonialSliderEn .testimonial-slide');
      const arrowLeftEn = document.getElementById('arrowLeftEn');
      const arrowRightEn = document.getElementById('arrowRightEn');
      const dotsEn = document.querySelectorAll('#dotsEn .dot');
  
      let currentSlideEn = 0;
  
      function showSlideEn(index) {
        slidesEn.forEach(s => s.classList.remove('active'));
        slidesEn[index].classList.add('active');
        dotsEn.forEach(d => d.classList.remove('active'));
        dotsEn[index].classList.add('active');
      }
  
      if (slidesEn.length > 0) {
        showSlideEn(currentSlideEn);
      }
  
      if (arrowLeftEn && arrowRightEn) {
        arrowLeftEn.addEventListener('click', () => {
          currentSlideEn = (currentSlideEn - 1 + slidesEn.length) % slidesEn.length;
          showSlideEn(currentSlideEn);
        });
        arrowRightEn.addEventListener('click', () => {
          currentSlideEn = (currentSlideEn + 1) % slidesEn.length;
          showSlideEn(currentSlideEn);
        });
      }
  
      dotsEn.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          currentSlideEn = idx;
          showSlideEn(idx);
        });
      });
    })();

    // ======================================================================
    // 5b) TESTIMONIALS SLIDER – CROATIAN
    // ======================================================================
    (function initCroatianSlider() {
      const slidesHr = document.querySelectorAll('#testimonialSliderHr .testimonial-slide');
      const arrowLeftHr = document.getElementById('arrowLeftHr');
      const arrowRightHr = document.getElementById('arrowRightHr');
      const dotsHr = document.querySelectorAll('#dotsHr .dot');
  
      let currentSlideHr = 0;
  
      function showSlideHr(index) {
        slidesHr.forEach(s => s.classList.remove('active'));
        slidesHr[index].classList.add('active');
        dotsHr.forEach(d => d.classList.remove('active'));
        dotsHr[index].classList.add('active');
      }
  
      if (slidesHr.length > 0) {
        showSlideHr(currentSlideHr);
      }
  
      if (arrowLeftHr && arrowRightHr) {
        arrowLeftHr.addEventListener('click', () => {
          currentSlideHr = (currentSlideHr - 1 + slidesHr.length) % slidesHr.length;
          showSlideHr(currentSlideHr);
        });
        arrowRightHr.addEventListener('click', () => {
          currentSlideHr = (currentSlideHr + 1) % slidesHr.length;
          showSlideHr(currentSlideHr);
        });
      }
  
      dotsHr.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          currentSlideHr = idx;
          showSlideHr(idx);
        });
      });
    })();
  
    // ======================================================================
    // 6) THREE-LANGUAGE TOGGLE WITH SCROLL PRESERVATION (German -> English -> Croatian)
    // ======================================================================
    const params = new URLSearchParams(window.location.search);
    let currentLang = params.get('lang') || 'de'; // default to German
  
    // If there's a scrollRatio param, restore it
    if (params.has('scrollRatio')) {
      const ratio = parseFloat(params.get('scrollRatio'));
      setTimeout(() => {
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const scrollY = Math.round(ratio * docHeight);
        window.scrollTo(0, scrollY);
      }, 50);
    }
  
    // Show/hide language sections based on current language
    const germanDivs = document.querySelectorAll('.german');
    const englishDivs = document.querySelectorAll('.english');
    const croatianDivs = document.querySelectorAll('.croatian');
    
    function updateLanguageDisplay(lang) {
      // Hide all languages first
      germanDivs.forEach(el => el.classList.add('hidden'));
      englishDivs.forEach(el => el.classList.add('hidden'));
      croatianDivs.forEach(el => el.classList.add('hidden'));

      // Show current language
      if (lang === 'de') {
        germanDivs.forEach(el => el.classList.remove('hidden'));
      } else if (lang === 'en') {
        englishDivs.forEach(el => el.classList.remove('hidden'));
      } else if (lang === 'hr') {
        croatianDivs.forEach(el => el.classList.remove('hidden'));
      }
    }

    // Initialize display
    updateLanguageDisplay(currentLang);
  
    // Grab the toggle button
    const langBtn = document.getElementById('toggleLang');
    if (langBtn) {
      // Set initial button text
      if (currentLang === 'de') {
        langBtn.textContent = 'English';
      } else if (currentLang === 'en') {
        langBtn.textContent = 'Hrvatski';
      } else if (currentLang === 'hr') {
        langBtn.textContent = 'Deutsch';
      }
  
      langBtn.addEventListener('click', () => {
        // 1) store current scroll ratio
        const currentScrollY = window.pageYOffset;
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const scrollRatio = currentScrollY / docHeight;
  
        // 2) cycle through languages: de -> en -> hr -> de
        let newLang;
        if (currentLang === 'de') {
          newLang = 'en';
        } else if (currentLang === 'en') {
          newLang = 'hr';
        } else {
          newLang = 'de';
        }
  
        // 3) update params
        params.set('lang', newLang);
        params.set('scrollRatio', scrollRatio.toFixed(4));
  
        // 4) reload with updated URL
        window.location.search = params.toString();
      });
    }
   
    // ENGLISH newsletter form
  
  });
 