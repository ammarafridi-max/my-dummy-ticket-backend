require("dotenv").config();
const express = require("express");
const router = express.Router();

const flightRoute = require("../controllers/flights-controller");
const validateSessionId = require("../middleware/verify-session");

router.get("/fetchFlights", validateSessionId, flightRoute.fetchFlightsList);
router.post("/addAirlineInfo/:airlineCode", flightRoute.addAirlineInfoByCode);

module.exports = router;
