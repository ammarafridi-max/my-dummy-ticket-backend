require("dotenv").config();
const express = require("express");
const router = express.Router();
const validateSessionId = require("../middleware/verify-session");
const {
  fetchFlightsList,
  addAirlineInfoByCode,
} = require("../controllers/flights-controller");

router.get("/fetchFlights", validateSessionId, fetchFlightsList);
router.post("/addAirlineInfo/:airlineCode", addAirlineInfoByCode);

module.exports = router;
