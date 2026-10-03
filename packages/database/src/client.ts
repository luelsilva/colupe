import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { requireEnv } from "@colupe/shared";
import * as schema from "./schema";

/**
 * Conexão PostgreSQL via Transaction Pooler do Supabase (Porta 6543)
 * 
 * Regras Obrigatórias (AGENTS.md):
 * - prepare: false (Pooler rejeita Prepared Statements)
 * - idle_timeout: 20s e connect_timeout: 10s (evita Erro 524 Cloudflare)
 * - max: 10 conexões
 */
const databaseUrl = requireEnv("DATABASE_URL");

export const client = postgres(databaseUrl, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: databaseUrl.includes("supabase.co") || databaseUrl.includes("pooler.supabase.com") ? "require" : undefined,
});

export const db = drizzle(client, { schema });
export { schema };
