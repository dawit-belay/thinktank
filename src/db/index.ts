import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. For local Supabase, copy the Database URL from `npx supabase status` into .env.local (same string you use for drizzle-kit)."
    );
  }
  return url;
}

const client = postgres(databaseUrl(), {
  connect_timeout: 15,
});

export const db = drizzle(client, { schema });