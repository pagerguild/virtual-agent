Feature: Install portless and add root dev:portless script
  As a developer contributing to virtual-agent
  I want portless installed as a root devDependency with a convenience script
  So that all apps in the monorepo can use conflict-free local development networking

  # ── AC #1 — portless listed in root devDependencies ────────────────────

  Scenario: portless is listed as a root devDependency
    Given the file "package.json" exists at the repo root
    Then its "devDependencies" should include "portless" at version "^0.4.2" or later

  # ── AC #2 — Root dev:portless script exists ────────────────────────────

  Scenario: Root package.json has a dev:portless script
    Given the file "package.json" exists at the repo root
    Then its "scripts" should include a "dev:portless" entry
    And the "dev:portless" script should be set to "portless dev"

  # ── AC #3 — bun install succeeds after adding the dependency ───────────

  Scenario: bun install succeeds with no errors
    Given the file "package.json" exists at the repo root
    When I run "bun install" from the repo root
    Then the command should exit with code 0
    And "node_modules/portless" should exist

  # ── AC #4 — bunx portless --help works from the repo root ─────────────

  Scenario: bunx portless --help works from the repo root
    Given portless is installed in the repo
    When I run "bunx portless --help" from the repo root
    Then the command should exit with code 0
    And the output should include usage information for portless
