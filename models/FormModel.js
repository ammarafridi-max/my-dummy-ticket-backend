const mongoose = require("mongoose");

const FormSchema = mongoose.Schema({
  creation: {
    date: { type: String },
    time: { type: String },
  },
  type: { type: String },
  price: { type: Number },
  passengers: { type: Array },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  from: { type: String },
  to: { type: String },
  departureDate: { type: String },
  arrivalDate: { type: String },
  quantity: { type: Number },
  message: { type: String },
});

const FormModel = mongoose.model("form", FormSchema);

module.exports = FormModel;
