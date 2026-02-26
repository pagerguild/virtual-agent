import { pgTable, uuid, text, numeric, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { gigs } from "./gigs";

export const bookingTypeEnum = pgEnum("booking_type", ["flight", "hotel"]);

export type BookingType = (typeof bookingTypeEnum.enumValues)[number];

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  gig_id: uuid("gig_id")
    .notNull()
    .references(() => gigs.id, { onDelete: "cascade" }),
  type: bookingTypeEnum("type").notNull(),
  provider: text("provider"),
  confirmation_number: text("confirmation_number"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  check_in: timestamp("check_in", { withTimezone: true }),
  check_out: timestamp("check_out", { withTimezone: true }),
  details: jsonb("details"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
