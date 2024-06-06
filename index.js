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
app.use(
  cors({
    origin: process.env.FRONTEND_URL.replace(/\/$/, ""),
  })
);
app.options("*", (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL.replace(/\/$/, "")
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// DB Connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log(`Connected to MonogDB successfully`))
  .catch((error) => console.log(`Error connecting to MongoDB ${error}`));

// -------------------- Route --------------------
app.use("/", ticketRoutes);

app.listen(process.env.PORT);
