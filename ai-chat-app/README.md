# AI Chat App

An intelligent chat application powered by OpenAI GPT with user authentication, chat history, and multi-session support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| AI | OpenAI GPT-4 API |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Deployment | Vercel (frontend) + Railway (backend) — see `vercel.json` and `railway.json` in repo |

## Features

- User authentication (register/login)
- AI-powered chat with GPT-4
- Multi-session chat history
- AI response streaming via OpenAI SDK
- Message persistence
- Responsive design with dark mode

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
