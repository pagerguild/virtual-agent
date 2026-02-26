import { describe, expect, it } from "bun:test";
import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { artists } from "../artists";
import { tours, tourStatusEnum } from "../tours";
import { gigs, riderStatusEnum } from "../gigs";
import { bookings, bookingTypeEnum } from "../bookings";
import { riders, riderDocStatusEnum } from "../riders";

// Helper to get column names from a table
function columnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((c) => c.name);
}

// Helper to get foreign keys
function getForeignKeys(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).foreignKeys;
}

// Helper to assert a cascade-delete FK exists
function assertCascadeFk(
  table: Parameters<typeof getTableConfig>[0],
  columnName: string,
  foreignTableName: string,
  foreignColumnName: string
) {
  const fks = getForeignKeys(table);
  expect(fks.length).toBeGreaterThanOrEqual(1);
  const matchingFk = fks.find((fk) => {
    const ref = fk.reference();
    return (
      ref.columns.some((c) => c.name === columnName) &&
      ref.foreignColumns.some((c) => c.name === foreignColumnName)
    );
  });
  expect(matchingFk).toBeDefined();
  expect(matchingFk!.onDelete).toBe("cascade");
  const ref = matchingFk!.reference();
  expect(getTableName(ref.foreignTable)).toBe(foreignTableName);
}

describe("Schema — Artists table", () => {
  it("is named 'artists'", () => {
    expect(getTableName(artists)).toBe("artists");
  });

  it("has required columns: id, name, email, preferences, rider_template, created_at, updated_at", () => {
    const cols = columnNames(artists);
    expect(cols).toContain("id");
    expect(cols).toContain("name");
    expect(cols).toContain("email");
    expect(cols).toContain("preferences");
    expect(cols).toContain("rider_template");
    expect(cols).toContain("created_at");
    expect(cols).toContain("updated_at");
  });

  it("uses uuid primary key for id", () => {
    const config = getTableConfig(artists);
    const idCol = config.columns.find((c) => c.name === "id");
    expect(idCol).toBeDefined();
    expect(idCol!.columnType).toBe("PgUUID");
    expect(idCol!.primary).toBe(true);
  });
});

describe("Schema — Tours table", () => {
  it("is named 'tours'", () => {
    expect(getTableName(tours)).toBe("tours");
  });

  it("has required columns", () => {
    const cols = columnNames(tours);
    for (const col of ["id", "artist_id", "name", "start_date", "end_date", "budget", "status", "created_at", "updated_at"]) {
      expect(cols).toContain(col);
    }
  });

  it("has a foreign key from artist_id to artists.id with cascade delete", () => {
    assertCascadeFk(tours, "artist_id", "artists", "id");
  });

  it("tour_status enum has correct values", () => {
    expect(tourStatusEnum.enumValues).toEqual(["planning", "confirmed", "in_progress", "completed"]);
  });
});

describe("Schema — Gigs table", () => {
  it("is named 'gigs'", () => {
    expect(getTableName(gigs)).toBe("gigs");
  });

  it("has required columns", () => {
    const cols = columnNames(gigs);
    for (const col of ["id", "tour_id", "venue_name", "city", "state", "date", "promoter_name", "promoter_email", "fee", "rider_status", "created_at", "updated_at"]) {
      expect(cols).toContain(col);
    }
  });

  it("has a foreign key from tour_id to tours.id with cascade delete", () => {
    assertCascadeFk(gigs, "tour_id", "tours", "id");
  });

  it("rider_status enum has correct values", () => {
    expect(riderStatusEnum.enumValues).toEqual(["draft", "sent", "signed"]);
  });
});

describe("Schema — Bookings table", () => {
  it("is named 'bookings'", () => {
    expect(getTableName(bookings)).toBe("bookings");
  });

  it("has required columns", () => {
    const cols = columnNames(bookings);
    for (const col of ["id", "gig_id", "type", "provider", "confirmation_number", "cost", "check_in", "check_out", "details", "created_at"]) {
      expect(cols).toContain(col);
    }
  });

  it("has a foreign key from gig_id to gigs.id with cascade delete", () => {
    assertCascadeFk(bookings, "gig_id", "gigs", "id");
  });

  it("booking_type enum has correct values", () => {
    expect(bookingTypeEnum.enumValues).toEqual(["flight", "hotel"]);
  });
});

describe("Schema — Riders table", () => {
  it("is named 'riders'", () => {
    expect(getTableName(riders)).toBe("riders");
  });

  it("has required columns", () => {
    const cols = columnNames(riders);
    for (const col of ["id", "gig_id", "content", "pdf_url", "status", "created_at", "updated_at"]) {
      expect(cols).toContain(col);
    }
  });

  it("has a foreign key from gig_id to gigs.id with cascade delete", () => {
    assertCascadeFk(riders, "gig_id", "gigs", "id");
  });

  it("has a unique index on gig_id", () => {
    const config = getTableConfig(riders);
    const indexes = config.indexes;
    const gigIdIndex = indexes.find((idx) => idx.config.name === "riders_gig_id_unique");
    expect(gigIdIndex).toBeDefined();
    expect(gigIdIndex!.config.unique).toBe(true);
  });

  it("rider_doc_status enum has correct values", () => {
    expect(riderDocStatusEnum.enumValues).toEqual(["draft", "sent", "signed"]);
  });
});

describe("Schema — barrel export", () => {
  it("re-exports all tables from index.ts", async () => {
    const schema = await import("../index");
    expect(schema.artists).toBeDefined();
    expect(schema.tours).toBeDefined();
    expect(schema.gigs).toBeDefined();
    expect(schema.bookings).toBeDefined();
    expect(schema.riders).toBeDefined();
  });

  it("re-exports all enums from index.ts", async () => {
    const schema = await import("../index");
    expect(schema.tourStatusEnum).toBeDefined();
    expect(schema.riderStatusEnum).toBeDefined();
    expect(schema.bookingTypeEnum).toBeDefined();
    expect(schema.riderDocStatusEnum).toBeDefined();
  });
});
