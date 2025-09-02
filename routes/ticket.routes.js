require('dotenv').config();
const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const router = express.Router();

router
  .route('/')
  .get(ticketController.getAllTickets)
  .post(ticketController.createTicketRequest);

router.post('/buy-ticket', ticketController.createStripePaymentUrl);

router
  .route('/:sessionId')
  .get(ticketController.getTicket)
  .delete(ticketController.deleteTicket);

router
  .route('/:sessionId/updateOrderStatus')
  .patch(ticketController.updateOrderStatus);

module.exports = router;
