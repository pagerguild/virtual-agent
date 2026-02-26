import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { eq, sql } from "drizzle-orm";

const ROOT = resolve(import.meta.dir, "..");

function readJson(relativePath: string) {
  const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
  return JSON.parse(content);
}

function readText(relativePath: string) {
  return readFileSync(resolve(ROOT, relativePath), "utf-8");
}

// ── AC #7 — Tooling: Drizzle ORM + drizzle-kit installed and configured ──

describe("AC #7 — Drizzle ORM and drizzle-kit installed and configured", () => {
  it("drizzle-orm is listed as a dependency in apps/api/package.json", () => {
    const pkg = readJson("apps/api/package.json");
    expect(pkg.dependencies?.["drizzle-orm"]).toBeDefined();
  });

  it("drizzle-kit is listed as a dev dependency in apps/api/package.json", () => {
    const pkg = readJson("apps/api/package.json");
    expect(pkg.devDependencies?.["drizzle-kit"]).toBeDefined();
  });

  it("drizzle.config.ts exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/drizzle.config.ts"))).toBe(true);
  });

  it("drizzle.config.ts references the schema directory", () => {
    const content = readText("apps/api/drizzle.config.ts");
    expect(content).toContain("./src/db/schema");
  });

  it("drizzle.config.ts configures SQLite as the dialect", () => {
    const content = readText("apps/api/drizzle.config.ts");
    expect(content).toContain('"sqlite"');
  });
});

// ── AC #8–11 — Tooling scripts ──

describe("AC #8–11 — Database scripts exist in apps/api/package.json", () => {
  const pkg = readJson("apps/api/package.json");

  it("has a db:generate script", () => {
    expect(pkg.scripts?.["db:generate"]).toBeDefined();
  });

  it("has a db:migrate script", () => {
    expect(pkg.scripts?.["db:migrate"]).toBeDefined();
  });

  it("has a db:studio script that invokes drizzle-kit studio", () => {
    expect(pkg.scripts?.["db:studio"]).toBeDefined();
    expect(pkg.scripts?.["db:studio"]).toContain("drizzle-kit studio");
  });

  it("has a db:seed script", () => {
    expect(pkg.scripts?.["db:seed"]).toBeDefined();
  });
});

// ── AC #12 — SQLite database gitignored ──

describe("AC #12 — SQLite database is gitignored", () => {
  it(".gitignore contains *.db", () => {
    const content = readText(".gitignore");
    expect(content).toContain("*.db");
  });
});

// ── Schema files exist ──

describe("Schema files exist", () => {
  it("apps/api/src/db/schema/ directory exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema"))).toBe(true);
  });

  it("artists schema file exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema/artists.ts"))).toBe(true);
  });

  it("tours schema file exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema/tours.ts"))).toBe(true);
  });

  it("gigs schema file exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema/gigs.ts"))).toBe(true);
  });

  it("bookings schema file exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema/bookings.ts"))).toBe(true);
  });

  it("riders schema file exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema/riders.ts"))).toBe(true);
  });

  it("schema index barrel file exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/schema/index.ts"))).toBe(true);
  });
});

// ── AC #18–20 — Database client ──

describe("AC #18–20 — Database client", () => {
  it("apps/api/src/db/index.ts exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/index.ts"))).toBe(true);
  });

  it("exports a Drizzle client instance (db)", () => {
    const content = readText("apps/api/src/db/index.ts");
    expect(content).toContain("export const db");
  });

  it("references DATABASE_URL environment variable", () => {
    const content = readText("apps/api/src/db/index.ts");
    expect(content).toContain("DATABASE_URL");
  });

  it("falls back to ./local.db when DATABASE_URL is not set", () => {
    const content = readText("apps/api/src/db/index.ts");
    expect(content).toContain("./local.db");
  });

  it("exports schema for use in route handlers", () => {
    const content = readText("apps/api/src/db/index.ts");
    expect(content).toContain("export { schema }");
  });

  it("exports DbClient type", () => {
    const content = readText("apps/api/src/db/index.ts");
    expect(content).toContain("export type DbClient");
  });
});

// ── AC #13 — Seed script file ──

