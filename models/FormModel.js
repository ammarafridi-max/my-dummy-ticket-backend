const mongoose = require("mongoose");

const FormSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  from: { type: String },
  to: { type: String },
  departureDate: { type: String },
  arrivalDate: { type: String },
  passport: { type: String },
});

const FormModel = mongoose.model("form", FormSchema);

module.exports = FormModel;
