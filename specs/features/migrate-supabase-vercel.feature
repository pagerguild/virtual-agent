Feature: Migrate virtual-agent to a single Next.js app with Supabase Postgres and Vercel deployment
  As a developer contributing to virtual-agent
  I want to replace the Bun monorepo architecture with a single Next.js app backed by Supabase Postgres
  So that the project ships faster on a simpler, production-ready stack using existing Supabase Pro and Vercel accounts

  Goal Summary:
    The PM should generate dependency-ordered migration issues that maximize delivery speed and minimize ambiguity.

  PM Constraints:
    - Generate at most 3 issues for this goal; fewer is allowed when issue quality is better.
    - Every issue must include sections: Objective, In Scope, Out of Scope, Acceptance Criteria, Visual Verification, Dependencies, Risks, PR Checklist.
    - Every issue must include Visual Verification with concrete browser actions and expected outcomes.
    - Prefer outcome-based criteria over file-existence criteria.
    - If work remains after the last issue, propose the next goal explicitly.

  Issue Buckets:
    - Issue 1: Foundation & Auth Flow
    - Issue 2: Postgres Data Plane & Dashboard Data
    - Issue 3: Navigation Surface & Production Cutover

  Acceptance Criteria by Bucket:

  Scenario: Issue 1 Objective and scope are generated correctly
    Given Issue 1 is "Foundation & Auth Flow"
    Then its Objective should focus on enabling a working auth-gated single-app baseline
    And its In Scope should include single-app root setup, Supabase auth wiring, auth pages, and dashboard route protection baseline
    And its Out of Scope should exclude full data migration and full production cutover
    And its Dependencies should be empty or marked as first issue

  Scenario: Issue 1 uses the approved Supabase + Next.js + Vercel starter baseline
    Given Issue 1 exists
    Then its Objective must include a starter-aligned migration baseline
    And its In Scope must include adopting or aligning with the Vercel Supabase starter baseline (https://vercel.com/templates/authentication/supabase) or create-next-app --example with-supabase
    And its Acceptance Criteria must require the project to bootstrap from the approved starter pattern before custom migration work
    And its Out of Scope must exclude unrelated custom architecture divergence in Issue 1

  Scenario: Issue 1 behavior-focused acceptance criteria are generated
    Given Issue 1 exists
    Then Acceptance Criteria must include starter-baseline adoption outcome before auth-flow outcomes
    And Acceptance Criteria should describe user-signup, user-login, and auth-gated access behavior
    And criteria should avoid file-existence-only checks as primary validation

  Scenario: Issue 2 Objective and scope are generated correctly
    Given Issue 2 is "Postgres Data Plane & Dashboard Data"
    Then its Objective should focus on migrating domain data to Supabase Postgres and rendering seeded data in dashboard
    And its In Scope should include pgTable migration for artists, tours, gigs, bookings, and riders
    And its In Scope should include migrations, seed data, and dashboard reads from Supabase
    And its Out of Scope should exclude broad navigation/page-surface completion and production cutover tasks
    And its Dependencies must explicitly include Issue 1 completion of starter baseline + auth foundation

  Scenario: Issue 2 behavior-focused acceptance criteria are generated
    Given Issue 2 exists
    Then Acceptance Criteria should describe successful migration execution and visible dashboard data outcomes
    And criteria should be measurable without relying on file-existence-only checks

  Scenario: Issue 3 Objective and scope are generated correctly
    Given Issue 3 is "Navigation Surface & Production Cutover"
    Then its Objective should focus on completing user-facing dashboard navigation and production readiness
    And its In Scope should include sidebar navigation, tours/riders/settings page data rendering, Vercel environment wiring, and production accessibility
    And its Out of Scope should exclude net-new feature expansion unrelated to migration cutover
    And its Dependencies must explicitly include Issue 2 and starter-aligned app shell continuity from Issue 1/2

  Scenario: Issue 3 behavior-focused acceptance criteria are generated
    Given Issue 3 exists
    Then Acceptance Criteria should describe production login accessibility, protected route behavior, and page-to-page navigation outcomes
    And criteria should avoid ambiguous phrases like "wire everything" or "complete all remaining pages"

  Visual Verification by Bucket:

  Scenario: Issue 1 visual verification is concrete
    Given Issue 1 exists
    Then Visual Verification must include opening app from starter baseline and confirming starter-derived auth landing behavior is present
    And Visual Verification should include opening app URL and redirect to /login
    And Visual Verification should include signup with new credentials and successful account creation
    And Visual Verification should include login success and dashboard shell visibility

  Scenario: Issue 2 visual verification is concrete
    Given Issue 2 exists
    Then Visual Verification should include logging in and opening dashboard
    And Visual Verification should include seeing seeded artist and tour values from Supabase
    And Visual Verification should include seeing a visible gigs summary/list sourced from seeded data

  Scenario: Issue 3 visual verification is concrete
    Given Issue 3 exists
    Then Visual Verification should include opening the Vercel URL and loading login page without errors
    And Visual Verification should include successful login and sidebar visibility
    And Visual Verification should include navigating Dashboard, Tours, Riders, and Settings with visible active-page state and rendered data

  Stop/Carryover Rule:
    If migration work remains after the final generated issue, output must explicitly propose the next PM goal and list remaining outcomes.
    And if starter baseline was not established in Issue 1, the next goal must begin with starter-baseline remediation before any new migration tasks.
