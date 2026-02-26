import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

describe("Update dev scripts to use portless (issue #34)", () => {
  // ── AC #1 — Web dev script uses portless ─────────────────────────────

  describe("AC #1 — apps/web dev script runs through portless", () => {
    it("apps/web/package.json exists", () => {
      expect(existsSync(resolve(ROOT, "apps/web/package.json"))).toBe(true);
    });

    it('scripts.dev is "portless virtual-agent -- next dev"', () => {
      const pkg = readJson("apps/web/package.json");
      expect(pkg.scripts?.dev).toBe("portless virtual-agent -- next dev");
    });

    it("scripts.dev does not contain --port", () => {
      const pkg = readJson("apps/web/package.json");
      expect(pkg.scripts?.dev).not.toContain("--port");
    });
  });

  // ── AC #2 — API dev script uses portless ─────────────────────────────

  describe("AC #2 — apps/api dev script runs through portless", () => {
    it("apps/api/package.json exists", () => {
      expect(existsSync(resolve(ROOT, "apps/api/package.json"))).toBe(true);
    });

    it('scripts.dev is "portless api.virtual-agent -- bun run --hot src/index.ts"', () => {
      const pkg = readJson("apps/api/package.json");
      expect(pkg.scripts?.dev).toBe(
        "portless api.virtual-agent -- bun run --hot src/index.ts"
      );
    });
  });

  // ── AC #3 — Root dev script starts both apps via filter ──────────────

  describe("AC #3 — Root dev script starts both apps through portless", () => {
    it('root package.json scripts.dev is "bun run --filter \'*\' dev"', () => {
      const pkg = readJson("package.json");
      expect(pkg.scripts?.dev).toBe("bun run --filter '*' dev");
    });
  });

  // ── AC #6 — No hardcoded port numbers remain in dev scripts ──────────

  describe("AC #6 — No hardcoded port numbers in dev scripts", () => {
    it('apps/web scripts.dev does not contain "3000"', () => {
      const pkg = readJson("apps/web/package.json");
      expect(pkg.scripts?.dev).not.toContain("3000");
    });

    it('apps/web scripts.dev does not contain "4000"', () => {
      const pkg = readJson("apps/web/package.json");
      expect(pkg.scripts?.dev).not.toContain("4000");
    });

    it('apps/api scripts.dev does not contain "3000"', () => {
      const pkg = readJson("apps/api/package.json");
      expect(pkg.scripts?.dev).not.toContain("3000");
    });

    it('apps/api scripts.dev does not contain "4000"', () => {
      const pkg = readJson("apps/api/package.json");
      expect(pkg.scripts?.dev).not.toContain("4000");
    });
  });
});
