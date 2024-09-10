const { v4: isUuid } = require("uuid");
const Form = require("../models/form-schema");

const validateSessionId = async (req, res, next) => {
  const sessionId = req.headers["x-session-id"];

  // Check if sessionId is present and valid
  if (!sessionId || !isUuid(sessionId)) {
    return res.status(400).json({ message: "Invalid or missing session ID" });
  }

  const sessionInfo = await Form.findOne({ sessionId: sessionId });
  if (!sessionInfo) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized!",
    });
  }

  // Attach sessionId to req for further use in the route handler
  req.sessionId = sessionId;
  req.sessionInfo = sessionInfo;

  next();
};

module.exports = validateSessionId;
