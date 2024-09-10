require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (formData) => {
  const ticketPrice = formData.ticketPrice;
  const price = parseFloat(ticketPrice);

  const metadata = {
    ticketType: formData.type,
    departureCity: formData.from,
    arrivalCity: formData.to,
    departureDate: formData.departureDate,
  };
  const email = formData.email;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    invoice_creation: {
      enabled: true,
    },
    metadata,
    customer_email: email,
    line_items: [
      {
        price_data: {
          unit_amount: price * 100,
          currency: "aed",
          product_data: {
            name: formData.type,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-successful`,
    cancel_url: `${process.env.FRONTEND_URL}`,
  });

  return session;
};

// Middleware to verify Stripe signature
const verifyStripeSignature = (req) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const result = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
    return result;
  } catch (err) {
    return null;
  }
};

module.exports = { createCheckoutSession, verifyStripeSignature };
