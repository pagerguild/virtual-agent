import { pgTable, uuid, text, date, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { tours } from "./tours";

export const riderStatusEnum = pgEnum("rider_status", ["draft", "sent", "signed"]);

export type RiderStatus = (typeof riderStatusEnum.enumValues)[number];

export const gigs = pgTable("gigs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tour_id: uuid("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),
  venue_name: text("venue_name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  date: date("date").notNull(),
  promoter_name: text("promoter_name"),
  promoter_email: text("promoter_email"),
  fee: numeric("fee", { precision: 10, scale: 2 }),
  rider_status: riderStatusEnum("rider_status").notNull().default("draft"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
