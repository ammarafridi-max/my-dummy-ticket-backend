const User = require('../models/User');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  };

  res.cookie('jwt', token, cookieOptions);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    status: 'success',
    data: userObj,
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Email and password are required', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new AppError('User does not exist', 404));

  const correct = await user.correctPassword(password, user.password);

  if (!correct) return next(new AppError('Incorrect password.', 401));

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'You have been logged out.',
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const correct = await user.correctPassword(req.body.passwordCurrent, user.password);
  if (!correct) return next(new AppError('Current password entered is wrong.', 401));

  user.password = req.body.password;
  await user.save();

  createSendToken(user, 200, res);
});

exports.currentUserInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('Your data was not found. Please try again later.', 404));

  res.status(200).json({
    status: 'success',
    message: 'User data fetched successfully',
    data: user,
  });
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password) return next(new AppError('Please use /updateMyPassword to change password', 403));

  const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) return next(new AppError('Could not find user', 404));

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
  });
});
