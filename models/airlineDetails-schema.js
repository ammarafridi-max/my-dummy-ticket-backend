const mongoose = require("mongoose");

const airlineSchema = mongoose.Schema({
  iataCode: { type: String },
  icaoCode: { type: String },
  businessName: { type: String },
  commonName: { type: String },
  logo: { type: String },
});

const Airline = mongoose.model("airline", airlineSchema);

module.exports = Airline;
