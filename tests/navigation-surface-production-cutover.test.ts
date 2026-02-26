import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

function collectSourceFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (entry === "node_modules" || entry === ".next" || entry === "dist") continue;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectSourceFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── AC #1 — Sidebar renders on all dashboard routes ─────────────────

describe("AC #1 — Sidebar renders on all dashboard routes", () => {
  it("sidebar component exists", () => {
    expect(existsSync(resolve(ROOT, "components/sidebar.tsx"))).toBe(true);
  });

  it("dashboard layout imports Sidebar", () => {
    const content = readText("app/dashboard/layout.tsx");
    expect(content).toContain("Sidebar");
  });

  it("sidebar has links to Dashboard, Tours, Riders, Settings", () => {
    const content = readText("components/sidebar.tsx");
    expect(content).toContain('"Dashboard"');
    expect(content).toContain('"Tours"');
    expect(content).toContain('"Riders"');
    expect(content).toContain('"Settings"');
  });

  it("sidebar links use /dashboard prefix", () => {
    const content = readText("components/sidebar.tsx");
    expect(content).toContain('"/dashboard"');
    expect(content).toContain('"/dashboard/tours"');
    expect(content).toContain('"/dashboard/riders"');
    expect(content).toContain('"/dashboard/settings"');
  });

  it("dashboard layout wraps children with sidebar in a flex container", () => {
    const content = readText("app/dashboard/layout.tsx");
    expect(content).toContain("flex");
    expect(content).toContain("children");
  });

  it("app/dashboard/tours/page.tsx exists", () => {
    expect(existsSync(resolve(ROOT, "app/dashboard/tours/page.tsx"))).toBe(true);
  });

  it("app/dashboard/riders/page.tsx exists", () => {
    expect(existsSync(resolve(ROOT, "app/dashboard/riders/page.tsx"))).toBe(true);
  });

  it("app/dashboard/settings/page.tsx exists", () => {
    expect(existsSync(resolve(ROOT, "app/dashboard/settings/page.tsx"))).toBe(true);
  });
});

// ── AC #2 — Active page state visible ───────────────────────────────

describe("AC #2 — Active page state visible in sidebar", () => {
  it("sidebar is a client component using usePathname", () => {
    const content = readText("components/sidebar.tsx");
    expect(content).toContain('"use client"');
    expect(content).toContain("usePathname");
  });

  it("sidebar computes active state based on pathname", () => {
    const content = readText("components/sidebar.tsx");
    expect(content).toContain("isActive");
    expect(content).toContain("pathname");
  });

  it("active link has a distinct style from inactive links", () => {
    const content = readText("components/sidebar.tsx");
    // Active state has a different bg color
    expect(content).toContain("bg-gray-200");
    // Inactive has different styling
    expect(content).toContain("text-gray-600");
  });
});

// ── AC #3 — Tours page displays data ────────────────────────────────

describe("AC #3 — Tours page displays data from Supabase Postgres", () => {
  it("tours page is a server component", () => {
    const content = readText("app/dashboard/tours/page.tsx");
    expect(content).not.toContain('"use client"');
    expect(content).not.toContain("'use client'");
  });

  it("tours page imports data query function", () => {
    const content = readText("app/dashboard/tours/page.tsx");
    expect(content).toContain("getToursWithGigs");
  });

  it("tours query module exists", () => {
    expect(existsSync(resolve(ROOT, "db/queries/tours.ts"))).toBe(true);
  });

  it("tours page renders tour names", () => {
    const content = readText("app/dashboard/tours/page.tsx");
    expect(content).toContain("tour.name");
  });

  it("tours page renders gig information (cities, dates, counts)", () => {
    const content = readText("app/dashboard/tours/page.tsx");
    expect(content).toContain("gig.city");
    expect(content).toContain("gig.date");
    expect(content).toContain("tour.gigs.length");
  });
});

// ── AC #4 — Riders page displays data ───────────────────────────────

describe("AC #4 — Riders page displays data from Supabase Postgres", () => {
  it("riders page is a server component", () => {
    const content = readText("app/dashboard/riders/page.tsx");
    expect(content).not.toContain('"use client"');
    expect(content).not.toContain("'use client'");
  });

  it("riders page imports data query function", () => {
    const content = readText("app/dashboard/riders/page.tsx");
    expect(content).toContain("getRidersWithGigs");
  });

  it("riders query module exists", () => {
    expect(existsSync(resolve(ROOT, "db/queries/riders.ts"))).toBe(true);
  });

  it("riders page renders rider content from JSONB column", () => {
    const content = readText("app/dashboard/riders/page.tsx");
    expect(content).toContain("rider.content");
    expect(content).toContain("hospitality");
    expect(content).toContain("technical");
  });
});

// ── AC #5 — Settings page renders ───────────────────────────────────

