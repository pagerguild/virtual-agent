import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

// ── AC #1 — IATA code mapping utility exists ─────────────────────────

describe("AC #1 — IATA code mapping covers seed data cities", () => {
  it("iata-codes module exists", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/iata-codes.ts"))).toBe(true);
  });

  it("exports getIataCode and hasIataCode functions", () => {
    const content = readText("lib/flights/iata-codes.ts");
    expect(content).toContain("export function getIataCode");
    expect(content).toContain("export function hasIataCode");
  });

  it("maps all seed data cities (New York, Chicago, Austin, Los Angeles, Miami)", () => {
    const content = readText("lib/flights/iata-codes.ts");
    expect(content).toContain('"New York, NY"');
    expect(content).toContain('"Chicago, IL"');
    expect(content).toContain('"Austin, TX"');
    expect(content).toContain('"Los Angeles, CA"');
    expect(content).toContain('"Miami, FL"');
  });

  it("maps cities to correct IATA codes", () => {
    const content = readText("lib/flights/iata-codes.ts");
    expect(content).toContain('"JFK"');
    expect(content).toContain('"ORD"');
    expect(content).toContain('"AUS"');
    expect(content).toContain('"LAX"');
    expect(content).toContain('"MIA"');
  });
});

// ── AC #2 — Flight leg computation utility ───────────────────────────

describe("AC #2 — Flight legs computed from consecutive gigs", () => {
  it("compute-legs module exists", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/compute-legs.ts"))).toBe(true);
  });

  it("exports computeFlightLegs function", () => {
    const content = readText("lib/flights/compute-legs.ts");
    expect(content).toContain("export function computeFlightLegs");
  });

  it("uses getIataCode to resolve airport codes", () => {
    const content = readText("lib/flights/compute-legs.ts");
    expect(content).toContain("getIataCode");
  });

  it("defines FlightLeg type with origin/destination codes and departure date", () => {
    const content = readText("lib/flights/compute-legs.ts");
    expect(content).toContain("originCode");
    expect(content).toContain("destinationCode");
    expect(content).toContain("departureDate");
  });

  it("departure date is computed as day after origin gig", () => {
    const content = readText("lib/flights/compute-legs.ts");
    expect(content).toContain("getDate");
    expect(content).toContain("setDate");
  });
});

// ── AC #3 — Amadeus API client ───────────────────────────────────────

describe("AC #3 — Amadeus API client for flight search", () => {
  it("amadeus module exists", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/amadeus.ts"))).toBe(true);
  });

  it("exports searchFlights function", () => {
    const content = readText("lib/flights/amadeus.ts");
    expect(content).toContain("export async function searchFlights");
  });

  it("implements OAuth2 token flow", () => {
    const content = readText("lib/flights/amadeus.ts");
    expect(content).toContain("oauth2/token");
    expect(content).toContain("client_credentials");
    expect(content).toContain("AMADEUS_API_KEY");
    expect(content).toContain("AMADEUS_API_SECRET");
  });

  it("calls the Flight Offers Search v2 endpoint", () => {
    const content = readText("lib/flights/amadeus.ts");
    expect(content).toContain("flight-offers");
    expect(content).toContain("originLocationCode");
    expect(content).toContain("destinationLocationCode");
  });

  it("defines FlightOffer type with price, carrier, times, duration", () => {
    const content = readText("lib/flights/amadeus.ts");
    expect(content).toContain("price: string");
    expect(content).toContain("carrier: string");
    expect(content).toContain("carrierName: string");
    expect(content).toContain("departureTime: string");
    expect(content).toContain("arrivalTime: string");
    expect(content).toContain("durationFormatted: string");
  });

  it("exports formatDuration utility", () => {
    const content = readText("lib/flights/amadeus.ts");
    expect(content).toContain("export function formatDuration");
  });

  it("caches auth tokens to avoid unnecessary requests", () => {
    const content = readText("lib/flights/amadeus.ts");
    expect(content).toContain("cachedToken");
  });
});

// ── AC #4 — API route for flights ────────────────────────────────────

