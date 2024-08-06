require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const ticketRoutes = require("./routes/ticket-routes");
const airportRoutes = require("./routes/airport-routes");
const flightRoutes = require("./routes/flight-routes");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS for all routes
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL.replace(/\/$/, ""),
//     methods: "GET, POST, OPTIONS",
//     allowedHeaders: "Content-Type",
//   })
// );

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// DB Connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log(`Connected to DB successfully`))
  .catch((error) => console.log(`Error connecting to db: ${error}`));

// Routes
app.use("/", ticketRoutes);
// app.use("/airports", airportRoutes);
// app.use("/flights", flightRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
