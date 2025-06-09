/***************************************************************************
  uber-uns.js (for "Über uns" / About Us page)
  Updated to support mobile navigation and multi-language functionality
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
    // 2) FADE-IN OBSERVER (for .fade-section)
    // =======================================================================
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

    // =======================================================================
    // 3) LANGUAGE DETECTION & DISPLAY
    // =======================================================================
    const params = new URLSearchParams(window.location.search);
    let currentLangParam = params.get('lang') || 'de'; // default to German
    
    // Map URL parameters to currentLang index
    let currentLang = 0; // 0 = German, 1 = English, 2 = Croatian
    if (currentLangParam === 'en') currentLang = 1;
    else if (currentLangParam === 'hr') currentLang = 2;
    
    // Find all language sections
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
    
    // =======================================================================
    // 4) LANGUAGE TOGGLE BUTTON
    // =======================================================================
    const langToggleBtn = document.getElementById('toggleLang');
    const langLabels = ['English', 'Hrvatski', 'Deutsch'];
    
    if (langToggleBtn) {
      langToggleBtn.textContent = langLabels[currentLang];
      
      langToggleBtn.addEventListener('click', () => {
        // Cycle through languages: German (0) -> English (1) -> Croatian (2) -> German (0)
        currentLang = (currentLang + 1) % 3;
        updateLanguageDisplay();
        langToggleBtn.textContent = langLabels[currentLang];
        
        // Update URL parameter
        const langParams = ['de', 'en', 'hr'];
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('lang', langParams[currentLang]);
        window.history.replaceState({}, '', newUrl);
      });
    }

    console.log('Über uns page initialized with mobile navigation and language support');
});