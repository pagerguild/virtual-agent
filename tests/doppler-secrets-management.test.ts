import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

// ── AC #1 — doppler.yaml declares virtual-agent project with dev/stg/prd configs ──

describe("AC #1 — doppler.yaml declares virtual-agent project with dev/stg/prd configs", () => {
  it("doppler.yaml exists", () => {
    expect(existsSync(resolve(ROOT, "doppler.yaml"))).toBe(true);
  });

  it("declares project as virtual-agent", () => {
    const content = readText("doppler.yaml");
    expect(content).toContain("project: virtual-agent");
  });

  it("declares default config as dev", () => {
    const content = readText("doppler.yaml");
    expect(content).toContain("config: dev");
  });

  it("has an environments block with dev, stg, and prd", () => {
    const content = readText("doppler.yaml");
    expect(content).toContain("environments:");
    expect(content).toMatch(/dev:\s*\n\s*config:\s*dev/);
    expect(content).toMatch(/stg:\s*\n\s*config:\s*stg/);
    expect(content).toMatch(/prd:\s*\n\s*config:\s*prd/);
  });

  it("maps dev to local development", () => {
    const content = readText("doppler.yaml");
    expect(content).toMatch(/dev:[\s\S]*?target:\s*local development/);
  });

  it("maps stg to Vercel Preview", () => {
    const content = readText("doppler.yaml");
    expect(content).toMatch(/stg:[\s\S]*?target:\s*Vercel Preview/);
  });

  it("maps prd to Vercel Production", () => {
    const content = readText("doppler.yaml");
    expect(content).toMatch(/prd:[\s\S]*?target:\s*Vercel Production/);
  });
});

// ── AC #2 — npm run dev:doppler invokes doppler run -- next dev ──────

describe("AC #2 — npm run dev:doppler invokes doppler run -- next dev", () => {
  it("package.json has dev:doppler script", () => {
    const pkg = readJson("package.json");
    expect(pkg.scripts["dev:doppler"]).toBeDefined();
  });

  it("dev:doppler runs 'doppler run -- next dev'", () => {
    const pkg = readJson("package.json");
    expect(pkg.scripts["dev:doppler"]).toBe("doppler run -- next dev");
  });

  it("existing dev script remains unchanged as 'next dev'", () => {
    const pkg = readJson("package.json");
    expect(pkg.scripts.dev).toBe("next dev");
  });
});

// ── AC #3 — .env.example begins with Doppler comment block ──────────

describe("AC #3 — .env.example begins with Doppler comment block and lists all 7 env var names", () => {
  it(".env.example exists", () => {
    expect(existsSync(resolve(ROOT, ".env.example"))).toBe(true);
  });

  it("begins with a Doppler header comment", () => {
    const content = readText(".env.example");
    const firstLine = content.split("\n")[0];
    expect(firstLine).toContain("Doppler");
  });

  it("mentions Doppler is the primary secrets source", () => {
    const content = readText(".env.example");
    expect(content.toLowerCase()).toContain("doppler");
    expect(content.toLowerCase()).toContain("primary");
  });

  it("lists all 7 env var names", () => {
    const content = readText(".env.example");
    const expectedVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "DATABASE_URL",
      "AMADEUS_API_KEY",
      "AMADEUS_API_SECRET",
      "GOOGLE_MAPS_API_KEY",
      "RESEND_API_KEY",
    ];
    for (const v of expectedVars) {
      expect(content).toContain(v);
    }
  });

  it("does not contain real secret values", () => {
    const content = readText(".env.example");
    const lines = content.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"));
    for (const line of lines) {
      const value = line.split("=")[1]?.trim();
      const isPlaceholder = !value || value.startsWith("your-");
      expect(isPlaceholder).toBe(true);
    }
  });
});

// ── AC #4 — .env.local.example states optional when using Doppler ───

