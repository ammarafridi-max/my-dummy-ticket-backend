const {
  BASE_PRICE,
  LATER_SEVEN_DAYS,
  LATER_FOURTEEN_DAYS,
} = require("../config/constant");
const Form = require("../models/form-schema");
const stripeClient = require("../utils/stripeClient");
require("dotenv").config();
const { format, parse } = require("date-fns");
const { v4: uuidv4 } = require("uuid");
const { sendEmail, generateEmailTemplate } = require("../utils/send-email");

const admin = process.env.ADMIN;

exports.buyTicket = async (req, res) => {
  const ticketDetails = req.body;
  try {
    const session = await stripeClient.createCheckoutSession(
      ticketDetails,
      ticketDetails.sessionId
    );
    if (!session) {
      return res.status(404).json({
        message: "Stripe session not found",
      });
    }
    return res.status(200).json({
      message: "successfully created ticket",
      url: session.url,
    });
  } catch (error) {
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

exports.createForm = async (req, res) => {
  const formData = req.body;
  const sessionId = uuidv4();

  try {
    const form = {
      sessionId: sessionId,
      type: formData.type,
      from: formData.from,
      to: formData.to,
      departureDate: formData.departureDate,
      returnDate:
        formData.type === "Return" && formData.returnDate
          ? formData.returnDate
          : undefined,
      quantity: formData.quantity,
      phoneNumber: {
        code: formData.number.code,
        digits: formData.number.digits,
      },
      status: "SEARCH_FLIGHTS",
    };

    Object.keys(form).forEach(
      (key) => form[key] === undefined && delete form[key]
    );

    const data = await Form.create(form);

    return res.status(200).json({
      message: "Session has started successfully.",
      sessionId: data.sessionId,
      success: true,
    });
  } catch (error) {
    console.error("Error creating form:", error);

    return res.status(500).json({
      message: "Failed to create the form. Please try again.",
      error: error.message,
      success: false,
    });
  }
};

exports.fetchFormDetails = async (req, res) => {
  try {
    const sessionInfo = req.sessionInfo;
    const quantity = sessionInfo.quantity;
    const totalQuantity =
      quantity.adults + quantity.children + quantity.infants;

    let ticketPrice = BASE_PRICE * totalQuantity;

    const ticketValidity = sessionInfo.ticketValidity;

    if (ticketValidity === "7d") {
      ticketPrice = LATER_SEVEN_DAYS * totalQuantity;
    }
    if (ticketValidity === "14d") {
      ticketPrice = LATER_FOURTEEN_DAYS * totalQuantity;
    }

    return res.status(200).json({
      message: "ticket details fetched successfully",
      result: sessionInfo,
      ticketPrice: ticketPrice,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateTicketDetails = async (req, res) => {
  try {
    const { sessionId } = req;
    const { flightData } = req.body;

    if (
      !flightData ||
      typeof flightData !== "object" ||
      Object.keys(flightData).length === 0
    ) {
      return res.status(400).json({
        message: "Missing or invalid flight data",
      });
    }

    const updatedData = await Form.findOneAndUpdate(
      { sessionId: sessionId },
      {
        $set: {
          status: "REVIEW_ORDER",
          type: flightData.type,
          flightDetails: flightData.flightDetails,
          passengers: flightData.passengers,
          email: flightData.email,
          phoneNumber: {
            code: flightData.phoneNumber.code,
            digits: flightData.phoneNumber.digits,
          },
          from: flightData.from,
          to: flightData.to,
          departureDate: flightData.departureDate,
          quantity: flightData.quantity,
          ticketValidity: flightData.ticketValidity,
          ticketAvailability: {
            immediate: flightData.ticketAvailability.immediate,
            receiptDate: flightData.ticketAvailability.receiptDate,
          },
          message: flightData.message,
        },
      },
      { new: true }
    );

    if (flightData.returnDate) {
      updatedData.returnDate = flightData.returnDate;
    }

    if (!updatedData) {
      return res.status(404).json({
        message: "Failed to update data",
      });
    }

    const totalQuantity =
      updatedData.quantity.adults +
      updatedData.quantity.children +
      updatedData.quantity.infants;

    // Send email to admin
    const subject = `${updatedData.passengers[0].firstName} ${updatedData.passengers[0].lastName} just submitted a from on MyDummyTicket.ae`;
    const htmlContent = generateEmailTemplate("adminFormSubmission", {
      type: updatedData.type,
      submittedOn: updatedData.createdAt,
      ticketCount: totalQuantity,
      passengers: updatedData.passengers,
      number: updatedData.phoneNumber.code + updatedData.phoneNumber.digits,
      email: updatedData.email,
      from: updatedData.from,
      to: updatedData.to,
      departureDate: updatedData.departureDate,
      departureFlight: updatedData.flightDetails.departureFlight,
      returnDate: updatedData.returnDate,
      returnFlight: updatedData.flightDetails.returnFlight,
      ticketValidity: updatedData.ticketValidity,
      ticketAvailability: updatedData.ticketAvailability.immediate,
      ticketAvailabilityDate: updatedData.ticketAvailability.receiptDate,
      message: updatedData.message,
    });

    sendEmail(admin, subject, htmlContent);
    return res.status(200).json({
      message: "Form details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.listenStripEvents = async (req, res) => {
  try {
    const event = await stripeClient.verifyStripeSignature(req);
    if (!event) {
      return res.status(400).send(`Webhook Error`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const sessionId = session.metadata.sessionId;

        // 1. Update status to "PAYMENT_DONE"
        const form = await Form.findOneAndUpdate(
          { sessionId: sessionId },
          { $set: { status: "PAYMENT_DONE" } },
          { new: true }
        );

        if (!form) {
          return res.status(404).json({
            status: "fail",
            message: "Session not found",
          });
        }

        // 2. Send email to customer
        const customerSubject = "Payment Confirmation for Your Booking";
        const customerHtmlContent = generateEmailTemplate(
          "customerPaymentConfirmation",
          {
            customer: session.metadata.customer,
            email: session.customer_email,
            ticketType: session.metadata.ticketType || "Unknown",
            departureCity: session.metadata.departureCity || "Unknown",
            arrivalCity: session.metadata.arrivalCity || "Unknown",
            departureDate: session.metadata.departureDate || "Unknown",
            returnDate: session.metadata.returnDate || "Not Specified",
            currency: session.currency.toUpperCase(),
            amount: (session.amount_total / 100).toFixed(2),
          }
        );

        // 3. Send email to admin
        const adminSubject = "New Payment Received";
        const adminHtmlContent = generateEmailTemplate(
          "adminPaymentNotification",
          {
            customer: session.metadata.customer,
            email: session.customer_email,
            ticketType: session.metadata.ticketType || "Unknown",
            departureCity: session.metadata.departureCity || "Unknown",
            arrivalCity: session.metadata.arrivalCity || "Unknown",
            departureDate: session.metadata.departureDate || "Unknown",
            returnDate: session.metadata.returnDate || "Not Specified",
            currency: session.currency.toUpperCase(),
            amount: (session.amount_total / 100).toFixed(2),
          }
        );

        try {
          const [customerEmailResponse, adminEmailResponse] = await Promise.all(
            [
              sendEmail(
                session.customer_email,
                customerSubject,
                customerHtmlContent
              ),
              sendEmail(admin, adminSubject, adminHtmlContent),
            ]
          );
        } catch (error) {
          console.error("Error sending emails: ", error);
        }
        res.status(200).json({ received: true });
        break;
      }
      default:
        res.status(200).json({ received: true });
        break;
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};
