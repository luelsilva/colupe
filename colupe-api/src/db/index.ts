import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config/env";
import * as schema from "./schema";

/**
 * Conexão PostgreSQL via Transaction Pooler do Supabase (Porta 6543)
 * 
 * Regras Obrigatórias (AGENTS.md):
 * - prepare: false (Pooler rejeita Prepared Statements)
 * - idle_timeout: 20s e connect_timeout: 10s (evita Erro 524 Cloudflare)
 * - max: 10 conexões
 */
export const client = postgres(config.databaseUrl, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: config.databaseUrl.includes("supabase.co") || config.databaseUrl.includes("pooler.supabase.com") ? "require" : undefined,
});

export const db = drizzle(client, { schema });
export { schema };
