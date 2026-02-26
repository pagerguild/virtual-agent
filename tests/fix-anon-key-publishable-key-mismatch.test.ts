import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const ROOT = resolve(import.meta.dir, "..");

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

// ── AC #1 — .env.local uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ─────

describe("AC #1 — .env.local uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
  it(".env.local exists at the repo root", () => {
    expect(existsSync(resolve(ROOT, ".env.local"))).toBe(true);
  });

  it("contains NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
    const content = readText(".env.local");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("does NOT contain NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    const content = readText(".env.local");
    expect(content).not.toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});

// ── AC #2 — .env.local does not contain PORT=3000 ───────────────────

describe("AC #2 — .env.local does not contain PORT=3000", () => {
  it("does NOT contain PORT=3000", () => {
    const content = readText(".env.local");
    expect(content).not.toContain("PORT=3000");
  });
});

// ── AC #3 — gherkin.spec.ts expects NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ─

describe("AC #3 — gherkin.spec.ts expects NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
  it(".attractor/qa-report/gherkin.spec.ts exists", () => {
    expect(existsSync(resolve(ROOT, ".attractor/qa-report/gherkin.spec.ts"))).toBe(true);
  });

  it("expectedVars array includes NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
    const content = readText(".attractor/qa-report/gherkin.spec.ts");
    expect(content).toContain('"NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"');
  });

  it("expectedVars array does NOT include NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    const content = readText(".attractor/qa-report/gherkin.spec.ts");
    expect(content).not.toContain('"NEXT_PUBLIC_SUPABASE_ANON_KEY"');
  });
});

// ── AC #4 — No remaining SUPABASE_ANON_KEY references in source ─────

describe("AC #4 — grep -r SUPABASE_ANON_KEY returns zero hits in source files", () => {
  it("no .ts, .tsx, or .env* files reference SUPABASE_ANON_KEY (excluding tests, .attractor/logs, and node_modules)", () => {
    // grep returns exit code 1 when zero matches, which is what we want
    let output = "";
    try {
      output = execSync(
        `grep -r "SUPABASE_ANON_KEY" --include="*.ts" --include="*.tsx" --include=".env*" . | grep -v node_modules/ | grep -v ".attractor/logs/" | grep -v "tests/fix-anon-key-publishable-key-mismatch"`,
        { cwd: ROOT, encoding: "utf-8" }
      );
    } catch {
      // Exit code 1 = zero matches, which is the desired state
      output = "";
    }
    expect(output.trim()).toBe("");
  });
});

// ── AC #5 — tsconfig.base.json is deleted ────────────────────────────

describe("AC #5 — tsconfig.base.json deleted; build succeeds", () => {
  it("tsconfig.base.json does NOT exist at the repo root", () => {
    expect(existsSync(resolve(ROOT, "tsconfig.base.json"))).toBe(false);
  });

  it("tsconfig.json does NOT reference tsconfig.base.json", () => {
    const content = readText("tsconfig.json");
    expect(content).not.toContain("tsconfig.base.json");
  });
});

// ── AC #7 — Supabase client modules read PUBLISHABLE_KEY ────────────

describe("AC #7 — All 3 Supabase client modules reference NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", () => {
  const modules = [
    "lib/supabase/client.ts",
    "lib/supabase/server.ts",
    "lib/supabase/middleware.ts",
  ];

  for (const mod of modules) {
    it(`${mod} references NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, () => {
      const content = readText(mod);
      expect(content).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    });

    it(`${mod} does NOT reference NEXT_PUBLIC_SUPABASE_ANON_KEY`, () => {
      const content = readText(mod);
      expect(content).not.toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    });
  }
});
