# AGENTS.md — virtual-agent

## Mission

virtual-agent is a tour management app for music artists. It helps booking agents manage artists, tours, gigs, bookings, and technical riders.

Target architecture for this repository:
- Single Next.js app (App Router)
- Supabase Auth + Supabase Postgres
- Drizzle ORM for schema/migrations
- Vercel deployment

## Attractor PM Output Rules (Hard Constraints)

These are mandatory for issue generation from any feature goal.

1. Issue count:
- Generate at most 3 issues per goal.
- Fewer than 3 issues is acceptable if quality is higher.
- If work remains after the final issue, explicitly propose the next goal.

2. Visual verification:
- Every issue must include a `Visual Verification` section.
- Every issue must include concrete browser steps and expected outcomes.
- If work is mostly infra, pair it with visible UI behavior in the same issue.

3. Required issue sections:
- `Objective`
- `In Scope`
- `Out of Scope`
- `Acceptance Criteria`
- `Visual Verification`
- `Dependencies`
- `Risks`
- `PR Checklist`

4. Criteria quality:
- Prefer outcome-based acceptance criteria.
- Do not use file-existence checks as primary acceptance criteria.
- Keep dependency order explicit across issues.

## Issue Quality Bar

An issue is acceptable only if all checks pass.

Pass conditions:
- One primary objective only.
- Scope is bounded and shippable in one PR.
- Dependencies are explicit and realistic.
- Acceptance criteria describe behavior, not implementation trivia.
- Visual verification has at least 3 browser actions with expected outcomes.
- Risks call out likely migration breakpoints.

Fail conditions:
- Mixed unrelated objectives in one issue.
- Broad buckets like "all remaining pages" without boundaries.
- Deploy + major feature build combined without strict scope control.
- Acceptance criteria that are mostly "file exists" checks.

## Issue Template (required headings)

Use this exact structure in every generated issue body.

```markdown
## Objective
<single sentence describing the user or business outcome>

## In Scope
- <bounded deliverable 1>
- <bounded deliverable 2>

## Out of Scope
- <explicit non-goals to prevent scope creep>

## Acceptance Criteria
- <behavior-focused criterion 1>
- <behavior-focused criterion 2>

## Visual Verification
- <browser step 1 -> expected visible result>
- <browser step 2 -> expected visible result>
- <browser step 3 -> expected visible result>

## Dependencies
- <upstream issue or prerequisite>

## Risks
- <key implementation or migration risk>

## PR Checklist
- [ ] Acceptance criteria implemented
- [ ] Visual verification performed
- [ ] Tests updated/added as needed
- [ ] Docs updated if behavior or workflow changed
```

## Spec Authoring Standard for /specs/features

Every feature goal spec should be written to maximize Attractor PM issue quality.

Required sections:
- `Goal Summary`
- `PM Constraints`
- `Issue Buckets`
- `Acceptance Criteria by Bucket`
- `Visual Verification by Bucket`
- `Stop/Carryover Rule`

Authoring rules:
- Keep bucket boundaries strict and dependency-ordered.
- Each bucket must map to one shippable issue.
- Use behavior and user-visible outcomes.
- State constraints in plain text, not only comments.

## Issue Slicing Heuristics

- One primary objective per issue.
- Dependency order must be explicit (`Issue 2 depends on Issue 1`, etc.).
- If a criterion has no visible UI effect, pair it with visible UI behavior in the same issue.
- Prefer vertical slices (UI + data + auth where needed) over horizontal micro-tasks.

## Anti-Patterns to Reject

- File-existence-only acceptance criteria.
- "All remaining pages" scope bombs.
- Deploy + broad feature development in one issue unless tightly bounded.
- Ambiguous language like "wire everything" or "finish migration" without measurable outcomes.

## AGENTS.md Update Rule

Do not update AGENTS.md after every PR by default.

Update AGENTS.md only when one or more of these are true:
- A reusable rule was discovered.
- A path/convention changed and future agents need it.
- A workflow gotcha caused avoidable rework.

## Goal Prompt Pattern

Use this canonical pattern for this migration goal:

```bash
attractor pm --goal "Review specs/features/migrate-supabase-vercel.feature and generate up to 3 dependency-ordered issues (fewer allowed). Each issue must include Objective, In Scope, Out of Scope, Acceptance Criteria, Visual Verification, Dependencies, Risks, and PR Checklist. Prefer outcome-based criteria over file-existence checks. If work remains after issue 3, propose the next goal explicitly."
```

## Engineering Standards (Target Stack)

### Next.js
- Use App Router (`app/`).
- Default to Server Components.
- Use `"use client"` only when hooks/event handlers/browser APIs are required.
- Prefer server-side data loading for initial page render.

### Supabase
- Browser client in `lib/supabase/client.ts`.
- Server client in `lib/supabase/server.ts`.
- Protect dashboard routes; redirect unauthenticated users to `/login`.
- Never expose `service_role` in client-side code.

### Drizzle (Postgres)
- Use `pgTable` and `pgEnum` from `drizzle-orm/pg-core`.
- Keep table definitions in `db/schema/` with barrel export.
- Generate and apply migrations via scripts.
- Use `DATABASE_URL` for connection.

### General
- TypeScript strict mode.
- No `any` unless explicitly justified.
- Keep components focused and cohesive.
- Prefer named exports.
