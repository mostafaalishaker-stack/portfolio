# SaaS Dashboard

A multi-tenant SaaS dashboard with subscription billing, team management, and analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Recharts |
| Backend | Node.js, Express, TypeScript |
| Payments | Stripe (test mode) |
| Auth | JWT (bcrypt + jsonwebtoken) |

## Features

- Multi-tenant organization support
- Role-based access (Admin, Member, Viewer)
- Subscription plans (Free, Starter, Pro, Enterprise)
- Stripe payment integration
- Dashboard with charts and analytics
- Revenue tracking and projections
- Team member management
- Recent activity feed

## Setup

### Backend
```bash
cd backend
npm install
cp backend/.env.example backend/.env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Root (both servers)
```bash
npm install
npm run dev
```
