const mongoose = require("mongoose");

const TicketSchema = mongoose.Schema({
  ticketType: { type: String },
  ticketId: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  from: { type: String },
  to: { type: String },
  departureDate: { type: String },
  arrivalDate: { type: String },
  quanity: { type: Number },
  message: { type: String },
});

const TicketModel = mongoose.model("form", TicketSchema);

module.exports = TicketModel;
