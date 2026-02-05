# MDT Backend Documentation

This documentation covers the API, architecture, data models, and deployment for the MDT backend.

**Scope**
1. Runtime architecture and key services
2. API surface and request formats
3. Data models and major fields
4. Deployment and environment configuration

**Tech Stack**
1. Node.js + Express
2. MongoDB + Mongoose
3. Stripe for payments
4. Amadeus for flight search
5. WIS for travel insurance
6. Cloudinary for blog images
7. BullMQ + Redis for queues (currently unused for review emails)

## Architecture

**Entry Points**
1. `src/server.js` boots the server and connects to MongoDB.
2. `src/app.js` sets middleware, CORS, rate limits, routes, and error handling.

**Routing**
1. Routes are mounted under `/api` in `src/routes/index.routes.js`.
2. Each route maps to a controller which calls a service.

**Request Flow**
1. Request enters Express middleware stack in `src/app.js`.
2. JSON body is sanitized in `src/utils/sanitize.js`.
3. Routes map to controllers in `src/controllers`.
4. Controllers call business logic in `src/services`.
5. Errors are handled by `src/error/error.controller.js`.

## Authentication and Authorization

**Mechanism**
1. Admin auth is cookie-based JWT.
2. Cookie name is `jwt`.
3. Login sets the cookie via `/api/auth/login`.

**Auth Middleware**
1. `protect` enforces a valid JWT.
2. `restrictTo` enforces role checks.

**Roles**
1. `admin`
2. `agent`
3. `blog-manager`

## Data Models

See `docs/API.md` for endpoint details and model fields.

## Error Handling

**Behavior**
1. Development returns full stack traces.
2. Production returns sanitized error messages for operational errors.

## Utilities

**Key Utilities**
1. `src/utils/stripe.js` handles Stripe SDK setup and signature validation.
2. `src/utils/amadeus.js` configures Amadeus SDK.
3. `src/utils/cloudinary.js` handles upload and deletion.
4. `src/utils/email.js` sends Brevo email requests.

