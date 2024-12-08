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

const corsOptions = {
  origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

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
