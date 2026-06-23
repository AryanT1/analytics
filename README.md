# Analytics

A self-hosted product analytics platform. Track events from any app using a simple HTTP API, then visualize them in a real-time dashboard.

## Architecture

```
┌─────────────┐     HTTP      ┌─────────────────────────────────────┐
│  Your App   │ ──────────── ▶│  Backend (Express + TypeScript)     │
│             │  x-api-key    │                                     │
└─────────────┘               │  POST /api/v1/track  ──▶  Redis    │
                              │                           Buffer    │
┌─────────────┐               │                              │      │
│  Dashboard  │ ◀──────────── │  GET  /api/v1/analytics     │      │
│  (React)    │   JWT         │                           BullMQ    │
└─────────────┘               │                           Worker    │
                              │                              │      │
                              │                           Neon DB   │
                              └─────────────────────────────────────┘
```

Events are buffered in Redis and flushed to PostgreSQL every 30 seconds via a BullMQ worker. Analytics queries hit the database directly with Redis response caching.

## Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Frontend | React 19, Vite, Tailwind CSS, Recharts |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Queue | BullMQ + Redis Stack |
| Auth | JWT (dashboard users) + API key (event ingestion) |
| Container | Docker, nginx, Amazon ECR |

## Project Structure

```
Analytics/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, rate limiter, cache
│   │   ├── routes/          # Express routers
│   │   ├── jobs/            # BullMQ flush worker (runs every 30s)
│   │   ├── service/         # Event buffering logic
│   │   ├── db/              # Prisma + Redis clients
│   │   └── utils/           # Config, token helpers
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Home, Login, Signup, Dashboard, ProjectAnalytics
│   │   ├── api/             # Axios wrappers for each endpoint
│   │   ├── context/         # AuthContext (JWT + user state)
│   │   └── components/      # ProtectedRoute
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

## API Reference

### Authentication

All dashboard API routes require a JWT Bearer token obtained from `/api/v1/auth/login`.  
Event tracking routes require an `x-api-key` header (per-project API key).

---

### Auth

#### `POST /api/v1/auth/signup`
```json
{ "email": "you@example.com", "password": "yourpassword" }
```
Returns `{ user, token }`

#### `POST /api/v1/auth/login`
```json
{ "email": "you@example.com", "password": "yourpassword" }
```
Returns `{ user, token }`

---

### Projects

All routes require `Authorization: Bearer <token>`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/project` | List your projects |
| `POST` | `/api/v1/project` | Create a project — body: `{ "name": "My App" }` |
| `GET` | `/api/v1/project/:id` | Get a single project |
| `DELETE` | `/api/v1/project/:id` | Delete project and all its events |
| `POST` | `/api/v1/project/:id/rotate-key` | Rotate the API key |

---

### Event Tracking

Requires `x-api-key: <your-project-api-key>` header.

#### `POST /api/v1/track`
```json
{
  "eventName": "page_view",
  "userId": "user_123",
  "anonymousId": "anon_abc",
  "country": "US",
  "deviceType": "desktop",
  "properties": { "page": "/pricing" }
}
```
Only `eventName` is required. Returns `{ success: true }`.

#### `POST /api/v1/track/identify`
Merge an anonymous visitor into a known user — backfills all buffered and stored events.
```json
{
  "anonymousId": "anon_abc",
  "userId": "user_123"
}
```

---

### Analytics

All routes require JWT auth and project ownership. Rate limited to 30 req/min. Responses cached for 60s.

| Method | Path | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/v1/analytics/:projectId/summary` | — | Total events, unique users, event types |
| `GET` | `/api/v1/analytics/:projectId/events` | `limit`, `offset` | Events grouped by name |
| `GET` | `/api/v1/analytics/:projectId/overtime` | `from`, `to` (YYYY-MM-DD) | Event count per day |
| `GET` | `/api/v1/analytics/:projectId/users-overtime` | `from`, `to` | Unique users per day |
| `GET` | `/api/v1/analytics/:projectId/countries` | `limit`, `offset` | Events by country |
| `GET` | `/api/v1/analytics/:projectId/devices` | `limit`, `offset` | Events by device type |
| `GET` | `/api/v1/analytics/:projectId/users` | `limit`, `offset` | Top users by event count |

---

## Quick Start (JavaScript)

```js
// Track an event
fetch('https://your-backend.com/api/v1/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-project-api-key',
  },
  body: JSON.stringify({
    eventName: 'button_click',
    userId: 'user_123',
    properties: { button: 'upgrade' },
  }),
});
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-secret-here
AWS_ACCOUNT_ID=123456789012
AWS_REGION=ap-south-1
IMAGE_TAG=latest
```

## Running with Docker Compose

```bash
# Pull images from ECR and start all services
aws ecr get-login-password --region ap-south-1 \
  | docker login --username AWS --password-stdin \
    295933006700.dkr.ecr.ap-south-1.amazonaws.com

docker compose pull
docker compose up -d
```

Services:
- Frontend → `http://localhost`
- Backend API → `http://localhost:3000`
- Redis Stack → `localhost:6379`

## Building and Pushing to ECR

```bash
# Backend
docker build -t analytics-backend ./backend
docker tag analytics-backend:latest \
  295933006700.dkr.ecr.ap-south-1.amazonaws.com/analytics-backend:latest
docker push 295933006700.dkr.ecr.ap-south-1.amazonaws.com/analytics-backend:latest

# Frontend
docker build -t analytics-frontend ./frontend
docker tag analytics-frontend:latest \
  295933006700.dkr.ecr.ap-south-1.amazonaws.com/analytics-frontend:latest
docker push 295933006700.dkr.ecr.ap-south-1.amazonaws.com/analytics-frontend:latest
```

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev        # tsx watch on port 3000

# Frontend
cd frontend
npm install
npm run dev        # Vite on port 5173, proxies /api → localhost:3000
```
