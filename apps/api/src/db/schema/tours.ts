import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { artists } from "./artists";

export const tourStatusEnum = ["planning", "confirmed", "in_progress", "completed"] as const;
export type TourStatus = (typeof tourStatusEnum)[number];

export const tours = sqliteTable("tours", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artist_id: text("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  start_date: text("start_date").notNull(),
  end_date: text("end_date").notNull(),
  budget: real("budget"),
  status: text("status", { enum: tourStatusEnum }).notNull().default("planning"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => new Date().toISOString()),
});
