const amadeus = require("../utils/amadeus-config");

exports.fetchAirports = async (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const response = await amadeus.referenceData.locations.get({
      subType: "AIRPORT",
      keyword: keyword,
    });

    const data = response.data;

    return res.status(200).json({
      message: "airports list fetched successfully",
      result: data,
    });
  } catch (error) {
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};
