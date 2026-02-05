# MDT Backend API

All endpoints are prefixed with `/api`.

**General Response Shape**
1. Most endpoints return JSON with a `status` and a `data` payload.
2. List endpoints often return `pagination` metadata.

**Auth Cookies**
1. Auth uses a `jwt` cookie.
2. Requests from admin UI should include `credentials: include`.

---

## Auth

**POST `/api/auth/login`**
1. Body: `email`, `password`
2. Response: user object and auth cookie

**POST `/api/auth/logout`**
1. Clears auth cookie

**GET `/api/users/me`**
1. Requires auth
2. Returns current user

**PATCH `/api/users/me`**
1. Requires auth
2. Updates `name`, `email`, `username`

**PATCH `/api/users/me/password`**
1. Requires auth
2. Body: `passwordCurrent`, `password`

---

## Users (Admin Only)

**GET `/api/users`**
1. List users

**POST `/api/users`**
1. Create user

**GET `/api/users/:username`**
1. Fetch user by username

**PATCH `/api/users/:username`**
1. Update user by username

**DELETE `/api/users/:username`**
1. Delete user by username

---

## Dummy Tickets

**POST `/api/ticket`**
1. Create dummy ticket request
2. Returns `sessionId`

**GET `/api/ticket/:sessionId`**
1. Public read by session id

**POST `/api/ticket/checkout`**
1. Creates Stripe checkout session
2. Body includes `sessionId` and checkout payload

**GET `/api/ticket`**
1. Admin and agent only
2. Query params: `page`, `limit`, `search`, `createdAt`, `orderStatus`, `paymentStatus`

**PATCH `/api/ticket/:sessionId/status`**
1. Admin and agent only
2. Body: `orderStatus`

**DELETE `/api/ticket/:sessionId`**
1. Admin only

**POST `/api/ticket/:transactionId/refund`**
1. Admin only

---

## Flights

**POST `/api/flights`**
1. Body: `type`, `from`, `to`, `departureDate`, `returnDate`, `quantity`
2. Returns flight offers enriched with airline details

**POST `/api/flights/airlines/:airlineCode`**
1. Admin only
2. Imports airline data by IATA code

---

## Airports

**GET `/api/airports?keyword=xxx`**
1. Keyword must be at least 3 characters
2. Returns matching airports from Amadeus

---

## Blog

**GET `/api/blogs`**
1. Query params: `page`, `limit`, `status`, `tag`, `search`
2. Public

**GET `/api/blogs/slug/:slug`**
1. Public, published only

**POST `/api/blogs`**
1. Admin only
2. Multipart with `coverImage`

**GET `/api/blogs/:id`**
1. Admin only

**PATCH `/api/blogs/:id`**
1. Admin only
2. Multipart with optional `newCoverImage`

**DELETE `/api/blogs/:id`**
1. Admin only

**PATCH `/api/blogs/:id/publish`**
1. Admin only

**POST `/api/blogs/:id/duplicate`**
1. Admin only

---

## Insurance

**POST `/api/insurance/quote`**
1. Public
2. Returns WIS quotes

**POST `/api/insurance/finalize`**
1. Public
2. Creates application and returns Stripe payment URL

**GET `/api/insurance/:sessionId`**
1. Public read by session id

**GET `/api/insurance`**
1. Admin and agent only
2. Query params include `page`, `limit`, `search`, `createdAt`, `region`, `paymentStatus`

**GET `/api/insurance/nationalities`**
1. Public

**POST `/api/insurance/nationalities`**
1. Admin only
2. Refreshes nationalities data

**GET `/api/insurance/download/:policyId/:index`**
1. Public
2. Returns policy document URL

---

## Email (Admin and Agent)

**POST `/api/email/send-email`**
1. Multipart field: `reservation` for PDF attachment
2. Body fields: `subject`, `body`, `email`

---

## Stripe Webhook

**POST `/api/webhook`**
1. Stripe webhook endpoint
2. Validates signature and processes ticket or insurance purchases

