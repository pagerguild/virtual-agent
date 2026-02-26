import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

describe("Monorepo structure", () => {
  describe("Root package.json", () => {
    it("exists", () => {
      expect(existsSync(resolve(ROOT, "package.json"))).toBe(true);
    });

    it('has workspaces set to ["apps/*"]', () => {
      const pkg = readJson("package.json");
      expect(pkg.workspaces).toEqual(["apps/*"]);
    });

    it("has a dev script", () => {
      const pkg = readJson("package.json");
      expect(pkg.scripts?.dev).toBeDefined();
    });

    it("is marked as private", () => {
      const pkg = readJson("package.json");
      expect(pkg.private).toBe(true);
    });
  });

  describe("tsconfig.base.json", () => {
    it("exists", () => {
      expect(existsSync(resolve(ROOT, "tsconfig.base.json"))).toBe(true);
    });

    it("has strict mode enabled", () => {
      const config = readJson("tsconfig.base.json");
      expect(config.compilerOptions.strict).toBe(true);
    });

    it("targets ES2022", () => {
      const config = readJson("tsconfig.base.json");
      expect(config.compilerOptions.target).toBe("ES2022");
    });
  });

  describe(".gitignore", () => {
    it("exists", () => {
      expect(existsSync(resolve(ROOT, ".gitignore"))).toBe(true);
    });

    it("ignores node_modules", () => {
      const content = readText(".gitignore");
      expect(content).toContain("node_modules");
    });

    it("ignores .env files but not .env.example", () => {
      const content = readText(".gitignore");
      expect(content).toContain(".env");
      expect(content).toContain("!.env.example");
    });

    it("ignores dist/", () => {
      const content = readText(".gitignore");
      expect(content).toContain("dist/");
    });

    it("ignores .next/", () => {
      const content = readText(".gitignore");
      expect(content).toContain(".next/");
    });

    it("ignores *.db", () => {
      const content = readText(".gitignore");
      expect(content).toContain("*.db");
    });
  });

  describe(".env.example", () => {
    it("exists", () => {
      expect(existsSync(resolve(ROOT, ".env.example"))).toBe(true);
    });

    it("documents all 7 expected env vars", () => {
      const content = readText(".env.example");
      const expectedVars = [
        "DATABASE_URL",
        "AMADEUS_API_KEY",
        "AMADEUS_API_SECRET",
        "GOOGLE_MAPS_API_KEY",
        "RESEND_API_KEY",
        "FRONTEND_URL",
        "PORT",
      ];
      for (const envVar of expectedVars) {
        expect(content).toContain(envVar);
      }
    });
  });

  describe("doppler.yaml", () => {
    it("exists", () => {
      expect(existsSync(resolve(ROOT, "doppler.yaml"))).toBe(true);
    });

    it("references virtual-agent project and dev config", () => {
      const content = readText("doppler.yaml");
      expect(content).toContain("virtual-agent");
      expect(content).toContain("dev");
    });
  });

  describe("README.md", () => {
    it("exists", () => {
      expect(existsSync(resolve(ROOT, "README.md"))).toBe(true);
    });

    it("documents doppler run workflow", () => {
      const content = readText("README.md");
      expect(content).toContain("doppler run -- bun run dev");
    });

    it("includes project structure section", () => {
      const content = readText("README.md");
      expect(content).toContain("Project Structure");
    });

    it("includes environment variables documentation", () => {
      const content = readText("README.md");
      expect(content).toContain("Environment Variables");
    });
  });
});

