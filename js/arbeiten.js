/***************************************************************************
  arbeiten.js (for "Mit uns arbeiten" page)
  Place this <script> at the bottom of arbeiten.html or via an external file,
  with scroll-position preservation on language toggle.
***************************************************************************/

document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // 1) MOBILE NAVBAR TOGGLE
    // =======================================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    if (mobileToggle && navbarMenu) {
      mobileToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('nav-open');
      });
    }
  
    // =======================================================================
    // 2) FAQ ACCORDION TOGGLE
    // =======================================================================
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
      const question = item.querySelector(".faq-question");
      if (question) {
        question.addEventListener("click", () => {
          item.classList.toggle("active");
        });
      }
    });
  
    // =======================================================================
    // 3) DETECT & APPLY CURRENT LANGUAGE VIA ?lang=de / ?lang=en
    //    AND RESTORE SCROLL RATIO IF EXISTS
    // =======================================================================
    const params = new URLSearchParams(window.location.search);
    let currentLang = params.get('lang') || 'de'; // default to German
  
    // If there's a scrollRatio param, parse and scroll to that ratio
    if (params.has('scrollRatio')) {
      const ratio = parseFloat(params.get('scrollRatio'));
      setTimeout(() => {
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const scrollY = Math.round(ratio * docHeight);
        window.scrollTo(0, scrollY);
      }, 50); 
    }
  
    // Grab references to your .german/.english containers
    const germanContent = document.querySelectorAll('.german');
    const englishContent = document.querySelectorAll('.english');
  
    // Decide which to hide
    let isGerman = (currentLang !== 'en');
    if (isGerman) {
      germanContent.forEach(el => el.classList.remove('hidden'));
      englishContent.forEach(el => el.classList.add('hidden'));
    } else {
      germanContent.forEach(el => el.classList.add('hidden'));
      englishContent.forEach(el => el.classList.remove('hidden'));
    }
  
    // =======================================================================
    // 4) LANGUAGE TOGGLE BUTTON (Preserve scroll ratio)
    // =======================================================================
    const langBtn = document.getElementById('toggleLang');
    if (langBtn) {
      // Initial button text
      langBtn.textContent = isGerman ? 'English' : 'Deutsch';
  
      langBtn.addEventListener('click', () => {
        // 1) Capture current scroll ratio
        const currentScrollY = window.pageYOffset;
        const docHeight = Math.max(document.body.scrollHeight, 1);
        const ratio = currentScrollY / docHeight;
  
        // 2) Flip isGerman
        isGerman = !isGerman;
        const newLang = isGerman ? 'de' : 'en';
  
        // 3) Set updated params => ?lang=newLang & ?scrollRatio=...
        params.set('lang', newLang);
        params.set('scrollRatio', ratio.toFixed(4));
  
        // 4) Trigger page reload with updated URL
        window.location.search = params.toString();
      });
    }
  
    // =======================================================================
    // 5) OPTIONAL: UPDATE NAV LINKS TO INCLUDE ?lang=XX
    // =======================================================================
    const navLinks = document.querySelectorAll('[data-nav-link]');
    // e.g. <a data-nav-link="home" href="#">Home</a>
  
    navLinks.forEach(link => {
      const linkTarget = link.getAttribute('data-nav-link');
      // Decide base URLs for each link:
      let baseUrl = '#';
      switch (linkTarget) {
        case 'home':
          baseUrl = 'index.html';
          break;
        case 'about':
          baseUrl = 'uber-uns.html';
          break;
        case 'services':
          baseUrl = 'dienstleistungen.html';
          break;
        case 'arbeiten':
          baseUrl = 'arbeiten.html';
          break;
        case 'kontakt':
          baseUrl = 'kontakt.html';
          break;
        // etc. (adapt as needed)
      }
  
      // Create a new URLSearchParams from the existing params
      const newParams = new URLSearchParams(params.toString());
  
      // But we only want to keep the language param (and possibly scroll ratio),
      // but removing scroll ratio might be better so the user doesn't jump
      // upon navigating to a new page. 
      // So let's remove scrollRatio for a "clean" new page load:
      newParams.delete('scrollRatio');
  
      // Ensure we keep the correct language
      newParams.set('lang', isGerman ? 'de' : 'en');
  
      // Apply to link
      link.href = `${baseUrl}?${newParams.toString()}`;
    });
  
  }); // end DOMContentLoaded