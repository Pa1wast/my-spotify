# My Spotify

A full-stack Next.js app for exploring and managing your music. The scaffold is ready for Auth0, Neon PostgreSQL, and future Spotify Web API integration.

## Stack

- Next.js App Router (Server Actions + API routes)
- TypeScript, Tailwind CSS v4, shadcn/ui
- Prisma ORM + Neon PostgreSQL (free tier)
- Auth0 authentication (free tier)
- NyxUI music player component
- Named theme system (`ember` is the default theme)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required for local auth/database:

- `DATABASE_URL` — Neon pooled connection string
- `DIRECT_URL` — Neon direct connection string (for migrations)
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`
- `APP_BASE_URL` — `http://localhost:3000` locally

Generate `AUTH0_SECRET`:

```bash
openssl rand -hex 32
```

### 3. Neon (free)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the pooled and direct PostgreSQL connection strings
3. Paste them into `.env` as `DATABASE_URL` and `DIRECT_URL`
4. Apply the schema:

```bash
npm run db:push
```

### 4. Auth0 (free)

1. Create a free Auth0 account and tenant
2. Create a **Regular Web Application**
3. Set Allowed Callback URLs: `http://localhost:3000/auth/callback`
4. Set Allowed Logout URLs: `http://localhost:3000`
5. Copy domain, client ID, and client secret into `.env`

For production on Vercel, also add your Vercel URL to Auth0 callback/logout URLs and set `APP_BASE_URL` to that URL.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/                 # App Router routes (thin wrappers)
├── features/            # Feature modules (auth, player, home, ...)
├── shared/              # Shared UI, lib, constants, types
├── layouts/
└── providers/           # Theme, React Query, Auth0 providers
```

## Deployment (Vercel Hobby — free)

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the same environment variables from `.env.example`
4. Deploy

Prisma client generation runs automatically via `postinstall` and `build`.

## Spotify Web API (later)

When you have Spotify API credentials, add them to `.env` and build services under `features/` for library sync and playback metadata. The NyxUI music player is already wired on the home page as a UI placeholder.

## Agent skills & rules

This repo includes Cursor rules and skills adapted from the Edinburgh Arrivals TMS frontend, plus Prisma and Auth0 agent skills under `.agents/skills/`.
