import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "../routes/health";

describe("CORS middleware", () => {
  it("includes Access-Control-Allow-Origin header for default frontend origin", async () => {
    const app = new Hono();
    app.use(
      "*",
      cors({
        origin: process.env.FRONTEND_URL || "http://virtual-agent.localhost:1355",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      })
    );
    app.route("/", healthRoute);

    const request = new Request("http://localhost/health", {
      method: "GET",
      headers: {
        Origin: "http://virtual-agent.localhost:1355",
      },
    });

    const response = await app.request(request);
    const allowOrigin = response.headers.get("access-control-allow-origin");
    expect(allowOrigin).toBe("http://virtual-agent.localhost:1355");
  });
});
