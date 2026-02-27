import { describe, expect, it } from "bun:test";
import { getIataCode, hasIataCode } from "../iata-codes";

describe("getIataCode", () => {
  it("returns JFK for New York, NY", () => {
    expect(getIataCode("New York", "NY")).toBe("JFK");
  });

  it("returns ORD for Chicago, IL", () => {
    expect(getIataCode("Chicago", "IL")).toBe("ORD");
  });

  it("returns AUS for Austin, TX", () => {
    expect(getIataCode("Austin", "TX")).toBe("AUS");
  });

  it("returns LAX for Los Angeles, CA", () => {
    expect(getIataCode("Los Angeles", "CA")).toBe("LAX");
  });

  it("returns MIA for Miami, FL", () => {
    expect(getIataCode("Miami", "FL")).toBe("MIA");
  });

  it("returns ATL for Atlanta, GA", () => {
    expect(getIataCode("Atlanta", "GA")).toBe("ATL");
  });

  it("returns SFO for San Francisco, CA", () => {
    expect(getIataCode("San Francisco", "CA")).toBe("SFO");
  });

  it("returns SEA for Seattle, WA", () => {
    expect(getIataCode("Seattle", "WA")).toBe("SEA");
  });

  it("returns null for unknown city", () => {
    expect(getIataCode("Smallville", "KS")).toBeNull();
  });

  it("returns null for empty inputs", () => {
    expect(getIataCode("", "")).toBeNull();
  });

  it("is case-sensitive (city names must match exactly)", () => {
    expect(getIataCode("new york", "NY")).toBeNull();
    expect(getIataCode("NEW YORK", "NY")).toBeNull();
  });
});

describe("hasIataCode", () => {
  it("returns true for known city/state pairs", () => {
    expect(hasIataCode("New York", "NY")).toBe(true);
    expect(hasIataCode("Miami", "FL")).toBe(true);
  });

  it("returns false for unknown city/state pairs", () => {
    expect(hasIataCode("Smallville", "KS")).toBe(false);
  });
});
