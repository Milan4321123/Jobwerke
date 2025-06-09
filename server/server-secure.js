/**
 * server-secure.js - Enhanced security version
 * Run with: node server-secure.js  (or use nodemon)
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
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}
connectDB();

/* ================================================
   2) Security & Anti-Spam Middleware
   ================================================ */

// Security headers
app.use(helmet());

// Rate limiting for general requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 contact form submissions per 15 minutes
  message: {
    error: "Too many contact form submissions from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiting for newsletter subscription
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // limit each IP to 2 newsletter subscriptions per hour
  message: {
    error: "Too many newsletter subscriptions from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5, // allow 5 requests per 15 minutes at full speed, then...
  delayMs: 500 // add 500ms delay per request after delayAfter
});

// Apply general rate limiting to all requests
app.use(generalLimiter);
app.use(speedLimiter);

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

/* ================================================
   3) Standard Middleware
   ================================================ */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

/* ========================================================================
   SUBSCRIBER ROUTES (Newsletter) - ENHANCED SECURITY
   ======================================================================== */
app.options("/subscribe", cors()); // For CORS preflight (if needed)

/**
 * POST /subscribe - Enhanced with anti-spam protection
 * - Receives { email, language } from your newsletter form
 * - Rate limiting, input validation, spam detection, duplicate prevention
 * - If email already exists => redirect ?subscribed=1
 * - Else => create in DB, send welcome email, redirect ?success=1&subscribe=1
 * - On error => ?error=1
 */
