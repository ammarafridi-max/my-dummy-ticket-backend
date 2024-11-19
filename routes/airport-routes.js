require("dotenv").config();
const express = require("express");
const router = express.Router();
const { fetchAirports } = require("../controllers/airports-controller");

router.get("/", fetchAirports);

module.exports = router;
