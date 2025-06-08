/**
 * CAPTCHA Management System
 * Handles both SVG CAPTCHA and Google reCAPTCHA v2
 * Supports Contact Forms and Newsletter Forms
 */

class CaptchaManager {
  constructor() {
    this.recaptchaEnabled = false;
    this.recaptchaSiteKey = null;
    this.widgets = {}; // Store reCAPTCHA widget IDs
    this.init();
  }

  async init() {
    // Check if reCAPTCHA is available
    await this.checkRecaptchaConfig();
    
    // Initialize CAPTCHA on page load
    this.initializePageCaptchas();
    
    // Set up form submission handlers
    this.setupFormHandlers();
  }

  async checkRecaptchaConfig() {
    try {
      const response = await fetch('/recaptcha/config');
      const config = await response.json();
      
      this.recaptchaEnabled = config.enabled;
      this.recaptchaSiteKey = config.siteKey;
      
      console.log('CAPTCHA Config:', {
        recaptchaEnabled: this.recaptchaEnabled,
        svgEnabled: true
      });
      
      if (this.recaptchaEnabled) {
        await this.loadRecaptchaScript();
      }
    } catch (error) {
      console.warn('Failed to load reCAPTCHA config:', error);
      this.recaptchaEnabled = false;
    }
  }

