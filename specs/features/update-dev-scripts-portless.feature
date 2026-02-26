Feature: Update dev scripts in apps to use portless for port assignment
  As a developer contributing to virtual-agent
  I want the dev scripts in apps/web and apps/api to run through portless
  So that each app gets an auto-assigned port with a stable *.localhost:1355 subdomain

  # ── AC #1 — Web dev script uses portless ─────────────────────────────

  Scenario: apps/web dev script runs through portless without a hardcoded port
    Given the file "apps/web/package.json" exists
    Then its "scripts.dev" field should be "portless virtual-agent -- next dev"
    And the "scripts.dev" field should not contain "--port"

  # ── AC #2 — API dev script uses portless ─────────────────────────────

  Scenario: apps/api dev script runs through portless
    Given the file "apps/api/package.json" exists
    Then its "scripts.dev" field should be "portless api.virtual-agent -- bun run --hot src/index.ts"

  # ── AC #3 — Root dev script starts both apps ─────────────────────────

  Scenario: Running bun run dev from the root starts both apps on auto-assigned ports
    Given the root "package.json" has a "dev" script
    When I run "bun run dev" from the repo root
    Then both the web and api apps should start successfully
    And each app should receive an auto-assigned port via the PORT environment variable

  # ── AC #4 — Web app accessible at stable portless URL ────────────────

  Scenario: Web app is accessible at its portless subdomain
    Given both apps are running via "bun run dev" from the repo root
    When I send a GET request to "http://virtual-agent.localhost:1355"
    Then the response status should be 200

  # ── AC #5 — API app accessible at stable portless URL ────────────────

  Scenario: API app is accessible at its portless subdomain
    Given both apps are running via "bun run dev" from the repo root
    When I send a GET request to "http://api.virtual-agent.localhost:1355/health"
    Then the response status should be 200

  # ── AC #6 — No hardcoded port numbers remain in dev scripts ──────────

  Scenario: No hardcoded port numbers remain in apps/web dev script
    Given the file "apps/web/package.json" exists
    Then its "scripts.dev" field should not contain "3000"
    And its "scripts.dev" field should not contain "4000"

  Scenario: No hardcoded port numbers remain in apps/api dev script
    Given the file "apps/api/package.json" exists
    Then its "scripts.dev" field should not contain "3000"
    And its "scripts.dev" field should not contain "4000"
