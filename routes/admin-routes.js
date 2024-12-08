const express = require('express');
const {
  getAllTickets,
  deleteTicket,
  updateStatus,
  getAllUsers,
  getUser,
  createUser,
  deleteUser,
  login,
} = require('../controllers/admin-controller');
const router = express.Router();

router.route('/tickets').get(getAllTickets);
router.route('/tickets/:sessionId').delete(deleteTicket).put(updateStatus);

router.route('/users').get(getAllUsers).post(createUser);
router.route('/users/login').post(login);
router.route('/users/:username').get(getUser).delete(deleteUser);

module.exports = router;
