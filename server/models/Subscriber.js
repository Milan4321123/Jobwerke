// models/Subscriber.js
const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    
    // Security tracking fields for anti-spam protection
    ipAddress: { type: String },
    userAgent: { type: String },
    fingerprint: { type: String }, // Browser fingerprint for duplicate detection
    
    // Subscription management
    isActive: { type: Boolean, default: true },
    
    // Optional: Additional security metadata
    isSpamChecked: { type: Boolean, default: true },
    securityScore: { type: Number, default: 0 }, // For future spam scoring
    subscriptionSource: { type: String, default: 'website' }, // Track subscription source
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscriber", SubscriberSchema);