describe("AC #4 — .env.local.example states optional when using Doppler", () => {
  it(".env.local.example exists", () => {
    expect(existsSync(resolve(ROOT, ".env.local.example"))).toBe(true);
  });

  it("header notes the file is optional when using Doppler", () => {
    const content = readText(".env.local.example");
    expect(content.toLowerCase()).toContain("optional");
    expect(content.toLowerCase()).toContain("doppler");
  });

  it("links to README #secrets-management section", () => {
    const content = readText(".env.local.example");
    expect(content).toContain("#secrets-management");
  });

  it("still contains Supabase env var placeholders", () => {
    const content = readText(".env.local.example");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(content).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});

// ── AC #5 — README has Secrets Management section ────────────────────

describe("AC #5 — README has Secrets Management section with install, auth, setup, and run steps", () => {
  it("README contains a 'Secrets Management' heading", () => {
    const content = readText("README.md");
    expect(content).toContain("## Secrets Management");
  });

  it("includes Doppler CLI install instructions", () => {
    const content = readText("README.md");
    expect(content).toContain("brew install dopplerhq/cli/doppler");
  });

  it("includes authenticate step", () => {
    const content = readText("README.md");
    expect(content).toContain("doppler login");
  });

  it("includes doppler setup step", () => {
    const content = readText("README.md");
    expect(content).toContain("doppler setup");
  });

  it("includes npm run dev:doppler", () => {
    const content = readText("README.md");
    expect(content).toContain("npm run dev:doppler");
  });

  it("mentions Vercel integration", () => {
    const content = readText("README.md");
    expect(content).toContain("Vercel Integration");
    expect(content).toContain("Doppler");
  });
});

// ── AC #6 — README Deployment (Vercel) references Doppler sync ──────

describe("AC #6 — README Deployment (Vercel) references Doppler sync as preferred method", () => {
  it("Deployment section exists", () => {
    const content = readText("README.md");
    expect(content).toContain("## Deployment (Vercel)");
  });

  it("references Doppler sync as preferred method", () => {
    const content = readText("README.md");
    // Extract deployment section
    const deployIdx = content.indexOf("## Deployment (Vercel)");
    const afterDeploy = content.slice(deployIdx);
    const nextSection = afterDeploy.indexOf("\n## ", 1);
    const deploySection = nextSection > 0 ? afterDeploy.slice(0, nextSection) : afterDeploy;

    expect(deploySection.toLowerCase()).toContain("doppler");
    expect(deploySection.toLowerCase()).toContain("preferred");
  });

  it("still includes manual entry as fallback", () => {
    const content = readText("README.md");
    const deployIdx = content.indexOf("## Deployment (Vercel)");
    const afterDeploy = content.slice(deployIdx);
    const nextSection = afterDeploy.indexOf("\n## ", 1);
    const deploySection = nextSection > 0 ? afterDeploy.slice(0, nextSection) : afterDeploy;

    expect(deploySection.toLowerCase()).toContain("fallback");
    expect(deploySection).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });
});

// ── AC #7 — README environment config reference table ────────────────

describe("AC #7 — README environment config reference table", () => {
  it("contains an environment config reference section", () => {
    const content = readText("README.md");
    expect(content).toContain("Environment Config Reference");
  });

  it("maps dev to Local development", () => {
    const content = readText("README.md");
    expect(content).toContain("`dev`");
    expect(content).toContain("Local development");
  });

  it("maps stg to Vercel Preview", () => {
    const content = readText("README.md");
    expect(content).toContain("`stg`");
    expect(content).toContain("Vercel Preview");
  });

  it("maps prd to Vercel Production", () => {
    const content = readText("README.md");
    expect(content).toContain("`prd`");
    expect(content).toContain("Vercel Production");
  });
});

// ── AC #8 — Getting Started preserves non-Doppler fallback ──────────

describe("AC #8 — Getting Started preserves non-Doppler .env.local fallback path", () => {
  it("Getting Started section exists", () => {
    const content = readText("README.md");
    expect(content).toContain("## Getting Started");
  });

  it("documents Doppler as Option A (recommended)", () => {
    const content = readText("README.md");
    expect(content).toContain("Option A");
    expect(content).toContain("Doppler");
    expect(content).toContain("recommended");
  });

  it("documents .env.local fallback as Option B", () => {
    const content = readText("README.md");
    expect(content).toContain("Option B");
    expect(content).toContain(".env.local");
  });

  it("documents copying .env.local.example to .env.local", () => {
    const content = readText("README.md");
    expect(content).toContain("cp .env.local.example .env.local");
  });

  it("shows both dev:doppler and dev run commands", () => {
    const content = readText("README.md");
    expect(content).toContain("npm run dev:doppler");
    expect(content).toContain("npm run dev");
  });
});

// ── AC #9 — No application code changes; no secret values committed ─

describe("AC #9 — No application code changes; no secret values committed", () => {
  it(".env.example has no real secret values", () => {
    const content = readText(".env.example");
    const lines = content.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"));
    for (const line of lines) {
      const value = line.split("=")[1]?.trim();
      const isPlaceholder = !value || value.startsWith("your-");
      expect(isPlaceholder).toBe(true);
    }
  });

  it(".env.local.example has no real secret values", () => {
    const content = readText(".env.local.example");
    const lines = content.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"));
    for (const line of lines) {
      const value = line.split("=")[1]?.trim();
      const isPlaceholder = !value || value.startsWith("your-");
      expect(isPlaceholder).toBe(true);
    }
  });

  it("doppler.yaml has no secret values", () => {
    const content = readText("doppler.yaml");
    // Should not contain any API keys, passwords, or tokens
    expect(content).not.toMatch(/sk[-_]/i);
    expect(content).not.toMatch(/password/i);
    expect(content).not.toMatch(/token:/i);
  });
});
