require('dotenv').config();
const mongoose = require('mongoose');
const DummyTicket = require('../models/DummyTicket');
const stripe = require('../utils/stripe');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  adminFormSubmissionEmail,
  adminPaymentCompletionEmail,
  laterDateDeliveryEmail,
} = require('../utils/email');

exports.getAllTickets = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };

  const excludedFields = ['page', 'limit', 'search', 'createdAt'];
  excludedFields.forEach((el) => delete queryObj[el]);

  Object.keys(queryObj).forEach((key) => {
    if (queryObj[key] === 'all') delete queryObj[key];
  });

  // 🔎 Handle search
  let searchFilter = {};
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    searchFilter = {
      $or: [
        { 'passengers.0.firstName': regex },
        { 'passengers.0.lastName': regex },
        { 'passengers.0.title': regex },
        { email: regex },
        { from: regex },
        { to: regex },
      ],
    };
  }

  // 🔎 Handle createdAt filter
  if (req.query.createdAt) {
    const now = new Date();
    let fromDate;
    switch (req.query.createdAt) {
      case '6_hours':
        fromDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '12_hours':
        fromDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case '24_hours':
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7_days':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '14_days':
        fromDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30_days':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90_days':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all_time':
      default:
        fromDate = null;
    }
    if (fromDate) queryObj.createdAt = { $gte: fromDate };
  }

  // Pagination
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 100;
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;

  // Merge query + search
  const finalQuery = { ...queryObj, ...searchFilter };

  const total = await DummyTicket.countDocuments(finalQuery);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (page > totalPages) page = totalPages;

  const skip = (page - 1) * limit;

  const data = await DummyTicket.find(finalQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({ path: 'handledBy' });

  res.status(200).json({
    status: 'success',
    message: 'Tickets fetched',
    results: data.length,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data,
  });
});

exports.getTicket = catchAsync(async (req, res, next) => {
  const data = await DummyTicket.findOne({
    sessionId: req.params.sessionId,
  }).populate({ path: 'handledBy' });

  if (!data)
    return next(new AppError('Ticket details could not be found', 404));

  return res.status(200).json({
    status: 'success',
    message: 'Ticket details fetched successfully',
    data,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { userId, orderStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid User ID', 400));
  }

  const data = await DummyTicket.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    { $set: { orderStatus, handledBy: new mongoose.Types.ObjectId(userId) } }
  ).populate('handledBy');

  if (!data)
    return next(
      new AppError('Could not find dummy ticket with that sessionId', 404)
    );

  res.status(200).json({
    status: 'success',
    message: `Order status set to ${orderStatus}`,
  });
});

exports.deleteTicket = catchAsync(async (req, res, next) => {
  const ticket = await DummyTicket.findOneAndDelete({
    sessionId: req.params.sessionId,
  });

  if (!ticket) {
    return next(new AppError('Ticket not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Data deleted successfully',
    data: { sessionId: ticket.sessionId },
  });
});

exports.createTicketRequest = catchAsync(async (req, res) => {
  const data = {
    ...req.body,
    sessionId: uuidv4(),
  };

  // 1. Upload data to DB
  const result = await DummyTicket.create(data);

  const totalQuantity =
    result.quantity.adults + result.quantity.children + result.quantity.infants;

  await adminFormSubmissionEmail({
    type: result.type,
    from: result.from,
    to: result.to,
    submittedOn: result.createdAt,
    ticketCount: totalQuantity,
    passengers: result.passengers,
    number:
      result.phoneNumber?.code && result.phoneNumber?.digits
        ? result.phoneNumber.code + result.phoneNumber.digits
        : 'Not provided',
    email: result.email,
    departureDate: result.departureDate,
    returnDate: result.returnDate,
    flightDetails: result.flightDetails,
    ticketValidity: result.ticketValidity,
    ticketDelivery: result.ticketDelivery.immediate,
    ticketDeliveryDate: result.ticketDelivery.deliveryDate,
    message: result.message,
  });

  res.status(200).json({
    status: 'success',
    message: 'Data received',
    data: result,
    sessionId: result.sessionId,
  });
});

exports.createStripePaymentUrl = catchAsync(async (req, res, next) => {
  const stripeSession = await stripe.createCheckoutSession(
    req.body,
    req.body.sessionId
  );

  if (!stripeSession)
    return next(new AppError('Stripe session not found', 404));

  return res.status(200).json({
    message: 'successfully created ticket',
    url: stripeSession.url,
  });
});

exports.stripePaymentWebhook = catchAsync(async (req, res, next) => {
  const event = await stripe.verifyStripeSignature(req);

  if (!event) {
    return next(new AppError('Webhook Error', 400));
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.metadata.sessionId;
    const currency = session.currency.toUpperCase();
    const amount = parseFloat((session.amount_total / 100).toFixed(2));

    const doc = await DummyTicket.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          paymentStatus: 'PAID',
          amountPaid: {
            currency,
            amount,
          },
          orderStatus: 'PENDING',
        },
      },
      { new: true }
    );

    if (!doc) {
      console.error(`No DummyTicket found for sessionId ${sessionId}`);
      return res.status(200).json({ received: true });
    }

    if (!doc.ticketDelivery.immediate) {
      await laterDateDeliveryEmail({
        to: doc.email,
        passenger: doc.passengers[0].firstName.split(' ')[0],
        deliveryDate: doc.ticketDelivery.deliveryDate,
      });
    }

    await adminPaymentCompletionEmail({
      type: doc.type || 'Not specified',
      from: doc.from || 'Not specified',
      to: doc.to || 'Not specified',
      departureDate: doc.departureDate || 'Not specified',
      returnDate: doc.returnDate || 'Not specified',
      customer: session.metadata.customer || 'Not specified',
      email: doc.email || 'Not specified',
    });

    return res.status(200).json({ received: true });
  }

  return res.status(200).json({ received: true });
});

async function updatePayment(sessionId, currency, amount) {
  let doc = await DummyTicket.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        paymentStatus: 'PAID',
        amountPaid: {
          currency,
          amount,
        },
        orderStatus: 'PENDING',
      },
    },
    { new: true }
  );

  if (!doc) throw new Error('Ticket not found for session ID');

  // const reservation = await createReservation(doc);

  // if (reservation?.pnr) {
  //   doc = await DummyTicket.findByIdAndUpdate(
  //     doc._id,
  //     { $set: { pnr: reservation.pnr } },
  //     { new: true }
  //   );
  // }

  return doc;
}

async function createReservation(ticket) {
  try {
    const res = await fetch(
      `${process.env.VIEWTRIP_BACKEND}/api/reservations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      }
    );

    if (!res.ok) throw new Error('Could not create reservation');

    const data = await res.json();

    return data.data.reservation;
  } catch (err) {
    console.error(err.message);
  }
}
