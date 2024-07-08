require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const ticketRoutes = require("./routes/ticket-routes");

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

app.use(
  cors({
    origin: "https://www.mydummyticket.ae",
  })
);

// DB Connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log(`Connected to MongoDB successfully`))
  .catch((error) => console.log(`Error connecting to MongoDB: ${error}`));

// Routes
app.use("/", ticketRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
