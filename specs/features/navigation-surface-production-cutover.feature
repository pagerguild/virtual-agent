Feature: Navigation Surface & Production Cutover — Sidebar, pages, Vercel deploy, and legacy cleanup
  As a developer contributing to virtual-agent
  I want a persistent sidebar with active-page state, functional Tours/Riders/Settings pages reading from Supabase Postgres, a clean Vercel deployment, and legacy monorepo artifacts removed
  So that the app has a complete user-facing dashboard navigation surface and is production-ready on Vercel

  # ── AC #1 — Sidebar renders on all dashboard routes ─────────────────

  Scenario: Sidebar is present on the dashboard overview page
    Given the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard"
    Then a persistent sidebar should be visible
    And the sidebar should contain links to "Dashboard", "Tours", "Riders", and "Settings"

  Scenario: Sidebar is present on the tours page
    Given the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard/tours"
    Then a persistent sidebar should be visible
    And the sidebar should contain links to "Dashboard", "Tours", "Riders", and "Settings"

  Scenario: Sidebar is present on the riders page
    Given the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard/riders"
    Then a persistent sidebar should be visible
    And the sidebar should contain links to "Dashboard", "Tours", "Riders", and "Settings"

  Scenario: Sidebar is present on the settings page
    Given the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard/settings"
    Then a persistent sidebar should be visible
    And the sidebar should contain links to "Dashboard", "Tours", "Riders", and "Settings"

  # ── AC #2 — Active page state visible ───────────────────────────────

  Scenario: Dashboard link shows active state on the dashboard overview page
    Given the user is authenticated and on the "/dashboard" page
    Then the "Dashboard" sidebar link should be visually distinguished as active
    And the "Tours", "Riders", and "Settings" sidebar links should appear inactive

  Scenario: Tours link shows active state on the tours page
    Given the user is authenticated and on the "/dashboard/tours" page
    Then the "Tours" sidebar link should be visually distinguished as active
    And the "Dashboard", "Riders", and "Settings" sidebar links should appear inactive

  Scenario: Riders link shows active state on the riders page
    Given the user is authenticated and on the "/dashboard/riders" page
    Then the "Riders" sidebar link should be visually distinguished as active
    And the "Dashboard", "Tours", and "Settings" sidebar links should appear inactive

  Scenario: Settings link shows active state on the settings page
    Given the user is authenticated and on the "/dashboard/settings" page
    Then the "Settings" sidebar link should be visually distinguished as active
    And the "Dashboard", "Tours", and "Riders" sidebar links should appear inactive

  # ── AC #3 — Tours page displays data ───────────────────────────────

  Scenario: Tours page renders tour names from Supabase Postgres
    Given the seed script has run
    And the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard/tours"
    Then the page should display at least one tour name
    And the tour "Spring Groove Tour 2026" should be visible

  Scenario: Tours page shows associated gig information
    Given the seed script has run
    And the user is authenticated and on the "/dashboard/tours" page
    Then the page should display gig information associated with tours
    And the gig information should include cities, dates, or gig counts sourced from Supabase Postgres

  # ── AC #4 — Riders page displays data ──────────────────────────────

  Scenario: Riders page renders rider hospitality items from Supabase Postgres
    Given the seed script has run
    And the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard/riders"
    Then the page should display rider hospitality items sourced from Supabase Postgres
    And the rider data should include content from the JSONB "content" column

  # ── AC #5 — Settings page renders ──────────────────────────────────

  Scenario: Settings page displays the authenticated user's email
    Given the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard/settings"
    Then the page should display the authenticated user's email address from the Supabase Auth session

  Scenario: Settings page renders a settings shell
    Given the user is authenticated and on the "/dashboard/settings" page
    Then the page should render a settings shell layout
    And the page should serve as a placeholder for future settings functionality

  # ── AC #6 — Vercel production URL loads ────────────────────────────

  Scenario: Vercel production URL loads without errors
    Given the app has been deployed to Vercel with all environment variables configured
    When the user opens the Vercel production URL
    Then the page should load without 500 errors or build failures
    And the login page should be accessible

  Scenario: Vercel environment variables are configured
    Given the Vercel project settings
    Then the following environment variables should be set:
      | variable                       |
      | NEXT_PUBLIC_SUPABASE_URL       |
      | NEXT_PUBLIC_SUPABASE_ANON_KEY  |
      | DATABASE_URL                   |

  # ── AC #7 — Production login works ────────────────────────────────

  Scenario: User can log in at the Vercel production URL
    Given a user with valid credentials
    And the app is deployed to Vercel
    When the user navigates to the production login page
    And the user enters valid email and password and submits the form
    Then the user should be redirected to "/dashboard"
    And the user should have an active Supabase session

  # ── AC #8 — Protected routes work in production ───────────────────

  Scenario: Unauthenticated user is redirected from dashboard on production
    Given the app is deployed to Vercel
    And the user is not authenticated
    When the user navigates to "/dashboard" on the production URL
    Then the browser should redirect to "/login"

  # ── AC #9 — Legacy apps/ directory removed ─────────────────────────

  Scenario: The apps/ directory no longer exists in the repository
    Then the directory "apps/" should not exist in the project root

  Scenario: No source files reference the legacy apps/ directory
    Then no source file in the project should contain import paths referencing "apps/api/" or "apps/web/"

  Scenario: Legacy monorepo configuration is removed
    Then the file "turbo.json" should not exist in the project root
    And "package.json" should not contain workspace configuration referencing "apps/*"

  # ── AC #10 — Tests pass ────────────────────────────────────────────

  Scenario: npm test passes with no legacy references
    When I run "npm test"
    Then the command should exit with code 0
    And no test file should reference "apps/api/" paths or old monorepo structure

  # ── AC #11 — README is accurate ────────────────────────────────────

  Scenario: README project structure matches actual single-app architecture
    Given the file "README.md" exists at the project root
    Then the project structure section should match the actual directory layout
    And the README should not reference "SQLite", "Bun monorepo", "turbo", "apps/api", or "apps/web"

  Scenario: README getting-started steps are accurate for Supabase and Vercel
    Given the file "README.md" exists at the project root
    Then the getting-started steps should reference Supabase and Vercel configuration
    And the deployment instructions should describe Vercel deployment with required environment variables

  # ── Visual Verification ────────────────────────────────────────────

  Scenario: End-to-end visual verification of production deployment and navigation
    Given the app is deployed to Vercel and accessible at the production URL
    When the user opens the Vercel production URL
    Then the login page loads without errors

    When the user enters valid credentials and submits the login form
    Then the browser redirects to "/dashboard" with the dashboard overview visible

    When the user observes the sidebar
    Then the sidebar is visible with links: Dashboard, Tours, Riders, Settings

    When the user clicks "Tours" in the sidebar
    Then the URL changes to "/dashboard/tours"
    And the "Tours" sidebar link shows active state
    And tour and gig data is rendered on the page

    When the user clicks "Riders" in the sidebar
    Then the URL changes to "/dashboard/riders"
    And the "Riders" sidebar link shows active state
    And rider hospitality items are rendered on the page

    When the user clicks "Settings" in the sidebar
    Then the URL changes to "/dashboard/settings"
    And the "Settings" sidebar link shows active state
    And the user's email is displayed on the page

    When the user clicks "Dashboard" in the sidebar
    Then the URL returns to "/dashboard"
    And the "Dashboard" sidebar link shows active state
    And the overview data is visible

    When the user clicks the sign-out button
    Then the browser redirects to "/login"
    When the user navigates to "/dashboard"
    Then the browser redirects back to "/login"