  loadRecaptchaScript() {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
      
      document.head.appendChild(script);

      // Global callback for reCAPTCHA
      window.onRecaptchaLoad = () => {
        this.initializeRecaptchaWidgets();
      };
    });
  }

  initializePageCaptchas() {
    // Initialize contact form CAPTCHAs
    ['de', 'en', 'hr'].forEach(lang => {
      const captchaImage = document.getElementById(`captcha-image-${lang}`);
      if (captchaImage) {
        this.refreshCaptchaImage(lang);
      }
    });

    // Initialize newsletter form CAPTCHAs
    ['de', 'en', 'hr'].forEach(lang => {
      const newsletterCaptchaImage = document.getElementById(`newsletter-captcha-image-${lang}`);
      if (newsletterCaptchaImage) {
        this.refreshNewsletterCaptchaImage(lang);
      }
    });
  }

  initializeRecaptchaWidgets() {
    if (!this.recaptchaEnabled || !window.grecaptcha) return;

    // Contact form reCAPTCHA widgets
    ['de', 'en', 'hr'].forEach(lang => {
      const container = document.getElementById(`recaptcha-container-${lang}`);
      if (container) {
        try {
          this.widgets[`contact-${lang}`] = window.grecaptcha.render(container, {
            sitekey: this.recaptchaSiteKey,
            size: 'normal'
          });
          
          // Hide SVG CAPTCHA and show reCAPTCHA
          const svgContainer = document.getElementById(`captcha-container-${lang}`);
          if (svgContainer) {
            svgContainer.style.display = 'none';
          }
          container.style.display = 'block';
        } catch (error) {
          console.warn(`Failed to render reCAPTCHA for contact-${lang}:`, error);
        }
      }
    });

    // Newsletter form reCAPTCHA widgets
    ['de', 'en', 'hr'].forEach(lang => {
      const container = document.getElementById(`newsletter-recaptcha-container-${lang}`);
      if (container) {
        try {
          this.widgets[`newsletter-${lang}`] = window.grecaptcha.render(container, {
            sitekey: this.recaptchaSiteKey,
            size: 'normal'
          });
          
          // Hide SVG CAPTCHA and show reCAPTCHA
          const svgContainer = document.getElementById(`newsletter-captcha-container-${lang}`);
          if (svgContainer) {
            svgContainer.style.display = 'none';
          }
          container.style.display = 'block';
        } catch (error) {
          console.warn(`Failed to render reCAPTCHA for newsletter-${lang}:`, error);
        }
      }
    });
  }

  refreshCaptchaImage(lang) {
    const image = document.getElementById(`captcha-image-${lang}`);
    const errorDiv = document.getElementById(`captcha-error-${lang}`);
    const input = document.getElementById(`captcha-input-${lang}`);
    
    if (image) {
      // Add loading state
      const container = document.getElementById(`captcha-container-${lang}`);
      if (container) container.classList.add('captcha-loading');
      
      // Clear previous input and errors
      if (input) input.value = '';
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }
      
      // Refresh image with timestamp to prevent caching
      image.src = `/captcha?t=${Date.now()}`;
      
      image.onload = () => {
        if (container) container.classList.remove('captcha-loading');
      };
      
      image.onerror = () => {
        if (container) container.classList.remove('captcha-loading');
        if (errorDiv) {
          errorDiv.textContent = 'Failed to load CAPTCHA. Please try again.';
          errorDiv.style.display = 'block';
        }
      };
    }
  }

  refreshNewsletterCaptchaImage(lang) {
    const image = document.getElementById(`newsletter-captcha-image-${lang}`);
    const errorDiv = document.getElementById(`newsletter-captcha-error-${lang}`);
    const input = document.getElementById(`newsletter-captcha-input-${lang}`);
    
    if (image) {
      // Add loading state
      const container = document.getElementById(`newsletter-captcha-container-${lang}`);
      if (container) container.classList.add('captcha-loading');
      
      // Clear previous input and errors
      if (input) input.value = '';
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }
      
      // Refresh image with timestamp to prevent caching
      image.src = `/captcha?t=${Date.now()}`;
      
      image.onload = () => {
        if (container) container.classList.remove('captcha-loading');
      };
      
      image.onerror = () => {
        if (container) container.classList.remove('captcha-loading');
        if (errorDiv) {
          errorDiv.textContent = 'Failed to load CAPTCHA. Please try again.';
          errorDiv.style.display = 'block';
        }
      };
    }
  }

  async playCaptchaAudio(lang) {
    try {
      const response = await fetch('/captcha/audio');
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.play().catch(error => {
          console.warn('Audio playback failed:', error);
          alert('Audio playback is not supported or blocked by your browser.');
        });
        
        // Clean up the object URL after playing
        audio.onended = () => URL.revokeObjectURL(audioUrl);
      } else {
        throw new Error('Failed to load audio CAPTCHA');
      }
    } catch (error) {
      console.error('Audio CAPTCHA error:', error);
      const errorDiv = document.getElementById(`captcha-error-${lang}`);
      if (errorDiv) {
        errorDiv.textContent = 'Audio CAPTCHA unavailable. Please use the visual CAPTCHA.';
        errorDiv.style.display = 'block';
      }
    }
  }

  async playNewsletterCaptchaAudio(lang) {
    try {
      const response = await fetch('/captcha/audio');
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.play().catch(error => {
          console.warn('Audio playback failed:', error);
          alert('Audio playback is not supported or blocked by your browser.');
        });
        
        // Clean up the object URL after playing
        audio.onended = () => URL.revokeObjectURL(audioUrl);
      } else {
        throw new Error('Failed to load audio CAPTCHA');
      }
    } catch (error) {
      console.error('Audio CAPTCHA error:', error);
      const errorDiv = document.getElementById(`newsletter-captcha-error-${lang}`);
      if (errorDiv) {
        errorDiv.textContent = 'Audio CAPTCHA unavailable. Please use the visual CAPTCHA.';
        errorDiv.style.display = 'block';
      }
    }
  }

  validateCaptcha(lang, formType = 'contact') {
    if (this.recaptchaEnabled && window.grecaptcha) {
      // Validate reCAPTCHA
      const widgetId = this.widgets[`${formType}-${lang}`];
      if (widgetId !== undefined) {
        const response = window.grecaptcha.getResponse(widgetId);
        return response && response.length > 0;
      }
    } else {
      // Validate SVG CAPTCHA
      const inputId = formType === 'contact' 
        ? `captcha-input-${lang}` 
        : `newsletter-captcha-input-${lang}`;
      const input = document.getElementById(inputId);
      return input && input.value && input.value.length >= 4;
    }
    return false;
  }

  showCaptchaError(lang, message, formType = 'contact') {
    const errorId = formType === 'contact' 
      ? `captcha-error-${lang}` 
      : `newsletter-captcha-error-${lang}`;
    const errorDiv = document.getElementById(errorId);
    
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      
      // Add error styling to container
      const containerId = formType === 'contact' 
        ? `captcha-container-${lang}` 
        : `newsletter-captcha-container-${lang}`;
      const container = document.getElementById(containerId);
      if (container) {
        container.classList.add('captcha-error-state');
        
        // Remove error state after 5 seconds
        setTimeout(() => {
          container.classList.remove('captcha-error-state');
        }, 5000);
      }
    }
  }

  clearCaptchaError(lang, formType = 'contact') {
    const errorId = formType === 'contact' 
      ? `captcha-error-${lang}` 
      : `newsletter-captcha-error-${lang}`;
    const errorDiv = document.getElementById(errorId);
    
    if (errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }
    
    // Remove error styling
    const containerId = formType === 'contact' 
      ? `captcha-container-${lang}` 
      : `newsletter-captcha-container-${lang}`;
    const container = document.getElementById(containerId);
    if (container) {
      container.classList.remove('captcha-error-state');
    }
  }

  setupFormHandlers() {
    // Contact form handlers
    ['de', 'en', 'hr'].forEach(lang => {
      const form = document.querySelector(`form[action="/send-email"]`);
      if (form) {
        form.addEventListener('submit', (e) => this.handleContactFormSubmit(e, lang));
      }
    });

    // Newsletter form handlers
    ['de', 'en', 'hr'].forEach(lang => {
      const form = document.getElementById(`newsletterForm${lang === 'de' ? 'De' : lang === 'en' ? 'En' : 'Hr'}`);
      if (form) {
        form.addEventListener('submit', (e) => this.handleNewsletterFormSubmit(e, lang));
      }
    });
  }

  handleContactFormSubmit(event, lang) {
    // Determine which language form is currently visible/active
    const formContainer = event.target.closest('.german, .english, .croatian');
    const isVisible = formContainer && !formContainer.classList.contains('hidden');
    
    if (!isVisible) return; // Skip validation for hidden forms
    
    this.clearCaptchaError(lang, 'contact');
    
    if (!this.validateCaptcha(lang, 'contact')) {
      event.preventDefault();
      
      const messages = {
        de: 'Bitte lösen Sie das CAPTCHA um fortzufahren.',
        en: 'Please complete the CAPTCHA to continue.',
        hr: 'Molimo riješite CAPTCHA da biste nastavili.'
      };
      
      this.showCaptchaError(lang, messages[lang] || messages.de, 'contact');
      return false;
    }
    
    return true;
  }

  handleNewsletterFormSubmit(event, lang) {
    // Determine which language form is currently visible/active
    const formContainer = event.target.closest('.german, .english, .croatian');
    const isVisible = formContainer && !formContainer.classList.contains('hidden');
    
    if (!isVisible) return; // Skip validation for hidden forms
    
    this.clearCaptchaError(lang, 'newsletter');
    
    if (!this.validateCaptcha(lang, 'newsletter')) {
      event.preventDefault();
      
      const messages = {
        de: 'Bitte lösen Sie das CAPTCHA um sich anzumelden.',
        en: 'Please complete the CAPTCHA to subscribe.',
        hr: 'Molimo riješite CAPTCHA da biste se pretplatili.'
      };
      
      this.showCaptchaError(lang, messages[lang] || messages.de, 'newsletter');
      return false;
    }
    
    return true;
  }
}

// Global functions for onclick handlers
function refreshCaptcha(lang) {
  if (window.captchaManager) {
    window.captchaManager.refreshCaptchaImage(lang);
  }
}

function refreshNewsletterCaptcha(lang) {
  if (window.captchaManager) {
    window.captchaManager.refreshNewsletterCaptchaImage(lang);
  }
}

function playCaptchaAudio(lang) {
  if (window.captchaManager) {
    window.captchaManager.playCaptchaAudio(lang);
  }
}

function playNewsletterCaptchaAudio(lang) {
  if (window.captchaManager) {
    window.captchaManager.playNewsletterCaptchaAudio(lang);
  }
}

// Initialize CAPTCHA manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.captchaManager = new CaptchaManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CaptchaManager;
}
