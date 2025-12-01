require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const { stripePaymentWebhook } = require('./controllers/ticket.controller');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');
const indexRoutes = require('./routes/index');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://www.mydummyticket.ae',
      'https://admin.mydummyticket.ae',
    ],
    credentials: true,
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.originalUrl === '/api/ticket/webhook') return next();
  express.json({ limit: '50mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(mongoSanitize());

app.use(
  '/api',
  rateLimit({
    max: 500,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
  })
);

app.post(
  '/api/ticket/webhook',
  express.raw({ type: 'application/json' }),
  stripePaymentWebhook
);

app.use('/api', indexRoutes);

['uploads', 'qr-codes', 'reservations'].forEach((dir) => {
  app.use(
    `/${dir}`,
    express.static(path.join(__dirname, `public/${dir}`), {
      setHeaders: (res) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    })
  );
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB successfully');
  } catch (error) {
    console.log(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const server = app.listen(process.env.PORT || 3001, () => {
  console.log(
    `Server running on port ${process.env.PORT || 3001} (${process.env.NODE_ENV})`
  );
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => process.exit(1));
});
