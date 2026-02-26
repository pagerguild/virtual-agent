import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { tours } from "./tours";

export const riderStatusEnum = ["draft", "sent", "signed"] as const;
export type RiderStatus = (typeof riderStatusEnum)[number];

export const gigs = sqliteTable("gigs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tour_id: text("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),
  venue_name: text("venue_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  date: text("date").notNull(),
  promoter_name: text("promoter_name"),
  promoter_email: text("promoter_email"),
  fee: real("fee"),
  rider_status: text("rider_status", { enum: riderStatusEnum }).notNull().default("draft"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => new Date().toISOString()),
});
