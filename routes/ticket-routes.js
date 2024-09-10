require("dotenv").config();
const express = require("express");
const ticketController = require("../controllers/ticket-controller");
const validateSessionId = require("../middleware/verify-session");

const router = express.Router();

router.post("/createForm", ticketController.createForm);

router.put(
  "/updateFormDetails",
  validateSessionId,
  ticketController.updateTicketDetails
);

router.get(
  "/getFormDetails",
  validateSessionId,
  ticketController.fetchFormDetails
);

router.post("/buy-ticket", validateSessionId, ticketController.buyTicket);
router.post("/webhook", ticketController.listenStripEvents);

module.exports = router;
