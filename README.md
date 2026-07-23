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
2. Create a **Regular Web Application** (Token Endpoint Auth Method: `client_secret_post`)
3. In Application → Settings, configure:

| Field | Local value |
|-------|-------------|
| Allowed Callback URLs | `http://localhost:3000/auth/callback` |
| Allowed Logout URLs | `http://localhost:3000` |
| Allowed Web Origins | `http://localhost:3000` |

4. Copy domain, client ID, and client secret into `.env` (see `.env.example`)
5. Generate `AUTH0_SECRET` with `openssl rand -hex 32` if needed

For production on Vercel, add your deployment URL with the same paths (e.g. `https://your-app.vercel.app/auth/callback`) and set `APP_BASE_URL` to that URL.

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

## Spotify Web API

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add redirect URIs:
   - `http://localhost:3000/api/spotify/callback`
   - `https://your-vercel-url.vercel.app/api/spotify/callback`
3. Add your Spotify account under **User Management** (Development mode)
4. Set env vars locally and on Vercel:

```bash
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

On Vercel, use your production URL for `SPOTIFY_REDIRECT_URI`.

5. Apply the database schema after pulling Spotify changes:

```bash
npm run db:push
```

6. Log in with Auth0, click **Connect Spotify**, then view your top tracks on the home page.

## Agent skills & rules

This repo includes Cursor rules and skills adapted from the Edinburgh Arrivals TMS frontend, plus Prisma and Auth0 agent skills under `.agents/skills/`.
