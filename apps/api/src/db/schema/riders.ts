import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { gigs } from "./gigs";

export const riderDocStatusEnum = ["draft", "sent", "signed"] as const;
export type RiderDocStatus = (typeof riderDocStatusEnum)[number];

export const riders = sqliteTable(
  "riders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    gig_id: text("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    content: text("content", { mode: "json" }),
    pdf_url: text("pdf_url"),
    status: text("status", { enum: riderDocStatusEnum }).notNull().default("draft"),
    created_at: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updated_at: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`)
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("riders_gig_id_unique").on(table.gig_id),
  ]
);
