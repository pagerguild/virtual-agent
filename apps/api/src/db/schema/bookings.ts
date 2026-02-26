import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { gigs } from "./gigs";

export const bookingTypeEnum = ["flight", "hotel"] as const;
export type BookingType = (typeof bookingTypeEnum)[number];

export const bookings = sqliteTable("bookings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  gig_id: text("gig_id")
    .notNull()
    .references(() => gigs.id, { onDelete: "cascade" }),
  type: text("type", { enum: bookingTypeEnum }).notNull(),
  provider: text("provider"),
  confirmation_number: text("confirmation_number"),
  cost: real("cost"),
  check_in: text("check_in"),
  check_out: text("check_out"),
  details: text("details", { mode: "json" }),
  created_at: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
