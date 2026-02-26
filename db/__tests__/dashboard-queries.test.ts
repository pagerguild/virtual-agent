import { describe, expect, it, mock, beforeEach } from "bun:test";

/**
 * Tests for the dashboard data-access layer.
 *
 * Since we can't connect to the real database in unit tests, we test
 * the getDashboardData() function's contract: it should return
 * the expected shape and delegate to the Drizzle client.
 */

// We mock the db module to avoid needing a real DATABASE_URL
mock.module("@/db", () => {
  const mockArtist = {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Chic",
    email: "chic@example.com",
    preferences: { dietary: ["vegetarian"] },
    rider_template: "Standard rider template",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-01"),
  };

  const mockTour = {
    id: "00000000-0000-0000-0000-000000000002",
    artist_id: "00000000-0000-0000-0000-000000000001",
    name: "Spring Groove Tour 2026",
    start_date: "2026-04-10",
    end_date: "2026-04-28",
    budget: "15000.00",
    status: "planning",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-01"),
  };

  const mockGigs = [
    { id: "g1", tour_id: mockTour.id, venue_name: "Brooklyn Steel", city: "New York", state: "NY", date: "2026-04-10", rider_status: "draft", fee: "5000.00", created_at: new Date(), updated_at: new Date() },
    { id: "g2", tour_id: mockTour.id, venue_name: "Metro Chicago", city: "Chicago", state: "IL", date: "2026-04-14", rider_status: "draft", fee: "4500.00", created_at: new Date(), updated_at: new Date() },
    { id: "g3", tour_id: mockTour.id, venue_name: "Stubb's BBQ", city: "Austin", state: "TX", date: "2026-04-18", rider_status: "draft", fee: "4000.00", created_at: new Date(), updated_at: new Date() },
    { id: "g4", tour_id: mockTour.id, venue_name: "The Roxy Theatre", city: "Los Angeles", state: "CA", date: "2026-04-23", rider_status: "draft", fee: "5500.00", created_at: new Date(), updated_at: new Date() },
    { id: "g5", tour_id: mockTour.id, venue_name: "The Fillmore Miami Beach", city: "Miami", state: "FL", date: "2026-04-28", rider_status: "draft", fee: "4800.00", created_at: new Date(), updated_at: new Date() },
  ];

  const mockBookings = [
    { id: "b1", gig_id: "g1", type: "flight", provider: "Delta Air Lines", confirmation_number: "DL-2026-ABCDEF", cost: "320.00", created_at: new Date() },
    { id: "b2", gig_id: "g1", type: "hotel", provider: "The Williamsburg Hotel", confirmation_number: "WH-2026-XYZ789", cost: "275.00", created_at: new Date() },
  ];

  // Build a chainable query mock for Drizzle's relational query API
  const queryMock = {
    artists: {
      findFirst: mock(async () => mockArtist),
    },
    tours: {
      findFirst: mock(async () => mockTour),
    },
    gigs: {
      findMany: mock(async () => mockGigs),
    },
    bookings: {
      findMany: mock(async () => mockBookings),
    },
  };

  // Also support select().from() style
  const selectFromMock = mock(() => ({
    from: mock(() => Promise.resolve([mockArtist])),
  }));

  return {
    db: {
      query: queryMock,
      select: selectFromMock,
    },
    schema: {},
  };
});

// Now import the function under test AFTER mocking
const { getDashboardData } = await import("@/db/queries/dashboard");

describe("getDashboardData()", () => {
  it("returns an object with artist, tour, gigs, and bookings", async () => {
    const data = await getDashboardData();
    expect(data).toBeDefined();
    expect(data).toHaveProperty("artist");
    expect(data).toHaveProperty("tour");
    expect(data).toHaveProperty("gigs");
    expect(data).toHaveProperty("bookings");
  });

  it("returns the seeded artist 'Chic'", async () => {
    const data = await getDashboardData();
    expect(data.artist).toBeDefined();
    expect(data.artist!.name).toBe("Chic");
    expect(data.artist!.email).toBe("chic@example.com");
  });

  it("returns the seeded tour 'Spring Groove Tour 2026'", async () => {
    const data = await getDashboardData();
    expect(data.tour).toBeDefined();
    expect(data.tour!.name).toBe("Spring Groove Tour 2026");
    expect(data.tour!.status).toBe("planning");
  });

  it("returns 5 gigs across different cities", async () => {
    const data = await getDashboardData();
    expect(data.gigs).toHaveLength(5);
    const cities = data.gigs.map((g: { city: string }) => g.city);
    expect(cities).toContain("New York");
    expect(cities).toContain("Chicago");
    expect(cities).toContain("Austin");
    expect(cities).toContain("Los Angeles");
    expect(cities).toContain("Miami");
  });

  it("returns 2 bookings (1 flight, 1 hotel)", async () => {
    const data = await getDashboardData();
    expect(data.bookings).toHaveLength(2);
    const types = data.bookings.map((b: { type: string }) => b.type);
    expect(types).toContain("flight");
    expect(types).toContain("hotel");
  });
});
