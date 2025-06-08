# CAPTCHA Integration Guide for Job Werke Website

This guide shows how to integrate the comprehensive CAPTCHA system into your contact and newsletter forms.

## 🎯 Overview

The server now supports **dual CAPTCHA protection**:
1. **SVG CAPTCHA** (Server-generated, no external dependencies)
2. **Google reCAPTCHA v2** (Optional, requires API keys)

## 🔧 Environment Configuration

Add these to your `.env` file for Google reCAPTCHA (optional):

```env
# Google reCAPTCHA v2 (optional)
RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here

# Session security (optional, auto-generated if not provided)
SESSION_SECRET=your_secure_session_secret_here
```

## 📝 HTML Integration Examples

### Contact Form Integration

```html
<!-- Contact Form with Dual CAPTCHA Support -->
<form id="contactForm" action="/send-email" method="POST">
  <!-- Existing fields -->
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  
  <!-- Honeypot (keep this hidden) -->
  <input type="text" name="hp" style="display: none;" tabindex="-1" autocomplete="off">
  
  <!-- CAPTCHA Section -->
  <div class="captcha-container">
    <!-- Google reCAPTCHA (if enabled) -->
    <div id="recaptcha-container" style="display: none;">
      <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
    </div>
    
    <!-- SVG CAPTCHA (fallback) -->
    <div id="svg-captcha-container">
      <label for="captcha">Security Code:</label>
      <div class="captcha-display">
        <img id="captcha-image" src="/captcha" alt="CAPTCHA" style="border: 1px solid #ccc;">
        <button type="button" id="refresh-captcha" aria-label="Refresh CAPTCHA">🔄</button>
      </div>
      <input type="text" id="captcha-input" name="captcha" placeholder="Enter the code above" required>
      <button type="button" id="audio-captcha" aria-label="Audio CAPTCHA">🔊</button>
    </div>
  </div>
  
  <!-- Submit button -->
  <button type="submit">Send Message</button>
</form>
```

### Newsletter Form Integration

```html
<!-- Newsletter Form with Dual CAPTCHA Support -->
<form id="newsletterForm" action="/subscribe" method="POST">
  <input type="email" name="email" required placeholder="Enter your email">
  <input type="hidden" name="language" value="de">
  
  <!-- CAPTCHA Section -->
  <div class="captcha-container">
    <!-- Google reCAPTCHA (if enabled) -->
    <div id="newsletter-recaptcha" style="display: none;">
      <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
    </div>
    
    <!-- SVG CAPTCHA (fallback) -->
    <div id="newsletter-svg-captcha">
      <label for="newsletter-captcha">Security Code:</label>
      <div class="captcha-display">
        <img id="newsletter-captcha-image" src="/captcha" alt="CAPTCHA">
        <button type="button" id="newsletter-refresh-captcha">🔄</button>
      </div>
      <input type="text" id="newsletter-captcha-input" name="captcha" placeholder="Enter code" required>
    </div>
  </div>
  
  <button type="submit">Subscribe</button>
</form>
```

## 🎨 CSS Styling

```css
/* CAPTCHA Container Styling */
.captcha-container {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.captcha-display {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.captcha-display img {
  max-width: 200px;
  height: auto;
  border-radius: 3px;
}

#refresh-captcha, 
#audio-captcha,
#newsletter-refresh-captcha {
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 16px;
}

#refresh-captcha:hover,
#audio-captcha:hover,
#newsletter-refresh-captcha:hover {
  background-color: #f0f0f0;
}

#captcha-input,
#newsletter-captcha-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 16px;
  width: 150px;
}

/* reCAPTCHA container */
.g-recaptcha {
  margin: 10px 0;
}
```

## 🚀 JavaScript Integration

