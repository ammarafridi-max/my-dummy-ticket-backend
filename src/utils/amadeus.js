const Amadeus = require('amadeus');
const AppError = require('./appError');

let amadeusClient = null;

function getAmadeusClient() {
  if (amadeusClient) return amadeusClient;

  const clientId = process.env.AMADEUS_API_KEY;
  const clientSecret = process.env.AMADEUS_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new AppError('Flight provider is not configured. Missing Amadeus credentials.', 503);
  }

  amadeusClient = new Amadeus({
    clientId,
    clientSecret,
    hostname: 'production',
  });

  return amadeusClient;
}

module.exports = { getAmadeusClient };
