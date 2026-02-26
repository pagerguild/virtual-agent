import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { resolve } from "path";

const DATABASE_URL = process.env.DATABASE_URL || "./local.db";

const sqlite = new Database(DATABASE_URL);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

const db = drizzle(sqlite);

console.log("🔄 Running migrations...");

migrate(db, { migrationsFolder: resolve(import.meta.dir, "../../drizzle") });

console.log("✅ Migrations applied successfully!");

sqlite.close();
