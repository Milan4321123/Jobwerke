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
    // Optional: add more fields if you want, e.g. name
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscriber", SubscriberSchema);