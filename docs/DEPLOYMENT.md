# MDT Backend Deployment

This guide covers configuration and deployment for the MDT backend.

## Environment Variables

Create `.env.development` and `.env.production` in `mdt-backend/`.

**Core**
1. `PORT`
2. `MONGO_URI`
3. `JWT_SECRET`
4. `JWT_EXPIRES_IN`
5. `JWT_COOKIE_EXPIRES_IN`

**Stripe**
1. `STRIPE_SECRET_KEY`
2. `STRIPE_WEBHOOK_SECRET`

**Frontend**
1. `MDT_FRONTEND`  
   Example: `https://www.mydummyticket.ae`

**Cloudinary**
1. `CLOUDINARY_CLOUD_NAME`
2. `CLOUDINARY_API_KEY`
3. `CLOUDINARY_API_SECRET`

**Amadeus**
1. `AMADEUS_API_KEY`
2. `AMADEUS_SECRET_KEY`

**Brevo**
1. `BREVO_API_KEY`

**Redis**
1. `REDIS_URL`

## Running Locally

1. Install dependencies  
   `npm install`
2. Start development server  
   `npm run dev`

## Production Notes

1. Set `NODE_ENV=production`.
2. Ensure `JWT_COOKIE_EXPIRES_IN` is set to a reasonable value.
3. Configure `MDT_FRONTEND` to the live frontend domain.
4. Provide correct production credentials for Stripe, Amadeus, Brevo, and Cloudinary.

## Stripe Webhooks

1. Webhook endpoint is `POST /api/webhook`.
2. Stripe requires raw request body for signature verification.
3. Ensure your hosting stack preserves the raw body for this route.

## WIS

1. Production URL: `https://admin.wisconnectz.com/api/v1`
2. UAT URL: `https://admin.uat.wisdevelopments.com/api/v1`
3. Ensure production credentials and IP whitelisting are configured.

