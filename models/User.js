const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the user'],
  },
  username: {
    type: String,
    lowercase: true,
    unique: true,
    minLength: [8, 'Username must be at least 8 characters long.'],
  },
  email: {
    type: String,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 8 characters long.'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm is required'],
    validate: {
      validator: function (el) {
        return this.isNew ? el === this.password : true;
      },
      message: 'Passwords do not match',
    },
  },
  role: {
    type: String,
    lowercase: true,
    default: 'agent',
    enum: ['admin', 'agent'],
    required: [true, 'Role is required'],
  },
  status: {
    type: String,
    uppercase: true,
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE'],
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
