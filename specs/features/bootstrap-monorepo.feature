Feature: Bootstrap monorepo with Bun + Hono backend, Next.js frontend, and Doppler secrets
  As a developer contributing to virtual-agent
  I want a fully scaffolded monorepo with backend, frontend, and secrets management
  So that I can start building features on a working foundation

  # ── Monorepo structure ──────────────────────────────────────────────

  Scenario: Root package.json defines Bun workspaces
    Given the file "package.json" exists at the repo root
    Then it should contain a "workspaces" field set to ["apps/*"]
    And it should be marked as "private": true

  Scenario: Shared TypeScript strict configuration
    Given the file "tsconfig.base.json" exists at the repo root
    Then its compilerOptions should have "strict" set to true

  Scenario: Root .gitignore covers all expected patterns
    Given the file ".gitignore" exists at the repo root
    Then it should ignore "node_modules"
    And it should ignore ".env" files but not ".env.example"
    And it should ignore "dist/"
    And it should ignore ".next/"
    And it should ignore "*.db"

  # ── Backend (apps/api) ─────────────────────────────────────────────

  Scenario: Backend workspace exists with Hono dependency
    Given the directory "apps/api" exists
    Then "apps/api/package.json" should list "hono" as a dependency

  Scenario: Backend project structure follows conventions
    Given the directory "apps/api/src" exists
    Then the following paths should exist:
      | path                    |
      | apps/api/src/index.ts   |
      | apps/api/src/routes/    |
      | apps/api/src/services/  |
      | apps/api/src/db/        |
      | apps/api/src/lib/       |

  Scenario: Backend health endpoint returns OK
    Given the backend server is running on port 4000
    When I send a GET request to "/health"
    Then the response status should be 200
    And the response body should contain '{"status":"ok"}'

  Scenario: Backend starts with hot reload on port 4000
    Given "apps/api/package.json" has a "dev" script
    Then the dev script should include the "--hot" flag
    And the backend should listen on port 4000

  Scenario: Backend CORS allows the frontend origin
    Given the backend server is running
    When I send a request with Origin header "http://localhost:3000"
    Then the response should include an "Access-Control-Allow-Origin" header allowing that origin

  Scenario: Backend TypeScript config extends the root base
    Given the file "apps/api/tsconfig.json" exists
    Then its "extends" field should be "../../tsconfig.base.json"

  # ── Frontend (apps/web) ────────────────────────────────────────────

  Scenario: Frontend workspace exists with Next.js and React Query
    Given the directory "apps/web" exists
    Then "apps/web/package.json" should list "next" as a dependency
    And "apps/web/package.json" should list "react" as a dependency
    And "apps/web/package.json" should list "@tanstack/react-query" as a dependency

  Scenario: Frontend has Tailwind CSS configured
    Given the file "apps/web/package.json" exists
    Then it should list "tailwindcss" as a dev dependency
    And "apps/web/postcss.config.mjs" should reference "@tailwindcss/postcss"
    And "apps/web/src/app/globals.css" should import "tailwindcss"

  Scenario: Frontend uses Next.js App Router layout
    Given the file "apps/web/src/app/layout.tsx" exists
    Then it should render a "QueryProvider" wrapper
    And it should render a "Sidebar" component

  Scenario: React Query provider is wired up
    Given the file "apps/web/src/lib/query-provider.tsx" exists
    Then the layout should wrap children with the QueryProvider

  Scenario: Sidebar navigation contains all required links
    Given the file "apps/web/src/components/sidebar.tsx" exists
    Then the sidebar should contain navigation links for:
      | label      |
      | Dashboard  |
      | Tours      |
      | Riders     |
      | Settings   |

  Scenario: Placeholder pages exist for each nav item
    Then the following page files should exist:
      | path                                   |
      | apps/web/src/app/page.tsx              |
      | apps/web/src/app/tours/page.tsx        |
      | apps/web/src/app/riders/page.tsx       |
      | apps/web/src/app/settings/page.tsx     |

  Scenario: API client utility reads backend URL from environment
    Given the file "apps/web/src/lib/api.ts" exists
    Then it should reference the "NEXT_PUBLIC_API_URL" environment variable

  Scenario: Frontend starts on port 3000
    Given "apps/web/package.json" has a "dev" script
    Then the dev script should include "next dev"
    And the dev script should reference port 3000

  Scenario: Frontend TypeScript config extends the root base
    Given the file "apps/web/tsconfig.json" exists
    Then its "extends" field should be "../../tsconfig.base.json"

  # ── Doppler integration ────────────────────────────────────────────

  Scenario: Doppler config file points to the project
    Given the file "doppler.yaml" exists at the repo root
    Then it should reference the "virtual-agent" project
    And it should reference the "dev" config

  Scenario: Environment example file documents all required variables
    Given the file ".env.example" exists at the repo root
    Then it should contain the following environment variables:
      | variable            |
      | DATABASE_URL        |
      | AMADEUS_API_KEY     |
      | AMADEUS_API_SECRET  |
      | GOOGLE_MAPS_API_KEY |
      | RESEND_API_KEY      |
      | FRONTEND_URL        |
      | PORT                |
    And it should not contain any real secret values

  Scenario: README documents Doppler workflow
    Given the file "README.md" exists at the repo root
    Then it should contain the command "doppler run -- bun run dev"
    And it should include a "Project Structure" section
    And it should include an "Environment Variables" section

  # ── Dev experience ─────────────────────────────────────────────────

  Scenario: Root dev script starts both apps concurrently
    Given the root "package.json" has a "dev" script
    Then running "bun run dev" from the repo root should start both the backend and frontend

  Scenario: README includes setup instructions
    Given the file "README.md" exists at the repo root
    Then it should document prerequisites
    And it should document Doppler setup steps
    And it should document how to run locally