describe("Backend (apps/api)", () => {
  it("has package.json", () => {
    expect(existsSync(resolve(ROOT, "apps/api/package.json"))).toBe(true);
  });

  it("is named @virtual-agent/api", () => {
    const pkg = readJson("apps/api/package.json");
    expect(pkg.name).toBe("@virtual-agent/api");
  });

  it("depends on hono", () => {
    const pkg = readJson("apps/api/package.json");
    expect(pkg.dependencies?.hono).toBeDefined();
  });

  it("has a dev script with --hot flag", () => {
    const pkg = readJson("apps/api/package.json");
    expect(pkg.scripts?.dev).toContain("--hot");
  });

  it("has src/index.ts entry point", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/index.ts"))).toBe(true);
  });

  it("has routes/ directory", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/routes"))).toBe(true);
  });

  it("has services/ directory", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/services"))).toBe(true);
  });

  it("has db/ directory", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db"))).toBe(true);
  });

  it("has lib/ directory", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/lib"))).toBe(true);
  });

  it("has tsconfig.json extending the root base", () => {
    const config = readJson("apps/api/tsconfig.json");
    expect(config.extends).toBe("../../tsconfig.base.json");
  });
});

describe("Frontend (apps/web)", () => {
  it("has package.json", () => {
    expect(existsSync(resolve(ROOT, "apps/web/package.json"))).toBe(true);
  });

  it("is named @virtual-agent/web", () => {
    const pkg = readJson("apps/web/package.json");
    expect(pkg.name).toBe("@virtual-agent/web");
  });

  it("depends on next", () => {
    const pkg = readJson("apps/web/package.json");
    expect(pkg.dependencies?.next).toBeDefined();
  });

  it("depends on react", () => {
    const pkg = readJson("apps/web/package.json");
    expect(pkg.dependencies?.react).toBeDefined();
  });

  it("depends on @tanstack/react-query", () => {
    const pkg = readJson("apps/web/package.json");
    expect(pkg.dependencies?.["@tanstack/react-query"]).toBeDefined();
  });

  it("has tailwindcss configured", () => {
    const pkg = readJson("apps/web/package.json");
    expect(pkg.devDependencies?.tailwindcss).toBeDefined();
  });

  it("has a dev script running next via portless", () => {
    const pkg = readJson("apps/web/package.json");
    expect(pkg.scripts?.dev).toContain("next dev");
    expect(pkg.scripts?.dev).toContain("portless");
  });

  it("has tsconfig.json extending the root base", () => {
    const config = readJson("apps/web/tsconfig.json");
    expect(config.extends).toBe("../../tsconfig.base.json");
  });

  it("has App Router layout", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/app/layout.tsx"))).toBe(true);
  });

  it("has dashboard page", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/app/page.tsx"))).toBe(true);
  });

  it("has tours page", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/app/tours/page.tsx"))).toBe(true);
  });

  it("has riders page", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/app/riders/page.tsx"))).toBe(true);
  });

  it("has settings page", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/app/settings/page.tsx"))).toBe(true);
  });

  it("has sidebar component", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/components/sidebar.tsx"))).toBe(true);
  });

  it("has API client utility", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/lib/api.ts"))).toBe(true);
  });

  it("has React Query provider", () => {
    expect(existsSync(resolve(ROOT, "apps/web/src/lib/query-provider.tsx"))).toBe(true);
  });

  it("layout wraps children with QueryProvider", () => {
    const content = readText("apps/web/src/app/layout.tsx");
    expect(content).toContain("QueryProvider");
  });

  it("layout includes Sidebar", () => {
    const content = readText("apps/web/src/app/layout.tsx");
    expect(content).toContain("Sidebar");
  });

  it("sidebar has navigation for Dashboard, Tours, Riders, Settings", () => {
    const content = readText("apps/web/src/components/sidebar.tsx");
    expect(content).toContain("Dashboard");
    expect(content).toContain("Tours");
    expect(content).toContain("Riders");
    expect(content).toContain("Settings");
  });

  it("API client reads NEXT_PUBLIC_API_URL env var", () => {
    const content = readText("apps/web/src/lib/api.ts");
    expect(content).toContain("NEXT_PUBLIC_API_URL");
  });

  it("postcss config uses @tailwindcss/postcss", () => {
    const content = readText("apps/web/postcss.config.mjs");
    expect(content).toContain("@tailwindcss/postcss");
  });

  it("globals.css imports tailwindcss", () => {
    const content = readText("apps/web/src/app/globals.css");
    expect(content).toContain("tailwindcss");
  });
});
