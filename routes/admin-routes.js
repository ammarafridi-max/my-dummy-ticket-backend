const express = require("express");
const {
  getAllTickets,
  deleteTicket,
  updateStatus,
} = require("../controllers/admin-controller");
const router = express.Router();

router.route("/tickets").get(getAllTickets);
router.route("/tickets/:sessionId").delete(deleteTicket).put(updateStatus);
router.route("/tickets/:sessionId/:orderStatus").put(updateStatus);

module.exports = router;
