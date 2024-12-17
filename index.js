require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticket-routes');
const airportRoutes = require('./routes/airport-routes');
const flightRoutes = require('./routes/flight-routes');
const adminRoutes = require('./routes/admin-routes');
const roleRoutes = require('./routes/role-routes');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: false }));

const cors = {
  origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
  default: process.env.FRONTEND_URL,
};

app.all('*', function (req, res, next) {
  const origin = cors.origin.includes(req.header('origin')) ? req.headers.origin : cors.default;
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Origin', origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Session-ID, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
app.use('/api/roles', roleRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
