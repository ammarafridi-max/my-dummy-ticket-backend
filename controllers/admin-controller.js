const Form = require('../models/form-schema');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.getAllTickets = async (req, res) => {
  try {
    const searchQuery = req.query.name;
    const filter = searchQuery
      ? {
          passengers: {
            $elemMatch: {
              $or: [
                { firstName: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search
                { lastName: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
              ],
            },
          },
        }
      : {};

    const data = await Form.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({
      status: 'success',
      message: 'Tickets fetched',
      data,
    });
  } catch (error) {
    console.error('Error in getAllTickets:', error); // Debugging log
    res.status(500).json({
      status: 'fail',
      message: 'An error occurred',
    });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(sessionId);
    const data = await Form.findOneAndDelete({ sessionId: sessionId });
    if (!data) {
      return res.status(404).json({ status: 'fail', message: 'Could not delete data' });
    }
    res.status(200).json({ status: 'success', message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not delete.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { user, orderStatus } = req.body;
    console.log(user, orderStatus);
    const data = await Form.findOneAndUpdate(
      { sessionId: sessionId },
      {
        $set: {
          orderStatus: orderStatus,
          handledBy: user,
        },
      }
    );
    if (!data) {
      return res.status(404).json({ status: 'fail', message: 'Could not find data' });
    }
    res.status(200).json({
      status: 'success',
      message: `Order status set to ${orderStatus}`,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not delete.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) return res.status(404).json({ status: 'fail', message: 'Could not find users' });
    res.status(200).json({ status: 'success', message: 'Users fetched successfully', data: users });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not fetch.' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });
    if (!user)
      return res
        .status(404)
        .json({ status: 'fail', message: `Could not find username ${username}` });
    return res
      .status(200)
      .json({ status: 'success', message: 'User found successfully', data: user });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not fetch.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    userData.password = hashedPassword;
    const newUser = await User.create(userData);
    return res
      .status(200)
      .json({ status: 'success', message: 'User created successfully', data: newUser });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not create user.' });
  }
};

// exports.updateUser = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const userData = req.body;
//     const newPassword = req.body.newPassword;
//     if (newPassword) {
//       const salt = await bcrypt.genSalt(saltRounds);
//       const hashedNewPassword = await bcrypt.hash(newPassword, salt);
//       userData.password = hashedNewPassword;
//     }
//   } catch (error) {
//     res.status(500).json({ status: 'fail', message: 'Server error. Could not delete user.' });
//   }
// };

exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.json({ status: 'fail', message: 'Username is missing' });
    const user = await User.findOneAndDelete({ username: username });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Could not delete user' });
    }
    return res
      .status(200)
      .json({ status: 'success', message: `User ${username} deleted successfully` });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not delete user.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ status: 'failed', message: 'User not found' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ status: 'failed', message: 'Wrong password' });
    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Server error. Could not login.' });
  }
};
