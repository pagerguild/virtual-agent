import { pgTable, uuid, text, jsonb, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { gigs } from "./gigs";

export const riderDocStatusEnum = pgEnum("rider_doc_status", ["draft", "sent", "signed"]);

export type RiderDocStatus = (typeof riderDocStatusEnum.enumValues)[number];

export const riders = pgTable(
  "riders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gig_id: uuid("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    content: jsonb("content"),
    pdf_url: text("pdf_url"),
    status: riderDocStatusEnum("status").notNull().default("draft"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("riders_gig_id_unique").on(table.gig_id)]
);
