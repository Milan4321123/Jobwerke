// models/Appointment.js

const mongoose = require("mongoose");

// Define the schema for an appointment
const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  // Single Date field for robust date/time handling
  appointmentDateTime: {
    type: Date,
    required: false, // only required if wantsAppointment is true
  },
  status: {
    type: String,
    default: "pending", // or "confirmed", "canceled", etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);