# MultiMail — Multi-Tenant Email Marketing Platform API

A production-grade backend API for sending bulk email campaigns with real-time tracking, scheduled dispatch, and live progress monitoring.

## Features

- **Multi-tenant architecture** — isolated data per tenant with row-level security
- **Bulk email dispatch** — send to 50,000+ recipients via Bull Queue workers without blocking the API
- **Open & click tracking** — real-time engagement tracking via pixel and redirect endpoints
- **Scheduled campaigns** — node-cron checks every minute and auto-triggers due campaigns
- **Live progress** — Socket.io pushes send progress to connected clients in real time
- **Dual authentication** — JWT tokens for UI users, API keys for programmatic access

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, TypeScript |
| Framework | Express.js |
| Databases | PostgreSQL (Supabase), Redis |
| ORM | Drizzle ORM |
| Queue | Bull Queue |
| Email | Nodemailer (Gmail SMTP) |
| Real-time | Socket.io |
| Scheduling | node-cron |
| DevOps | Docker, Docker Compose |
| Auth | JWT, bcryptjs |

## Architecture

```
Client Request
      ↓
Express (helmet, cors, validation)
      ↓
JWT / API Key Auth Middleware
      ↓
Route → Controller → Service → PostgreSQL
      ↓
Bull Queue → Email Workers → Nodemailer
      ↓
Webhook → MongoDB (open/click events)
      ↓
Socket.io → Live progress to client
      ↓
node-cron → Scheduled campaign dispatch
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- Supabase account (free tier)
- Gmail account with App Password

### Setup

**1. Clone the repo:**
```bash
git clone https://github.com/rahul-singh011/multimail
cd multimail
```

**2. Create `.env` file:**
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
REDIS_HOST=redis
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_gmail@gmail.com
APP_URL=http://localhost:3000
```

**3. Run with Docker:**
```bash
docker compose up -d
```

API is running at `http://localhost:3000`

### Without Docker

```bash
pnpm install
pnpm db:push
pnpm dev
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new tenant |
| POST | `/api/auth/login` | Login and get JWT token |

### Campaigns
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/campaigns` | Create a campaign |
| GET | `/api/campaigns` | List all campaigns |
| GET | `/api/campaigns/:id` | Get one campaign |
| PATCH | `/api/campaigns/:id` | Update a campaign |
| DELETE | `/api/campaigns/:id` | Delete a campaign |
| POST | `/api/campaigns/:id/send` | Trigger campaign send |

### Contacts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/campaigns/:id/contacts` | Add contacts to campaign |
| GET | `/api/campaigns/:id/contacts` | List campaign contacts |

### Tracking
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/track/open` | Records email open (pixel) |
| GET | `/api/track/click` | Records click, redirects to URL |

## Key Design Decisions

**Why Bull Queue instead of direct sending?**
Sending 50,000 emails in a loop blocks the API for hours. Bull Queue pushes jobs to Redis and workers process them in the background — API responds in milliseconds.

**Why two auth methods?**
JWT tokens for browser/app users who log in. API keys for developers integrating MultiMail into their own backend — same pattern as Stripe.

**Why atomic SQL increments?**
Multiple workers running simultaneously could read the same count value and both write the same incremented number. Raw SQL `count + 1` is atomic — database handles concurrent updates safely.

**Why separate PostgreSQL and Redis?**
PostgreSQL for relational data (tenants, campaigns, contacts) that needs ACID transactions. Redis for ephemeral data (job queue, rate limiting) that needs speed.

## Real-time Progress

Connect via Socket.io to watch live campaign progress:

```javascript
const socket = io('http://localhost:3000')

// Join campaign room
socket.emit('join', campaignId)

// Listen for progress
socket.on('campaignProgress', (data) => {
  console.log(`${data.sent} / ${data.total} sent`)
})

socket.on('campaignComplete', (data) => {
  console.log('Campaign complete!')
})
```

## License
MIT