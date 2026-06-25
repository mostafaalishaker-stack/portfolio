# Kanban Task Manager

A full-stack task management application with drag-and-drop Kanban board and user authentication.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (Prisma ORM) |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Deployment | Vercel (frontend) + Railway (backend) |

## Features

- User authentication (register/login with JWT)
- Create/Edit/Delete boards
- Drag-and-drop task management
- Task cards with due dates, labels, assignees
- Responsive design

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
