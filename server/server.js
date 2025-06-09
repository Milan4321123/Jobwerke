/**
 * server.js
 * Run with: node server.js  (or use nodemon)
 */

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const svgCaptcha = require("svg-captcha");
const recaptcha = require("recaptcha2");
const session = require("express-session");
require("dotenv").config(); // Ensure EMAIL_USER, EMAIL_PASS, MONGODB_URI are set

// Import your Mongoose models
const Appointment = require("./models/Appointment.js");
const Subscriber = require("./models/Subscriber.js");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================================================
   1) Connect to MongoDB
   ================================================ */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    console.log("⚠️  Server will continue running without database connection");
    console.log("📝 Configure MONGODB_URI in .env file to enable database features");
    // Don't exit - continue without database for testing
  }
}
connectDB();

/* ================================================
   2) Session Management for CAPTCHA
   ================================================ */
app.use(session({
  secret: process.env.SESSION_SECRET || 'jobwerke-captcha-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 10 * 60 * 1000, // 10 minutes
    httpOnly: true
  }
}));

/* ================================================
   3) CAPTCHA Configuration
   ================================================ */
// Configure Google reCAPTCHA (if keys are provided)
let recaptchaV2;
if (process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY) {
  recaptchaV2 = new recaptcha({
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    secretKey: process.env.RECAPTCHA_SECRET_KEY
  });
  console.log('🔐 Google reCAPTCHA v2 configured');
} else {
  console.log('⚠️  Google reCAPTCHA not configured (missing environment variables)');
}

// SVG CAPTCHA configuration
const svgCaptchaConfig = {
  size: 6, // Number of characters
  ignoreChars: '0o1iIl', // Ambiguous characters to avoid
  noise: 2, // Noise lines
  color: true, // Colored characters
  background: '#f0f0f0', // Background color
  fontSize: 60,
  width: 200,
  height: 80
};

/* ================================================
   4) Security & Anti-Spam Middleware
   ================================================ */

// Security headers
app.use(helmet());

// Rate limiting for general requests - DISABLED FOR DEVELOPMENT
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit to essentially disable during development
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Skip rate limiting entirely during development
});

// Rate limiting for contact form - Reasonable protection
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 contact form submissions per 15 minutes (increased from 3)
  message: {
    error: "Too many contact form submissions from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiting for newsletter subscription - Reasonable protection
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 newsletter subscriptions per hour (increased from 2)
  message: {
    error: "Too many newsletter subscriptions from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down repeated requests - DISABLED FOR DEVELOPMENT
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 1000, // Very high threshold to disable during development
  delayMs: () => 0, // No delay during development
  validate: { delayMs: false }, // disable warning message
  skip: () => true, // Skip slow down entirely during development
});

// Apply rate limiting only to API endpoints, not static files
// Skip rate limiting for static files (CSS, JS, images, etc.)
const skipStaticFiles = (req, res) => {
  return req.path.startsWith('/css/') || 
         req.path.startsWith('/js/') || 
         req.path.startsWith('/assets/') ||
         req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/);
};

// TEMPORARILY DISABLED - Apply general rate limiting to non-static requests only
// app.use((req, res, next) => {
//   if (skipStaticFiles(req, res)) {
//     return next();
//   }
//   generalLimiter(req, res, next);
// });

// TEMPORARILY DISABLED - Apply speed limiting to non-static requests only
// app.use((req, res, next) => {
//   if (skipStaticFiles(req, res)) {
//     return next();
//   }
//   speedLimiter(req, res, next);
// });

// Input validation functions
const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address too long'),
];

const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZàáâäãåąčćđèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçšžÀÁÂÄÃÅĄČĆĐÈÉÊËĖĮÌÍÎÏŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑÇŠŽ\s-'\.]+$/)
    .withMessage('Name contains invalid characters'),
  ...emailValidation,
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .matches(/^[^<>]*$/)
    .withMessage('Message contains invalid characters'),
  body('hp')
    .isEmpty()
    .withMessage('Honeypot field must be empty'),
  body('terminDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('terminTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format'),
];

