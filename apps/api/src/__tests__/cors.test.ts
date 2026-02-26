import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "../routes/health";

const DEFAULT_FRONTEND_URL = "http://virtual-agent.localhost:1355";

describe("CORS middleware", () => {
  it("includes Access-Control-Allow-Origin header for default frontend origin", async () => {
    const app = new Hono();
    app.use(
      "*",
      cors({
        origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      })
    );
    app.route("/", healthRoute);

    const request = new Request("http://localhost/health", {
      method: "GET",
      headers: {
        Origin: DEFAULT_FRONTEND_URL,
      },
    });

    const response = await app.request(request);
    const allowOrigin = response.headers.get("access-control-allow-origin");
    expect(allowOrigin).toBe(DEFAULT_FRONTEND_URL);
  });
});
