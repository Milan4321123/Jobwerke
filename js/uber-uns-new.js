document.addEventListener('DOMContentLoaded', () => {
    // =====================================================
    // 1) MOBILE NAVBAR TOGGLE
    // =====================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    if (mobileToggle && navbarMenu) {
      mobileToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('nav-open');
      });
    }
  
    // =====================================================
    // 2) DETECT ?lang=de OR ?lang=en OR ?lang=hr FROM URL
    // =====================================================
    const urlParams = new URLSearchParams(window.location.search);
    let currentLangParam = urlParams.get('lang');
    if (!currentLangParam) {
      currentLangParam = 'de'; // fallback if ?lang not found
    }

    // Map URL parameters to currentLang index
    let currentLang = 0; // 0 = German, 1 = English, 2 = Croatian
    if (currentLangParam === 'en') currentLang = 1;
    else if (currentLangParam === 'hr') currentLang = 2;
  
    // Grab references to your .german, .english, and .croatian sections
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
  
    // =====================================================
    // 3) RESTORE PREVIOUS SCROLL RATIO (IF ANY)
    // =====================================================
    // We'll see if there's a ?scrollRatio= param; if so, we'll apply that.
    // (Because we might pass the scroll ratio through the URL on reload)
    if (urlParams.has('scrollRatio')) {
      const ratio = parseFloat(urlParams.get('scrollRatio'));
      // Wait a short moment so the document size is calculated
      setTimeout(() => {
        const newDocHeight = document.body.scrollHeight;
        // The user's original scroll was ratio * docHeight
        const newScrollY = Math.round(newDocHeight * ratio);
        window.scrollTo(0, newScrollY);
      }, 50);
    }
  
    // =====================================================
    // 4) LANGUAGE TOGGLE BUTTON (WITH SCROLL PRESERVATION)
    // =====================================================
    const langBtn = document.getElementById('toggleLang');
    if (langBtn) {
      // Set initial button text based on current language
      const buttonTexts = ['English', 'Hrvatski', 'Deutsch'];
      langBtn.textContent = buttonTexts[currentLang];

      langBtn.addEventListener('click', () => {
        // 4A) First, store the user's current scroll ratio
        const currentScrollY = window.pageYOffset;
        const docHeight = document.body.scrollHeight || 1;
        const ratio = currentScrollY / docHeight;

        // 4B) Cycle to next language
        currentLang = (currentLang + 1) % 3;
        
        // Map currentLang to URL parameter
        const langParams = ['de', 'en', 'hr'];
        const newLang = langParams[currentLang];

        // 4C) Update ?lang= param and also store ?scrollRatio= param
        urlParams.set('lang', newLang);
        urlParams.set('scrollRatio', ratio.toFixed(4)); 
        // toFixed(4) is just to avoid super long decimals

        // 4D) Reload with updated search params
        window.location.search = urlParams.toString();
      });
    }
});