// Spam detection functions
const suspiciousPatterns = [
  /\b(viagra|cialis|pharmacy|casino|lottery|winner|congratulations|inherited|million\s+dollars)\b/i,
  /\b(click\s+here|free\s+money|make\s+money|work\s+from\s+home)\b/i,
  /\b(nigerian\s+prince|inheritance|beneficiary|transfer\s+funds)\b/i,
  /(http[s]?:\/\/[^\s]+){3,}/gi, // Multiple URLs
  /(.)\1{10,}/gi, // Repeated characters
];

const isSpamContent = (text) => {
  return suspiciousPatterns.some(pattern => pattern.test(text));
};

const generateFingerprint = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const ip = req.ip || req.connection.remoteAddress;
  
  return crypto
    .createHash('sha256')
    .update(`${ip}${userAgent}${acceptLanguage}${acceptEncoding}`)
    .digest('hex');
};

// Store recent submissions to detect duplicates
const recentSubmissions = new Map();
const DUPLICATE_WINDOW = 5 * 60 * 1000; // 5 minutes

const isDuplicateSubmission = (fingerprint, email, message) => {
  const now = Date.now();
  const key = `${fingerprint}:${email}`;
  const messageHash = crypto.createHash('sha256').update(message).digest('hex');
  
  // Clean old entries
  for (const [k, v] of recentSubmissions.entries()) {
    if (now - v.timestamp > DUPLICATE_WINDOW) {
      recentSubmissions.delete(k);
    }
  }
  
  const existing = recentSubmissions.get(key);
  if (existing && existing.messageHash === messageHash) {
    return true;
  }
  
  recentSubmissions.set(key, {
    messageHash,
    timestamp: now
  });
  
  return false;
};

// CAPTCHA validation functions
const validateSvgCaptcha = (req, userInput) => {
  if (!req.session.captcha) {
    return { valid: false, error: 'No CAPTCHA session found' };
  }
  
  const isValid = userInput && userInput.toLowerCase() === req.session.captcha.toLowerCase();
  
  // Clear CAPTCHA from session after validation (one-time use)
  delete req.session.captcha;
  
  return {
    valid: isValid,
    error: isValid ? null : 'Invalid CAPTCHA code'
  };
};

const validateRecaptcha = async (recaptchaResponse, remoteIP) => {
  if (!recaptchaV2) {
    return { valid: true, error: null }; // Skip if not configured
  }
  
  if (!recaptchaResponse) {
    return { valid: false, error: 'reCAPTCHA response missing' };
  }
  
  try {
    const isValid = await recaptchaV2.validate(recaptchaResponse, remoteIP);
    return {
      valid: isValid,
      error: isValid ? null : 'reCAPTCHA validation failed'
    };
  } catch (error) {
    console.error('reCAPTCHA validation error:', error);
    return { valid: false, error: 'reCAPTCHA validation error' };
  }
};

// Enhanced validation with CAPTCHA support
const contactValidationWithCaptcha = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZàáâäãåąčćđèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçšžÀÁÂÄÃÅĄČĆĐÈÉÊËĖĮÌÍÎÏŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑÇŠŽ\s-'\.]+$/)
    .withMessage('Name contains invalid characters'),
  ...emailValidation,
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .matches(/^[^<>]*$/)
    .withMessage('Message contains invalid characters'),
  body('hp')
    .isEmpty()
    .withMessage('Honeypot field must be empty'),
  body('captcha')
    .if(body('g-recaptcha-response').isEmpty())
    .isLength({ min: 1 })
    .withMessage('CAPTCHA is required when reCAPTCHA is not provided'),
  body('terminDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('terminTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format'),
];

