require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticket-routes');
const airportRoutes = require('./routes/airport-routes');
const flightRoutes = require('./routes/flight-routes');
const adminRoutes = require('./routes/admin-routes');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: false }));

// const corsOptions = {
//   origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
//   default: process.env.FRONTEND_URL,
// };

// app.all('*', function (req, res, next) {
//   const origin = corsOptions.origin.includes(req.header('origin').toLowerCase())
//     ? req.headers.origin
//     : corsOptions.default;
//   res.header('Access-Control-Allow-Origin', origin);
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

const allowedDomains = [process.env.FRONTEND_URL, process.env.ADMIN_URL];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedDomains.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/ticket/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});

connectDB();

app.use('/api/ticket', ticketRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/admin', adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
