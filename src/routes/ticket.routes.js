require('dotenv').config();
const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo('admin', 'agent'), ticketController.getAllTickets)
  .post(ticketController.createTicketRequest);

router.post('/buy-ticket', ticketController.createStripePaymentUrl);

router
  .route('/:sessionId')
  .get(ticketController.getTicket)
  .delete(protect, restrictTo('admin', 'agent'), ticketController.deleteTicket);

router
  .route('/:sessionId/updateOrderStatus')
  .patch(protect, restrictTo('admin', 'agent'), ticketController.updateOrderStatus);

module.exports = router;
