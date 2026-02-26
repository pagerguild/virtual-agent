import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

describe("Install portless (issue #33)", () => {
  // ── AC #1 — portless listed in root devDependencies ────────────────────

  describe("AC #1 — portless is listed as a root devDependency", () => {
    it("root package.json exists", () => {
      expect(existsSync(resolve(ROOT, "package.json"))).toBe(true);
    });

    it('devDependencies includes "portless" at version "^0.4.2"', () => {
      const pkg = readJson("package.json");
      expect(pkg.devDependencies?.portless).toBe("^0.4.2");
    });
  });

  // ── AC #2 — Root dev:portless script exists ────────────────────────────

  describe("AC #2 — Root package.json has a dev:portless script", () => {
    it('scripts includes a "dev:portless" entry', () => {
      const pkg = readJson("package.json");
      expect(pkg.scripts?.["dev:portless"]).toBeDefined();
    });

    it('"dev:portless" script is set to "portless dev"', () => {
      const pkg = readJson("package.json");
      expect(pkg.scripts?.["dev:portless"]).toBe("portless dev");
    });
  });

  // ── AC #3 — bun install succeeds after adding the dependency ───────────

  describe("AC #3 — bun install succeeds with no errors", () => {
    it("node_modules/portless directory exists", () => {
      expect(existsSync(resolve(ROOT, "node_modules/portless"))).toBe(true);
    });
  });

  // ── AC #4 — bunx portless --help works from the repo root ─────────────

  describe("AC #4 — bunx portless --help works from the repo root", () => {
    it("bunx portless --help exits with code 0", async () => {
      const proc = Bun.spawn(["bunx", "portless", "--help"], {
        cwd: ROOT,
        stdout: "pipe",
        stderr: "pipe",
      });
      const exitCode = await proc.exited;
      expect(exitCode).toBe(0);
    });

    it("bunx portless --help outputs usage information", async () => {
      const proc = Bun.spawn(["bunx", "portless", "--help"], {
        cwd: ROOT,
        stdout: "pipe",
        stderr: "pipe",
      });
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const output = stdout + stderr;
      await proc.exited;
      expect(output.toLowerCase()).toContain("usage");
    });
  });
});
