/**
 * server.js
 * Run with: node server.js  (or use nodemon)
 */

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
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
   2) Middleware
   ================================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================================
   3) Serve static files (CSS, JS, assets)
   ================================================ */
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

/* ================================================
   4) Serve .html from the project root
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
   SUBSCRIBER ROUTES (Newsletter)
   ======================================================================== */
app.options("/subscribe", cors()); // For CORS preflight (if needed)

/**
 * POST /subscribe
 * - Receives { email, language } from your newsletter form
 * - If email already exists => redirect ?subscribed=1
 * - Else => create in DB, send welcome email, redirect ?success=1&subscribe=1
 * - On error => ?error=1
 */
app.post("/subscribe", async (req, res) => {
  try {
    const { email, language } = req.body;  // "en" or "de"

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

    // Otherwise create
    const newSub = new Subscriber({ email });
    await newSub.save();
    console.log("New newsletter subscriber saved:", email);

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
Email: job.werke@web.de  
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
E-Mail: job.werke@web.de  
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
 * - Receives { name, email, message, wantsAppointment, terminDate, terminTime, hp, language }
 * - If wantsAppointment is "on" + date/time => sets appointmentDateTime
 * - On success => /danke.html?success=1 (+ &appointment=1) + &lang=
 * - On error => /danke.html?error=1 + &lang=
 */
app.post("/send-email", async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      wantsAppointment, // "on" if selected
      terminDate,
      terminTime,
      hp,               // honeypot
      language          // "en" or "de"
    } = req.body;

    // A) Honeypot / basic checks
    if (hp && hp.trim() !== "") {
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
    }
    if (!name || !email || !message) {
      return res.redirect(`/danke.html?error=1&lang=${language || "de"}`);
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

    // C) Save in DB
    const newAppointment = new Appointment({
      name,
      email,
      message,
      appointmentDateTime
    });
    await newAppointment.save();
    console.log("New inquiry stored in DB:", newAppointment);

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
Email: job.werke@web.de  
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
E-Mail: job.werke@web.de  
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
  console.log(`Server is running on http://localhost:${PORT}`);
});