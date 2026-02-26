Feature: Database schema with Drizzle ORM, migrations, and seed data
  As a developer contributing to virtual-agent
  I want a complete data model using Drizzle ORM with SQLite, migration tooling, and seed data
  So that API routes can read and write to real tables from day one

  # ── AC #1 — Schema: Artist table ─────────────────────────────────────

  Scenario: Artist table has all required columns
    Given the schema file "apps/api/src/db/schema/" defines an "artists" table
    Then the table should have the following columns:
      | column          | type     |
      | id              | uuid     |
      | name            | text     |
      | email           | text     |
      | preferences     | json     |
      | rider_template  | text     |
      | created_at      | datetime |
      | updated_at      | datetime |

  # ── AC #2 — Schema: Tour table ───────────────────────────────────────

  Scenario: Tour table has all required columns
    Given the schema file "apps/api/src/db/schema/" defines a "tours" table
    Then the table should have the following columns:
      | column     | type     |
      | id         | uuid     |
      | artist_id  | uuid     |
      | name       | text     |
      | start_date | date     |
      | end_date   | date     |
      | budget     | decimal  |
      | status     | enum     |
      | created_at | datetime |
      | updated_at | datetime |

  Scenario: Tour status column only allows valid enum values
    Given the "tours" table has a "status" column
    Then it should only allow the values "planning", "confirmed", "in_progress", and "completed"

  Scenario: Tour has a foreign key to Artist
    Given the "tours" table has an "artist_id" column
    Then it should be a foreign key referencing the "artists" table "id" column

  # ── AC #3 — Schema: Gig table ────────────────────────────────────────

  Scenario: Gig table has all required columns
    Given the schema file "apps/api/src/db/schema/" defines a "gigs" table
    Then the table should have the following columns:
      | column         | type     |
      | id             | uuid     |
      | tour_id        | uuid     |
      | venue_name     | text     |
      | city           | text     |
      | state          | text     |
      | date           | date     |
      | promoter_name  | text     |
      | promoter_email | text     |
      | fee            | decimal  |
      | rider_status   | enum     |
      | created_at     | datetime |
      | updated_at     | datetime |

  Scenario: Gig rider_status column only allows valid enum values
    Given the "gigs" table has a "rider_status" column
    Then it should only allow the values "draft", "sent", and "signed"

  Scenario: Gig has a foreign key to Tour
    Given the "gigs" table has a "tour_id" column
    Then it should be a foreign key referencing the "tours" table "id" column

  # ── AC #4 — Schema: Booking table ────────────────────────────────────

  Scenario: Booking table has all required columns
    Given the schema file "apps/api/src/db/schema/" defines a "bookings" table
    Then the table should have the following columns:
      | column              | type     |
      | id                  | uuid     |
      | gig_id              | uuid     |
      | type                | enum     |
      | provider            | text     |
      | confirmation_number | text     |
      | cost                | decimal  |
      | check_in            | datetime |
      | check_out           | datetime |
      | details             | json     |
      | created_at          | datetime |

  Scenario: Booking type column only allows valid enum values
    Given the "bookings" table has a "type" column
    Then it should only allow the values "flight" and "hotel"

  Scenario: Booking has a foreign key to Gig
    Given the "bookings" table has a "gig_id" column
    Then it should be a foreign key referencing the "gigs" table "id" column

  # ── AC #5 — Schema: Rider table ──────────────────────────────────────

  Scenario: Rider table has all required columns
    Given the schema file "apps/api/src/db/schema/" defines a "riders" table
    Then the table should have the following columns:
      | column     | type     |
      | id         | uuid     |
      | gig_id     | uuid     |
      | content    | json     |
      | pdf_url    | text     |
      | status     | enum     |
      | created_at | datetime |
      | updated_at | datetime |

  Scenario: Rider status column only allows valid enum values
    Given the "riders" table has a "status" column
    Then it should only allow the values "draft", "sent", and "signed"

  Scenario: Rider has a unique foreign key to Gig
    Given the "riders" table has a "gig_id" column
    Then it should be a foreign key referencing the "gigs" table "id" column
    And it should have a unique constraint

  # ── AC #6 — Schema: Cascade deletes ──────────────────────────────────

  Scenario: Deleting a tour cascades to its gigs
    Given a tour exists with associated gigs
    When the tour is deleted
    Then all its gigs should also be deleted

  Scenario: Deleting a gig cascades to its bookings and rider
    Given a gig exists with associated bookings and a rider
    When the gig is deleted
    Then all its bookings should also be deleted
    And its rider should also be deleted

  # ── AC #7 — Tooling: Drizzle ORM + drizzle-kit installed and configured

  Scenario: Drizzle ORM and drizzle-kit are installed
    Given the file "apps/api/package.json" exists
    Then it should list "drizzle-orm" as a dependency
    And it should list "drizzle-kit" as a dev dependency

  Scenario: Drizzle config file exists and targets SQLite
    Given the file "apps/api/drizzle.config.ts" exists
    Then it should reference the schema directory "apps/api/src/db/schema"
    And it should configure SQLite as the dialect

  # ── AC #8 — db:generate creates SQL migration files ──────────────────

  Scenario: db:generate script creates migration files from schema changes
    Given "apps/api/package.json" has a "db:generate" script
    When I run "bun run db:generate" from "apps/api"
    Then SQL migration files should be generated

  # ── AC #9 — db:migrate applies pending migrations ────────────────────

  Scenario: db:migrate script applies pending migrations
    Given "apps/api/package.json" has a "db:migrate" script
    When I run "bun run db:migrate" from "apps/api"
    Then pending migrations should be applied to the SQLite database

  # ── AC #10 — db:studio launches Drizzle Studio ───────────────────────

  Scenario: db:studio script launches Drizzle Studio
    Given "apps/api/package.json" has a "db:studio" script
    Then the script should invoke "drizzle-kit studio"

  # ── AC #11 — db:seed populates sample data ───────────────────────────

  Scenario: db:seed script populates sample data
    Given "apps/api/package.json" has a "db:seed" script
    When I run "bun run db:seed" from "apps/api"
    Then the database should be populated with sample data

  # ── AC #12 — SQLite database at apps/api/local.db (gitignored) ───────

  Scenario: SQLite database file is gitignored
    Given the file ".gitignore" exists at the repo root
    Then it should ignore "*.db" files
    And the file "apps/api/local.db" should not be tracked by git

  # ── AC #13 — Seed: 1 sample artist (Chic) ───────────────────────────

  Scenario: Seed script file exists at the expected location
    Given the file "apps/api/src/db/seed.ts" exists
    Then it should export or execute a seed function

  Scenario: Seed creates one sample artist named Chic
    When the seed script has run
    Then the "artists" table should contain exactly 1 row
    And the artist name should be "Chic"

  # ── AC #14 — Seed: 1 tour with 5 gigs across different US cities ────

  Scenario: Seed creates one tour with five gigs across different US cities
    When the seed script has run
    Then the "tours" table should contain exactly 1 row
    And the "gigs" table should contain exactly 5 rows
    And the gigs should span different US cities

  # ── AC #15 — Seed: Realistic dates (2-3 weeks spread) ───────────────

  Scenario: Seed gigs have realistic dates spread across 2-3 weeks
    When the seed script has run
    Then the gig dates should span at least 14 days
    And the gig dates should span no more than 21 days

  # ── AC #16 — Seed: 2 sample bookings (1 flight, 1 hotel) on first gig

  Scenario: Seed creates sample bookings for the first gig
    When the seed script has run
    Then the "bookings" table should contain exactly 2 rows
    And one booking should have type "flight"
    And one booking should have type "hotel"
    And both bookings should reference the first gig

  # ── AC #17 — Seed: 1 sample rider in draft status with hospitality/tech

  Scenario: Seed creates a draft rider with hospitality and technical sections
    When the seed script has run
    Then the "riders" table should contain exactly 1 row
    And the rider status should be "draft"
    And the rider content should include a "hospitality" section
    And the rider content should include a "technical" section

  # ── AC #18 — Database client exported from apps/api/src/db/index.ts ─

  Scenario: Drizzle client is exported from the db module
    Given the file "apps/api/src/db/index.ts" exists
    Then it should export a Drizzle client instance

  # ── AC #19 — Connection uses DATABASE_URL with fallback to ./local.db

  Scenario: Database connection uses DATABASE_URL with a local fallback
    Given the file "apps/api/src/db/index.ts" exists
    Then it should reference the "DATABASE_URL" environment variable
    And it should fall back to "./local.db" when DATABASE_URL is not set

  # ── AC #20 — Type-safe query helpers exported for route handlers ─────

  Scenario: Type-safe query helpers are exported for route handlers
    Given the file "apps/api/src/db/index.ts" exists
    Then it should export typed query helpers or the schema for use in route handlers
