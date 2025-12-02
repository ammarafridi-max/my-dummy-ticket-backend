const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    status: 'success',
    message: 'Users fetched successfully',
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return next(new AppError('Could not find user!', 404));
  res.status(200).json({
    status: 'success',
    message: 'User found successfully',
    data: user,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  if (!username)
    return next(new AppError("Please provide a user's username", 401));
  if (req.body.password)
    return next(
      new AppError('Please use /updateMyPassword to change password', 400)
    );

  const user = await User.findOneAndUpdate({ username }, req.body, {
    runValidators: true,
    new: true,
  });

  if (!user) return next(new AppError('User not found.', 404));

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  if (!username)
    return res.json({ status: 'fail', message: 'Username is missing.' });

  const user = await User.findOneAndDelete({ username });
  if (!user) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'User not found with that id.' });
  }

  res.status(200).json({
    status: 'success',
    message: `User ${username} deleted successfully`,
  });
});
