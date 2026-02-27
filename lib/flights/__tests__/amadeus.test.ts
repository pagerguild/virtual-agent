import { describe, expect, it, beforeEach, mock, afterEach } from "bun:test";
import { formatDuration, resetTokenCache } from "../amadeus";

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration("PT4H30M")).toBe("4h 30m");
  });

  it("formats hours only", () => {
    expect(formatDuration("PT2H")).toBe("2h");
  });

  it("formats minutes only", () => {
    expect(formatDuration("PT45M")).toBe("45m");
  });

  it("formats double-digit hours and minutes", () => {
    expect(formatDuration("PT12H55M")).toBe("12h 55m");
  });

  it("returns original string for unrecognized format", () => {
    expect(formatDuration("invalid")).toBe("invalid");
  });

  it("handles PT0H0M edge case", () => {
    // While unlikely, the function should handle it gracefully
    expect(formatDuration("PT0H0M")).toBe("0h 0m");
  });
});

describe("searchFlights (mocked)", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetTokenCache();
    process.env.AMADEUS_API_KEY = "test-key";
    process.env.AMADEUS_API_SECRET = "test-secret";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.AMADEUS_API_KEY = originalEnv.AMADEUS_API_KEY;
    process.env.AMADEUS_API_SECRET = originalEnv.AMADEUS_API_SECRET;
  });

  it("throws when credentials are missing", async () => {
    delete process.env.AMADEUS_API_KEY;
    delete process.env.AMADEUS_API_SECRET;

    // Re-import to get fresh module behavior
    const { searchFlights, resetTokenCache: reset } = await import("../amadeus");
    reset();

    expect(searchFlights("JFK", "ORD", "2026-04-11")).rejects.toThrow(
      "AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables are required"
    );
  });

  it("calls Amadeus token endpoint and flight search endpoint", async () => {
    const calls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      calls.push(url);

      // Token endpoint
      if (url.includes("oauth2/token")) {
        return new Response(
          JSON.stringify({
            access_token: "mock-token-abc",
            token_type: "Bearer",
            expires_in: 1799,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Flight search endpoint
      if (url.includes("flight-offers")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "1",
                itineraries: [
                  {
                    duration: "PT3H15M",
                    segments: [
                      {
                        departure: { iataCode: "JFK", at: "2026-04-11T08:00:00" },
                        arrival: { iataCode: "ORD", at: "2026-04-11T10:15:00" },
                        carrierCode: "AA",
                        number: "123",
                        numberOfStops: 0,
                      },
                    ],
                  },
                ],
                price: { total: "189.50", currency: "USD" },
              },
            ],
            dictionaries: {
              carriers: { AA: "American Airlines" },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response("Not found", { status: 404 });
    }) as typeof fetch;

    const { searchFlights, resetTokenCache: reset } = await import("../amadeus");
    reset();

    const offers = await searchFlights("JFK", "ORD", "2026-04-11", 3);

    // Should have called both endpoints
    expect(calls.some((url) => url.includes("oauth2/token"))).toBe(true);
    expect(calls.some((url) => url.includes("flight-offers"))).toBe(true);

    // Should parse the offer correctly
    expect(offers).toHaveLength(1);
    expect(offers[0].id).toBe("1");
    expect(offers[0].price).toBe("189.50");
    expect(offers[0].currency).toBe("USD");
    expect(offers[0].carrier).toBe("AA");
    expect(offers[0].carrierName).toBe("American Airlines");
    expect(offers[0].stops).toBe(0);
    expect(offers[0].departureTime).toBe("2026-04-11T08:00:00");
    expect(offers[0].arrivalTime).toBe("2026-04-11T10:15:00");
    expect(offers[0].duration).toBe("PT3H15M");
    expect(offers[0].durationFormatted).toBe("3h 15m");
  });

  it("handles multi-segment (connecting) flights", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url.includes("oauth2/token")) {
        return new Response(
          JSON.stringify({ access_token: "mock-token", token_type: "Bearer", expires_in: 1799 }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("flight-offers")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "2",
                itineraries: [
                  {
                    duration: "PT7H45M",
                    segments: [
                      {
                        departure: { iataCode: "JFK", at: "2026-04-11T06:00:00" },
                        arrival: { iataCode: "ATL", at: "2026-04-11T09:00:00" },
                        carrierCode: "DL",
                        number: "456",
                        numberOfStops: 0,
                      },
                      {
                        departure: { iataCode: "ATL", at: "2026-04-11T10:30:00" },
                        arrival: { iataCode: "LAX", at: "2026-04-11T13:45:00" },
                        carrierCode: "DL",
                        number: "789",
                        numberOfStops: 0,
                      },
                    ],
                  },
                ],
                price: { total: "245.00", currency: "USD" },
              },
            ],
            dictionaries: { carriers: { DL: "Delta Air Lines" } },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response("Not found", { status: 404 });
    }) as typeof fetch;

    const { searchFlights, resetTokenCache: reset } = await import("../amadeus");
    reset();

    const offers = await searchFlights("JFK", "LAX", "2026-04-11");

    expect(offers).toHaveLength(1);
    expect(offers[0].stops).toBe(1); // 2 segments = 1 stop
    expect(offers[0].departureTime).toBe("2026-04-11T06:00:00");
    expect(offers[0].arrivalTime).toBe("2026-04-11T13:45:00"); // last segment arrival
    expect(offers[0].carrierName).toBe("Delta Air Lines");
  });
});
