# AGENTS.md — virtual-agent

## Mission

Virtual-agent is a tour management app for music artists. It helps booking agents manage artists, tours, gigs, bookings, and technical riders.

The app is a **single Next.js application** backed by **Supabase Postgres**, deployed on **Vercel**.

## Repo Map

```
/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, signup (public routes)
│   └── (dashboard)/        # Protected routes (Dashboard, Tours, Riders, Settings)
├── components/             # React components (shadcn/ui based)
├── db/
│   ├── schema/             # Drizzle ORM schemas (pgTable)
│   ├── migrations/         # Drizzle migration files
│   └── seed.ts             # Seed script for sample data
├── lib/
│   ├── supabase/           # Supabase client (browser) and server helpers
│   └── ...                 # Shared utilities
├── specs/features/         # Gherkin feature specs (PM goals)
├── drizzle.config.ts       # Drizzle config targeting Supabase Postgres
├── AGENTS.md               # This file — agent guidelines
└── package.json
```

## Issue Creation Constraints

These rules apply to the **attractor PM agent** when creating issues from a feature spec goal.

### Maximum 3 Issues Per Goal

- Each PM goal (feature spec) must be broken into **no more than 3 issues**.
- Each issue should be a meaningful, shippable increment — not a micro-task.
- If more work is needed after the 3 issues are completed, **create a new PM goal** with a new feature spec.

### Visual Verification Required

- Every issue **must define a visual checkpoint** — a concrete thing you can see in the browser that proves the issue was implemented correctly.
- Include a **"Visual Verification"** section in every issue body with bullet points describing exactly what to look for.
- If an issue has no visible browser change, it is too low-level. Combine it with another issue.

Example:

```markdown
## Visual Verification
- Navigate to /login → login form renders with email and password fields
- Submit valid credentials → redirected to dashboard
- Dashboard shows "Chic" as the artist name
```

### AGENTS.md Update Requirement

- **After every PR**, check whether AGENTS.md needs updating.
- If anything was wrong, unclear, missing, or could be more explicit — update AGENTS.md in the same PR or a follow-up.
- This ensures agent instructions improve over time based on real implementation experience.
- Common updates: new file paths, changed conventions, discovered gotchas, corrected assumptions.

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js (App Router)                |
| UI             | shadcn/ui + Tailwind CSS            |
| Auth           | Supabase Auth (email/password)      |
| Database       | Supabase Postgres                   |
| ORM            | Drizzle ORM (`pgTable`, `pgEnum`)   |
| Deployment     | Vercel                              |
| Package Mgr    | npm (not Bun — Vercel compatibility)|

## Coding Standards

### Next.js

- Use the App Router (`app/` directory), not Pages Router.
- Default to **Server Components**. Only use `"use client"` when the component needs browser APIs, event handlers, or React hooks.
- Use route groups `(auth)` and `(dashboard)` to separate public and protected layouts.
- Fetch data in Server Components using the Supabase server client — avoid client-side fetching for initial page loads.

### Supabase

- Browser client: `lib/supabase/client.ts` — uses `createBrowserClient` from `@supabase/ssr`.
- Server client: `lib/supabase/server.ts` — uses `createServerClient` from `@supabase/ssr` with cookie handling.
- Auth: Use Supabase Auth middleware to protect routes. Redirect unauthenticated users to `/login`.
- Never expose the `service_role` key in client-side code.

### Drizzle ORM (Postgres)

- Schemas use `pgTable` and `pgEnum` from `drizzle-orm/pg-core`.
- Each table in its own file under `db/schema/`.
- Barrel export from `db/schema/index.ts`.
- Migrations generated with `drizzle-kit generate` and applied with `drizzle-kit migrate`.
- Connection string from `DATABASE_URL` environment variable.

### shadcn/ui

- Install components via `npx shadcn@latest add <component>`.
- Components live in `components/ui/`.
- Custom components (sidebar, data tables, etc.) live in `components/`.
- Use shadcn/ui primitives rather than building from scratch.

### General

- TypeScript strict mode.
- No `any` types — use proper typing.
- Prefer named exports over default exports.
- Keep components small and focused.
- Colocate related files (component + its types/utils) when practical.

## Engineering Agent Workflow

1. **Read the issue** — understand the visual verification criteria before writing code.
2. **Read AGENTS.md** — follow the conventions documented here.
3. **Read the relevant feature spec** in `specs/features/` for full context.
4. **Implement** — write code that satisfies the issue's acceptance criteria and visual verification.
5. **Test locally** — verify the visual checkpoint yourself before opening a PR.
6. **Update AGENTS.md** — if you discovered anything that should be documented (new paths, gotchas, convention changes), update this file.
7. **Open PR** — include the visual verification steps in the PR description so reviewers know what to check.
