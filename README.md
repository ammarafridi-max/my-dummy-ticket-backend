# MDT Backend

Express API for My Dummy Ticket. Handles dummy ticket bookings, travel insurance, blogs, users, and payments.

## Documentation

See the full docs in `mdt-backend/docs/README.md`.

## Stack

- Node.js + Express
- MongoDB (Mongoose)
- Stripe
- BullMQ + Redis (queues)

## Setup

1. Install dependencies:
   - `npm install`
2. Run the dev server:
   - `npm run dev`

## Environment Variables

Create a `.env.development` (and `.env.production`) file in `mdt-backend/`:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_COOKIE_EXPIRES_IN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MDT_FRONTEND`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `AMADEUS_API_KEY`
- `AMADEUS_SECRET_KEY`
- `BREVO_API_KEY`
- `REDIS_URL`

## Scripts

- `npm run dev` — start dev server
- `npm run start` — start production server
- `npm run lint` — prettier check
