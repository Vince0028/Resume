# John Michael Corpuz | Portfolio 2026

A personal portfolio/resume website with livechat and guestbook features.

## Project Structure

```
├── frontend/          # React + Vite + Tailwind CSS + shadcn/ui
├── backend/           # NestJS API (livechat & guestbook)
└── database/          # MySQL schema and migrations
```

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Vite, React, TypeScript, Tailwind, shadcn/ui |
| Backend    | NestJS, TypeORM, Socket.IO              |
| Database   | MySQL                                   |

## Getting Started

### Frontend
```sh
cd frontend
npm install
npm run dev
```

### Backend
```sh
cd backend
cp .env.example .env   # configure your DB credentials
npm install
npm run start:dev
```

### Database
```sh
mysql -u root -p < database/schema.sql
```
