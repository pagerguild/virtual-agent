import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

function collectSourceFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
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

describe("Update default URLs to portless subdomains (issue #35)", () => {
  // ── AC #1 — API CORS origin default uses portless subdomain ────────────

  describe("AC #1 — apps/api/src/index.ts CORS origin default is http://virtual-agent.localhost:1355", () => {
    it("apps/api/src/index.ts exists", () => {
      expect(existsSync(resolve(ROOT, "apps/api/src/index.ts"))).toBe(true);
    });

    it('CORS origin fallback is "http://virtual-agent.localhost:1355"', () => {
      const content = readText("apps/api/src/index.ts");
      expect(content).toContain('"http://virtual-agent.localhost:1355"');
    });
  });

  // ── AC #2 — Web API base URL default uses portless subdomain ───────────

  describe("AC #2 — apps/web/src/lib/api.ts API base URL default is http://api.virtual-agent.localhost:1355", () => {
    it("apps/web/src/lib/api.ts exists", () => {
      expect(existsSync(resolve(ROOT, "apps/web/src/lib/api.ts"))).toBe(true);
    });

    it('API base URL fallback is "http://api.virtual-agent.localhost:1355"', () => {
      const content = readText("apps/web/src/lib/api.ts");
      expect(content).toContain('"http://api.virtual-agent.localhost:1355"');
    });
  });

  // ── AC #3 — FRONTEND_URL env var override still works ──────────────────

  describe("AC #3 — process.env.FRONTEND_URL override still works", () => {
    it("CORS origin reads from process.env.FRONTEND_URL", () => {
      const content = readText("apps/api/src/index.ts");
      expect(content).toContain("process.env.FRONTEND_URL");
    });

    it('CORS origin uses || pattern to fall back to portless URL', () => {
      const content = readText("apps/api/src/index.ts");
      expect(content).toContain(
        'process.env.FRONTEND_URL || "http://virtual-agent.localhost:1355"'
      );
    });
  });

  // ── AC #4 — NEXT_PUBLIC_API_URL env var override still works ───────────

  describe("AC #4 — process.env.NEXT_PUBLIC_API_URL override still works", () => {
    it("API base URL reads from process.env.NEXT_PUBLIC_API_URL", () => {
      const content = readText("apps/web/src/lib/api.ts");
      expect(content).toContain("process.env.NEXT_PUBLIC_API_URL");
    });

    it('API base URL uses || pattern to fall back to portless URL', () => {
      const content = readText("apps/web/src/lib/api.ts");
      expect(content).toContain(
        'process.env.NEXT_PUBLIC_API_URL || "http://api.virtual-agent.localhost:1355"'
      );
    });
  });

  // ── AC #5 — No references to old localhost ports in application code ───

  describe("AC #5 — No references to localhost:3000 or localhost:4000 in application source code", () => {
    it('no file under apps/ contains "localhost:3000"', () => {
      const appsDir = resolve(ROOT, "apps");
      const files = collectSourceFiles(appsDir, [".ts", ".tsx", ".js", ".jsx"]);
      for (const file of files) {
        const content = readFileSync(file, "utf-8");
        expect(content).not.toContain("localhost:3000");
      }
    });

    it('no file under apps/ contains "localhost:4000"', () => {
      const appsDir = resolve(ROOT, "apps");
      const files = collectSourceFiles(appsDir, [".ts", ".tsx", ".js", ".jsx"]);
      for (const file of files) {
        const content = readFileSync(file, "utf-8");
        expect(content).not.toContain("localhost:4000");
      }
    });
  });
});
