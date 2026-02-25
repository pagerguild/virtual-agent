import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { healthRoute } from "../routes/health";

describe("GET /health", () => {
  const app = new Hono();
  app.route("/", healthRoute);

  it("returns 200 status", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });

  it('returns JSON with { status: "ok" }', async () => {
    const res = await app.request("/health");
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("returns Content-Type application/json", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