describe("AC #13 — Seed script file exists", () => {
  it("apps/api/src/db/seed.ts exists", () => {
    expect(existsSync(resolve(ROOT, "apps/api/src/db/seed.ts"))).toBe(true);
  });

  it("exports a seed function", () => {
    const content = readText("apps/api/src/db/seed.ts");
    expect(content).toContain("export async function seed");
  });
});

// ── Schema column and FK tests (using actual imports) ──

describe("Schema definitions — column and constraint verification", () => {
  // Import the schema modules
  let artistsSchema: any;
  let toursSchema: any;
  let gigsSchema: any;
  let bookingsSchema: any;
  let ridersSchema: any;

  beforeAll(async () => {
    artistsSchema = await import("../apps/api/src/db/schema/artists");
    toursSchema = await import("../apps/api/src/db/schema/tours");
    gigsSchema = await import("../apps/api/src/db/schema/gigs");
    bookingsSchema = await import("../apps/api/src/db/schema/bookings");
    ridersSchema = await import("../apps/api/src/db/schema/riders");
  });

  // AC #1 — Artist table
  describe("AC #1 — Artist table columns", () => {
    it("has id column", () => {
      expect(artistsSchema.artists.id).toBeDefined();
    });
    it("has name column", () => {
      expect(artistsSchema.artists.name).toBeDefined();
    });
    it("has email column", () => {
      expect(artistsSchema.artists.email).toBeDefined();
    });
    it("has preferences column", () => {
      expect(artistsSchema.artists.preferences).toBeDefined();
    });
    it("has rider_template column", () => {
      expect(artistsSchema.artists.rider_template).toBeDefined();
    });
    it("has created_at column", () => {
      expect(artistsSchema.artists.created_at).toBeDefined();
    });
    it("has updated_at column", () => {
      expect(artistsSchema.artists.updated_at).toBeDefined();
    });
  });

  // AC #2 — Tour table
  describe("AC #2 — Tour table columns", () => {
    it("has id column", () => {
      expect(toursSchema.tours.id).toBeDefined();
    });
    it("has artist_id column", () => {
      expect(toursSchema.tours.artist_id).toBeDefined();
    });
    it("has name column", () => {
      expect(toursSchema.tours.name).toBeDefined();
    });
    it("has start_date column", () => {
      expect(toursSchema.tours.start_date).toBeDefined();
    });
    it("has end_date column", () => {
      expect(toursSchema.tours.end_date).toBeDefined();
    });
    it("has budget column", () => {
      expect(toursSchema.tours.budget).toBeDefined();
    });
    it("has status column", () => {
      expect(toursSchema.tours.status).toBeDefined();
    });
    it("has created_at column", () => {
      expect(toursSchema.tours.created_at).toBeDefined();
    });
    it("has updated_at column", () => {
      expect(toursSchema.tours.updated_at).toBeDefined();
    });

    it("tour status enum includes planning, confirmed, in_progress, completed", () => {
      expect(toursSchema.tourStatusEnum).toEqual([
        "planning",
        "confirmed",
        "in_progress",
        "completed",
      ]);
    });
  });

  // AC #3 — Gig table
  describe("AC #3 — Gig table columns", () => {
    it("has id column", () => {
      expect(gigsSchema.gigs.id).toBeDefined();
    });
    it("has tour_id column", () => {
      expect(gigsSchema.gigs.tour_id).toBeDefined();
    });
    it("has venue_name column", () => {
      expect(gigsSchema.gigs.venue_name).toBeDefined();
    });
    it("has city column", () => {
      expect(gigsSchema.gigs.city).toBeDefined();
    });
    it("has state column", () => {
      expect(gigsSchema.gigs.state).toBeDefined();
    });
    it("has date column", () => {
      expect(gigsSchema.gigs.date).toBeDefined();
    });
    it("has promoter_name column", () => {
      expect(gigsSchema.gigs.promoter_name).toBeDefined();
    });
    it("has promoter_email column", () => {
      expect(gigsSchema.gigs.promoter_email).toBeDefined();
    });
    it("has fee column", () => {
      expect(gigsSchema.gigs.fee).toBeDefined();
    });
    it("has rider_status column", () => {
      expect(gigsSchema.gigs.rider_status).toBeDefined();
    });
    it("has created_at column", () => {
      expect(gigsSchema.gigs.created_at).toBeDefined();
    });
    it("has updated_at column", () => {
      expect(gigsSchema.gigs.updated_at).toBeDefined();
    });

    it("rider_status enum includes draft, sent, signed", () => {
      expect(gigsSchema.riderStatusEnum).toEqual(["draft", "sent", "signed"]);
    });
  });

  // AC #4 — Booking table
  describe("AC #4 — Booking table columns", () => {
    it("has id column", () => {
      expect(bookingsSchema.bookings.id).toBeDefined();
    });
    it("has gig_id column", () => {
      expect(bookingsSchema.bookings.gig_id).toBeDefined();
    });
    it("has type column", () => {
      expect(bookingsSchema.bookings.type).toBeDefined();
    });
    it("has provider column", () => {
      expect(bookingsSchema.bookings.provider).toBeDefined();
    });
    it("has confirmation_number column", () => {
      expect(bookingsSchema.bookings.confirmation_number).toBeDefined();
    });
    it("has cost column", () => {
      expect(bookingsSchema.bookings.cost).toBeDefined();
    });
    it("has check_in column", () => {
      expect(bookingsSchema.bookings.check_in).toBeDefined();
    });
    it("has check_out column", () => {
      expect(bookingsSchema.bookings.check_out).toBeDefined();
    });
    it("has details column", () => {
      expect(bookingsSchema.bookings.details).toBeDefined();
    });
    it("has created_at column", () => {
      expect(bookingsSchema.bookings.created_at).toBeDefined();
    });

    it("booking type enum includes flight and hotel", () => {
      expect(bookingsSchema.bookingTypeEnum).toEqual(["flight", "hotel"]);
    });
  });

  // AC #5 — Rider table
  describe("AC #5 — Rider table columns", () => {
    it("has id column", () => {
      expect(ridersSchema.riders.id).toBeDefined();
    });
    it("has gig_id column", () => {
      expect(ridersSchema.riders.gig_id).toBeDefined();
    });
    it("has content column", () => {
      expect(ridersSchema.riders.content).toBeDefined();
    });
    it("has pdf_url column", () => {
      expect(ridersSchema.riders.pdf_url).toBeDefined();
    });
    it("has status column", () => {
      expect(ridersSchema.riders.status).toBeDefined();
    });
    it("has created_at column", () => {
      expect(ridersSchema.riders.created_at).toBeDefined();
    });
    it("has updated_at column", () => {
      expect(ridersSchema.riders.updated_at).toBeDefined();
    });

    it("rider status enum includes draft, sent, signed", () => {
      expect(ridersSchema.riderDocStatusEnum).toEqual(["draft", "sent", "signed"]);
    });
  });
});

