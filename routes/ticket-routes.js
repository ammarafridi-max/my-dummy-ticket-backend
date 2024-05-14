require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_API);
const FormModel = require("../models/FormModel");

// Nodemailer -
let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

router.post("/ticket", async (req, res) => {
  try {
    // 1. Retrieve Data
    const formData = {
      type: req.body.type,
      price: req.body.price * 100,
      passengers: req.body.passengers,
      email: req.body.email,
      phoneNumber: req.body.number,
      from: req.body.from,
      to: req.body.to,
      departureDate: req.body.departureDate,
      arrivalDate: req.body.arrivalDate,
      quantity: req.body.quantity,
      message: req.body.message,
    };

    // 2. Send data to database.
    await FormModel.create(formData);

    // 3. Send email
    let mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: "info@citytours.ae",
      subject: `${
        formData.passengers[0].firstName + " " + formData.passengers[0].lastName
      } Submitted a Form On MyDummyTicket.ae`,
      html: `<p><strong>Type:</strong> ${
        formData.type
      }<br> ${formData.passengers.map((passenger, index) => {
        return ` <strong>Passenger ${index + 1}:</strong> ${passenger.title} ${
          passenger.firstName
        } ${passenger.lastName}<br> `;
      })}<strong>Number of Tickets:</strong> ${
        formData.quantity
      }; <br><strong>Phone Number:</strong> ${
        formData.phoneNumber
      } <br><strong>Email:</strong> ${
        formData.email
      } <br><strong>From:</strong> ${formData.from} <br><strong>To:</strong> ${
        formData.to
      } <br><strong>Departing on:</strong> ${formData.departureDate}; ${
        formData.arrivalDate &&
        ` <br><strong>Returning on:</strong> ${formData.arrivalDate}`
      } <br><strong>Message:</strong>${formData.message} </p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error.message);
        return;
      }
      console.log("Email sent successfully!");
    });

    // 4. Stripe Checkout session
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              unit_amount: formData.price,
              currency: "aed",
              product_data: {
                name: formData.type,
              },
            },
            quantity: formData.quantity,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}`,
      },
      async (err, session) => {
        if (err) {
          console.error("Error creating Stripe session:", err);
          return res
            .status(500)
            .json({ error: "An unexpected error occurred" });
        }

        try {
          // 5. Send response to client
          res.status(200).json({
            sessionId: session.id,
            clientSecret: session.client_secret,
            url: session.url,
          });
        } catch (error) {
          console.error("Error:", error);
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

module.exports = router;
