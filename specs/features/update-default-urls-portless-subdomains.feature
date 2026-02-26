Feature: Update default URLs in application code to use portless subdomains
  As a developer contributing to virtual-agent
  I want the hardcoded fallback URLs to point to portless subdomain URLs
  So that the frontend and API can communicate out-of-the-box when running via portless

  # ── AC #1 — API CORS origin default uses portless subdomain ────────────

  Scenario: API CORS origin default is the portless web subdomain
    Given the file "apps/api/src/index.ts" exists
    Then the CORS origin fallback should be "http://virtual-agent.localhost:1355"

  # ── AC #2 — Web API base URL default uses portless subdomain ───────────

  Scenario: Web API base URL default is the portless API subdomain
    Given the file "apps/web/src/lib/api.ts" exists
    Then the API base URL fallback should be "http://api.virtual-agent.localhost:1355"

  # ── AC #3 — FRONTEND_URL env var override still works ──────────────────

  Scenario: process.env.FRONTEND_URL override still works in the API CORS config
    Given the file "apps/api/src/index.ts" exists
    Then the CORS origin should read from "process.env.FRONTEND_URL"
    And the CORS origin should fall back to "http://virtual-agent.localhost:1355" when the env var is not set

  # ── AC #4 — NEXT_PUBLIC_API_URL env var override still works ───────────

  Scenario: process.env.NEXT_PUBLIC_API_URL override still works in the web API client
    Given the file "apps/web/src/lib/api.ts" exists
    Then the API base URL should read from "process.env.NEXT_PUBLIC_API_URL"
    And the API base URL should fall back to "http://api.virtual-agent.localhost:1355" when the env var is not set

  # ── AC #5 — No references to old localhost ports in application code ───

  Scenario: No references to localhost:3000 remain in application source code
    Given the directory "apps" exists
    Then no file under "apps" should contain the string "localhost:3000"

  Scenario: No references to localhost:4000 remain in application source code
    Given the directory "apps" exists
    Then no file under "apps" should contain the string "localhost:4000"

  # ── AC #6 — Web app can call the API health endpoint via portless ──────

  Scenario: Web app can successfully call the API health endpoint when both run via portless
    Given both apps are running via "bun run dev" from the repo root
    When the web app makes a request to the API health endpoint at "http://api.virtual-agent.localhost:1355/health"
    Then the response status should be 200
    And the response body should contain '{"status":"ok"}'
