# Virtual Agent

Tour logistics automation for performing artists. Optimize flight routing, generate riders, find hotels, and manage tour budgets.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Auth:** [Supabase Auth](https://supabase.com/auth)
- **Database:** [Supabase Postgres](https://supabase.com/database)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team) (pgTable)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Deployment:** [Vercel](https://vercel.com)

## Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Bun](https://bun.sh) >= 1.0 (for tests)
- A [Supabase](https://supabase.com) project (free or Pro)
- A [Vercel](https://vercel.com) account (for deployment)

## Project Structure

```
├── app/
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── tours/page.tsx    # Tours page (tour + gig data)
│   │   ├── riders/page.tsx   # Riders page (hospitality items)
│   │   └── settings/page.tsx # Settings page (user info)
│   ├── login/                # Login page (public)
│   ├── signup/               # Signup page (public)
│   ├── auth/callback/        # Supabase auth callback
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── sidebar.tsx           # Dashboard sidebar navigation
│   └── sign-out-button.tsx   # Sign-out button
├── db/
│   ├── schema/               # Drizzle ORM schemas (pgTable)
│   ├── queries/              # Data access queries
│   ├── migrations/           # Drizzle migration files
│   ├── index.ts              # Database client
│   └── seed.ts               # Seed script
├── lib/
│   └── supabase/             # Supabase client helpers
│       ├── client.ts         # Browser client
│       ├── server.ts         # Server client
│       └── middleware.ts     # Auth middleware
├── specs/                    # Project specifications
├── tests/                    # Test files
├── drizzle.config.ts         # Drizzle config (Supabase Postgres)
├── middleware.ts              # Next.js middleware (auth protection)
└── package.json
```

## Secrets Management

This project uses [Doppler](https://www.doppler.com/) as the primary source of truth for all environment variables. Doppler eliminates the need for `.env.local` files and manual Vercel env var configuration.

### Environment Config Reference

| Doppler Config | Deployment Target        |
|----------------|--------------------------|
| `dev`          | Local development        |
| `stg`          | Vercel Preview           |
| `prd`          | Vercel Production        |

### Setup

1. **Install the Doppler CLI**

   ```bash
   # macOS
   brew install dopplerhq/cli/doppler

   # Other platforms: https://docs.doppler.com/docs/install-cli
   ```

2. **Authenticate**

   ```bash
   doppler login
   ```

3. **Link this project** (run from the `virtual-agent` directory)

   ```bash
   doppler setup
   ```

   Select the `virtual-agent` project and `dev` config when prompted (these defaults are declared in `doppler.yaml`).

4. **Run the dev server with Doppler**

   ```bash
   npm run dev:doppler
   ```

   This runs `doppler run -- next dev`, injecting all secrets from the `dev` config into the Next.js process. No `.env.local` file is required.

### Vercel Integration

For Vercel deployments, the [Doppler–Vercel integration](https://docs.doppler.com/docs/vercel) syncs secrets automatically:

- **Production** deploys receive env vars from the `prd` config
- **Preview** deploys receive env vars from the `stg` config

Once configured, no environment variables need to be manually set in the Vercel dashboard. See [Doppler's Vercel integration docs](https://docs.doppler.com/docs/vercel) for setup instructions.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from the project settings

### 3. Configure environment variables

**Option A — Doppler (recommended):** Follow the [Secrets Management](#secrets-management) steps above. No `.env.local` file is needed.

**Option B — Manual `.env.local`:** If you prefer not to use Doppler, copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

### 4. Set up the database

```bash
# Generate migrations from schema
npm run db:generate

# Apply migrations to Supabase Postgres
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 5. Run in development

```bash
# With Doppler (recommended)
npm run dev:doppler

# Without Doppler (requires .env.local)
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Connect the repository to Vercel
2. Set the **Root Directory** to `virtual-agent` (if this is inside a parent repo)
3. **Configure environment variables** using one of the following methods:

   **Preferred — Doppler sync:** Configure the [Doppler–Vercel integration](https://docs.doppler.com/docs/vercel) to automatically sync secrets. The `prd` config is used for Production and `stg` for Preview deployments. Once active, no manual env var entry is needed in Vercel.

   **Fallback — Manual entry:** If not using Doppler, add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL (from Supabase Dashboard > Settings > API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anonymous/publishable key (from Supabase Dashboard > Settings > API)
   - `DATABASE_URL` — Supabase Postgres connection string (use the **connection pooler** URL on port 6543 for Vercel Serverless Functions)

4. Deploy — Vercel will run `next build` and deploy automatically

> **Note:** For production, use the Supabase **connection pooler URL** (port 6543) as your `DATABASE_URL` instead of the direct connection string. This avoids connection exhaustion in serverless environments.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/publishable key |
| `DATABASE_URL` | Supabase Postgres connection string |
| `AMADEUS_API_KEY` | Amadeus flight API key |
| `AMADEUS_API_SECRET` | Amadeus flight API secret |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `RESEND_API_KEY` | Resend email service API key |

## Auth

- Unauthenticated users are redirected to `/login`
- Authentication is handled by Supabase Auth
- Protected routes are enforced via Next.js middleware
- Sign up creates a new Supabase user account
- Sign in uses email/password authentication

## Database

- Schema defined with Drizzle ORM using `pgTable` (Postgres)
- Tables: artists, tours, gigs, bookings, riders
- Migrations managed via `drizzle-kit`
- Seed data includes: 1 artist (Chic), 1 tour, 5 gigs, 2 bookings, 1 rider

## Testing

```bash
# Run all tests
npm test
```

Tests use [Bun's built-in test runner](https://bun.sh/docs/cli/test). Test files are located in `tests/`, `db/__tests__/`, and `db/schema/__tests__/`.
