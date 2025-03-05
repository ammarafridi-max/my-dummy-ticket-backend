require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const xss = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const ticketRoutes = require('./routes/ticket.routes');
const airportRoutes = require('./routes/airport.routes');
const flightRoutes = require('./routes/flight.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');

const app = express();

// ---------- STATIC FILES ----------
app.use(
  '/public/uploads',
  express.static(path.join(__dirname, 'public/uploads'))
);

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// ---------- SECURITY MIDDLEWARE ----------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(xss());
app.use(mongoSanitize());

// ---------- RATE LIMITING ----------
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// ---------- CORS ----------
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS', 403));
    }
  },
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  allowedHeaders: [
    'Origin',
    'X-Session-ID',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// ---------- BODY PARSING MIDDLEWARE ----------
app.use('/api/ticket/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// ---------- DATABASE CONNECTION ----------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB successfully');
  } catch (error) {
    console.error(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// ---------- ROUTES ----------
app.use('/api/ticket', ticketRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Route is not defined. Cannot find ${req.originalUrl}.`, 404)
  );
});

app.use(globalErrorHandler);

// ---------- START SERVER ----------
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
