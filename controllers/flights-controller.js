const Airline = require("../models/airlineDetails-schema");
const Form = require("../models/form-schema");
require("dotenv").config();
const amadeus = require("../utils/amadeus-config");

exports.addAirlineInfoByCode = async (req, res) => {
  try {
    const { airlineCode } = req.params;

    const exsits = await Airline.findOne({ iataCode: airlineCode });
    if (exsits) {
      return res.status(402).json({
        message: "This airline Details already exsits into db",
      });
    }

    const response = await amadeus.referenceData.airlines.get({
      airlineCodes: airlineCode,
    });

    const [data] = response.data;

    if (!data) {
      return res.status(404).josn({
        message: "No airline found",
      });
    }
    if (data.icaoCode === undefined) {
      return res.status(404).json({
        message: "Data not found",
      });
    }
    if (data.businessName === "UNDEFINED") {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    const airlineDetails = {
      iataCode: data.iataCode,
      icaoCode: data.icaoCode,
      businessName: data.businessName,
      commonName: data.commonName,
    };

    const airlineInfo = await Airline.create(airlineDetails);

    return res.status(200).json({
      message: "Airline Info saved successfully",
      result: airlineInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

function extractIataCode(locationString) {
  const start = locationString.indexOf("(") + 1;
  const end = locationString.indexOf(")");

  return start > 0 && end > start ? locationString.slice(start, end) : null;
}

exports.fetchFlightsList = async (req, res) => {
  try {
    const sessionInfo = req.sessionInfo;

    const flightSearchParams = {
      originLocationCode: extractIataCode(sessionInfo.from),
      destinationLocationCode: extractIataCode(sessionInfo.to),
      departureDate: sessionInfo.departureDate,
      adults: sessionInfo.quantity.adults,
      children: sessionInfo.quantity.children,
      infants: sessionInfo.quantity.infants,
    };

    if (sessionInfo.type === "Return" && sessionInfo.returnDate) {
      flightSearchParams.returnDate = sessionInfo.returnDate;
    }

    // Fetch non-stop flights
    const nonStopResponse = await amadeus.shopping.flightOffersSearch.get({
      ...flightSearchParams,
      nonStop: true,
    });

    if (!nonStopResponse.data) {
      return res.status(404).json({
        message: "Failed to fetch non-stop flights",
      });
    }

    // Fetch one-stop flights
    const oneStopResponse = await amadeus.shopping.flightOffersSearch.get({
      ...flightSearchParams,
      nonStop: false,
    });

    if (!oneStopResponse.data) {
      return res.status(404).json({
        message: "Failed to fetch one-stop flights",
      });
    }

    const nonStopFlights = nonStopResponse.data;
    const oneStopFlights = oneStopResponse.data;

    // Combine non-stop and one-stop flights
    let flights = [...nonStopFlights, ...oneStopFlights];

    // Filter out flights with more than one stop
    flights = flights.filter(
      (flight) => flight.itineraries[0].segments.length <= 2
    );

    // Extracting airline codes from flights
    const airlineCodes = [
      ...new Set(flights.flatMap((flight) => flight.validatingAirlineCodes)),
    ];

    // Checking which airline codes are already in the database
    const airlinesInDb = await Airline.find({
      iataCode: { $in: airlineCodes },
    });
    const airlinesInDbMap = new Map(
      airlinesInDb.map((airline) => [airline.iataCode, airline])
    );

    // Find which codes are missing
    const missingAirlineCodes = airlineCodes.filter(
      (code) => !airlinesInDbMap.has(code)
    );

    // Batch fetching missing airline details from Amadeus API
    let newAirlineDetails = [];
    if (missingAirlineCodes.length > 0) {
      const response = await amadeus.referenceData.airlines.get({
        airlineCodes: missingAirlineCodes.join(),
      });
      newAirlineDetails = response.data
        .filter(
          (data) =>
            data &&
            data.icaoCode !== undefined &&
            data.businessName !== "UNDEFINED"
        )
        .map((data) => ({
          iataCode: data.iataCode,
          icaoCode: data.icaoCode,
          businessName: data.businessName,
          commonName: data.commonName,
        }));

      // Save new airline details to the database
      await Airline.insertMany(newAirlineDetails);
    }

    // Update airlinesInDbMap with newly fetched airline details
    newAirlineDetails.forEach((detail) => {
      airlinesInDbMap.set(detail.iataCode, detail);
    });

    // Including airline details in the flight data
    const flightsWithAirlineDetails = flights.map((flight) => {
      const airlineDetails = flight.validatingAirlineCodes.map((code) =>
        airlinesInDbMap.get(code)
      );
      return { ...flight, airlineDetails };
    });

    // Sort flights: non-stop flights first, then one-stop flights
    flightsWithAirlineDetails.sort((a, b) => {
      const aSegments = a.itineraries[0].segments.length;
      const bSegments = b.itineraries[0].segments.length;
      return aSegments - bSegments; // non-stop first (1 segment), then one-stop (2 segments)
    });

    return res.status(200).json({
      message: "Flights list fetched successfully",
      flights: flightsWithAirlineDetails,
      session: sessionInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
