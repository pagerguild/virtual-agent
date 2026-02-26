Feature: Migrate virtual-agent to single Next.js app with Supabase Postgres and Vercel deployment
  As a developer contributing to virtual-agent
  I want to collapse the Bun monorepo (Hono API + SQLite + Next.js frontend) into a single Next.js app
  backed by Supabase Postgres and deployed on Vercel
  So that the stack is simpler, production-ready, and leverages the org's existing Supabase Pro and Vercel accounts

  Background:
    Given the org (Guilde AI) pays for Supabase Pro and Vercel
    And the current stack is a Bun monorepo with apps/api (Hono + SQLite) and apps/web (Next.js)
    And there are 5 Drizzle schemas: artists, tours, gigs, bookings, riders

  # ────────────────────────────────────────────────────────────────────────
  # PM CONSTRAINTS
  #
  # The attractor PM must create NO MORE THAN 3 ISSUES for this goal.
  # Every issue must produce VISIBLE CHANGES in the running app.
  # Every issue must include a "Visual Verification" section in its body.
  # AGENTS.md must be updated after every PR.
  # If more work is needed after the 3 issues, create a new PM goal.
  # ────────────────────────────────────────────────────────────────────────

  # ── Issue 1 — Foundation: Single Next.js app, Supabase Auth, shadcn/ui ─

  Scenario: Monorepo is collapsed into a single Next.js app at the repo root
    Given the apps/api and apps/web directories have been removed
    Then the repo root should contain a Next.js App Router project
    And "package.json" should list "next", "react", and "react-dom" as dependencies
    And the Bun workspace configuration should be removed

  Scenario: Supabase Auth is configured with email/password provider
    Given the file "lib/supabase/client.ts" exists
    And the file "lib/supabase/server.ts" exists
    Then the Supabase client should read NEXT_PUBLIC_SUPABASE_URL from the environment
    And it should read NEXT_PUBLIC_SUPABASE_ANON_KEY from the environment

  Scenario: Login and signup pages exist and work
    Given the file "app/(auth)/login/page.tsx" exists
    And the file "app/(auth)/signup/page.tsx" exists
    Then a user can sign up with email and password
    And a user can log in with valid credentials
    And unauthenticated users are redirected to the login page

  Scenario: shadcn/ui is installed and configured
    Given the file "components.json" exists
    Then shadcn/ui components should be importable
    And Tailwind CSS should be configured for the project

  Scenario: Drizzle ORM is configured for Supabase Postgres
    Given the file "drizzle.config.ts" exists
    Then it should configure "pg" or "postgresql" as the dialect
    And it should reference DATABASE_URL from the environment

  # Visual Verification for Issue 1:
  #   - Navigate to the app URL → redirected to /login
  #   - Sign up with a new email/password → account created
  #   - Log in → redirected to the dashboard
  #   - shadcn/ui button and input components render correctly on auth pages

  # ── Issue 2 — Database: Migrate schemas to pgTable, seed data, Dashboard ─

  Scenario: All 5 schemas are migrated from SQLite to Postgres pgTable
    Given the following schema files exist under "db/schema/":
      | file         |
      | artists.ts   |
      | tours.ts     |
      | gigs.ts      |
      | bookings.ts  |
      | riders.ts    |
    Then each schema should use "pgTable" from "drizzle-orm/pg-core"
    And each schema should preserve all columns and relationships from the SQLite version
    And enums should use "pgEnum" instead of SQLite text checks

  Scenario: Drizzle migrations are generated and applied to Supabase
    Given "package.json" has "db:generate" and "db:migrate" scripts
    When I run "npm run db:generate"
    Then SQL migration files should be created
    When I run "npm run db:migrate"
    Then all migrations should be applied to the Supabase Postgres database

  Scenario: Seed script populates Supabase with sample data
    Given "package.json" has a "db:seed" script
    When I run "npm run db:seed"
    Then the artists table should contain "Chic"
    And the tours table should contain "Spring Groove Tour 2026"
    And the gigs table should contain 5 rows across different US cities
    And the bookings table should contain 1 flight and 1 hotel booking
    And the riders table should contain 1 draft rider

  Scenario: Dashboard page displays real data from Supabase
    Given the user is logged in
    When they navigate to the dashboard
    Then the page should display the artist name "Chic"
    And the page should display the tour name "Spring Groove Tour 2026"
    And the page should show a summary of upcoming gigs

  # Visual Verification for Issue 2:
  #   - Log in → Dashboard loads
  #   - Dashboard shows "Chic" as the artist
  #   - Dashboard shows "Spring Groove Tour 2026"
  #   - Dashboard shows gig count or upcoming gig list

  # ── Issue 3 — App Shell + Deploy: Sidebar, all pages, Vercel live ──────

  Scenario: App shell has a sidebar built with shadcn/ui
    Given the file "components/sidebar.tsx" exists
    Then the sidebar should use shadcn/ui components
    And it should contain navigation links for:
      | label      |
      | Dashboard  |
      | Tours      |
      | Riders     |
      | Settings   |

  Scenario: All pages are wired to Supabase data
    Then the following page files should exist:
      | path                          |
      | app/(dashboard)/page.tsx      |
      | app/(dashboard)/tours/page.tsx   |
      | app/(dashboard)/riders/page.tsx  |
      | app/(dashboard)/settings/page.tsx |
    And each page should fetch data from Supabase using server components or API routes

  Scenario: App is deployed and live on Vercel
    Given the project is connected to Vercel
    And environment variables are configured in Vercel project settings:
      | variable                       |
      | NEXT_PUBLIC_SUPABASE_URL       |
      | NEXT_PUBLIC_SUPABASE_ANON_KEY  |
      | DATABASE_URL                   |
    When a push is made to the main branch
    Then the app should be deployed and accessible at the Vercel URL
    And the login page should load without errors

  Scenario: Protected routes require authentication
    Given a user is not logged in
    When they navigate to any dashboard page
    Then they should be redirected to the login page

  # Visual Verification for Issue 3:
  #   - Open the Vercel URL → login page loads
  #   - Log in → dashboard with sidebar appears
  #   - Click "Tours" in sidebar → Tours page shows tour data
  #   - Click "Riders" in sidebar → Riders page shows rider data
  #   - Sidebar highlights the active page
