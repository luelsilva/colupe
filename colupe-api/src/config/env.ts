import { requireEnv, requireEnvNumber, validateRequiredEnvs } from "../shared/utils/require_env";

// 🛑 Validação de variáveis de ambiente obrigatórias sem fallback
validateRequiredEnvs([
  "PORT",
  "NODE_ENV",
  "APP_NAME",
  "DATABASE_URL",
]);

export const config = {
  port: requireEnvNumber("PORT"),
  nodeEnv: requireEnv("NODE_ENV"),
  appName: requireEnv("APP_NAME"),
  databaseUrl: requireEnv("DATABASE_URL"),
} as const;