// ── Live database tests (in-memory SQLite) ──

describe("Live database tests (in-memory SQLite)", () => {
  let sqlite: Database;
  let db: ReturnType<typeof drizzle>;
  let artistsTable: any;
  let toursTable: any;
  let gigsTable: any;
  let bookingsTable: any;
  let ridersTable: any;

  beforeAll(async () => {
    // Import schemas
    const schema = await import("../apps/api/src/db/schema");
    artistsTable = schema.artists;
    toursTable = schema.tours;
    gigsTable = schema.gigs;
    bookingsTable = schema.bookings;
    ridersTable = schema.riders;

    // Create in-memory database and run migrations
    sqlite = new Database(":memory:");
    sqlite.exec("PRAGMA foreign_keys = ON;");
    db = drizzle(sqlite, { schema });
    migrate(db, {
      migrationsFolder: resolve(ROOT, "apps/api/drizzle"),
    });
  });

  afterAll(() => {
    sqlite.close();
  });

  // AC #1–5 — Schema: tables exist with correct structure
  describe("Tables are created by migrations", () => {
    it("artists table exists", () => {
      const result = sqlite
        .query("SELECT name FROM sqlite_master WHERE type='table' AND name='artists'")
        .get() as any;
      expect(result).toBeDefined();
      expect(result.name).toBe("artists");
    });

    it("tours table exists", () => {
      const result = sqlite
        .query("SELECT name FROM sqlite_master WHERE type='table' AND name='tours'")
        .get() as any;
      expect(result).toBeDefined();
      expect(result.name).toBe("tours");
    });

    it("gigs table exists", () => {
      const result = sqlite
        .query("SELECT name FROM sqlite_master WHERE type='table' AND name='gigs'")
        .get() as any;
      expect(result).toBeDefined();
      expect(result.name).toBe("gigs");
    });

    it("bookings table exists", () => {
      const result = sqlite
        .query("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'")
        .get() as any;
      expect(result).toBeDefined();
      expect(result.name).toBe("bookings");
    });

    it("riders table exists", () => {
      const result = sqlite
        .query("SELECT name FROM sqlite_master WHERE type='table' AND name='riders'")
        .get() as any;
      expect(result).toBeDefined();
      expect(result.name).toBe("riders");
    });
  });

  // AC #5 — Rider gig_id unique constraint
  describe("Rider gig_id unique constraint", () => {
    it("riders_gig_id_unique index exists", () => {
      const result = sqlite
        .query("SELECT name FROM sqlite_master WHERE type='index' AND name='riders_gig_id_unique'")
        .get() as any;
      expect(result).toBeDefined();
      expect(result.name).toBe("riders_gig_id_unique");
    });
  });

  // AC #6 — Cascade deletes
  describe("AC #6 — Cascade deletes", () => {
    it("deleting a tour cascades to its gigs", () => {
      // Insert artist
      db.insert(artistsTable)
        .values({ id: "artist-cascade-1", name: "Test", email: "test@test.com" })
        .run();

      // Insert tour
      db.insert(toursTable)
        .values({
          id: "tour-cascade-1",
          artist_id: "artist-cascade-1",
          name: "Test Tour",
          start_date: "2026-01-01",
          end_date: "2026-01-15",
        })
        .run();

      // Insert gig
      db.insert(gigsTable)
        .values({
          id: "gig-cascade-1",
          tour_id: "tour-cascade-1",
          venue_name: "Test Venue",
          city: "Test City",
          state: "TS",
          date: "2026-01-05",
        })
        .run();

      // Verify gig exists
      const gigsBefore = db
        .select()
        .from(gigsTable)
        .where(eq(gigsTable.tour_id, "tour-cascade-1"))
        .all();
      expect(gigsBefore.length).toBe(1);

      // Delete tour
      db.delete(toursTable).where(eq(toursTable.id, "tour-cascade-1")).run();

      // Verify gig is deleted
      const gigsAfter = db
        .select()
        .from(gigsTable)
        .where(eq(gigsTable.tour_id, "tour-cascade-1"))
        .all();
      expect(gigsAfter.length).toBe(0);

      // Cleanup
      db.delete(artistsTable).where(eq(artistsTable.id, "artist-cascade-1")).run();
    });

    it("deleting a gig cascades to its bookings and rider", () => {
      // Insert artist
      db.insert(artistsTable)
        .values({ id: "artist-cascade-2", name: "Test2", email: "test2@test.com" })
        .run();

      // Insert tour
      db.insert(toursTable)
        .values({
          id: "tour-cascade-2",
          artist_id: "artist-cascade-2",
          name: "Test Tour 2",
          start_date: "2026-02-01",
          end_date: "2026-02-15",
        })
        .run();

      // Insert gig
      db.insert(gigsTable)
        .values({
          id: "gig-cascade-2",
          tour_id: "tour-cascade-2",
          venue_name: "Test Venue 2",
          city: "Test City 2",
          state: "TS",
          date: "2026-02-05",
        })
        .run();

      // Insert booking
      db.insert(bookingsTable)
        .values({
          id: "booking-cascade-1",
          gig_id: "gig-cascade-2",
          type: "flight",
        })
        .run();

      // Insert rider
      db.insert(ridersTable)
        .values({
          id: "rider-cascade-1",
          gig_id: "gig-cascade-2",
          status: "draft",
        })
        .run();

      // Verify they exist
      const bookingsBefore = db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.gig_id, "gig-cascade-2"))
        .all();
      expect(bookingsBefore.length).toBe(1);

      const ridersBefore = db
        .select()
        .from(ridersTable)
        .where(eq(ridersTable.gig_id, "gig-cascade-2"))
        .all();
      expect(ridersBefore.length).toBe(1);

      // Delete gig
      db.delete(gigsTable).where(eq(gigsTable.id, "gig-cascade-2")).run();

      // Verify bookings deleted
      const bookingsAfter = db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.gig_id, "gig-cascade-2"))
        .all();
      expect(bookingsAfter.length).toBe(0);

      // Verify rider deleted
      const ridersAfter = db
        .select()
        .from(ridersTable)
        .where(eq(ridersTable.gig_id, "gig-cascade-2"))
        .all();
      expect(ridersAfter.length).toBe(0);

      // Cleanup
      db.delete(toursTable).where(eq(toursTable.id, "tour-cascade-2")).run();
      db.delete(artistsTable).where(eq(artistsTable.id, "artist-cascade-2")).run();
    });

    it("deleting a tour cascades through gigs to bookings and riders", () => {
      // Insert full chain
      db.insert(artistsTable)
        .values({ id: "artist-cascade-3", name: "Test3", email: "test3@test.com" })
        .run();
      db.insert(toursTable)
        .values({
          id: "tour-cascade-3",
          artist_id: "artist-cascade-3",
          name: "Test Tour 3",
          start_date: "2026-03-01",
          end_date: "2026-03-15",
        })
        .run();
      db.insert(gigsTable)
        .values({
          id: "gig-cascade-3",
          tour_id: "tour-cascade-3",
          venue_name: "Test Venue 3",
          city: "Test City 3",
          state: "TS",
          date: "2026-03-05",
        })
        .run();
      db.insert(bookingsTable)
        .values({ id: "booking-cascade-2", gig_id: "gig-cascade-3", type: "hotel" })
        .run();
      db.insert(ridersTable)
        .values({ id: "rider-cascade-2", gig_id: "gig-cascade-3", status: "draft" })
        .run();

      // Delete tour — should cascade through gigs to bookings/riders
      db.delete(toursTable).where(eq(toursTable.id, "tour-cascade-3")).run();

      const gigsAfter = db
        .select()
        .from(gigsTable)
        .where(eq(gigsTable.id, "gig-cascade-3"))
        .all();
      expect(gigsAfter.length).toBe(0);

      const bookingsAfter = db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.id, "booking-cascade-2"))
        .all();
      expect(bookingsAfter.length).toBe(0);

      const ridersAfter = db
        .select()
        .from(ridersTable)
        .where(eq(ridersTable.id, "rider-cascade-2"))
        .all();
      expect(ridersAfter.length).toBe(0);

      // Cleanup
      db.delete(artistsTable).where(eq(artistsTable.id, "artist-cascade-3")).run();
    });
  });

  // Foreign key enforcement
  describe("Foreign key constraints are enforced", () => {
    it("cannot insert a tour with a non-existent artist_id", () => {
      expect(() => {
        db.insert(toursTable)
          .values({
            id: "tour-fk-test",
            artist_id: "nonexistent-artist",
            name: "Bad Tour",
            start_date: "2026-01-01",
            end_date: "2026-01-15",
          })
          .run();
      }).toThrow();
    });

    it("cannot insert a gig with a non-existent tour_id", () => {
      expect(() => {
        db.insert(gigsTable)
          .values({
            id: "gig-fk-test",
            tour_id: "nonexistent-tour",
            venue_name: "Bad Venue",
            city: "Nowhere",
            state: "XX",
            date: "2026-01-01",
          })
          .run();
      }).toThrow();
    });

    it("cannot insert a booking with a non-existent gig_id", () => {
      expect(() => {
        db.insert(bookingsTable)
          .values({
            id: "booking-fk-test",
            gig_id: "nonexistent-gig",
            type: "flight",
          })
          .run();
      }).toThrow();
    });

    it("cannot insert a rider with a non-existent gig_id", () => {
      expect(() => {
        db.insert(ridersTable)
          .values({
            id: "rider-fk-test",
            gig_id: "nonexistent-gig",
            status: "draft",
          })
          .run();
      }).toThrow();
    });
  });
});

