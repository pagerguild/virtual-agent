import { describe, expect, it } from "bun:test";

describe("API app module", () => {
  it("exports a default with port and fetch", async () => {
    const mod = await import("../index");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default.port).toBe("number");
    expect(mod.default.port).toBeGreaterThan(0);
    expect(typeof mod.default.fetch).toBe("function");
  });
});
