/**
 * server.js
 * Run with: node server.js (or use nodemon)
 */
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // .env must have EMAIL_USER, EMAIL_PASS, MONGODB_URI, etc.

// Import existing models
const Appointment = require("./models/Appointment.js");
const Subscriber = require("./models/Subscriber.js");

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Connect to MongoDB
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

// 2) Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Serve ONLY specific folders as static
//    so you don't expose the entire repo
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// (Optional) If you have an admin-panel folder with static files:
app.use("/admin-panel", express.static(path.join(__dirname, "admin-panel")));

// 4) Serve each HTML file explicitly
//    e.g., root path -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Repeat for each .html you want publicly accessible:
app.get("/arbeiten.html", (req, res) => {
  res.sendFile(path.join(__dirname, "arbeiten.html"));
});

app.get("/kontakt.html", (req, res) => {
  res.sendFile(path.join(__dirname, "kontakt.html"));
});

app.get("/dienstleistungen.html", (req, res) => {
  res.sendFile(path.join(__dirname, "dienstleistungen.html"));
});

app.get("/uber-uns.html", (req, res) => {
  res.sendFile(path.join(__dirname, "uber-uns.html"));
});

app.get("/danke.html", (req, res) => {
  res.sendFile(path.join(__dirname, "danke.html"));
});

// ... add more if you have other .html files

/**
 * OPTIONS /subscribe
 * For CORS preflight on /subscribe endpoint
 */
app.options("/subscribe", cors());

/**
 * POST /subscribe
 * Saves an email to MongoDB (Subscriber collection),
 * optionally sends a welcome email
 */
app.post("/subscribe", async (req, res) => {
  try {
    const { email, language } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: "E-Mail fehlt." });
    }
    // Check if already subscribed
    let existing = await Subscriber.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, msg: "Diese E-Mail ist bereits eingetragen." });
    }

    // Save new subscriber
    const newSub = new Subscriber({ email });
    await newSub.save();
    console.log("New newsletter subscriber saved:", email);

    // (Optional) send a welcome email
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    let mailOptions = {
      from: `"Job Werke Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        language === "en"
          ? "Thank you for subscribing!"
          : "Danke für Ihre Newsletter-Anmeldung!",
      text:
        language === "en"
          ? "Hello, thanks for subscribing to our newsletter!"
          : "Hallo, danke für Ihre Anmeldung zu unserem Newsletter!",
    };
    await transporter.sendMail(mailOptions);

    // Return success
    return res.status(200).json({
      success: true,
      msg:
        language === "en"
          ? "Thank you for subscribing!"
          : "Danke für Ihre Newsletter-Anmeldung!",
    });
  } catch (err) {
    console.error("Error in /subscribe route:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Serverfehler beim Abonnieren." });
  }
});

/**
 * POST /send-email
 * Saves inquiry to DB, sends admin email, and sends user an auto-reply
 */
app.post("/send-email", async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      wantsAppointment,
      terminDate,
      terminTime,
      hp
    } = req.body;

    // (A) Honeypot/spam check
    if (hp && hp.trim() !== "") {
      return res
        .status(400)
        .json({ success: false, msg: "Spam detected (honeypot filled)." });
    }

    // (B) Basic validation
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing required fields." });
    }

    // (C) If user requested an appointment
    let appointmentDateTime = null;
    if (wantsAppointment && terminDate && terminTime) {
      appointmentDateTime = new Date(`${terminDate}T${terminTime}:00`);
    }

    // (D) Prepare admin email
    let subjectLine = "Neue Kontakt-Anfrage";
    let emailText = `Name: ${name}\nEmail: ${email}\nNachricht:\n${message}\n\n`;
    if (appointmentDateTime) {
      subjectLine = "Neue Kontakt-Anfrage (Terminwunsch)";
      emailText += `*** Termin-Anfrage ***\nDatum: ${terminDate}\nUhrzeit: ${terminTime}\n`;
    }

    // (E) Store in MongoDB
    const newAppointment = new Appointment({
      name,
      email,
      message,
      appointmentDateTime,
    });
    await newAppointment.save();
    console.log("New inquiry stored in DB:", newAppointment);

    // (F) Nodemailer for admin
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    let adminMailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: subjectLine,
      text: emailText,
    };
    await transporter.sendMail(adminMailOptions);

    // (G) Auto-reply to user
    let autoReplyOptions = {
      from: `"No-Reply" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: email,
      subject: "Danke für Ihre Nachricht an Job Werke d.o.o.",
      text: `Hallo ${name},\n\nvielen Dank für Ihre Nachricht! Wir melden uns in Kürze.\n\nBeste Grüße,\nJob Werke d.o.o.`,
    };
    await transporter.sendMail(autoReplyOptions);

    return res
      .status(200)
      .json({ success: true, msg: "Ihre Nachricht wurde gesendet." });
  } catch (err) {
    console.error("Error in /send-email route:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Interner Serverfehler." });
  }
});

// GET /appointments -> Admin panel fetches all
app.get("/appointments", async (req, res) => {
  try {
    const allAppointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json(allAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to fetch appointments." });
  }
});

// PUT /appointments/:id -> confirm/cancel
app.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedAppt = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedAppt) {
      return res
        .status(404)
        .json({ success: false, msg: "Appointment not found." });
    }
    return res.json({ success: true, data: updatedAppt });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Failed to update appointment." });
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
    return res
      .status(500)
      .json({ success: false, msg: "Failed to delete appointment." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});