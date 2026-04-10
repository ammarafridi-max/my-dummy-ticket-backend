# MDT Backend

Express API for My Dummy Ticket. Handles dummy ticket bookings, travel insurance, admin users, blogs, affiliates, currencies, payments, and flight-related integrations.

## Stack

- Node.js + Express
- MongoDB (Mongoose)
- WIS travel insurance integration
- Stripe webhook support for MDT payment flows
- Cloudinary for media uploads
- Brevo / email utilities
- BullMQ + Redis utilities
- Amadeus utilities for flight-related features

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env.development` and `.env.production` in the project root.
3. Run the dev server:
   - `npm run dev`

## Environment Variables

Core:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_COOKIE_EXPIRES_IN`
- `CORS_ORIGINS`
- `API_BODY_LIMIT`
- `API_RATE_LIMIT_MAX`
- `API_RATE_LIMIT_WINDOW_MS`
- `BLOG_SCHEDULER_INTERVAL_MS`

Brand / app URLs:
- `MDT_FRONTEND`
- `MDT_ADMIN`
- `MDT_BACKEND`
- `ADMIN_EMAIL`

Insurance / WIS:
- `WIS_URL`
- `WIS_AGENCY_ID`
- `WIS_AGENCY_CODE`

Payments:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Cloudinary:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Email:
- `BREVO_API_KEY`

Flights / queues:
- `AMADEUS_API_KEY`
- `AMADEUS_SECRET_KEY`
- `REDIS_URL`

## Scripts

- `npm run dev` - start the development server
- `npm run start` - start the production server
- `npm run lint` - run Prettier check

## Notes

- Admin access uses the `AdminUser` model.
- There is no separate regular customer `User` model in this backend.
- The backend includes MDT-specific flight and ticket routes in addition to the shared insurance/admin modules.
