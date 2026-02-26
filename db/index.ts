import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const client = postgres(process.env.DATABASE_URL);
  return drizzle(client, { schema });
}

// Lazy-initialize: the db client is created on first access,
// not at module import time. This prevents build-time errors
// when DATABASE_URL is not available (e.g., during `next build` on Vercel).
let _db: ReturnType<typeof createDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Re-export schema for convenience in route handlers
export { schema };

// Export type-safe query helpers
export type DbClient = ReturnType<typeof createDb>;
