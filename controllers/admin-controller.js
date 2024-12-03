const Form = require("../models/form-schema");

exports.getAllTickets = async (req, res) => {
  try {
    const data = await Form.find()
      .sort({ createdAt: -1 }) // Sort by creation date, descending
      .limit(100); // Limit to the most recent 100 documents

    res.status(200).json({
      status: "success",
      message: "Tickets fetched",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred",
    });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(sessionId);
    const data = await Form.findOneAndDelete({ sessionId: sessionId });
    if (!data) {
      return res
        .status(404)
        .json({ status: "fail", message: "Could not delete data" });
    }
    res
      .status(200)
      .json({ status: "success", message: "Data deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "fail", message: "Server error. Could not delete." });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { sessionId, orderStatus } = req.params;
    console.log(sessionId, orderStatus);
    const data = await Form.findOneAndUpdate(
      { sessionId: sessionId },
      {
        $set: {
          orderStatus: orderStatus,
        },
      }
    );
    if (!data) {
      return res
        .status(404)
        .json({ status: "fail", message: "Could not find data" });
    }
    res
      .status(200)
      .json({
        status: "success",
        message: `Order status set to ${orderStatus}`,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: "fail", message: "Server error. Could not delete." });
  }
};
