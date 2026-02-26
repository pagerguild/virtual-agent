import { pgTable, uuid, text, date, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { artists } from "./artists";

export const tourStatusEnum = pgEnum("tour_status", [
  "planning",
  "confirmed",
  "in_progress",
  "completed",
]);

export type TourStatus = (typeof tourStatusEnum.enumValues)[number];

export const tours = pgTable("tours", {
  id: uuid("id").primaryKey().defaultRandom(),
  artist_id: uuid("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  status: tourStatusEnum("status").notNull().default("planning"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
