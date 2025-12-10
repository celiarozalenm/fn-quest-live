# Forward Quest

A gamified quiz platform for Forward Networks community. Users complete timed challenges with hints, compete on leaderboards, and earn achievements.

## Features

- **Dual Authentication**: Okta (employees) and Auth0 (community)
- **Timed Challenges**: Timer counts up, +30 seconds per hint
- **Hint System**: 3 hints per challenge, solution revealed after 3rd hint
- **Leaderboard**: Arcade-style 3-letter initials, ranked by fastest time
- **Admin Panel**: Manage quests, levels, and challenges

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (database + auth)
- React Router

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key

# Start development server
npm run dev
```

## Project Structure

```
src/
  components/ui/    # shadcn/ui components
  contexts/         # Auth context
  hooks/            # Custom hooks
  lib/              # Utilities (supabase client)
  pages/            # Route components
  types/            # TypeScript types
supabase/
  migrations/       # Database schema
```

## Database Setup

1. Create a Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Add your Supabase URL and anon key to `.env`

## Routes

- `/` - Home (login)
- `/quests` - Quest list
- `/quest/:questId/level/:levelId` - Play challenge
- `/enter-initials` - Submit score (if eligible)
- `/leaderboard` - View rankings
- `/admin` - Admin panel

## Game Rules

1. Each challenge has a timer that counts up
2. Users can use up to 3 hints (+30 seconds each)
3. After 3 hints, the solution is shown
4. If solution is shown, user is NOT eligible for leaderboard
5. Eligible users enter 3-letter initials for leaderboard

## Deployment

Configured for Cloudflare Pages:

```bash
npm run build
# Deploy dist/ folder
```
