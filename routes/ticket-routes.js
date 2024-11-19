require("dotenv").config();
const express = require("express");
const {
  createForm,
  updateTicketDetails,
  fetchFormDetails,
  buyTicket,
  listenStripEvents,
  updatePaymentStatus,
} = require("../controllers/ticket-controller");
const validateSessionId = require("../middleware/verify-session");

const router = express.Router();

router.get("/getFormDetails", validateSessionId, fetchFormDetails);
router.post("/createForm", createForm);
router.post("/buy-ticket", validateSessionId, buyTicket);
router.post("/webhook", listenStripEvents);
router.put("/updateFormDetails", validateSessionId, updateTicketDetails);

module.exports = router;
