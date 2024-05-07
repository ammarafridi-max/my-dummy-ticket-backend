const mongoose = require("mongoose");

const FormSchema = mongoose.Schema({
  ticketType: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  from: { type: String },
  to: { type: String },
  departureDate: { type: String },
  arrivalDate: { type: String },
  quanity: { type: Number },
  price: { type: Number },
  message: { type: String },
});

const FormModel = mongoose.model("form", FormSchema);

module.exports = FormModel;
