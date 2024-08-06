// require("dotenv").config();
// const express = require("express");
// const router = express.Router();
// const Amadeus = require("amadeus");

// const API_KEY = process.env.AMADEUS_API_KEY;
// const SECRET_KEY = process.env.AMADEUS_SECRET_KEY;

// const amadeus = new Amadeus({
//   clientId: API_KEY,
//   clientSecret: SECRET_KEY,
// });

// // --------------- AIRPORTS ---------------

// router.get("/", async (req, res) => {
//   const keyword = req.query.keyword;

//   try {
//     const response = await amadeus.referenceData.locations.get({
//       subType: "AIRPORT",
//       keyword: keyword,
//     });

//     // console.log("Amadeus API Response Data:", response.data);

//     res.json(response.data);
//   } catch (error) {
//     console.error("Amadeus API Error:", error);
//     if (error.code === "ClientError" && error.response.statusCode === 429) {
//       res
//         .status(429)
//         .json({ error: "Too many requests, please try again later." });
//     } else {
//       res.status(500).json({ error: error.message });
//     }
//   }
// });

// module.exports = router;
