import { describe, expect, it } from "bun:test";
import { computeFlightLegs, type GigForLeg } from "../compute-legs";

// Helper to create a minimal gig
function makeGig(overrides: Partial<GigForLeg> & { city: string; state: string; date: string }): GigForLeg {
  return {
    id: `gig-${overrides.city}`,
    venue_name: `Venue in ${overrides.city}`,
    ...overrides,
  };
}

describe("computeFlightLegs", () => {
  it("returns empty array when fewer than 2 gigs", () => {
    expect(computeFlightLegs([])).toEqual([]);
    expect(
      computeFlightLegs([makeGig({ city: "New York", state: "NY", date: "2026-04-10" })])
    ).toEqual([]);
  });

  it("computes a single leg for 2 consecutive gigs", () => {
    const gigs = [
      makeGig({ id: "g1", city: "New York", state: "NY", date: "2026-04-10" }),
      makeGig({ id: "g2", city: "Chicago", state: "IL", date: "2026-04-14" }),
    ];

    const legs = computeFlightLegs(gigs);

    expect(legs).toHaveLength(1);
    expect(legs[0].originGigId).toBe("g1");
    expect(legs[0].destinationGigId).toBe("g2");
    expect(legs[0].originCity).toBe("New York, NY");
    expect(legs[0].destinationCity).toBe("Chicago, IL");
    expect(legs[0].originCode).toBe("JFK");
    expect(legs[0].destinationCode).toBe("ORD");
    expect(legs[0].departureDate).toBe("2026-04-11"); // day after gig
  });

  it("computes 4 legs for the seed data (5 gigs)", () => {
    const gigs = [
      makeGig({ id: "g1", city: "New York", state: "NY", date: "2026-04-10" }),
      makeGig({ id: "g2", city: "Chicago", state: "IL", date: "2026-04-14" }),
      makeGig({ id: "g3", city: "Austin", state: "TX", date: "2026-04-18" }),
      makeGig({ id: "g4", city: "Los Angeles", state: "CA", date: "2026-04-23" }),
      makeGig({ id: "g5", city: "Miami", state: "FL", date: "2026-04-28" }),
    ];

    const legs = computeFlightLegs(gigs);

    expect(legs).toHaveLength(4);

    // Leg 1: NYC → Chicago
    expect(legs[0].originCode).toBe("JFK");
    expect(legs[0].destinationCode).toBe("ORD");
    expect(legs[0].departureDate).toBe("2026-04-11");

    // Leg 2: Chicago → Austin
    expect(legs[1].originCode).toBe("ORD");
    expect(legs[1].destinationCode).toBe("AUS");
    expect(legs[1].departureDate).toBe("2026-04-15");

    // Leg 3: Austin → LA
    expect(legs[2].originCode).toBe("AUS");
    expect(legs[2].destinationCode).toBe("LAX");
    expect(legs[2].departureDate).toBe("2026-04-19");

    // Leg 4: LA → Miami
    expect(legs[3].originCode).toBe("LAX");
    expect(legs[3].destinationCode).toBe("MIA");
    expect(legs[3].departureDate).toBe("2026-04-24");
  });

  it("skips legs where both gigs are in the same city", () => {
    const gigs = [
      makeGig({ id: "g1", city: "New York", state: "NY", date: "2026-04-10" }),
      makeGig({ id: "g2", city: "New York", state: "NY", date: "2026-04-12" }),
      makeGig({ id: "g3", city: "Chicago", state: "IL", date: "2026-04-14" }),
    ];

    const legs = computeFlightLegs(gigs);

    expect(legs).toHaveLength(1);
    expect(legs[0].originGigId).toBe("g2");
    expect(legs[0].destinationGigId).toBe("g3");
    expect(legs[0].originCode).toBe("JFK");
    expect(legs[0].destinationCode).toBe("ORD");
  });

  it("skips legs where a city has no known IATA code", () => {
    const gigs = [
      makeGig({ id: "g1", city: "New York", state: "NY", date: "2026-04-10" }),
      makeGig({ id: "g2", city: "Smallville", state: "KS", date: "2026-04-14" }),
      makeGig({ id: "g3", city: "Chicago", state: "IL", date: "2026-04-18" }),
    ];

    const legs = computeFlightLegs(gigs);

    // Leg 1 (NYC→Smallville) skipped, Leg 2 (Smallville→Chicago) skipped
    expect(legs).toHaveLength(0);
  });

  it("departure date is the day after the origin gig date", () => {
    const gigs = [
      makeGig({ id: "g1", city: "New York", state: "NY", date: "2026-04-30" }),
      makeGig({ id: "g2", city: "Chicago", state: "IL", date: "2026-05-03" }),
    ];

    const legs = computeFlightLegs(gigs);
    expect(legs[0].departureDate).toBe("2026-05-01"); // May 1st (day after Apr 30th)
  });

  it("handles month boundary correctly", () => {
    const gigs = [
      makeGig({ id: "g1", city: "New York", state: "NY", date: "2026-01-31" }),
      makeGig({ id: "g2", city: "Miami", state: "FL", date: "2026-02-05" }),
    ];

    const legs = computeFlightLegs(gigs);
    expect(legs[0].departureDate).toBe("2026-02-01");
  });

  it("preserves origin and destination city display names", () => {
    const gigs = [
      makeGig({ id: "g1", city: "Los Angeles", state: "CA", date: "2026-04-10" }),
      makeGig({ id: "g2", city: "San Francisco", state: "CA", date: "2026-04-14" }),
    ];

    const legs = computeFlightLegs(gigs);
    expect(legs[0].originCity).toBe("Los Angeles, CA");
    expect(legs[0].destinationCity).toBe("San Francisco, CA");
  });
});
