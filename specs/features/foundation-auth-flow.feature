Feature: Foundation & Auth Flow — Starter-aligned single-app baseline with Supabase auth
  As a developer contributing to virtual-agent
  I want a single Next.js App Router project aligned with the Vercel Supabase starter
  So that I have a working auth-gated app shell that all subsequent migration work builds on

  # ── AC #1 — Starter baseline established ───────────────────────────

  Scenario: Project structure aligns with the Vercel Supabase starter pattern
    Given the project root contains a single Next.js App Router application
    Then the root should contain "package.json", "next.config.ts", "tsconfig.json", and "tailwind.config.ts"
    And there should be no monorepo workspace or turbo configuration
    And the project structure should follow the Vercel Supabase starter conventions

  Scenario: Supabase browser client utility exists
    Given the file "lib/supabase/client.ts" exists
    Then it should create a Supabase client using "@supabase/ssr" for browser usage
    And it should reference "NEXT_PUBLIC_SUPABASE_URL" and "NEXT_PUBLIC_SUPABASE_ANON_KEY"

  Scenario: Supabase server client utility exists
    Given the file "lib/supabase/server.ts" exists
    Then it should create a Supabase client using "@supabase/ssr" for server-side usage
    And it should reference "NEXT_PUBLIC_SUPABASE_URL" and "NEXT_PUBLIC_SUPABASE_ANON_KEY"

  Scenario: Auth callback route follows starter conventions
    Given the file "app/auth/callback/route.ts" exists
    Then it should handle the Supabase auth callback exchange
    And it should redirect the user after successful authentication

  Scenario: Middleware protects dashboard routes
    Given the file "middleware.ts" exists at the project root
    Then it should intercept requests to "/dashboard" routes
    And it should redirect unauthenticated users to "/login"
    And it should allow authenticated users to proceed

  Scenario: Environment variable example file documents required Supabase variables
    Given the file ".env.local.example" exists at the project root
    Then it should contain the following environment variables:
      | variable                       |
      | NEXT_PUBLIC_SUPABASE_URL       |
      | NEXT_PUBLIC_SUPABASE_ANON_KEY  |
    And it should not contain any real secret values

  # ── AC #2 — Signup works ───────────────────────────────────────────

  Scenario: Signup page renders with email and password form
    Given the user navigates to "/signup"
    Then the page should display an email input field
    And the page should display a password input field
    And the page should display a submit button for signup

  Scenario: New user can sign up with email and password
    Given the user is on the "/signup" page
    When the user enters a new email and password and submits the form
    Then Supabase Auth should receive the signup request
    And the user should see a confirmation message or be redirected indicating successful account creation
    And a new user should exist in Supabase Auth

  # ── AC #3 — Login works ───────────────────────────────────────────

  Scenario: Login page renders with email and password form
    Given the user navigates to "/login"
    Then the page should display an email input field
    And the page should display a password input field
    And the page should display a submit button for login

  Scenario: Existing user can log in with valid credentials
    Given an existing user with valid credentials
    And the user is on the "/login" page
    When the user enters valid email and password and submits the form
    Then the user should be redirected to "/dashboard"
    And the user should have an active Supabase session

  # ── AC #4 — Auth-gated access enforced ─────────────────────────────

  Scenario: Unauthenticated user is redirected from dashboard to login
    Given the user is not authenticated
    When the user navigates to "/dashboard"
    Then the browser should redirect to "/login"

  Scenario: Authenticated user can access the dashboard
    Given the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard"
    Then the dashboard shell should render successfully
    And the user should not be redirected away

  # ── AC #5 — Sign-out works ────────────────────────────────────────

  Scenario: Sign-out button is visible on the dashboard
    Given the user is authenticated and on the "/dashboard" page
    Then a sign-out button or action should be visible

  Scenario: Clicking sign-out clears session and redirects to login
    Given the user is authenticated and on the "/dashboard" page
    When the user clicks the sign-out button
    Then the Supabase session should be cleared
    And the browser should redirect to "/login"

  Scenario: After sign-out, dashboard access is blocked
    Given the user has just signed out
    When the user navigates to "/dashboard"
    Then the browser should redirect to "/login"

  # ── AC #6 — Dev server starts cleanly ──────────────────────────────

  Scenario: Dev server starts without errors
    Given the project has all dependencies installed
    When I run "npm run dev"
    Then the dev server should start without errors
    And the app should be served on localhost

  Scenario: App builds successfully
    Given the project has all dependencies installed
    When I run "npm run build"
    Then the build should complete without errors

  # ── Visual Verification ────────────────────────────────────────────

  Scenario: Starter landing behavior loads correctly
    When the user opens "http://localhost:3000"
    Then the app should load with starter-derived auth landing behavior
    And the user should see a login page or be redirected to one

  Scenario: Visual verification of full auth round-trip
    Given the dev server is running
    When the user navigates to "/dashboard" while logged out
    Then the browser redirects to "/login"
    When the user goes to "/signup" and submits new credentials
    Then the user sees confirmation of successful account creation
    When the user goes to "/login" and submits valid credentials
    Then the browser redirects to "/dashboard" and the dashboard shell is visible
    When the user clicks the sign-out button
    Then the browser redirects to "/login"
    When the user navigates to "/dashboard" again
    Then the browser redirects back to "/login"
