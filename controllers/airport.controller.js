const amadeus = require('../utils/amadeus');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.fetchAirports = catchAsync(async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return new AppError(
      'Airport code is required and must be at least 3 characters long.',
      400
    );
  }

  const response = await amadeus.referenceData.locations.get({
    subType: 'AIRPORT',
    keyword: keyword,
  });

  const data = response.data;

  return res.status(200).json({
    message: 'airports list fetched successfully',
    result: data,
  });
});
