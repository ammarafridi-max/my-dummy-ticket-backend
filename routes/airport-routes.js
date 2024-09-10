require("dotenv").config();
const express = require("express");
const router = express.Router();
const airportRoute = require("../controllers/airports-controller");

router.get("/", airportRoute.fetchAirports);

module.exports = router;
