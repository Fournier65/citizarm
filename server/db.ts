import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Keep Replit's DATABASE_URL as the preferred configuration when available.
// OVH supplies PG* settings instead, without constructing a URL from a password.
const dockerDatabaseConfigured = !process.env.DATABASE_URL && Boolean(process.env.PGHOST);

if (dockerDatabaseConfigured && (!process.env.PGUSER || !process.env.PGDATABASE || !process.env.PGPASSWORD)) {
  throw new Error("PGHOST requires PGUSER, PGDATABASE and PGPASSWORD");
}

if (!dockerDatabaseConfigured && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL or PostgreSQL PG* settings must be set",
  );
}

// Docker passes the password separately so URL-reserved characters (such as #)
// do not alter the connection string.
export const pool = new Pool(
  dockerDatabaseConfigured
    ? {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
      }
    : { connectionString: process.env.DATABASE_URL },
);
export const db = drizzle(pool, { schema });
