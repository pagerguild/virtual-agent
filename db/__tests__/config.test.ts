import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "../..");

describe("Drizzle config", () => {
  it("drizzle.config.ts exists", () => {
    expect(existsSync(join(root, "drizzle.config.ts"))).toBe(true);
  });

  it("sets schema to ./db/schema", () => {
    const content = readFileSync(join(root, "drizzle.config.ts"), "utf-8");
    expect(content).toContain('"./db/schema"');
  });

  it("sets dialect to postgresql", () => {
    const content = readFileSync(join(root, "drizzle.config.ts"), "utf-8");
    expect(content).toContain('"postgresql"');
  });

  it("sets migrations output to ./db/migrations", () => {
    const content = readFileSync(join(root, "drizzle.config.ts"), "utf-8");
    expect(content).toContain('"./db/migrations"');
  });

  it("reads DATABASE_URL from env", () => {
    const content = readFileSync(join(root, "drizzle.config.ts"), "utf-8");
    expect(content).toContain("DATABASE_URL");
  });
});

describe("Database client (db/index.ts)", () => {
  it("exists", () => {
    expect(existsSync(join(root, "db/index.ts"))).toBe(true);
  });

  it("imports drizzle from drizzle-orm/postgres-js", () => {
    const content = readFileSync(join(root, "db/index.ts"), "utf-8");
    expect(content).toContain('drizzle-orm/postgres-js');
  });

  it("imports postgres from postgres", () => {
    const content = readFileSync(join(root, "db/index.ts"), "utf-8");
    expect(content).toContain('from "postgres"');
  });

  it("throws if DATABASE_URL is not set", () => {
    const content = readFileSync(join(root, "db/index.ts"), "utf-8");
    expect(content).toContain("DATABASE_URL");
    expect(content).toMatch(/throw|Error/);
  });

  it("exports db instance", () => {
    const content = readFileSync(join(root, "db/index.ts"), "utf-8");
    expect(content).toContain("export const db");
  });

  it("does NOT have 'use client' directive (server-only)", () => {
    const content = readFileSync(join(root, "db/index.ts"), "utf-8");
    expect(content).not.toContain('"use client"');
    expect(content).not.toContain("'use client'");
  });
});

describe("Environment example files", () => {
  it(".env.example contains DATABASE_URL", () => {
    const content = readFileSync(join(root, ".env.example"), "utf-8");
    expect(content).toContain("DATABASE_URL");
  });

  it(".env.local.example contains DATABASE_URL", () => {
    const content = readFileSync(join(root, ".env.local.example"), "utf-8");
    expect(content).toContain("DATABASE_URL");
  });

  it(".env.example DATABASE_URL is empty or placeholder (no real secret)", () => {
    const content = readFileSync(join(root, ".env.example"), "utf-8");
    const match = content.match(/DATABASE_URL=(.*)/);
    expect(match).toBeDefined();
    // Should be empty or a placeholder like "postgresql://..."
    const value = match![1].trim();
    expect(value).not.toMatch(/^postgresql:\/\/[a-z]+:[^@]+@/i); // No real credentials
  });
});

describe("Seed script (db/seed.ts)", () => {
  it("exists", () => {
    expect(existsSync(join(root, "db/seed.ts"))).toBe(true);
  });

  it("inserts artist 'Chic'", () => {
    const content = readFileSync(join(root, "db/seed.ts"), "utf-8");
    expect(content).toContain("Chic");
    expect(content).toContain("chic@example.com");
  });

  it("inserts tour 'Spring Groove Tour 2026'", () => {
    const content = readFileSync(join(root, "db/seed.ts"), "utf-8");
    expect(content).toContain("Spring Groove Tour 2026");
  });

  it("inserts 5 gigs across different cities", () => {
    const content = readFileSync(join(root, "db/seed.ts"), "utf-8");
    for (const city of ["New York", "Chicago", "Austin", "Los Angeles", "Miami"]) {
      expect(content).toContain(city);
    }
  });

  it("inserts flight and hotel bookings", () => {
    const content = readFileSync(join(root, "db/seed.ts"), "utf-8");
    expect(content).toContain('"flight"');
    expect(content).toContain('"hotel"');
  });

  it("inserts a rider with hospitality and technical content", () => {
    const content = readFileSync(join(root, "db/seed.ts"), "utf-8");
    expect(content).toContain("hospitality");
    expect(content).toContain("technical");
  });
});

describe("package.json scripts", () => {
  it("has db:generate script", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
    expect(pkg.scripts["db:generate"]).toBeDefined();
    expect(pkg.scripts["db:generate"]).toContain("drizzle-kit generate");
  });

  it("has db:migrate script", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
    expect(pkg.scripts["db:migrate"]).toBeDefined();
    expect(pkg.scripts["db:migrate"]).toContain("drizzle-kit migrate");
  });

  it("has db:seed script using tsx", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
    expect(pkg.scripts["db:seed"]).toBeDefined();
    expect(pkg.scripts["db:seed"]).toContain("tsx db/seed.ts");
  });
});

describe("Migrations directory", () => {
  it("db/migrations/ directory exists", () => {
    expect(existsSync(join(root, "db/migrations"))).toBe(true);
  });

  it("contains at least one SQL migration file", () => {
    const { readdirSync } = require("fs");
    const files = readdirSync(join(root, "db/migrations"));
    const sqlFiles = files.filter((f: string) => f.endsWith(".sql"));
    expect(sqlFiles.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Dashboard page (app/dashboard/page.tsx)", () => {
  it("exists", () => {
    expect(existsSync(join(root, "app/dashboard/page.tsx"))).toBe(true);
  });

  it("is a server component (no 'use client' directive)", () => {
    const content = readFileSync(join(root, "app/dashboard/page.tsx"), "utf-8");
    expect(content).not.toContain('"use client"');
    expect(content).not.toContain("'use client'");
  });

  it("imports from the dashboard queries module", () => {
    const content = readFileSync(join(root, "app/dashboard/page.tsx"), "utf-8");
    expect(content).toContain("getDashboardData");
  });
});
