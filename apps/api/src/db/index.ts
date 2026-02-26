import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "./local.db";

const sqlite = new Database(DATABASE_URL);

// Enable WAL mode for better concurrent read performance
sqlite.exec("PRAGMA journal_mode = WAL;");

// Enable foreign key enforcement (SQLite has them off by default)
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

// Re-export schema for convenience in route handlers
export { schema };

// Export type-safe query helpers
export type DbClient = typeof db;
