Feature: Fix NEXT_PUBLIC_SUPABASE_ANON_KEY → PUBLISHABLE_KEY mismatch in .env.local and stale QA test
  As a developer contributing to virtual-agent
  I want .env.local and the QA spec to use the renamed NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY variable
  So that local development without Doppler works correctly and the QA pipeline does not produce false-negative failures

  # ── AC #1 — .env.local uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ─────

  Scenario: .env.local sets NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY instead of ANON_KEY
    Given the file ".env.local" exists at the repo root
    Then it should contain "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    And it should not contain "NEXT_PUBLIC_SUPABASE_ANON_KEY"

  # ── AC #2 — .env.local does not contain PORT=3000 ───────────────────

  Scenario: .env.local does not contain PORT=3000
    Given the file ".env.local" exists at the repo root
    Then it should not contain "PORT=3000"

  # ── AC #3 — QA spec expects NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ─────

  Scenario: gherkin.spec.ts expects NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in expectedVars
    Given the file ".attractor/qa-report/gherkin.spec.ts" exists
    Then the "expectedVars" array should include "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    And the "expectedVars" array should not include "NEXT_PUBLIC_SUPABASE_ANON_KEY"

  # ── AC #4 — No remaining SUPABASE_ANON_KEY references in source ─────

  Scenario: No source or env files reference SUPABASE_ANON_KEY
    Given the virtual-agent repo root
    When I run "grep -r SUPABASE_ANON_KEY --include='*.ts' --include='*.tsx' --include='.env*' . | grep -v node_modules/"
    Then the command should produce zero output

  # ── AC #5 — Orphaned tsconfig.base.json is deleted ──────────────────

  Scenario: tsconfig.base.json does not exist at the repo root
    Given the virtual-agent repo root
    Then the file "tsconfig.base.json" should not exist

  Scenario: tsconfig.json still works after tsconfig.base.json removal
    Given the file "tsconfig.json" exists at the repo root
    And "tsconfig.base.json" does not exist
    When I run "bun run build" from the repo root
    Then the command should exit with code 0

  # ── AC #6 — bun test still passes ───────────────────────────────────

  Scenario: bun test passes with zero failures
    Given the virtual-agent repo root
    When I run "bun test" from the repo root
    Then the command should exit with code 0
    And all tests should pass with 0 failures

  # ── AC #7 — next dev initializes Supabase client from .env.local ────

  Scenario: next dev without Doppler correctly initializes the Supabase client
    Given .env.local exists with NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY set
    And Doppler is not running
    When the developer runs "next dev"
    Then the Next.js dev server should start without errors
    And the Supabase client should receive a defined value for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    And the login page should render at /login
