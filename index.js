require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const FormModel = require("./models/FormModel");

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

// Nodemailer
let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

// DB Connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log(`Connected to MonogDB successfully`))
  .catch((error) => console.log(`Error connecting to MongoDB ${error}`));

// Routes
app.post("/", (req, res) => {
  const formData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.number,
    from: req.body.from,
    to: req.body.to,
    departureDate: req.body.departureDate,
    arrivalDate: req.body.arrivalDate,
  };

  FormModel.create(formData)
    .then((success) => {
      console.log(`Data entered successfully: ${success}`);

      // Send email
      let mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: "info@citytours.ae",
        subject: `New Form Submitted On MyDummyTicket.ae`,
        html: `<strong>Name:</strong> ${
          formData.firstName + " " + formData.lastName
        }; <strong>Phone Number:</strong> ${
          formData.phoneNumber
        }; <strong>Email:</strong> ${formData.email}; <strong>From:</strong> ${
          formData.from
        }; <strong>To:</strong> ${
          formData.to
        }; <strong>Departing on:</strong> ${formData.departureDate}; ${
          formData.arrivalDate &&
          `<strong>Departing on:</strong> ${formData.arrivalDate}`
        }`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error.message);
          res.status(500).send({ error: "Error sending email" }); // Sending error to client
          return;
        } else {
          console.log("Email sent successfully!");
          res.send("Email sent successfully!"); // Sending success message to client
        }
      });
    })
    .catch((error) => {
      console.log(`Error sending data to DB ${error}`);
      res.status(500).send({ error: "Error saving data to database" }); // Sending error to client
    });
});

app.listen(process.env.PORT);