describe("AC #5 — Settings page renders user info", () => {
  it("settings page is a server component", () => {
    const content = readText("app/dashboard/settings/page.tsx");
    expect(content).not.toContain('"use client"');
    expect(content).not.toContain("'use client'");
  });

  it("settings page reads the Supabase Auth session", () => {
    const content = readText("app/dashboard/settings/page.tsx");
    expect(content).toContain("createClient");
    expect(content).toContain("auth.getUser");
  });

  it("settings page displays user email", () => {
    const content = readText("app/dashboard/settings/page.tsx");
    expect(content).toContain("user?.email");
  });

  it("settings page serves as a placeholder for future settings", () => {
    const content = readText("app/dashboard/settings/page.tsx");
    expect(content).toContain("Coming Soon");
  });
});

// ── AC #6 — Vercel deployment readiness ─────────────────────────────

describe("AC #6 — Vercel deployment readiness", () => {
  it("all dashboard pages use force-dynamic to prevent build-time DB access", () => {
    const dashboardPage = readText("app/dashboard/page.tsx");
    const toursPage = readText("app/dashboard/tours/page.tsx");
    const ridersPage = readText("app/dashboard/riders/page.tsx");
    const settingsPage = readText("app/dashboard/settings/page.tsx");
    expect(dashboardPage).toContain('dynamic = "force-dynamic"');
    expect(toursPage).toContain('dynamic = "force-dynamic"');
    expect(ridersPage).toContain('dynamic = "force-dynamic"');
    expect(settingsPage).toContain('dynamic = "force-dynamic"');
  });

  it("env example documents required Vercel env vars", () => {
    const content = readText(".env.example");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(content).toContain("DATABASE_URL");
  });
});

// ── AC #9 — Legacy apps/ directory removed ──────────────────────────

describe("AC #9 — Legacy apps/ directory removed", () => {
  it("apps/ directory does not exist", () => {
    expect(existsSync(resolve(ROOT, "apps"))).toBe(false);
  });

  it("no source files reference apps/api/ or apps/web/", () => {
    const dirs = ["app", "components", "lib", "db"];
    for (const dir of dirs) {
      const dirPath = resolve(ROOT, dir);
      if (!existsSync(dirPath)) continue;
      const files = collectSourceFiles(dirPath, [".ts", ".tsx", ".js", ".jsx"]);
      for (const file of files) {
        const content = readFileSync(file, "utf-8");
        expect(content).not.toContain("apps/api/");
        expect(content).not.toContain("apps/web/");
      }
    }
  });

  it("turbo.json does not exist", () => {
    expect(existsSync(resolve(ROOT, "turbo.json"))).toBe(false);
  });

  it("package.json has no workspaces configuration", () => {
    const pkg = readJson("package.json");
    expect(pkg.workspaces).toBeUndefined();
  });
});

// ── AC #10 — Tests pass ─────────────────────────────────────────────

describe("AC #10 — No test files reference legacy apps/ paths", () => {
  const SELF = resolve(ROOT, "tests/navigation-surface-production-cutover.test.ts");

  it("no test file references legacy apps/ imports or paths", () => {
    const testDirs = [resolve(ROOT, "tests"), resolve(ROOT, "db/__tests__"), resolve(ROOT, "db/schema/__tests__")];
    const legacyAppsPattern = /(?:from|import|require)\s*\(?\s*['"].*apps\/(api|web)\//;
    for (const dir of testDirs) {
      if (!existsSync(dir)) continue;
      const files = collectSourceFiles(dir, [".ts", ".tsx"]);
      for (const file of files) {
        if (file === SELF) continue; // skip this file (it references the strings in assertions)
        const content = readFileSync(file, "utf-8");
        expect(legacyAppsPattern.test(content)).toBe(false);
      }
    }
  });
});

// ── AC #11 — README is accurate ─────────────────────────────────────

describe("AC #11 — README is accurate for single-app architecture", () => {
  it("README.md exists", () => {
    expect(existsSync(resolve(ROOT, "README.md"))).toBe(true);
  });

  it("does not reference SQLite", () => {
    const content = readText("README.md");
    expect(content.toLowerCase()).not.toContain("sqlite");
  });

  it("does not reference Bun monorepo", () => {
    const content = readText("README.md");
    expect(content).not.toContain("Bun monorepo");
  });

  it("does not reference turbo", () => {
    const content = readText("README.md");
    expect(content.toLowerCase()).not.toContain("turbo");
  });

  it("does not reference apps/api", () => {
    const content = readText("README.md");
    expect(content).not.toContain("apps/api");
  });

  it("does not reference apps/web", () => {
    const content = readText("README.md");
    expect(content).not.toContain("apps/web");
  });

  it("references Supabase", () => {
    const content = readText("README.md");
    expect(content).toContain("Supabase");
  });

  it("references Vercel deployment", () => {
    const content = readText("README.md");
    expect(content).toContain("Vercel");
  });

  it("documents required environment variables for Vercel", () => {
    const content = readText("README.md");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(content).toContain("DATABASE_URL");
  });

  it("project structure section matches actual directory layout", () => {
    const content = readText("README.md");
    expect(content).toContain("Project Structure");
    expect(content).toContain("app/");
    expect(content).toContain("components/");
    expect(content).toContain("db/");
    expect(content).toContain("lib/");
  });
});
