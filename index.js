require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