const newsletterValidationWithCaptcha = [
  ...emailValidation,
  body('captcha')
    .if(body('g-recaptcha-response').isEmpty())
    .isLength({ min: 1 })
    .withMessage('CAPTCHA is required when reCAPTCHA is not provided'),
];

/* ================================================
   3) Standard Middleware
   ================================================ */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management for CAPTCHA
app.use(session({
  secret: 'your-secret-key', // Change this to a strong, unique secret
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/* ================================================
   4) Serve static files (CSS, JS, assets)
   ================================================ */
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

/* ================================================
   5) Serve .html from the project root
   ================================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});
app.get("/arbeiten.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "arbeiten.html"));
});
app.get("/datenschutz.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "datenschutz.html"));
});
app.get("/datenschutzEn.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "datenschutzEn.html"));
});
app.get("/kontakt.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "kontakt.html"));
});
app.get("/dienstleistungen.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dienstleistungen.html"));
});
app.get("/uber-uns.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "uber-uns.html"));
});
app.get("/danke.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "danke.html"));
});

/* ================================================
   6) CAPTCHA Routes
   ================================================ */
/**
 * GET /captcha - Generate SVG CAPTCHA
 */
app.get("/captcha", (req, res) => {
  try {
    const captcha = svgCaptcha.create(svgCaptchaConfig);
    
    // Store CAPTCHA text in session
    req.session.captcha = captcha.text;
    
    // Set headers for SVG
    res.type('svg');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.send(captcha.data);
  } catch (error) {
    console.error('Error generating CAPTCHA:', error);
    res.status(500).send('Error generating CAPTCHA');
  }
});

/**
 * GET /captcha/audio - Generate audio CAPTCHA (accessibility)
 */
app.get("/captcha/audio", (req, res) => {
  try {
    if (!req.session.captcha) {
      return res.status(400).json({ error: 'No CAPTCHA session found' });
    }
    
    // Simple audio representation (in a real implementation, use text-to-speech)
    const captchaText = req.session.captcha;
    const audioInstructions = `The CAPTCHA code is: ${captchaText.split('').join(', ')}`;
    
    res.json({
      message: 'Audio CAPTCHA',
      instructions: audioInstructions,
      hint: 'Enter the letters and numbers you hear, separated by spaces'
    });
  } catch (error) {
    console.error('Error generating audio CAPTCHA:', error);
    res.status(500).json({ error: 'Error generating audio CAPTCHA' });
  }
});

/**
 * POST /captcha/refresh - Refresh CAPTCHA
 */
app.post("/captcha/refresh", (req, res) => {
  try {
    const captcha = svgCaptcha.create(svgCaptchaConfig);
    req.session.captcha = captcha.text;
    
    res.json({
      success: true,
      captcha: captcha.data,
      message: 'CAPTCHA refreshed'
    });
  } catch (error) {
    console.error('Error refreshing CAPTCHA:', error);
    res.status(500).json({ error: 'Error refreshing CAPTCHA' });
  }
});

/**
 * GET /recaptcha/config - Get reCAPTCHA configuration
 */
app.get("/recaptcha/config", (req, res) => {
  res.json({
    enabled: !!recaptchaV2,
    siteKey: process.env.RECAPTCHA_SITE_KEY || null,
    message: recaptchaV2 ? 'reCAPTCHA available' : 'reCAPTCHA not configured'
  });
});
/* ========================================================================
   SUBSCRIBER ROUTES (Newsletter)
   ======================================================================== */
app.options("/subscribe", cors()); // For CORS preflight (if needed)

/**
 * POST /subscribe
 * - Receives { email, language, captcha, g-recaptcha-response } from your newsletter form
 * - Validates CAPTCHA (SVG or reCAPTCHA)
 * - If email already exists => redirect ?subscribed=1
 * - Else => create in DB, send welcome email, redirect ?success=1&subscribe=1
 * - On error => ?error=1
 */
app.post("/subscribe", newsletterLimiter, newsletterValidationWithCaptcha, async (req, res) => {
  try {
    const { email, language, captcha, 'g-recaptcha-response': recaptchaResponse } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Newsletter validation errors:', errors.array());
      return res.redirect(`/danke.html?error=1&validation=1&lang=${language || "de"}`);
    }

    // CAPTCHA validation
    let captchaValid = false;
    let captchaError = null;

    // Try reCAPTCHA first if response provided
    if (recaptchaResponse) {
      const recaptchaResult = await validateRecaptcha(recaptchaResponse, req.ip);
      captchaValid = recaptchaResult.valid;
      captchaError = recaptchaResult.error;
    }
    // Fallback to SVG CAPTCHA if reCAPTCHA not provided or failed
    else if (captcha) {
      const svgResult = validateSvgCaptcha(req, captcha);
      captchaValid = svgResult.valid;
      captchaError = svgResult.error;
    }

    if (!captchaValid) {
      console.log('Newsletter CAPTCHA validation failed:', captchaError);
      return res.redirect(`/danke.html?error=1&captcha=1&lang=${language || "de"}`);
    }

    // Security checks
    const fingerprint = generateFingerprint(req);
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Spam detection
    if (isSpamContent(email)) {
      console.log('Newsletter spam detected in email:', email);
      return res.redirect(`/danke.html?error=1&spam=1&lang=${language || "de"}`);
    }

    // Duplicate submission check
    if (isDuplicateSubmission(fingerprint, email, 'newsletter_subscription')) {
      console.log('Newsletter duplicate submission detected:', email, fingerprint);
      return res.redirect(`/danke.html?error=1&duplicate=1&lang=${language || "de"}`);
    }

    if (!email) {
      // No email => error
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // Already subscribed => ?subscribed=1
      return res.redirect(`/danke.html?subscribed=1&lang=${language || "de"}`);
    }

    // Otherwise create with security tracking
    const newSub = new Subscriber({ 
      email,
      ipAddress,
      userAgent,
      fingerprint,
      isSpamChecked: true,
      securityScore: 10, // High score for passed CAPTCHA
      subscriptionSource: 'website'
    });
    await newSub.save();
    console.log("New newsletter subscriber saved with security tracking:", email, fingerprint);

    // Prepare welcome email (English or German)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let subjectLine, messageText;
    if (language === "en") {
      subjectLine = "Welcome to Job Werke – Thank You for Subscribing!";
      messageText = `Hello,

Thank you for subscribing to the Job Werke d.o.o. newsletter! We’re excited to keep you informed about our latest services, industry insights, and special offers.

Should you have any questions or requests, feel free to reply to this email or visit our website at https://www.jobwerke.com.

Kind regards,

Job Werke d.o.o.  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
Email: info@jobwerke.com  
Website: www.jobwerke.com  

Head Office:  
Marije Grbac 14  
51000 Rijeka  

Branch Office:  
Industriestraße 27  
61381 Friedrichsdorf  

Management: Goran Cosic  
Deputy: Drago Cosic  

---

**Confidentiality Notice**  
This email and any attachments may contain confidential and/or legally protected information. If you are not the intended recipient, please inform the sender immediately and delete this message. Any unauthorized copying or further distribution is prohibited. Your personal data is stored securely to prevent third-party access; however, email communication is generally unencrypted and can potentially be read by unauthorized persons on the internet, making complete data security impossible. If you prefer not to communicate by email, please let us know, and we will send correspondence by postal mail instead.
`;
    } else {
      // default: German
      subjectLine = "Willkommen bei Job Werke – Danke für Ihre Anmeldung!";
      messageText = `Hallo,

vielen Dank für Ihre Anmeldung zum Job Werke d.o.o. Newsletter! Wir freuen uns darauf, Ihnen künftig aktuelle Informationen, Branchen-News und exklusive Angebote zu übermitteln.

Sollten Sie Fragen oder besondere Wünsche haben, antworten Sie einfach auf diese E-Mail oder besuchen Sie unsere Webseite unter https://www.jobwerke.com.

Freundliche Grüße,

Job Werke d.o.o.  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
E-Mail: info@jobwerke.com  
Web: www.jobwerke.com  

Hauptsitz:  
Marije Grbac 14  
51000 Rijeka  

Zweigstelle:  
Industriestraße 27  
61381 Friedrichsdorf  

Geschäftsführung: Goran Cosic  
Stellvertretung: Drago Cosic  

---

**Rechtlicher Hinweis**  
Diese E-Mail und ihre Anhänge können vertrauliche bzw. rechtlich geschützte Informationen enthalten. Falls Sie diese Nachricht irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und löschen Sie diese E-Mail. Eine unbefugte Vervielfältigung oder Weiterleitung ist untersagt. Wir speichern Ihre personenbezogenen Daten so, dass sie für Dritte nicht zugänglich sind; jedoch erfolgt E-Mail-Kommunikation in der Regel unverschlüsselt und kann gegebenenfalls auf dem Übertragungsweg von Unbefugten eingesehen werden, sodass eine vollständige Datensicherheit nicht gewährleistet werden kann. Wenn Sie keine Kommunikation per E-Mail wünschen, geben Sie uns bitte Bescheid; in diesem Fall senden wir unsere Korrespondenz ausschließlich per Post.
`;
    }

    // Send welcome email
    await transporter.sendMail({
      from: `"Job Werke Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjectLine,
      text: messageText,
    });

    // On success => ?success=1&subscribe=1
    return res.redirect(`/danke.html?success=1&subscribe=1&lang=${language || "de"}`);
  } catch (err) {
    console.error("Error in /subscribe route:", err);
    return res.redirect(`/danke.html?error=1&lang=de`);
  }
});

/**
 * GET /subscribers -> admin usage
 */
app.get("/subscribers", async (req, res) => {
  try {
    const allSubs = await Subscriber.find().sort({ createdAt: -1 });
    return res.json(allSubs);
  } catch (err) {
    console.error("Error fetching subscribers:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to fetch subscribers." });
  }
});

/**
 * DELETE /subscribers/:id -> remove subscriber
 */
app.delete("/subscribers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Subscriber.findByIdAndDelete(id);
    return res.json({ success: true, msg: "Subscriber deleted." });
  } catch (err) {
    console.error("Error deleting subscriber:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to delete subscriber." });
  }
});

/* ========================================================================
   CONTACT / APPOINTMENT ROUTES
   ======================================================================== */
/**
 * POST /send-email
 * - Receives { name, email, message, wantsAppointment, terminDate, terminTime, hp, language, captcha, g-recaptcha-response }
 * - Validates CAPTCHA (SVG or reCAPTCHA)
 * - If wantsAppointment is "on" + date/time => sets appointmentDateTime
 * - On success => /danke.html?success=1 (+ &appointment=1) + &lang=
 * - On error => /danke.html?error=1 + &lang=
 */
app.post("/send-email", contactLimiter, contactValidationWithCaptcha, async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      wantsAppointment, // "on" if selected
      terminDate,
      terminTime,
      hp,               // honeypot
      language,         // "en" or "de"
      captcha,          // SVG CAPTCHA input
      'g-recaptcha-response': recaptchaResponse // Google reCAPTCHA response
    } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Contact form validation errors:', errors.array());
      return res.redirect(`/danke.html?error=1&validation=1&lang=${language || "de"}`);
    }

    // CAPTCHA validation
    let captchaValid = false;
    let captchaError = null;

    // Try reCAPTCHA first if response provided
    if (recaptchaResponse) {
      const recaptchaResult = await validateRecaptcha(recaptchaResponse, req.ip);
      captchaValid = recaptchaResult.valid;
      captchaError = recaptchaResult.error;
    }
    // Fallback to SVG CAPTCHA if reCAPTCHA not provided or failed
    else if (captcha) {
      const svgResult = validateSvgCaptcha(req, captcha);
      captchaValid = svgResult.valid;
      captchaError = svgResult.error;
    }

    if (!captchaValid) {
      console.log('Contact form CAPTCHA validation failed:', captchaError);
      return res.redirect(`/danke.html?error=1&captcha=1&lang=${language || "de"}`);
    }

    // Security checks
    const fingerprint = generateFingerprint(req);
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // A) Honeypot / basic checks
    if (hp && hp.trim() !== "") {
      console.log('Contact form honeypot triggered:', ipAddress);
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }
    if (!name || !email || !message) {
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Spam detection
    const fullContent = `${name} ${email} ${message}`;
    if (isSpamContent(fullContent)) {
      console.log('Contact form spam detected:', fingerprint, fullContent.substring(0, 100));
      return res.redirect(`/danke.html?error=1&spam=1&lang=${language || "de"}`);
    }

    // Duplicate submission check
    if (isDuplicateSubmission(fingerprint, email, message)) {
      console.log('Contact form duplicate submission detected:', email, fingerprint);
      return res.redirect(`/danke.html?error=1&duplicate=1&lang=${language || "de"}`);
    }

    // B) Possibly store appointment
    let appointmentDateTime = null;
    let queryString = `?success=1&lang=${language || "de"}`;
    let snippetDe = "";
    let snippetEn = "";

    if (wantsAppointment === "on" && terminDate && terminTime) {
      appointmentDateTime = new Date(`${terminDate}T${terminTime}:00`);
      queryString += "&appointment=1";
      snippetDe = `\n\nHinweis zum Termin:\nDatum: ${terminDate}, Uhrzeit: ${terminTime}`;
      snippetEn = `\n\nAppointment Note:\nDate: ${terminDate}, Time: ${terminTime}`;
    }

    // C) Save in DB with security tracking
    const newAppointment = new Appointment({
      name,
      email,
      message,
      appointmentDateTime,
      ipAddress,
      userAgent,
      fingerprint,
      isSpamChecked: true,
      securityScore: 10 // High score for passed CAPTCHA
    });
    await newAppointment.save();
    console.log("New inquiry stored in DB with security tracking:", newAppointment._id, fingerprint);

    // D) Email to admin
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Subject + text to admin
    let adminSubject, adminText;
    if (language === "en") {
      adminSubject = "New Inquiry";
      adminText = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}\n`;
      if (appointmentDateTime) {
        adminSubject += " (Appointment)";
        adminText += `\nAppointment requested on: ${terminDate} at ${terminTime}\n`;
      }
    } else {
      adminSubject = "Neue Kontakt-Anfrage";
      adminText = `Name: ${name}\nEmail: ${email}\nNachricht:\n${message}\n`;
      if (appointmentDateTime) {
        adminSubject += " (Terminwunsch)";
        adminText += `\nTermin: ${terminDate}, ${terminTime}\n`;
      }
    }

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: adminSubject,
      text: adminText
    });

    // E) Auto-reply to user
    let autoSubject, autoBody;
    if (language === "en") {
      autoSubject = "Your Inquiry at Job Werke";
      autoBody = `Hello ${name},

Thank you for reaching out to Job Werke d.o.o. We appreciate your inquiry and will respond as soon as possible.



Should you have any additional questions, feel free to reply to this email or visit our website at https://www.jobwerke.com.

Kind regards,

Job Werke d.o.o.  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
Email: info@jobwerke.com  
Website: www.jobwerke.com  

Head Office:  
Marije Grbac 14  
51000 Rijeka  

Branch Office:  
Industriestraße 27  
61381 Friedrichsdorf  

Management: Goran Cosic  
Deputy: Drago Cosic  

---

**Confidentiality Notice**  
This email and any attachments may contain confidential and/or legally protected information. If you are not the intended recipient, please notify the sender immediately and delete this email. Any unauthorized copying or sharing is prohibited. We store your personal data securely so that it is inaccessible to third parties; however, email communications are generally unencrypted and may be readable by unauthorized persons on the internet, so complete data security cannot be guaranteed. If you prefer not to communicate via email, please let us know, and we will send correspondence via postal mail.

`;
    } else {
      autoSubject = "Ihre Anfrage bei Job Werke";
      autoBody = `Hallo ${name},

vielen Dank für Ihre Nachricht an Job Werke d.o.o. Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.



Sollten Sie weitere Fragen haben, antworten Sie gerne auf diese E-Mail oder besuchen Sie unsere Webseite unter https://www.jobwerke.com.

Freundliche Grüße,

Job Werke d.o.o.  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
E-Mail: info@jobwerke.com  
Web: www.jobwerke.com  

Hauptsitz:  
Marije Grbac 14  
51000 Rijeka  

Zweigstelle:  
Industriestraße 27  
61381 Friedrichsdorf  

Geschäftsführung: Goran Cosic  
Stellvertretung: Drago Cosic  

---

**Rechtlicher Hinweis**  
Diese E-Mail und ihre Anhänge können vertrauliche bzw. rechtlich geschützte Informationen enthalten. Wenn Sie nicht der beabsichtigte Empfänger sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte umgehend den Absender und löschen Sie diese E-Mail. Jegliches unerlaubte Kopieren oder Weiterleiten ist untersagt. Wir speichern Ihre personenbezogenen Daten so, dass Dritte keinen Zugriff haben. Da die Kommunikation per E-Mail in der Regel unverschlüsselt erfolgt, kann eine vollständige Datensicherheit nicht garantiert werden. Falls Sie keine Kommunikation per E-Mail wünschen, teilen Sie uns dies bitte mit. In diesem Fall versenden wir unsere Korrespondenz ausschließlich auf dem Postweg.

`;
    }

    await transporter.sendMail({
      from: `"No-Reply" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: email,
      subject: autoSubject,
      text: autoBody
    });

    // F) Redirect => danke
    return res.redirect(`/danke.html${queryString}`);
  } catch (err) {
    console.error("Error in /send-email route:", err);
    return res.redirect(`/danke.html?error=1&lang=de`);
  }
});

/* ================================================
   APPOINTMENT ADMIN ROUTES
   ================================================ */
// GET /appointments
app.get("/appointments", async (req, res) => {
  try {
    const all = await Appointment.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({ success: false, msg: "Failed to fetch appointments." });
  }
});

// PUT /appointments/:id -> confirm/cancel
app.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. "confirmed" or "canceled"
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, msg: "Appointment not found." });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res.status(500).json({ success: false, msg: "Failed to update appointment." });
  }
});

// DELETE /appointments/:id
app.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    return res.json({ success: true, msg: "Appointment deleted." });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    return res.status(500).json({ success: false, msg: "Failed to delete appointment." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🔒 Secure Server is running on http://localhost:${PORT}`);
  console.log(`📧 Anti-spam protection: ENABLED`);
  console.log(`🛡️  Rate limiting: ENABLED`);
  console.log(`🔍 Input validation: ENABLED`);
  console.log(`🚫 Spam detection: ENABLED`);
  console.log(`🎯 Fingerprinting: ENABLED`);
  console.log(`⚡ Security headers: ENABLED`);
  console.log(`🤖 SVG CAPTCHA: ENABLED`);
  console.log(`🔐 Google reCAPTCHA: ${recaptchaV2 ? 'ENABLED' : 'DISABLED (configure RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY)'}`);
  console.log(`🔑 Session management: ENABLED`);
  console.log(`🎨 CAPTCHA endpoints: /captcha, /captcha/audio, /captcha/refresh, /recaptcha/config`);
});