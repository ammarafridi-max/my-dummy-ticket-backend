const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const FormSchema = mongoose.Schema(
  {
    sessionId: { type: String, default: uuidv4, unique: true },
    creation: {
      date: { type: String },
      time: { type: String },
    },
    type: {
      type: String,
      enum: ["One Way Flight Reservation", "Return Flight Reservation"],
    },
    passengers: { type: Array },
    email: { type: String },
    phoneNumber: {
      code: { type: String, required: true },
      digits: { type: String, required: true },
    },
    from: { type: String },
    to: { type: String },
    departureDate: { type: String },
    arrivalDate: { type: String },
    quantity: {
      adults: { type: Number },
      children: { type: Number },
      infants: { type: Number },
    },
    message: { type: String },
    status: {
      type: String,
      enum: ["SEARCH_FLIGHTS", "REVIEW_ORDER", "PAYMENT_DONE"],
    },
    ticketValidity: {
      type: String,
      enum: ["48h", "7d", "14d"],
    },
    ticketAvailability: {
      immediate: { type: Boolean },
      receiptDate: { type: String },
    },
    flightDetails: { type: Object },
  },

  { timestamps: true }
);

const Form = mongoose.model("Form", FormSchema);

module.exports = Form;
