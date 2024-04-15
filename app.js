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
app.use(cors());

// Nodemailer
let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ammar.afridi95@gmail.com",
    pass: "gqhi eyuf bskv tdzc",
  },
});

// DB Connection
mongoose
  .connect(
    "mongodb+srv://admin01:Geralt_091@cluster0.eb3zmm7.mongodb.net/mydummyticket?retryWrites=true&w=majority"
  )
  .then((success) => console.log(`Connected to MonogDB successfully`))
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
        from: "ammar.afridi95@gmail.com",
        to: "info@citytours.ae",
        subject: `New Form Submitted On MyDummyTicket.ae`,
        text: `${
          formData.firstName + " " + formData.lastName
        } needs a dummy ticket from ${formData.from} to ${
          formData.to
        }. Phone number is ${formData.number} and email address is ${
          formData.email
        }`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error.message);
          return;
        }
        console.log("Email sent successfully!");
      });
    })
    .catch((error) => console.log(`Error sending data to DB ${error}`));

  console.log(formData);
  res.send("Received the data successfully");

  FormModel.remove({}, callback)
    .then((success) => {
      console.log("Data erased successfully");
    })
    .catch((error) => console.log("Error deleting data"));
});

app.listen(3001, () => {
  console.log("App running on localhost:3001");
});
