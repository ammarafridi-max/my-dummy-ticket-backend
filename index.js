require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_API);
const FormModel = require("./models/FormModel");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL.replace(/\/$/, ""),
  })
);
app.options("*", cors());

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

app.post("/", async (req, res) => {
  try {
    // 1. Retrieve Data
    const formData = {
      ticketType: req.body.ticketType,
      ticketId: req.body.ticketId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.number,
      from: req.body.from,
      to: req.body.to,
      departureDate: req.body.departureDate,
      arrivalDate: req.body.arrivalDate,
    };

    // 2. Send data to database.
    await FormModel.create(formData);

    // 3. Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: formData.ticketId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
    });

    // 4. Send response to client
    res.status(200).json({
      sessionId: session.id,
      clientSecret: session.client_secret,
      url: session.url,
    });

    // 5. Send email only if payment is successful
    session.on("payment_intent.succeeded", async (event) => {
      let mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: "info@citytours.ae",
        subject: `${
          formData.firstName + " " + formData.lastName
        } Submitted On MyDummyTicket.ae`,
        html: `<p style="font-size:20px"><strong>Name:</strong> ${
          formData.firstName + " " + formData.lastName
        }; <br><strong>Phone Number:</strong> ${
          formData.phoneNumber
        }; <br><strong>Email:</strong> ${
          formData.email
        }; <br><strong>From:</strong> ${
          formData.from
        }; <br><strong>To:</strong> ${
          formData.to
        }; <br><strong>Departing on:</strong> ${formData.departureDate}; ${
          formData.arrivalDate &&
          `<br><strong>Departing on:</strong> ${formData.arrivalDate}`
        }</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error occurred:", error.message);
          return;
        } else {
          console.log("Email sent successfully!");
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});
