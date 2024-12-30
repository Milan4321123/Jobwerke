// server.js

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// ===== IMPORT THE MODEL =====
const Appointment = require("./models/Appointment.js");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONNECT TO MONGODB ATLAS =====
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

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====

// CONTACT / APPOINTMENT FORM
app.post("/send-email", async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      wantsAppointment,
      terminDate, // e.g. "2024-12-28"
      terminTime, // e.g. "13:59"
      hp
    } = req.body;

    // 1) Honeypot check
    if (hp && hp.trim() !== "") {
      return res.status(400).json({ success: false, msg: "Spam detected." });
    }

    // 2) Build email text
    let emailText = `Name: ${name}\nEmail: ${email}\nNachricht:\n${message}\n\n`;
    let subjectLine = "Neue Kontakt-Anfrage";

    let appointmentDateTime = null;
    let newAppointment = null;

    if (wantsAppointment && terminDate && terminTime) {
      // Convert date+time -> single JavaScript Date
      appointmentDateTime = new Date(`${terminDate}T${terminTime}:00`);

      emailText += `\n*** Termin-Anfrage ***\nDatum: ${terminDate}\nUhrzeit: ${terminTime}\n`;
      subjectLine = "Neue Kontakt-Anfrage mit Termin";

      // Save to DB
      newAppointment = new Appointment({
        name,
        email,
        message,
        appointmentDateTime, // store as real Date
        // status remains "pending" by default
      });
      await newAppointment.save();
      console.log("New appointment stored:", newAppointment);
    }

    // 3) Nodemailer config
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4) Email to admin (YOU)
    let mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER, // or your test email
      subject: subjectLine,
      text: emailText,
    };
    await transporter.sendMail(mailOptions);

    // 5) Auto-reply to user
    let autoReplyOptions = {
      from: `"No-Reply" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: email,
      subject: "Danke für Ihre Nachricht an Job Werke d.o.o.",
      text: `Hallo ${name},\n\nvielen Dank für Ihre Nachricht! Wir melden uns in Kürze.\n\nBeste Grüße,\nJob Werke d.o.o.`,
    };
    await transporter.sendMail(autoReplyOptions);

    return res.status(200).json({ success: true, msg: "Emails sent successfully." });
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({ success: false, msg: "Failed to send email." });
  }
});

// GET all appointments
app.get("/appointments", async (req, res) => {
  try {
    const allAppointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json(allAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({ success: false, msg: "Failed to fetch appointments." });
  }
});

// UPDATE (confirm/cancel) an appointment
app.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. "confirmed", "canceled", etc.
    const updatedAppt = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedAppt) {
      return res.status(404).json({ success: false, msg: "Appointment not found." });
    }
    return res.json({ success: true, data: updatedAppt });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res.status(500).json({ success: false, msg: "Failed to update appointment." });
  }
});

// DELETE an appointment
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

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});