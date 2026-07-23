# My Spotify

A full-stack Next.js app for exploring your Spotify listening data. Auth0 login, saved library, top artists/tracks, and forward-only play tracking.

## Stack

- Next.js App Router (Server Components + API routes)
- TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Table, React Query
- Prisma ORM + Neon PostgreSQL
- Auth0 authentication
- Named theme system (`ember` is the default theme)

## App routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — top tracks, artists, playlists preview |
| `/tracks` | Saved library (paginated table) |
| `/artists` | Top artists table with time range |
| `/recent` | Play history tracked by the app |
| `/settings` | Account + Spotify connection |

**Desktop:** sidebar navigation. **Mobile:** bottom tab bar.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL` — Neon pooled connection string
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`
- `APP_BASE_URL` — `http://localhost:3000` locally
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`
- `CRON_SECRET` — for Vercel cron play sync (optional locally)

Optional: `SESSION_ABSOLUTE_SECONDS` — fixed Auth0 session TTL (7 days dev / ~90 days prod by default).

### Auth0 login keeps appearing or hangs

- **Use Sync now** in Settings for fresh data — only use **Reconnect Spotify** when permissions changed.
- Open the app at **`http://127.0.0.1:3000`** — do not mix `localhost` and `127.0.0.1` (Auth0 state cookies are host-specific).
- In [Auth0 Dashboard](https://manage.auth0.com) → your app → **Allowed Callback URLs**, include:
  - `http://127.0.0.1:3000/auth/callback`
- If Accept on the Auth0 screen never finishes, clear site cookies for `localhost` and Auth0, then log in again.
- Dev sessions last **7 days** by default (was 5 minutes). Set `SESSION_ABSOLUTE_SECONDS` in `.env` if you need a different TTL.

### 3. Database

```bash
npm run db:push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to Auth0, then `/dashboard`.

## Spotify scopes

The app requests:

- `user-read-email`, `user-read-private`
- `user-top-read`
- `user-read-recently-played`
- `playlist-read-private`
- `user-library-read` (saved tracks page)
- `streaming`, `user-read-playback-state`, `user-modify-playback-state` (in-app playback)

After scope changes, **Reconnect Spotify** from Settings (use the reconnect link with consent).

## In-app playback

Playback uses the [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk) and requires **Spotify Premium**.

1. Connect Spotify and **Reconnect** once after playback scopes were added.
2. Use play buttons on Tracks or the Overview top/recent lists.
3. A compact player bar stays visible while a track is playing; tap it to expand full controls.

Playback does not call Spotify for browsing — only when you press play or use player controls.

## Play tracking

Play history is **forward-only**: the app polls Spotify's recently-played endpoint when you open Recent, use **Sync listening history** in Settings, or via the daily cron — and stores events in Neon. It does not backfill your full Spotify history.

Library data (top tracks, artists, liked songs, playlists) loads from Spotify when you open each page, then caches in your database for about an hour.

- Manual play import: **Settings → Sync listening history**
- Automatic play import: Vercel cron once daily (`vercel.json`) using `CRON_SECRET`

## Deployment (Vercel)

1. Push to GitHub and import in Vercel
2. Set all env vars from `.env.example` including `CRON_SECRET`
3. Run `npm run db:push` against your Neon database
4. Redeploy after env changes

## Project structure

```
src/
├── app/(protected)/     # Dashboard, tracks, artists, recent, settings
├── features/            # dashboard, tracks, artists, recent, settings, spotify, listening
├── layouts/             # AppShell, sidebar, bottom nav
├── shared/              # UI, data-table, services, lib
└── providers/
```