app.post("/subscribe", newsletterLimiter, emailValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Newsletter validation errors:", errors.array());
      return res.redirect(`/danke.html?error=1&lang=${req.body.language || "de"}`);
    }

    const { email, language } = req.body;  // "en", "de", or "hr"
    const fingerprint = generateFingerprint(req);

    // Additional spam checks
    if (isSpamContent(email)) {
      console.log("Spam detected in newsletter email:", email);
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Check for duplicate submission
    if (isDuplicateSubmission(fingerprint, email, 'newsletter')) {
      console.log("Duplicate newsletter submission detected");
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // Already subscribed => ?subscribed=1
      return res.redirect(`/danke.html?subscribed=1&lang=${language || "de"}`);
    }

    // Otherwise create with additional tracking data
    const newSub = new Subscriber({ 
      email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      fingerprint: fingerprint
    });
    await newSub.save();
    console.log("New newsletter subscriber saved:", email);

    // Prepare welcome email (English, German, or Croatian)
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

Thank you for subscribing to the Job Werke d.o.o. newsletter! We're excited to keep you informed about our latest services, industry insights, and special offers.

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
    } else if (language === "hr") {
      subjectLine = "Dobrodošli u Job Werke – Hvala vam na pretplati!";
      messageText = `Pozdrav,

Hvala vam što ste se pretplatili na newsletter Job Werke d.o.o.! Radujemo se što ćemo vas informirati o našim najnovijim uslugama, uvjetima u industriji i posebnim ponudama.

Ako imate pitanja ili zahtjeve, slobodno odgovorite na ovaj email ili posjetite našu web stranicu na https://www.jobwerke.com.

Srdačan pozdrav,

Job Werke d.o.o.  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
Email: info@jobwerke.com  
Website: www.jobwerke.com  

Glavni ured:  
Marije Grbac 14  
51000 Rijeka  

Podružnica:  
Industriestraße 27  
61381 Friedrichsdorf  

Uprava: Goran Cosic  
Zamjenik: Drago Cosic

---

**Obavijest o povjerljivosti**  
Ovaj email i njegovi prilozi mogu sadržavati povjerljive i/ili pravno zaštićene informacije. Ako niste namijenjeni primatelj, molimo vas da odmah obavijestite pošiljatelja i obrišete ovu poruku. Svako neovlašteno kopiranje ili prosljeđivanje je zabranjeno. Vaše osobne podatke čuvamo sigurno kako bi se spriječio pristup trećih strana; međutim, email komunikacija je općenito nešifrirana i može se dogoditi da je neovlaštene osobe čitaju na internetu, što čini potpunu sigurnost podataka nemogućom. Ako ne želite komunicirati putem emaila, molimo vas da nas obavijestite, a mi ćemo slati korespondenciju isključivo poštom.
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

/* ========================================================================
   CONTACT / APPOINTMENT ROUTES - ENHANCED SECURITY
   ======================================================================== */
/**
 * POST /send-email - Enhanced with anti-spam protection
 * - Receives { name, email, message, wantsAppointment, terminDate, terminTime, hp, language }
 * - Rate limiting, input validation, spam detection, duplicate prevention
 * - If wantsAppointment is "on" + date/time => sets appointmentDateTime
 * - On success => /danke.html?success=1 (+ &appointment=1) + &lang=
 * - On error => /danke.html?error=1 + &lang=
 */
app.post("/send-email", contactLimiter, contactValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Contact form validation errors:", errors.array());
      return res.redirect(`/danke.html?error=1&lang=${req.body.language || "de"}`);
    }

    const {
      name,
      email,
      message,
      wantsAppointment, // "on" if selected
      terminDate,
      terminTime,
      hp,               // honeypot - should be empty
      language          // "en", "de", or "hr"
    } = req.body;

    const fingerprint = generateFingerprint(req);

    // Additional spam checks
    if (isSpamContent(message) || isSpamContent(name)) {
      console.log("Spam detected in contact form:", { name, email, message: message.substring(0, 50) });
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Check for duplicate submission
    if (isDuplicateSubmission(fingerprint, email, message)) {
      console.log("Duplicate contact form submission detected");
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }

    // Process appointment request
    let appointmentDateTime = null;
    let queryString = `?success=1&lang=${language || "de"}`;

    if (wantsAppointment === "on" && terminDate && terminTime) {
      appointmentDateTime = new Date(`${terminDate}T${terminTime}:00`);
      queryString += "&appointment=1";
    }

    // Save in DB with additional tracking data
    const newAppointment = new Appointment({
      name,
      email,
      message,
      appointmentDateTime,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      fingerprint: fingerprint
    });
    await newAppointment.save();
    console.log("New inquiry stored in DB:", { name, email, hasAppointment: !!appointmentDateTime });

    // Email to admin
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
    } else if (language === "hr") {
      adminSubject = "Nova upit";
      adminText = `Ime: ${name}\nEmail: ${email}\nPoruka:\n${message}\n`;
      if (appointmentDateTime) {
        adminSubject += " (Termin)";
        adminText += `\nZahtjev za termin: ${terminDate} u ${terminTime}\n`;
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

    // Auto-reply to user
    let autoSubject, autoBody;
    if (language === "en") {
      autoSubject = "Your Inquiry at Job Werke";
      autoBody = `Hello ${name},

Thank you for reaching out to Job Werke d.o.o. We appreciate your inquiry and will respond as soon as possible.

${appointmentDateTime ? `\nRegarding your appointment request for ${terminDate} at ${terminTime}, we will confirm the availability and get back to you shortly.` : ''}

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
    } else if (language === "hr") {
      autoSubject = "Vaš upit u Job Werke";
      autoBody = `Pozdrav ${name},

Hvala vam što ste kontaktirali Job Werke d.o.o. Cijenimo vaš upit i odgovorit ćemo vam što je prije moguće.

${appointmentDateTime ? `\nU vezi vašeg zahtjeva za termin ${terminDate} u ${terminTime}, potvrditi ćemo dostupnost i javiti vam se uskoro.` : ''}

Ako imate dodatna pitanja, slobodno odgovorite na ovaj email ili posjetite našu web stranicu na https://www.jobwerke.com.

Srdačan pozdrav,

Job Werke d.o.o.  
Industriestraße 27  
61381 Friedrichsdorf  

WhatsApp: +385 (99) 532 1237  
WhatsApp: +385 (99) 208 8076  
Email: info@jobwerke.com  
Website: www.jobwerke.com

Glavni ured:  
Marije Grbac 14  
51000 Rijeka  

Podružnica:  
Industriestraße 27  
61381 Friedrichsdorf  

Uprava: Goran Cosic  
Zamjenik: Drago Cosic

---

**Obavijest o povjerljivosti**  
Ovaj email i njegovi prilozi mogu sadržavati povjerljive i/ili pravno zaštićene informacije. Ako niste namijenjeni primatelj, molimo vas da odmah obavijestite pošiljatelja i obrišete ovaj email. Svako neovlašteno kopiranje ili dijeljenje je zabranjeno. Vaše osobne podatke čuvamo sigurno tako da su nedostupni trećim stranama; međutim, email komunikacija je općenito nešifrirana i može je pročitati neovlaštene osobe na internetu, tako da se potpuna sigurnost podataka ne može garantirati. Ako ne želite komunicirati putem emaila, molimo vas da nas obavijestite, a mi ćemo slati korespondenciju poštom.
`;
    } else {
      autoSubject = "Ihre Anfrage bei Job Werke";
      autoBody = `Hallo ${name},

vielen Dank für Ihre Nachricht an Job Werke d.o.o. Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.

${appointmentDateTime ? `\nBezüglich Ihres Terminwunsches für den ${terminDate} um ${terminTime} werden wir die Verfügbarkeit prüfen und uns zeitnah bei Ihnen melden.` : ''}

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

    // Redirect to thank you page
    return res.redirect(`/danke.html${queryString}`);
  } catch (err) {
    console.error("Error in /send-email route:", err);
    return res.redirect(`/danke.html?error=1&lang=${req.body.language || "de"}`);
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
});
