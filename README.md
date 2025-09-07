# VYRAL 🎮✨

A futuristic teen-centered hub for growth, creativity, and connection with gaming-inspired UI.

## Features

- **LyfeBoard**: Goal tracking with draggable cards and progress visualization
- **VybeTree**: Interactive milestone tree with glowing animations
- **VybeStrike**: Daily RPG-style challenges with XP and streaks
- **VybeZone**: Peer mentorship hub with chat and avatars
- **V-Shop**: Virtual reward store with rarity tiers
- **MoneyMoves**: Gamified budgeting with treasure map UI
- **B-Vyral**: Creative content feed with safe moderation
- **Skrybe**: AI-powered creative companion

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, PostgreSQL
- **Auth**: JWT, Google OAuth
- **Real-time**: Socket.IO
- **AI**: OpenAI API integration

## Quick Start

1. **Setup**: `npm run setup`
2. **Environment**: Copy `.env.example` files and configure
3. **Database**: Set up PostgreSQL and run migrations
4. **Seed Data**: `npm run seed`
5. **Development**: `npm run dev`

## Project Structure

```
vyral-app/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types and utilities
└── docs/           # Documentation
```

## Environment Setup

### Server (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/vyral_db
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
PORT=5000
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## Development

- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:5000
- Database migrations in `server/migrations/`
- Seed data in `server/seeders/`

## Gaming UI Theme

- **Colors**: Neon cyan, purple, electric blue, glitch green
- **Style**: Dark mode, rounded corners, glowing effects
- **Animations**: Smooth micro-interactions, level-up celebrations
- **Mobile-first**: Responsive design for all screen sizes