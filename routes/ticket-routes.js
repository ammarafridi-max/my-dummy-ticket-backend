require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_API);
const FormModel = require("../models/FormModel");

router.post("/ticket", async (req, res) => {
  try {
    // Retrieve Data
    const formData = {
      creation: {
        date: req.body.creation.date,
        time: req.body.creation.time,
      },
      type: req.body.type + " Flight Reservation",
      currency: req.body.currency,
      price: req.body.price,
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

    // Send data to database
    await FormModel.create(formData);

    // Send email
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: "info@citytours.ae",
      subject: `${formData.passengers[0].firstName} ${formData.passengers[0].lastName} Submitted a Form On MyDummyTicket.ae`,
      html: `<p>
        <strong>Type:</strong> ${formData.type}<br>
        <strong>Submitted On:</strong> ${formData.creation.time} ${
        formData.creation.date
      }<br>
        <strong>Number of Tickets:</strong> ${
          formData.quantity.adults +
          formData.quantity.children +
          formData.quantity.infants
        }<br>
        ${formData.passengers
          .map((passenger, i) => {
            return `<strong>${passenger.type} ${i + 1}:</strong> ${
              passenger.title
            } / ${passenger.firstName} / ${passenger.lastName} <br>`;
          })
          .join("")}
        <strong>Phone Number:</strong> ${
          formData.phoneNumber
        } (<a href="https://api.whatsapp.com/send?phone=${
        formData.phoneNumber
      }">WhatsApp</a> | <a href="tel:${formData.phoneNumber}">Call</a>)<br>
        <strong>Email:</strong> ${formData.email}<br>
        <strong>From:</strong> ${formData.from}<br>
        <strong>To:</strong> ${formData.to}<br>
        <strong>Departing on:</strong> ${formData.departureDate}<br>
        <strong>Returning on:</strong> ${
          formData.arrivalDate || "Not specified"
        }<br>
        <strong>Message:</strong> ${formData.message}
      </p>`,
    };

    await transporter.sendMail(mailOptions);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: formData.price * 100,
            currency: formData.currency,
            product_data: {
              name: formData.type,
            },
          },
          quantity:
            formData.quantity.adults +
            formData.quantity.children +
            formData.quantity.infants,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-successful`,
      cancel_url: `${process.env.FRONTEND_URL}`,
    });

    res.status(200).json({
      sessionId: session.id,
      clientSecret: session.client_secret,
      url: session.url,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.get("/tickets", async (req, res) => {
  try {
    const data = await FormModel.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