```javascript
// CAPTCHA Management Script
document.addEventListener('DOMContentLoaded', function() {
  
  // Check if reCAPTCHA is available
  fetch('/recaptcha/config')
    .then(response => response.json())
    .then(config => {
      if (config.enabled && config.siteKey) {
        // Show reCAPTCHA, hide SVG CAPTCHA
        document.getElementById('recaptcha-container').style.display = 'block';
        document.getElementById('svg-captcha-container').style.display = 'none';
        
        // Load reCAPTCHA script
        loadRecaptchaScript(config.siteKey);
      } else {
        // Use SVG CAPTCHA
        initializeSvgCaptcha();
      }
    })
    .catch(error => {
      console.log('reCAPTCHA not available, using SVG CAPTCHA');
      initializeSvgCaptcha();
    });
  
  function loadRecaptchaScript(siteKey) {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    // Update site key in HTML
    document.querySelectorAll('.g-recaptcha').forEach(element => {
      element.setAttribute('data-sitekey', siteKey);
    });
  }
  
  function initializeSvgCaptcha() {
    // Refresh CAPTCHA functionality
    document.getElementById('refresh-captcha')?.addEventListener('click', refreshCaptcha);
    document.getElementById('newsletter-refresh-captcha')?.addEventListener('click', refreshNewsletterCaptcha);
    
    // Audio CAPTCHA functionality
    document.getElementById('audio-captcha')?.addEventListener('click', playAudioCaptcha);
  }
  
  function refreshCaptcha() {
    fetch('/captcha/refresh', { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update the CAPTCHA image using data URL
          const imgElement = document.getElementById('captcha-image');
          imgElement.src = 'data:image/svg+xml;base64,' + btoa(data.captcha);
          
          // Clear the input
          document.getElementById('captcha-input').value = '';
        }
      })
      .catch(error => {
        console.error('Error refreshing CAPTCHA:', error);
        // Fallback to simple reload
        document.getElementById('captcha-image').src = '/captcha?' + Date.now();
      });
  }
  
  function refreshNewsletterCaptcha() {
    fetch('/captcha/refresh', { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const imgElement = document.getElementById('newsletter-captcha-image');
          imgElement.src = 'data:image/svg+xml;base64,' + btoa(data.captcha);
          document.getElementById('newsletter-captcha-input').value = '';
        }
      })
      .catch(error => {
        console.error('Error refreshing newsletter CAPTCHA:', error);
        document.getElementById('newsletter-captcha-image').src = '/captcha?' + Date.now();
      });
  }
  
  function playAudioCaptcha() {
    fetch('/captcha/audio')
      .then(response => response.json())
      .then(data => {
        if (data.instructions) {
          // Simple text-to-speech (modern browsers)
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data.instructions);
            utterance.rate = 0.7;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
          } else {
            // Fallback: show instructions
            alert(data.instructions);
          }
        }
      })
      .catch(error => {
        console.error('Error playing audio CAPTCHA:', error);
      });
  }
  
  // Form submission handling
  document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    const recaptchaResponse = document.querySelector('[name="g-recaptcha-response"]');
    const captchaInput = document.getElementById('captcha-input');
    
    if (recaptchaResponse && !recaptchaResponse.value && captchaInput && !captchaInput.value) {
      e.preventDefault();
      alert('Please complete the CAPTCHA verification.');
      return false;
    }
  });
  
  document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
    const recaptchaResponse = document.querySelector('[name="g-recaptcha-response"]');
    const captchaInput = document.getElementById('newsletter-captcha-input');
    
    if (recaptchaResponse && !recaptchaResponse.value && captchaInput && !captchaInput.value) {
      e.preventDefault();
      alert('Please complete the CAPTCHA verification.');
      return false;
    }
  });
});
```

## 🎯 Error Handling

The system provides detailed error feedback through URL parameters:

- `?error=1&captcha=1` - CAPTCHA validation failed
- `?error=1&validation=1` - Form validation errors
- `?error=1&spam=1` - Spam content detected
- `?error=1&duplicate=1` - Duplicate submission detected

Update your `danke.html` page to handle these error states:

```javascript
// Error handling in danke.html
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
const captcha = urlParams.get('captcha');
const validation = urlParams.get('validation');
const spam = urlParams.get('spam');
const duplicate = urlParams.get('duplicate');

if (error) {
  let message = 'An error occurred. Please try again.';
  
  if (captcha) {
    message = 'CAPTCHA verification failed. Please try again.';
  } else if (validation) {
    message = 'Please check your form inputs and try again.';
  } else if (spam) {
    message = 'Your submission was flagged as spam. Please review and try again.';
  } else if (duplicate) {
    message = 'Duplicate submission detected. Please wait before submitting again.';
  }
  
  // Display error message
  document.getElementById('error-message').textContent = message;
  document.getElementById('error-container').style.display = 'block';
}
```

## 🔧 Testing the CAPTCHA System

1. **Test SVG CAPTCHA**: Submit forms without reCAPTCHA keys configured
2. **Test reCAPTCHA**: Add valid reCAPTCHA keys to environment variables
3. **Test Rate Limiting**: Submit multiple forms quickly
4. **Test Spam Detection**: Submit forms with spam keywords
5. **Test Audio CAPTCHA**: Click the audio button for accessibility
6. **Test Refresh**: Click refresh button to get new CAPTCHA

## 🛡️ Security Features

- **Dual CAPTCHA Protection**: SVG + reCAPTCHA fallback
- **Session-Based Security**: CAPTCHA tied to user session
- **One-Time Use**: Each CAPTCHA can only be used once
- **Rate Limiting**: Limited submissions per IP
- **Spam Detection**: Content analysis for suspicious patterns
- **Fingerprinting**: Browser fingerprinting for duplicate detection
- **Input Validation**: Comprehensive server-side validation
- **Accessibility**: Audio CAPTCHA support for visually impaired users

## 📊 CAPTCHA Analytics

Monitor CAPTCHA effectiveness by checking server logs for:
- CAPTCHA validation failures
- Spam detection hits
- Rate limiting triggers
- Duplicate submission attempts

All security events are logged with timestamps and IP addresses for analysis.
