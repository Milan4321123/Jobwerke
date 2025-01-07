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
    const navbarMenu = document.getElementById('navbar__Menu');
  
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
    // 3) TABS SWITCHING LOGIC (.svc-step)
    // ======================================================================
    const steps = document.querySelectorAll('.svc-step');
    const panels = document.querySelectorAll('.svc-step-panel');
  
    steps.forEach(step => {
      step.addEventListener('click', () => {
        // Remove 'active' from all steps/panels
        steps.forEach(s => s.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
  
        // Mark this step active
        step.classList.add('active');
  
        // Build panel ID from data-step attribute
        const stepNumber = step.getAttribute('data-step'); 
        const panelId = `panel-${stepNumber}`;
  
        // Activate the target panel
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
          targetPanel.classList.add('active');
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
    // 6) LANGUAGE TOGGLE WITH SCROLL PRESERVATION
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
  
    // Show/hide .german / .english
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
  
    // Grab the toggle button
    const langBtn = document.getElementById('toggleLang');
    if (langBtn) {
      // Initial text
      langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  
      langBtn.addEventListener('click', () => {
        // 1) store current scroll ratio
        const currentScrollY = window.pageYOffset;
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const scrollRatio = currentScrollY / docHeight;
  
        // 2) flip language
        isGerman = !isGerman;
        const newLang = isGerman ? 'de' : 'en';
  
        // 3) update params
        params.set('lang', newLang);
        params.set('scrollRatio', scrollRatio.toFixed(4));
  
        // 4) reload with updated URL
        window.location.search = params.toString();
      });
    }
  });