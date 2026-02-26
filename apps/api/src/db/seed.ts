import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { resolve } from "path";
import { artists } from "./schema/artists";
import { tours } from "./schema/tours";
import { gigs } from "./schema/gigs";
import { bookings } from "./schema/bookings";
import { riders } from "./schema/riders";

const DATABASE_URL = process.env.DATABASE_URL || "./local.db";

const sqlite = new Database(DATABASE_URL);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

const db = drizzle(sqlite);

// Run migrations first to ensure tables exist
console.log("🔄 Ensuring migrations are up to date...");
migrate(db, { migrationsFolder: resolve(import.meta.dir, "../../drizzle") });

export async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (in reverse FK order)
  db.delete(riders).run();
  db.delete(bookings).run();
  db.delete(gigs).run();
  db.delete(tours).run();
  db.delete(artists).run();

  // --- Artist ---
  const artistId = crypto.randomUUID();
  db.insert(artists)
    .values({
      id: artistId,
      name: "Chic",
      email: "chic@example.com",
      preferences: {
        dietary: ["vegetarian", "gluten-free options"],
        tech: ["in-ear monitors", "backing tracks via USB"],
        travel: ["window seat", "direct flights preferred"],
      },
      rider_template:
        "Standard rider template for Chic. Includes hospitality, technical, and travel requirements.",
    })
    .run();

  console.log("  ✅ Artist: Chic");

  // --- Tour ---
  // Dates spread across ~18 days (between 14 and 21)
  const tourStartDate = "2026-04-10";
  const tourEndDate = "2026-04-28";
  const tourId = crypto.randomUUID();

  db.insert(tours)
    .values({
      id: tourId,
      artist_id: artistId,
      name: "Spring Groove Tour 2026",
      start_date: tourStartDate,
      end_date: tourEndDate,
      budget: 15000.0,
      status: "planning",
    })
    .run();

  console.log("  ✅ Tour: Spring Groove Tour 2026");

  // --- Gigs (5 across different US cities, spanning 18 days) ---
  const gigData = [
    {
      venue_name: "Brooklyn Steel",
      city: "New York",
      state: "NY",
      date: "2026-04-10",
      promoter_name: "Alex Rivera",
      promoter_email: "alex@brooklynsteel.com",
      fee: 5000.0,
    },
    {
      venue_name: "Metro Chicago",
      city: "Chicago",
      state: "IL",
      date: "2026-04-14",
      promoter_name: "Jordan Blake",
      promoter_email: "jordan@metrochicago.com",
      fee: 4500.0,
    },
    {
      venue_name: "Stubb's BBQ",
      city: "Austin",
      state: "TX",
      date: "2026-04-18",
      promoter_name: "Casey Nguyen",
      promoter_email: "casey@stubbsaustin.com",
      fee: 4000.0,
    },
    {
      venue_name: "The Roxy Theatre",
      city: "Los Angeles",
      state: "CA",
      date: "2026-04-23",
      promoter_name: "Taylor Kim",
      promoter_email: "taylor@theroxy.com",
      fee: 5500.0,
    },
    {
      venue_name: "The Fillmore Miami Beach",
      city: "Miami",
      state: "FL",
      date: "2026-04-28",
      promoter_name: "Morgan Ellis",
      promoter_email: "morgan@fillmoremiami.com",
      fee: 4800.0,
    },
  ];

  const gigIds: string[] = [];

  for (const gig of gigData) {
    const gigId = crypto.randomUUID();
    gigIds.push(gigId);
    db.insert(gigs)
      .values({
        id: gigId,
        tour_id: tourId,
        ...gig,
        rider_status: "draft",
      })
      .run();
  }

  console.log("  ✅ Gigs: 5 across NYC, Chicago, Austin, LA, Miami");

  // --- Bookings (2 on first gig: 1 flight, 1 hotel) ---
  const firstGigId = gigIds[0];

  db.insert(bookings)
    .values({
      id: crypto.randomUUID(),
      gig_id: firstGigId,
      type: "flight",
      provider: "Delta Air Lines",
      confirmation_number: "DL-2026-ABCDEF",
      cost: 320.0,
      check_in: "2026-04-09T14:30:00Z",
      check_out: "2026-04-09T18:45:00Z",
      details: {
        departure_airport: "LAX",
        arrival_airport: "JFK",
        flight_number: "DL 1042",
        seat: "12A",
      },
    })
    .run();

  db.insert(bookings)
    .values({
      id: crypto.randomUUID(),
      gig_id: firstGigId,
      type: "hotel",
      provider: "The Williamsburg Hotel",
      confirmation_number: "WH-2026-XYZ789",
      cost: 275.0,
      check_in: "2026-04-09T15:00:00Z",
      check_out: "2026-04-11T11:00:00Z",
      details: {
        address: "96 Wythe Ave, Brooklyn, NY 11249",
        room_type: "Standard King",
        amenities: ["wifi", "gym", "rooftop bar"],
      },
    })
    .run();

  console.log("  ✅ Bookings: 1 flight + 1 hotel for NYC gig");

  // --- Rider (1 draft rider for first gig) ---
  db.insert(riders)
    .values({
      id: crypto.randomUUID(),
      gig_id: firstGigId,
      content: {
        hospitality: {
          dressing_room: [
            "Private dressing room with mirror and good lighting",
            "Vegetarian meal for 4 (no red meat)",
            "Sparkling water (6 bottles)",
            "Fresh fruit platter",
            "Hot tea with honey and lemon",
            "Assorted nuts and granola bars",
          ],
          green_room: [
            "Comfortable seating for 6",
            "Wi-Fi access",
            "Power strips (at least 4 outlets)",
          ],
        },
        technical: {
          sound: [
            "Full PA system suitable for 500+ capacity venue",
            "Monitor engineer provided by venue",
            "4 monitor mixes (2 wedge, 2 in-ear)",
            "Backing track playback via USB-A input on console",
          ],
          lighting: [
            "Front wash in warm white",
            "Color LED wash for stage backdrop",
            "Follow spot for lead performer",
          ],
          stage: [
            "Minimum stage size: 24ft x 16ft",
            "Drum riser: 8ft x 8ft x 2ft",
            "Black stage backdrop",
          ],
        },
        travel: [
          "Ground transportation from airport to venue",
          "Ground transportation from venue to hotel",
        ],
        misc: [
          "Guest list: 10 spots",
          "Merch table near venue entrance with power outlet",
          "1 crew meal (same as artist meal)",
        ],
      },
      pdf_url: null,
      status: "draft",
    })
    .run();

  console.log("  ✅ Rider: draft with hospitality & technical sections");

  console.log("\n🎉 Seed complete!");
}

// Run seed when executed directly
seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    sqlite.close();
  });
