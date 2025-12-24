require('dotenv').config();
const Airline = require('../models/Airline');
const amadeus = require('../utils/amadeus');
const extractIataCode = require('../utils/extractIataCode');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addAirlineInfoByCode = catchAsync(async (req, res, next) => {
  const { airlineCode } = req.params;

  const exists = await Airline.findOne({ iataCode: airlineCode });

  if (exists) {
    return next(new AppError('This airline data already exists', 409));
  }

  const response = await amadeus.referenceData.airlines.get({
    airlineCodes: airlineCode,
  });

  const [data] = response.data;

  if (!data) {
    return next(new AppError('No airline found', 404));
  }

  if (data.icaoCode === undefined || data.businessName === 'UNDEFINED') {
    return next(new AppError('Data not found', 404));
  }

  const airlineDetails = {
    iataCode: data.iataCode,
    icaoCode: data.icaoCode,
    businessName: data.businessName,
    commonName: data.commonName,
  };

  const airlineInfo = await Airline.create(airlineDetails);

  return res.status(200).json({
    message: 'Airline Info saved successfully',
    result: airlineInfo,
  });
});

exports.fetchFlightsList = catchAsync(async (req, res, next) => {
  const { type, from, to, departureDate, returnDate } = req.body;

  if (!from || !to || !departureDate) {
    return next(
      new AppError(
        'Please provide the departure destination, arrival destination, and the departure date',
        400
      )
    );
  }

  const flightSearchParams = {
    originLocationCode: extractIataCode(from),
    destinationLocationCode: extractIataCode(to),
    departureDate,
    adults: 1,
    children: 0,
    infants: 0,
    ...(type === 'Return' && returnDate ? { returnDate } : {}),
  };

  const response = await fetchFlights(flightSearchParams);

  if (!response?.data) {
    return next(new AppError('No flights available', 404));
  }

  let flights = response.data;

  flights = flights.filter(
    (flight) => flight.itineraries[0].segments.length <= 2
  );

  const airlineCodes = [
    ...new Set(flights.flatMap((flight) => flight.validatingAirlineCodes)),
  ];

  const airlinesInDb = await Airline.find({
    iataCode: { $in: airlineCodes },
  });

  const airlinesInDbMap = new Map(
    airlinesInDb.map((airline) => [airline.iataCode, airline])
  );

  const missingAirlineCodes = airlineCodes.filter(
    (code) => !airlinesInDbMap.has(code)
  );

  let newAirlineDetails = [];

  if (missingAirlineCodes.length > 0) {
    const response = await amadeus.referenceData.airlines.get({
      airlineCodes: missingAirlineCodes.join(),
    });

    newAirlineDetails = (response.data || []).map((data) => ({
      iataCode: data.iataCode,
      icaoCode: data.icaoCode,
      businessName: data.businessName,
      commonName: data.commonName,
    }));

    await Airline.insertMany(newAirlineDetails, { ordered: false });
  }

  newAirlineDetails.forEach((detail) =>
    airlinesInDbMap.set(detail.iataCode, detail)
  );

  const flightsWithAirlineDetails = attachAirlineDetails(
    flights,
    airlinesInDbMap
  );

  flightsWithAirlineDetails.sort((a, b) => {
    const aSegments = a.itineraries[0].segments.length;
    const bSegments = b.itineraries[0].segments.length;
    return aSegments - bSegments;
  });

  return res.status(200).json({
    message: 'Flights list fetched successfully',
    flights: flightsWithAirlineDetails,
  });
});

async function fetchFlights(params) {
  return amadeus.shopping.flightOffersSearch.get(params);
}

function attachAirlineDetails(flights, airlinesMap) {
  return flights.map((flight) => {
    const enrichedItineraries = flight.itineraries.map((itinerary) => {
      const enrichedSegments = itinerary.segments.map((segment) => {
        const carrier = segment.carrierCode;
        const airlineDetail = airlinesMap.get(carrier) || {};
        return { ...segment, airlineDetail };
      });
      return { ...itinerary, segments: enrichedSegments };
    });

    return {
      ...flight,
      itineraries: enrichedItineraries,
      airlineDetails: flight.validatingAirlineCodes.map(
        (code) => airlinesMap.get(code) || {}
      ),
    };
  });
}
