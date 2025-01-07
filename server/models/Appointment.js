// models/Appointment.js
const mongoose = require("mongoose");

// By default, { timestamps: true } adds createdAt and updatedAt fields
const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    appointmentDateTime: { type: Date, default: null },
    status: { type: String, default: "pending" }, // e.g., "pending", "confirmed", "canceled"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);