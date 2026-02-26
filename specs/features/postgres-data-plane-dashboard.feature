Feature: Postgres Data Plane & Dashboard Data — Drizzle schemas, migrations, seed, and dashboard reads
  As a developer contributing to virtual-agent
  I want Drizzle pgTable schemas for all 5 domain entities, runnable migrations, a seed script, and a dashboard that reads from Supabase Postgres
  So that the app has a complete data plane backed by Supabase Postgres from day one

  # ── AC #1 — Migrations generate cleanly ──────────────────────────────

  Scenario: Drizzle config file targets Postgres with correct schema and output paths
    Given the file "drizzle.config.ts" exists at the project root
    Then it should set the schema source to "./db/schema"
    And it should set the dialect to "postgresql"
    And it should set the migrations output directory to "./db/migrations"
    And it should read database credentials from the "DATABASE_URL" environment variable

  Scenario: drizzle-kit generate produces SQL migration files for all 5 tables
    When I run "npx drizzle-kit generate"
    Then SQL migration files should be created in the "db/migrations/" directory
    And the migration SQL should include CREATE TABLE statements for "artists", "tours", "gigs", "bookings", and "riders"

  Scenario: Generated migrations define pgEnum types for status and type columns
    Given migration files have been generated
    Then the migration SQL should define a "tour_status" enum with values "planning", "confirmed", "in_progress", "completed"
    And the migration SQL should define a "rider_status" enum with values "draft", "sent", "signed"
    And the migration SQL should define a "booking_type" enum with values "flight", "hotel"
    And the migration SQL should define a "rider_doc_status" enum with values "draft", "sent", "signed"

  Scenario: Generated migrations define foreign keys with ON DELETE CASCADE
    Given migration files have been generated
    Then the "tours" table should have a foreign key from "artist_id" to "artists"."id" with ON DELETE CASCADE
    And the "gigs" table should have a foreign key from "tour_id" to "tours"."id" with ON DELETE CASCADE
    And the "bookings" table should have a foreign key from "gig_id" to "gigs"."id" with ON DELETE CASCADE
    And the "riders" table should have a foreign key from "gig_id" to "gigs"."id" with ON DELETE CASCADE

  # ── AC #2 — Migrations apply successfully ────────────────────────────

  Scenario: npm run db:migrate applies migrations to Supabase Postgres without errors
    Given a valid "DATABASE_URL" is configured for Supabase Postgres
    When I run "npm run db:migrate"
    Then the command should exit with code 0
    And the following tables should exist in the database: "artists", "tours", "gigs", "bookings", "riders"

  # ── AC #3 — Seed script populates data ───────────────────────────────

  Scenario: Seed script file exists and is executable via npm
    Given the file "db/seed.ts" exists
    And "package.json" defines a "db:seed" script as "npx tsx db/seed.ts"
    Then the seed script should export or execute a seed function

  Scenario: npm run db:seed inserts the artist "Chic"
    Given migrations have been applied successfully
    When I run "npm run db:seed"
    Then the "artists" table should contain at least 1 row
    And one artist row should have name "Chic" and email "chic@example.com"

  Scenario: Seed creates one tour linked to the artist "Chic"
    Given the seed script has run
    Then the "tours" table should contain at least 1 row
    And the tour "Spring Groove Tour 2026" should reference the "Chic" artist via "artist_id"
    And the tour should have status "planning"

  Scenario: Seed creates at least 5 gigs across different US cities
    Given the seed script has run
    Then the "gigs" table should contain at least 5 rows
    And the gigs should include cities "New York", "Chicago", "Austin", "Los Angeles", and "Miami"
    And each gig should have a "venue_name", "city", "date", and "rider_status"

  Scenario: Seed creates at least 2 bookings linked to a gig
    Given the seed script has run
    Then the "bookings" table should contain at least 2 rows
    And one booking should have type "flight"
    And one booking should have type "hotel"
    And both bookings should reference the same gig

  Scenario: Seed creates one rider with hospitality and technical content as JSON
    Given the seed script has run
    Then the "riders" table should contain at least 1 row
    And the rider should have status "draft"
    And the rider "content" column should be JSONB containing a "hospitality" key
    And the rider "content" column should be JSONB containing a "technical" key

  # ── AC #4 — Dashboard displays seeded data ───────────────────────────

  Scenario: Dashboard shows seeded artist name "Chic" after login
    Given the seed script has run
    And the user is authenticated with a valid Supabase session
    When the user navigates to "/dashboard"
    Then the page should display the artist name "Chic"

  Scenario: Dashboard shows seeded tour name
    Given the seed script has run
    And the user is authenticated and on the "/dashboard" page
    Then the page should display the tour name "Spring Groove Tour 2026"

  Scenario: Dashboard shows gigs summary with cities and dates
    Given the seed script has run
    And the user is authenticated and on the "/dashboard" page
    Then the page should display a gigs count or list of upcoming gigs
    And the gigs data should include cities and dates from seeded data

  Scenario: Dashboard shows booking information
    Given the seed script has run
    And the user is authenticated and on the "/dashboard" page
    Then the page should display booking data sourced from the "bookings" table

  Scenario: Dashboard data is sourced from Supabase Postgres via Drizzle, not hardcoded
    Given the seed script has run
    And the user is authenticated and on the "/dashboard" page
    Then the displayed artist, tour, and gigs data should match the rows inserted by "npm run db:seed"
    And the dashboard page should fetch data in a Server Component or Server Action using the Drizzle client from "db/index.ts"

  # ── AC #5 — Database connection works in dev ─────────────────────────

  Scenario: Database client module creates a Drizzle client using DATABASE_URL
    Given the file "db/index.ts" exists
    Then it should import "drizzle" from "drizzle-orm/postgres-js"
    And it should import "postgres" from "postgres"
    And it should throw an error if "DATABASE_URL" is not set
    And it should export a "db" instance created with the postgres driver and schema

  Scenario: Dev server starts and connects to Supabase Postgres without errors
    Given a valid "DATABASE_URL" is configured in ".env.local"
    When I run "npm run dev"
    Then the dev server should start without database connection errors in the console
    And navigating to "http://localhost:3000/dashboard" (while authenticated) should render without error

  # ── AC #6 — Schema matches domain model ──────────────────────────────

  Scenario: Artists table schema has expected columns
    Given the schema file "db/schema/artists.ts" defines an "artists" table using pgTable
    Then the table should have at minimum the following columns:
      | column         | type      |
      | id             | uuid      |
      | name           | text      |
      | email          | text      |
      | preferences    | jsonb     |
      | rider_template | text      |
      | created_at     | timestamp |
      | updated_at     | timestamp |

  Scenario: Tours table schema has expected columns and tour_status enum
    Given the schema file "db/schema/tours.ts" defines a "tours" table using pgTable
    Then the table should have at minimum the following columns:
      | column     | type          |
      | id         | uuid          |
      | artist_id  | uuid          |
      | name       | text          |
      | start_date | date          |
      | end_date   | date          |
      | budget     | numeric       |
      | status     | tour_status   |
      | created_at | timestamp     |
      | updated_at | timestamp     |
    And "tour_status" should only allow values "planning", "confirmed", "in_progress", "completed"
    And "artist_id" should reference "artists"."id" with onDelete cascade

  Scenario: Gigs table schema has expected columns including venue, city, date, and status
    Given the schema file "db/schema/gigs.ts" defines a "gigs" table using pgTable
    Then the table should have at minimum the following columns:
      | column         | type          |
      | id             | uuid          |
      | tour_id        | uuid          |
      | venue_name     | text          |
      | city           | text          |
      | state          | text          |
      | date           | date          |
      | promoter_name  | text          |
      | promoter_email | text          |
      | fee            | numeric       |
      | rider_status   | rider_status  |
      | created_at     | timestamp     |
      | updated_at     | timestamp     |
    And "rider_status" should only allow values "draft", "sent", "signed"
    And "tour_id" should reference "tours"."id" with onDelete cascade

  Scenario: Bookings table schema has expected columns and booking_type enum
    Given the schema file "db/schema/bookings.ts" defines a "bookings" table using pgTable
    Then the table should have at minimum the following columns:
      | column              | type          |
      | id                  | uuid          |
      | gig_id              | uuid          |
      | type                | booking_type  |
      | provider            | text          |
      | confirmation_number | text          |
      | cost                | numeric       |
      | check_in            | timestamp     |
      | check_out           | timestamp     |
      | details             | jsonb         |
      | created_at          | timestamp     |
    And "booking_type" should only allow values "flight", "hotel"
    And "gig_id" should reference "gigs"."id" with onDelete cascade

  Scenario: Riders table schema has content as JSONB and rider_doc_status enum
    Given the schema file "db/schema/riders.ts" defines a "riders" table using pgTable
    Then the table should have at minimum the following columns:
      | column     | type              |
      | id         | uuid              |
      | gig_id     | uuid              |
      | content    | jsonb             |
      | pdf_url    | text              |
      | status     | rider_doc_status  |
      | created_at | timestamp         |
      | updated_at | timestamp         |
    And "rider_doc_status" should only allow values "draft", "sent", "signed"
    And "gig_id" should reference "gigs"."id" with onDelete cascade
    And "gig_id" should have a unique index

  Scenario: Cascade deletes propagate through the full entity hierarchy
    Given all 5 schema files exist in "db/schema/" with cascade delete foreign keys
    Then deleting an artist should cascade-delete their tours, gigs, bookings, and riders
    And deleting a tour should cascade-delete its gigs, bookings, and riders
    And deleting a gig should cascade-delete its bookings and rider

  # ── Environment & Configuration ──────────────────────────────────────

  Scenario: DATABASE_URL is documented in environment example files
    Given the file ".env.example" exists at the project root
    Then it should contain a "DATABASE_URL" variable
    And the value should be empty or a placeholder, not a real secret

  # ── Security ─────────────────────────────────────────────────────────

  Scenario: All database queries run server-side only
    Given the dashboard page queries Supabase Postgres via the Drizzle client
    Then the "db/index.ts" module should not include a "use client" directive
    And the dashboard page component should be a Server Component (no "use client" directive)
    And "DATABASE_URL" should never appear in client-side JavaScript bundles

  # ── Visual Verification ──────────────────────────────────────────────

  Scenario: End-to-end visual verification of seeded data on dashboard
    Given the dev server is running
    And "npm run db:migrate" and "npm run db:seed" have completed successfully
    When the user navigates to "http://localhost:3000/login"
    And the user signs in with valid credentials
    Then the browser redirects to "/dashboard"
    And the dashboard displays the artist name "Chic"
    And the dashboard displays the tour name "Spring Groove Tour 2026"
    And the dashboard displays a gigs summary including cities and dates from the seed data
    And the data visible on the dashboard matches the rows in Supabase Postgres
