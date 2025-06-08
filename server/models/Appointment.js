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
    
    // Security tracking fields for anti-spam protection
    ipAddress: { type: String },
    userAgent: { type: String },
    fingerprint: { type: String }, // Browser fingerprint for duplicate detection
    
    // Optional: Additional security metadata
    isSpamChecked: { type: Boolean, default: true },
    securityScore: { type: Number, default: 0 }, // For future spam scoring
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);