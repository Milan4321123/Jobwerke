/***************************************************************
  arbeiten.js
  - Mobile navbar toggle
  - Language toggle
  - FAQ accordion
***************************************************************/

// 1) MOBILE NAV TOGGLE
const mobileToggle = document.getElementById('mobileToggle');
const navbarMenu = document.getElementById('navbarMenu');
mobileToggle.addEventListener('click', () => {
  navbarMenu.classList.toggle('nav-open');
});

// 2) LANGUAGE TOGGLE
const langBtn = document.getElementById('toggleLang');
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');
let isGerman = true;

langBtn.addEventListener('click', () => {
  isGerman = !isGerman;
  germanDivs.forEach(div => div.classList.toggle('hidden', !isGerman));
  englishDivs.forEach(div => div.classList.toggle('hidden', isGerman));
  langBtn.textContent = isGerman ? 'English' : 'Deutsch';
});

/***************************************************************
  3) FAQ ACCORDION
***************************************************************/
function initFaqAccordion() {
  // We have .faq-section or .faq-accordion-de / .faq-accordion-en
  // but let's unify with .faq-accordion-wrapper
  const allFaqWrappers = document.querySelectorAll('.faq-accordion-wrapper');

  allFaqWrappers.forEach(wrapper => {
    const items = wrapper.querySelectorAll('.faq-accordion-item');
    items.forEach(item => {
      const questionBtn = item.querySelector('.faq-accordion-question');
      const answerPanel = item.querySelector('.faq-accordion-answer');
      
      questionBtn.addEventListener('click', () => {
        // Check if it's already open
        const isOpen = questionBtn.classList.contains('active');
        
        // Close all items in this wrapper
        items.forEach(i => {
          const qBtn = i.querySelector('.faq-accordion-question');
          const ans = i.querySelector('.faq-accordion-answer');
          qBtn.classList.remove('active');
          ans.style.maxHeight = '0';
        });
        
        // Toggle current one
        if(!isOpen) {
          questionBtn.classList.add('active');
          answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
        }
      });
    });
  });
}
initFaqAccordion();