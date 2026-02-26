Feature: Update tests for dynamic port assignment and portless URLs
  As a developer contributing to virtual-agent
  I want the test suite to validate dynamic port assignment instead of hardcoded ports
  So that tests remain correct after the switch from fixed ports to portless

  # ── AC #1 — app.test.ts asserts dynamic port (typeof number, > 0) ───────

  Scenario: API app test asserts port is a number
    Given the file "apps/api/src/__tests__/app.test.ts" exists
    Then it should assert that the port type is "number" using `typeof`

  Scenario: API app test asserts port is greater than zero
    Given the file "apps/api/src/__tests__/app.test.ts" exists
    Then it should assert that the port is greater than 0

  Scenario: API app test does not assert a specific port number
    Given the file "apps/api/src/__tests__/app.test.ts" exists
    Then it should not contain "toBe(4000)"
    And it should not contain "toBe(3000)"

  # ── AC #2 — cors.test.ts uses portless URL as default frontend constant ──

  Scenario: CORS test defines the default frontend URL constant
    Given the file "apps/api/src/__tests__/cors.test.ts" exists
    Then it should define a constant set to "http://virtual-agent.localhost:1355"

  Scenario: CORS test validates Access-Control-Allow-Origin against the portless URL
    Given the file "apps/api/src/__tests__/cors.test.ts" exists
    Then it should assert the "access-control-allow-origin" header equals "http://virtual-agent.localhost:1355"

  # ── AC #3 — monorepo-structure.test.ts checks for portless (not 3000) ───

  Scenario: Monorepo structure test asserts web dev script contains portless
    Given the file "tests/monorepo-structure.test.ts" exists
    Then it should assert that the web app dev script contains "portless"

  Scenario: Monorepo structure test does not check for port 3000 in web dev script
    Given the file "tests/monorepo-structure.test.ts" exists
    Then the web dev script assertion should not reference "3000"

  # ── AC #4 — All tests pass ──────────────────────────────────────────────

  Scenario: Full test suite passes
    Given all project dependencies are installed
    When I run "bun test" from the repo root
    Then the command should exit with code 0

  # ── AC #5 — No test references to hardcoded ports 3000 or 4000 ──────────

  Scenario: No test file references hardcoded port 3000
    Given the file "apps/api/src/__tests__/app.test.ts" exists
    And the file "apps/api/src/__tests__/cors.test.ts" exists
    And the file "tests/monorepo-structure.test.ts" exists
    Then none of these test files should contain the string "3000"

  Scenario: No test file references hardcoded port 4000
    Given the file "apps/api/src/__tests__/app.test.ts" exists
    And the file "apps/api/src/__tests__/cors.test.ts" exists
    And the file "tests/monorepo-structure.test.ts" exists
    Then none of these test files should contain the string "4000"
