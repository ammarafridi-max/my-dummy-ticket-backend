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
const { sendEmail } = require("../utils/send-email");

exports.buyTicket = async (req, res) => {
  const ticketDetails = req.body;

  let price = BASE_PRICE;

  const validity = ticketDetails.ticketValidity;

  if (validity === "7d") {
    price = LATER_SEVEN_DAYS;
  }
  if (validity === "14d") {
    price = LATER_FOURTEEN_DAYS;
  }

  if (ticketDetails.ticketPrice !== price) {
    ticketDetails.ticketPrice = price;
  }

  try {
    const session = await stripeClient.createCheckoutSession(ticketDetails);
    if (!session) {
      return res.status(404).json({
        message: "Strip session not found",
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

exports.listenStripEvents = async (req, res) => {
  try {
    const event = await stripeClient.verifyStripeSignature(req);
    if (!event) {
      return res.status(400).send(`Webhook Error`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const emailData = {
          customerName: session.customer_email,
          ticketType: session.metadata.ticketType || "Unknown",
          departureCity: session.metadata.departureCity || "Unknown",
          arrivalCity: session.metadata.arrivalCity || "Unknown",
          departureDate: session.metadata.departureDate || "Unknown",
          currency: session.currency.toUpperCase(),
          amount: session.amount_total / 100,
        };

        try {
          const res = await sendEmail(
            session.customer_email,
            "Payment Confirmation",
            emailData
          );

          console.log("rs ->",res);
          
        } catch (emailError) {
          console.error("Error sending email:", emailError);
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

exports.createForm = async (req, res) => {
  const formData = req.body;

  const formatDate = (dateStr) => {
    const parsedDate = parse(dateStr, "MMMM dd, yyyy", new Date());
    return format(parsedDate, "yyyy-MM-dd");
  };

  const now = new Date();
  const creationDate = format(now, "yyyy-MM-dd");
  const creationTime = format(now, "HH:mm:ss");

  // Generate a UUID for sessionId
  const sessionId = uuidv4();

  const form = {
    sessionId: sessionId,
    type: formData.type + " Flight Reservation",
    from: formData.from,
    to: formData.to,
    departureDate: formatDate(formData.departureDate),
    arrivalDate: formData.arrivalDate ? formatDate(formData.arrivalDate) : null,
    quantity: formData.quantity,
    phoneNumber: {
      code: formData.number.code,
      digits: formData.number.digits,
    },
    status: "SEARCH_FLIGHTS",
    creation: {
      date: creationDate,
      time: creationTime,
    },
  };

  try {
    const data = await Form.create(form);

    return res.status(200).json({
      message: "session has started",
      sessionId: data.sessionId,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

exports.fetchFormDetails = async (req, res) => {
  try {
    const sessionInfo = req.sessionInfo;

    let ticketPrice = BASE_PRICE;

    const validity = sessionInfo.ticketValidity;

    if (validity === "7d") {
      ticketPrice = LATER_SEVEN_DAYS;
    }
    if (validity === "14d") {
      ticketPrice = LATER_FOURTEEN_DAYS;
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
          arrivalDate: flightData.arrivalDate,
          quantity: flightData.quantity,
          ticketValidity: flightData.ticketValidity,
          ticketAvailability: {
            immediate: flightData.ticketAvailability.immediate,
            receiptDate: flightData.ticketAvailability.receiptDate,
          },
        },
      },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        message: "Failed to update data",
      });
    }

    return res.status(200).json({
      message: "Form details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