describe("AC #4 — API route serves flight options", () => {
  it("flights API route exists at app/api/flights/route.ts", () => {
    expect(existsSync(resolve(ROOT, "app/api/flights/route.ts"))).toBe(true);
  });

  it("exports a GET handler", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("export async function GET");
  });

  it("requires authentication via Supabase", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("createClient");
    expect(content).toContain("auth.getUser");
    expect(content).toContain("Unauthorized");
  });

  it("accepts tourId query parameter", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("tourId");
    expect(content).toContain("searchParams");
  });

  it("fetches gigs for the tour from database", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("db.query.gigs.findMany");
    expect(content).toContain("tour_id");
  });

  it("uses computeFlightLegs and searchFlights", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("computeFlightLegs");
    expect(content).toContain("searchFlights");
  });

  it("returns legs with offers in the response", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("FlightLegWithOffers");
    expect(content).toContain("legs");
    expect(content).toContain("offers");
  });

  it("handles errors per-leg gracefully", () => {
    const content = readText("app/api/flights/route.ts");
    expect(content).toContain("catch");
    expect(content).toContain("error");
  });
});

// ── AC #5 — Dashboard displays flight options section ────────────────

describe("AC #5 — Dashboard shows flight options between consecutive gig cities", () => {
  it("FlightOptions component exists", () => {
    expect(existsSync(resolve(ROOT, "components/flight-options.tsx"))).toBe(true);
  });

  it("FlightOptions is a client component", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain('"use client"');
  });

  it("FlightOptions fetches from /api/flights", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain("/api/flights");
    expect(content).toContain("tourId");
  });

  it("FlightOptions renders flight-options-section with data-testid", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain('data-testid="flight-options-section"');
  });

  it("FlightOptions displays leg routes (origin → destination cities)", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain("leg.originCity");
    expect(content).toContain("leg.destinationCity");
    expect(content).toContain('data-testid="flight-leg-route"');
  });

  it("FlightOptions displays IATA codes", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain("leg.originCode");
    expect(content).toContain("leg.destinationCode");
  });

  it("FlightOptions displays departure date for each leg", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain("leg.departureDate");
    expect(content).toContain('data-testid="flight-leg-date"');
  });

  it("FlightOptions displays offer details (carrier, times, duration, price)", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain("offer.carrierName");
    expect(content).toContain("offer.departureTime");
    expect(content).toContain("offer.arrivalTime");
    expect(content).toContain("offer.durationFormatted");
    expect(content).toContain("offer.price");
    expect(content).toContain('data-testid="flight-offer"');
  });

  it("FlightOptions displays stops information", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain("offer.stops");
    expect(content).toContain("Nonstop");
    expect(content).toContain('data-testid="flight-offer-stops"');
  });

  it("FlightOptions shows loading state", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain('data-testid="flight-options-loading"');
    expect(content).toContain("Loading flight options");
  });

  it("FlightOptions handles errors gracefully", () => {
    const content = readText("components/flight-options.tsx");
    expect(content).toContain('data-testid="flight-options-error"');
  });

  it("dashboard page imports FlightOptions component", () => {
    const content = readText("app/dashboard/page.tsx");
    expect(content).toContain("FlightOptions");
    expect(content).toContain("@/components/flight-options");
  });

  it("dashboard page passes tour ID to FlightOptions", () => {
    const content = readText("app/dashboard/page.tsx");
    expect(content).toContain("tourId={tour.id}");
  });

  it("dashboard page only renders FlightOptions when tour exists with 2+ gigs", () => {
    const content = readText("app/dashboard/page.tsx");
    expect(content).toContain("tour && gigs.length >= 2");
  });
});

// ── AC #6 — Barrel export for flights module ─────────────────────────

describe("AC #6 — Flights module is properly organized", () => {
  it("barrel index exists at lib/flights/index.ts", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/index.ts"))).toBe(true);
  });

  it("barrel re-exports all public APIs", () => {
    const content = readText("lib/flights/index.ts");
    expect(content).toContain("getIataCode");
    expect(content).toContain("hasIataCode");
    expect(content).toContain("computeFlightLegs");
    expect(content).toContain("searchFlights");
    expect(content).toContain("formatDuration");
    expect(content).toContain("FlightOffer");
    expect(content).toContain("FlightLeg");
  });
});

// ── AC #7 — Unit tests exist for flight utilities ────────────────────

describe("AC #7 — Unit tests exist for flight utilities", () => {
  it("IATA codes tests exist", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/__tests__/iata-codes.test.ts"))).toBe(true);
  });

  it("compute-legs tests exist", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/__tests__/compute-legs.test.ts"))).toBe(true);
  });

  it("amadeus tests exist", () => {
    expect(existsSync(resolve(ROOT, "lib/flights/__tests__/amadeus.test.ts"))).toBe(true);
  });
});