// ── Seed data verification (using the actual local.db) ──

describe("Seed data verification (local.db)", () => {
  let sqlite: Database;
  let db: ReturnType<typeof drizzle>;
  let schema: any;

  beforeAll(async () => {
    schema = await import("../apps/api/src/db/schema");
    const dbPath = resolve(ROOT, "apps/api/local.db");

    if (!existsSync(dbPath)) {
      throw new Error(
        "local.db does not exist. Run 'bun run db:seed' from apps/api first."
      );
    }

    sqlite = new Database(dbPath, { readonly: true });
    sqlite.exec("PRAGMA foreign_keys = ON;");
    db = drizzle(sqlite, { schema });
  });

  afterAll(() => {
    sqlite?.close();
  });

  // AC #13 — Seed: 1 sample artist (Chic)
  describe("AC #13 — Seed: 1 sample artist (Chic)", () => {
    it("artists table contains exactly 1 row", () => {
      const rows = db.select().from(schema.artists).all();
      expect(rows.length).toBe(1);
    });

    it("artist name is Chic", () => {
      const rows = db.select().from(schema.artists).all();
      expect(rows[0].name).toBe("Chic");
    });

    it("artist has an email", () => {
      const rows = db.select().from(schema.artists).all();
      expect(rows[0].email).toBeDefined();
      expect(rows[0].email.length).toBeGreaterThan(0);
    });
  });

  // AC #14 — Seed: 1 tour with 5 gigs
  describe("AC #14 — Seed: 1 tour with 5 gigs across different US cities", () => {
    it("tours table contains exactly 1 row", () => {
      const rows = db.select().from(schema.tours).all();
      expect(rows.length).toBe(1);
    });

    it("gigs table contains exactly 5 rows", () => {
      const rows = db.select().from(schema.gigs).all();
      expect(rows.length).toBe(5);
    });

    it("gigs span different US cities", () => {
      const rows = db.select().from(schema.gigs).all();
      const cities = rows.map((g: any) => g.city);
      const uniqueCities = new Set(cities);
      expect(uniqueCities.size).toBe(5);
    });
  });

  // AC #15 — Seed: Realistic dates
  describe("AC #15 — Seed gigs have realistic dates spread across 2-3 weeks", () => {
    it("gig dates span at least 14 days", () => {
      const rows = db.select().from(schema.gigs).all();
      const dates = rows.map((g: any) => new Date(g.date).getTime()).sort((a: number, b: number) => a - b);
      const diffDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(14);
    });

    it("gig dates span no more than 21 days", () => {
      const rows = db.select().from(schema.gigs).all();
      const dates = rows.map((g: any) => new Date(g.date).getTime()).sort((a: number, b: number) => a - b);
      const diffDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeLessThanOrEqual(21);
    });
  });

  // AC #16 — Seed: 2 sample bookings
  describe("AC #16 — Seed: 2 sample bookings (1 flight, 1 hotel) on first gig", () => {
    it("bookings table contains exactly 2 rows", () => {
      const rows = db.select().from(schema.bookings).all();
      expect(rows.length).toBe(2);
    });

    it("one booking has type flight", () => {
      const rows = db.select().from(schema.bookings).all();
      const flights = rows.filter((b: any) => b.type === "flight");
      expect(flights.length).toBe(1);
    });

    it("one booking has type hotel", () => {
      const rows = db.select().from(schema.bookings).all();
      const hotels = rows.filter((b: any) => b.type === "hotel");
      expect(hotels.length).toBe(1);
    });

    it("both bookings reference the same gig (the first gig)", () => {
      const bookingRows = db.select().from(schema.bookings).all();
      const gigIds = bookingRows.map((b: any) => b.gig_id);
      expect(gigIds[0]).toBe(gigIds[1]);

      // Verify it's the first gig (earliest date)
      const gigRows = db.select().from(schema.gigs).all();
      const sortedGigs = [...gigRows].sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      expect(gigIds[0]).toBe(sortedGigs[0].id);
    });
  });

  // AC #17 — Seed: 1 sample rider in draft status
  describe("AC #17 — Seed: 1 sample rider in draft status with hospitality/tech", () => {
    it("riders table contains exactly 1 row", () => {
      const rows = db.select().from(schema.riders).all();
      expect(rows.length).toBe(1);
    });

    it("rider status is draft", () => {
      const rows = db.select().from(schema.riders).all();
      expect(rows[0].status).toBe("draft");
    });

    it("rider content includes a hospitality section", () => {
      const rows = db.select().from(schema.riders).all();
      const content = rows[0].content as any;
      expect(content.hospitality).toBeDefined();
    });

    it("rider content includes a technical section", () => {
      const rows = db.select().from(schema.riders).all();
      const content = rows[0].content as any;
      expect(content.technical).toBeDefined();
    });
  });
});
