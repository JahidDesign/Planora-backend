# Planora — Backend

> REST API server for Planora — a secure, JWT-protected event management platform.

---

## 🔗 Links

| | URL |
|---|---|
| 🖥️ **Live API** | [https://planora-server-4lly.onrender.com](https://planora-server-4lly.onrender.com) |
| 📦 **Backend Repo** | [https://github.com/JahidDesign/Planora-backend](https://github.com/JahidDesign/Planora-backend) |
| 🌐 **Frontend App** | [https://planoranet.vercel.app](https://planoranet.vercel.app) |
| 📦 **Frontend Repo** | [https://github.com/JahidDesign/Planora-frontend](https://github.com/JahidDesign/Planora-frontend) |

---

## 🔐 Admin Credentials

| Field | Value |
|---|---|
| **Email** | jahid@planora.dev |
| **Password** | jahid@1234 |
| **Role** | ADMIN |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Payments | Stripe |
| File Uploads | Multer / Cloudinary |
| Validation | Zod / express-validator |
| Email | Nodemailer |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Stripe account
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/JahidDesign/Planora-backend.git
cd Planora-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/planora

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Client
CLIENT_URL=http://localhost:3000

# Cloudinary (optional — for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database (creates admin user + sample events)
npx prisma db seed

# Open Prisma Studio (optional — visual DB browser)
npx prisma studio
```

### Run Development Server

```bash
npm run dev
```

Server starts at [http://localhost:5000](http://localhost:5000).

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
Planora-backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Seed script (admin + sample data)
├── src/
│   ├── index.ts                # Entry point — Express app setup
│   ├── config/
│   │   ├── db.ts               # Prisma client instance
│   │   └── stripe.ts           # Stripe client instance
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification middleware
│   │   ├── isAdmin.ts          # Admin role guard
│   │   ├── isOwner.ts          # Event owner guard
│   │   ├── validate.ts         # Request validation middleware
│   │   └── errorHandler.ts     # Global error handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── participant.routes.ts
│   │   ├── invitation.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── review.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── participant.controller.ts
│   │   ├── invitation.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── review.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   ├── payment.service.ts
│   │   └── email.service.ts
│   └── utils/
│       ├── jwt.ts              # Token sign/verify helpers
│       ├── hash.ts             # bcrypt helpers
│       └── apiError.ts         # Custom error class
└── package.json
```

---

## Database Schema

### Models

| Model | Description |
|---|---|
| `User` | Registered users with role (USER / ADMIN) |
| `Event` | Events with type (PUBLIC / PRIVATE) and optional fee |
| `Participant` | Join requests with status (PENDING / APPROVED / REJECTED / BANNED) |
| `Invitation` | Host-sent invitations with status (PENDING / ACCEPTED / DECLINED) |
| `Payment` | Stripe payment records linked to events and users |
| `Review` | Star ratings and comments on past events |

### Key Relations

```
User       ──< Event        (one user creates many events)
User       ──< Participant  (one user joins many events)
Event      ──< Participant  (one event has many participants)
User       ──< Invitation   (sender / receiver)
Event      ──< Invitation
Event      ──< Review
User       ──< Review
User       ──< Payment
Event      ──< Payment
```

---

## API Reference

Base URL: `https://planora-server-4lly.onrender.com/api`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Login and receive JWT |
| GET | `/auth/me` | ✅ | Get current user profile |
| PATCH | `/auth/me` | ✅ | Update profile |
| PATCH | `/auth/me/password` | ✅ | Change password |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | — | List all public events (search + filter) |
| GET | `/events/:id` | — | Get event details |
| POST | `/events` | ✅ | Create a new event |
| PATCH | `/events/:id` | ✅ Owner | Update an event |
| DELETE | `/events/:id` | ✅ Owner/Admin | Delete an event |
| GET | `/events/:id/participants` | ✅ Owner | List event participants |

**Query Parameters for `GET /events`:**

| Param | Type | Example |
|---|---|---|
| `search` | string | `?search=tech` |
| `type` | PUBLIC \| PRIVATE | `?type=PUBLIC` |
| `fee` | free \| paid | `?fee=free` |
| `upcoming` | boolean | `?upcoming=true` |
| `limit` | number | `?limit=9` |
| `page` | number | `?page=2` |

### Participants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/participants/join/:eventId` | ✅ | Join or request to join an event |
| PATCH | `/participants/:id/approve` | ✅ Owner | Approve a join request |
| PATCH | `/participants/:id/reject` | ✅ Owner | Reject a join request |
| PATCH | `/participants/:id/ban` | ✅ Owner | Ban a participant |

### Invitations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/invitations` | ✅ Owner | Send an invitation by email |
| GET | `/invitations/my` | ✅ | Get current user's invitations |
| PATCH | `/invitations/:id/accept` | ✅ | Accept an invitation |
| PATCH | `/invitations/:id/decline` | ✅ | Decline an invitation |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-session` | ✅ | Create Stripe Checkout Session → returns `{ url }` |
| POST | `/payments/create-subscription-session` | ✅ | Create subscription checkout session |
| GET | `/payments/my` | ✅ | Get current user's payment history |
| POST | `/payments/webhook` | — | Stripe webhook handler |

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews/event/:eventId` | — | Get all reviews for an event |
| POST | `/reviews` | ✅ | Submit a review (past attendees only) |
| PATCH | `/reviews/:id` | ✅ Owner | Edit a review |
| DELETE | `/reviews/:id` | ✅ Owner | Delete a review |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | ✅ Admin | List all users |
| DELETE | `/admin/users/:id` | ✅ Admin | Delete a user account |
| GET | `/admin/events` | ✅ Admin | List all events |
| DELETE | `/admin/events/:id` | ✅ Admin | Delete any event |

---

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are issued on login and expire based on `JWT_EXPIRES_IN` (default `7d`).

---

## Payment Flow

```
1. Client  →  POST /payments/create-session  { eventId }
2. Server  →  Creates Stripe Checkout Session
3. Server  →  Returns { url: session.url }
4. Client  →  window.location.href = url
5. User    →  Completes payment on Stripe hosted page
6. Stripe  →  POST /payments/webhook (checkout.session.completed)
7. Server  →  Verifies webhook signature
8. Server  →  Sets Participant status to PENDING
9. Host    →  Approves or rejects from dashboard
```

**Stripe webhook events handled:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Mark payment succeeded, set participant PENDING |
| `payment_intent.payment_failed` | Mark payment as failed |

---

## Participation Logic

| Event Type | Fee | Flow |
|---|---|---|
| PUBLIC | Free | Join → immediately APPROVED |
| PUBLIC | Paid | Payment → PENDING → host approves |
| PRIVATE | Free | Request → PENDING → host approves |
| PRIVATE | Paid | Payment → PENDING → host approves |

---

## Error Handling

All errors follow a consistent JSON shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

| HTTP Code | Meaning |
|---|---|
| 400 | Validation error / bad request |
| 401 | Missing or invalid JWT |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g. already joined) |
| 500 | Internal server error |

---

## Commit History

This project maintains a minimum of 20 meaningful commits:

```
feat: initialise Express project with TypeScript and Prisma
feat: define Prisma schema — User, Event, Participant, Review, Payment
feat: run initial database migration
feat: implement register and login with bcrypt + JWT
feat: add auth middleware for JWT verification
feat: add isAdmin and isOwner guard middleware
feat: build event CRUD — create, read, update, delete
feat: add search and filter query params to GET /events
feat: implement participant join endpoint with type/fee logic
feat: add approve, reject, ban endpoints for participants
feat: build invitation system — send, accept, decline
feat: integrate Stripe — create-session returning session.url
feat: implement Stripe webhook handler with signature verification
feat: add payment history endpoint GET /payments/my
feat: build review endpoints — create, read, update, delete
feat: add past-attendee guard on review creation
feat: build admin routes — list/delete users and events
feat: add global error handler middleware
feat: add request validation with Zod schemas
feat: seed database with admin user and sample events
fix: scope participant approval to event owner only
fix: handle Stripe webhook idempotency on duplicate events
```

---

## License

MIT
