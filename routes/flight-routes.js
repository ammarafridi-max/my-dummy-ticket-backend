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

// function formatAirportCode(code) {
//   const match = code.match(/\(([^)]+)\)/);
//   return match ? match[1] : "";
// }

// function formatDateString(dateString) {
//   // Check if dateString is provided
//   if (!dateString) return "";
//   const months = {
//     January: "01",
//     February: "02",
//     March: "03",
//     April: "04",
//     May: "05",
//     June: "06",
//     July: "07",
//     August: "08",
//     September: "09",
//     October: "10",
//     November: "11",
//     December: "12",
//   };
//   const [month, day, year] = String(dateString).replace(",", "").split(" ");
//   return `${year}-${months[month]}-${String(day).padStart(2, "0")}`;
// }

// router.get("/", async (req, res) => {
//   const { type, from, to, departureDate, returnDate } = req.query;

//   // Log the received parameters
//   console.log("Received Parameters:", {
//     type,
//     from,
//     to,
//     departureDate,
//     returnDate,
//   });

//   if (!from || !to || !departureDate) {
//     return res.status(400).send("Missing required query parameters");
//   }

//   const origin = formatAirportCode(from);
//   const destination = formatAirportCode(to);
//   const departure = formatDateString(departureDate);
//   const returnD = returnDate ? formatDateString(returnDate) : null;

//   console.log(type, origin, destination, departure, returnD);

//   try {
//     const flightSearchParams = {
//       originLocationCode: origin,
//       destinationLocationCode: destination,
//       departureDate: departure,
//       adults: 1,
//     };

//     if (type === "Return" && returnDate) {
//       flightSearchParams.returnDate = returnD;
//     }

//     const response = await amadeus.shopping.flightOffersSearch.get(
//       flightSearchParams
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error fetching flights");
//   }
// });

// module.exports = router;
