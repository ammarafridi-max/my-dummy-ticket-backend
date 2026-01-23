const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ticketService = require('../services/ticket.service');
const { verifyStripeSignature } = require('../utils/stripe');

exports.getAllTickets = catchAsync(async (req, res) => {
  const result = await ticketService.getAllTickets(req.query);

  res.status(200).json({
    status: 'success',
    message: 'Tickets fetched',
    results: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});

exports.getTicket = catchAsync(async (req, res, next) => {
  const data = await ticketService.getTicketBySessionId(req.params.sessionId);
  if (!data) return next(new AppError('Ticket not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  try {
    await ticketService.updateOrderStatus(req.params.sessionId, req.body.userId, req.body.orderStatus);
  } catch {
    return next(new AppError('Invalid User ID', 400));
  }

  res.status(200).json({
    status: 'success',
    message: `Order status updated`,
  });
});

exports.deleteTicket = catchAsync(async (req, res, next) => {
  const ticket = await ticketService.deleteTicket(req.params.sessionId);
  if (!ticket) return next(new AppError('Ticket not found', 404));

  res.status(200).json({ status: 'success' });
});

exports.createTicketRequest = catchAsync(async (req, res) => {
  const ticket = await ticketService.createTicketRequest(req.body);

  res.status(200).json({
    status: 'success',
    data: ticket,
    sessionId: ticket.sessionId,
  });
});

exports.createStripePaymentUrl = catchAsync(async (req, res) => {
  const session = await ticketService.createStripePaymentUrl(req.body);

  res.status(200).json({ data: session.url });
});

exports.ticketStripePaymentWebhook = async (req, res) => {
  const event = verifyStripeSignature(req);

  if (!event) {
    console.error('Invalid Stripe webhook');
    return res.status(200).json({ received: false });
  }

  if (event.type === 'checkout.session.completed') {
    await ticketService.handleStripeSuccess(event.data.object);
  }

  res.status(200).json({ received: true });
};
