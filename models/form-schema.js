const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const FormSchema = mongoose.Schema(
  {
    sessionId: { type: String, default: uuidv4, unique: true },
    type: {
      type: String,
      enum: ["One Way", "Return"],
    },
    passengers: { type: Array },
    email: { type: String },
    phoneNumber: {
      code: { type: String, required: true },
      digits: { type: String, required: true },
    },
    from: { type: String },
    to: { type: String },
    departureDate: { type: Date },
    returnDate: { type: Date },
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
    totalAmount: { type: Number },
  },

  { timestamps: true }
);

const Form = mongoose.model("Form", FormSchema);

module.exports = Form;
