/**
 * server.js
 * Run: node server.js   (or use nodemon)
 */
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // make sure .env is in root

const Appointment = require("./models/Appointment.js");

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

// 3) Serve static files (kontakt.html, admin.html, etc. from ./public)
app.use(express.static("public"));

/**
 * POST /send-email
 * Saves inquiry to DB, sends admin email, sends user auto-reply
 */
app.post("/send-email", async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      wantsAppointment, // boolean
      terminDate,
      terminTime,
      hp // honeypot
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

    // (C) Determine if user requested an appointment
    let appointmentDateTime = null;
    if (wantsAppointment && terminDate && terminTime) {
      appointmentDateTime = new Date(`${terminDate}T${terminTime}:00`);
    }

    // (D) Create text for admin email
    let subjectLine = "Neue Kontakt-Anfrage";
    let emailText = `Name: ${name}\nEmail: ${email}\nNachricht:\n${message}\n\n`;
    if (appointmentDateTime) {
      subjectLine = "Neue Kontakt-Anfrage (Terminwunsch)";
      emailText += `*** Termin-Anfrage ***\nDatum: ${terminDate}\nUhrzeit: ${terminTime}\n`;
    }

    // (E) Store in MongoDB (new "Appointment" doc)
    const newAppointment = new Appointment({
      name,
      email,
      message,
      appointmentDateTime,
      // status defaults to "pending"
    });
    await newAppointment.save();
    console.log("New inquiry stored in DB:", newAppointment);

    // (F) Nodemailer: set up transporter
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g. "myaccount@gmail.com"
        pass: process.env.EMAIL_PASS, // e.g. "abcd1234" (an app password)
      },
    });

    // (G) Send email to admin
    let adminMailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER, // your own email
      subject: subjectLine,
      text: emailText,
    };
    await transporter.sendMail(adminMailOptions);

    // (H) Send auto-reply to user
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
    // sort newest first
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
    const { status } = req.body; // "confirmed", "canceled", etc.
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