// database/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB successfully');
  } catch (error) {
    console.error(`Error connecting to DB: ${error}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
