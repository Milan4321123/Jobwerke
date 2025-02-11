/***************************************************************
  dienstleistungen.js
  For the new black & silver "Dienstleistungen" layout
***************************************************************/

/* 1) MOBILE NAV TOGGLE */
const mobileToggle = document.getElementById('mobileToggle');
const navbarMenu = document.getElementById('navbarMenu');
mobileToggle.addEventListener('click', () => {
  navbarMenu.classList.toggle('nav-open');
});

/* 2) LANGUAGE TOGGLE */
const langBtn = document.getElementById('toggleLang');
const germanDivs = document.querySelectorAll('.german');
const englishDivs = document.querySelectorAll('.english');
let isGerman = true;

langBtn.addEventListener('click', () => {
  isGerman = !isGerman;
  germanDivs.forEach(el => el.classList.toggle('hidden', !isGerman));
  englishDivs.forEach(el => el.classList.toggle('hidden', isGerman));
  langBtn.textContent = isGerman ? 'English' : 'Deutsch';
});

/* 3) FAQ ACCORDION */
function initFaqAccordion(containerSelector) {
  // This will match both .faq-accordion-de and .faq-accordion-en
  const accordions = document.querySelectorAll(containerSelector + ' .faq-accordion-item');

  accordions.forEach((item) => {
    const questionBtn = item.querySelector('.faq-accordion-question');
    const answerPanel = item.querySelector('.faq-accordion-answer');

    questionBtn.addEventListener('click', () => {
      // Check if it's already open
      const isOpen = questionBtn.classList.contains('active');

      // Close all accordion items first
      accordions.forEach((otherItem) => {
        const otherBtn = otherItem.querySelector('.faq-accordion-question');
        const otherAns = otherItem.querySelector('.faq-accordion-answer');
        otherBtn.classList.remove('active');
        otherAns.style.maxHeight = 0;
      });

      // Toggle this one
      if (!isOpen) {
        questionBtn.classList.add('active');
        answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
      }
    });
  });
}

// Initialize FAQ for both German and English
initFaqAccordion('.faq-accordion-de');
initFaqAccordion('.faq-accordion-en');

/* 4) OPTIONAL: ADVANTAGES HORIZONTAL SCROLL
   If you want to show left/right arrows for
   the .advantages-scroll-wrapper sections. 
   This code snippet sets up two arrow buttons
   to horizontally scroll the container. 
   You can adapt the class names as needed.
*/
function initAdvantagesScroll(containerSelector, leftArrowSelector, rightArrowSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const leftArrow = document.querySelector(leftArrowSelector);
  const rightArrow = document.querySelector(rightArrowSelector);

  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      container.scrollBy({
        top: 0,
        left: -300, // adjust scroll distance
        behavior: 'smooth'
      });
    });
  }
  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      container.scrollBy({
        top: 0,
        left: 300,
        behavior: 'smooth'
      });
    });
  }
}

/* Example usage:
   initAdvantagesScroll('.advantages-scroll-wrapper', '#arrowLeft', '#arrowRight');
   Make sure you have <button id="arrowLeft">Prev</button> 
   and <button id="arrowRight">Next</button> 
   around your .advantages-scroll-wrapper in the HTML
*/

/* 
  If you don't plan on using left/right arrow buttons,
  the horizontal scroll can remain purely drag or scroll-based,
  and you can ignore this optional function.
*/