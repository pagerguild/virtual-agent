Feature: Doppler Secrets Management — Centralize all environment variables in Doppler
  As a developer contributing to virtual-agent
  I want all environment variables managed through Doppler with per-environment configs (dev, preview, production)
  So that secrets are never stored in local files or manually duplicated across Vercel, and every environment pulls from a single source of truth

  # ── AC #1 — Doppler project and environments configured ─────────────

  Scenario: Doppler project exists with dev, preview, and production environments
    Given a Doppler account with access to the pagerguild workspace
    When the developer opens the Doppler dashboard
    Then a "virtual-agent" project should exist
    And it should have "dev", "stg" (preview), and "prd" (production) environment configs

  Scenario: All required secrets are populated in each environment
    Given the "virtual-agent" Doppler project is open
    When the developer views any environment config
    Then NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and DATABASE_URL should be set
    And AMADEUS_API_KEY, AMADEUS_API_SECRET, GOOGLE_MAPS_API_KEY, and RESEND_API_KEY should be present (values may be empty in dev)

  # ── AC #2 — Local development uses Doppler CLI ─────────────────────

  Scenario: Developer runs the app locally using Doppler-injected env vars
    Given the developer has the Doppler CLI installed and authenticated
    When the developer runs "doppler run -- npm run dev"
    Then the Next.js dev server should start on port 3000
    And the app should connect to Supabase and Postgres using Doppler-provided values
    And no .env.local file should be required

  Scenario: npm run dev script optionally wraps Doppler
    Given the developer opens package.json
    Then a "dev:doppler" script should exist that runs "doppler run -- next dev"
    And the existing "dev" script should remain unchanged for non-Doppler workflows

  # ── AC #3 — Vercel integration pulls secrets from Doppler ──────────

  Scenario: Vercel deployment uses Doppler-synced environment variables
    Given the Doppler-Vercel integration is configured for virtual-agent
    When a production deployment runs on Vercel
    Then Vercel should receive env vars from Doppler's "prd" config
    And no env vars should be manually set in the Vercel dashboard

  Scenario: Vercel preview deployments use Doppler preview config
    Given a PR triggers a Vercel preview deployment
    Then the preview build should receive env vars from Doppler's "stg" config

  # ── AC #4 — .env files updated to reference Doppler ────────────────

  Scenario: .env.example documents Doppler as the primary secrets source
    Given the developer opens .env.example
    Then a comment at the top should explain that Doppler is the primary source
    And the file should still list all variable names for reference
    And no real secret values should be present

  Scenario: .env.local.example references Doppler setup
    Given the developer opens .env.local.example
    Then it should note that .env.local is optional when using Doppler
    And it should link to the Doppler setup instructions in the README

  # ── AC #5 — README documents Doppler setup ─────────────────────────

  Scenario: README includes Doppler getting-started steps
    Given the developer opens README.md
    Then a "Secrets Management" section should exist
    And it should include steps: install Doppler CLI, authenticate, run with doppler run
    And it should mention the Vercel integration for deployments

  # ── AC #7 — Deployment section updated for Doppler ─────────────────

  Scenario: README "Deployment (Vercel)" section references Doppler sync
    Given the developer opens README.md
    When the developer navigates to the "Deployment (Vercel)" section
    Then the section should reference Doppler sync as the preferred method for providing env vars
    And the section should no longer describe only manual env var entry in the Vercel dashboard

  # ── AC #8 — Environment config reference in README ─────────────────

  Scenario: README includes environment config reference mapping Doppler configs to deployment targets
    Given the developer opens README.md
    Then the README should contain an environment config reference
    And it should map "dev" to local development
    And it should map "stg" to Vercel Preview deployments
    And it should map "prd" to Vercel Production deployments

  # ── AC #9 — Non-Doppler fallback preserved ─────────────────────────

  Scenario: Getting Started section preserves the non-Doppler .env.local workflow
    Given the developer opens README.md
    When the developer reads the Getting Started section
    Then it should document copying .env.local.example to .env.local as a fallback
    And a developer who does not use Doppler should be able to run the app with a manually populated .env.local

  # ── AC #6 — .env.local is not required and app still boots ─────────

  Scenario: App boots without .env.local when Doppler provides vars
    Given .env.local does not exist in the project root
    And the developer runs "doppler run -- npm run dev"
    Then the app should start without errors
    And the login page should render at /login
    And the page should display the "Virtual Agent" heading and an email/password form
