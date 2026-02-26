# Virtual Agent

Tour logistics automation for performing artists. Optimize flight routing, generate riders, find hotels, and manage tour budgets.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Backend:** [Hono](https://hono.dev) (Web Standards-based)
- **Frontend:** [Next.js](https://nextjs.org) (App Router) + [Tailwind CSS](https://tailwindcss.com) + [TanStack React Query](https://tanstack.com/query)
- **Secrets:** [Doppler](https://doppler.com)

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) (for secrets management)
- Access to the `virtual-agent` Doppler project

## Project Structure

```
├── apps/
│   ├── api/          # Bun + Hono backend (port 4000)
│   │   └── src/
│   │       ├── index.ts
│   │       ├── routes/
│   │       ├── services/
│   │       ├── db/
│   │       └── lib/
│   └── web/          # Next.js frontend (port 3000)
│       └── src/
│           ├── app/
│           ├── components/
│           └── lib/
├── specs/            # Project specifications
├── doppler.yaml      # Doppler project config
├── .env.example      # Expected environment variables
└── tsconfig.base.json
```

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Doppler

```bash
# Login to Doppler (first time only)
doppler login

# Set up the project (run from repo root)
doppler setup
```

### 3. Run in development

**With Doppler (recommended):**

```bash
doppler run -- bun run dev
```

This starts both the API (port 4000) and web app (port 3000) concurrently, with secrets injected by Doppler.

**Without Doppler (using local .env):**

Copy `.env.example` to `.env` in the root directory, fill in your values, then:

```bash
bun run dev
```

### Running individual apps

```bash
# Backend only
cd apps/api && bun run dev

# Frontend only
cd apps/web && bun run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Database connection string |
| `AMADEUS_API_KEY` | Amadeus flight API key |
| `AMADEUS_API_SECRET` | Amadeus flight API secret |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `RESEND_API_KEY` | Resend email service API key |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:3000`) |
| `PORT` | Backend port (default: `4000`) |

## API

### Health Check

```
GET /health → { "status": "ok" }
```
