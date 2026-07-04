# Vanam - Farm Finance Tracker

Real-time personal finance tracking web app designed for Tamil-speaking farmers.

## Features
- Real-time updates across devices using Socket.IO
- Offline support with local caching and request queuing
- Tamil language UI and Indian Rupee formatting
- Dashboard, History, Investment Planner, and Trends

## Tech Stack
- Frontend: React 18 (Vite) + Tailwind CSS + Recharts
- Backend: Node.js + Express + Prisma + Socket.IO
- Database: PostgreSQL

## Setup Instructions

### 1. Database Setup
Ensure you have PostgreSQL running. Create a database named `vanam` (or use your preferred name).

### 2. Server Setup
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL database URL
npm install
npx prisma db push
npm run seed
npm run dev
```

### 3. Client Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Deployment (Render / Railway)
- For the server, configure the `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL` environment variables. Add a start command: `npm start`. Ensure `prisma db push` is run during the build phase.
- For the client, build it using `npm run build` and deploy the `dist` folder to a static host (like Vercel, Netlify, or Render Static Site). Ensure `VITE_API_URL` points to your backend API URL.
