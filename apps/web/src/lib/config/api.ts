/**
 * ==============================================================================
 * Configuração e Validação de Ambiente - Frontend Colupe
 * ==============================================================================
 * Diretriz 3: Sem fallbacks silenciosos em variáveis de ambiente.
 * ==============================================================================
 */

import { env } from '$env/dynamic/public';

function requirePublicEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    console.error(`\n======================================================`);
    console.error(`❌ [ERRO CRÍTICO DE CONFIGURAÇÃO - .ENV]`);
    console.error(`A variável obrigatória '${key}' NÃO foi informada no .env!`);
    console.error(`======================================================\n`);
    throw new Error(`A variável de ambiente '${key}' é obrigatória e não foi configurada.`);
  }
  return value.trim();
}

export function getApiUrl(): string {
  const value =
    (typeof env !== "undefined" ? env.PUBLIC_API_URL : undefined) ||
    (typeof process !== "undefined" ? process.env?.PUBLIC_API_URL : undefined) ||
    (typeof import.meta !== "undefined" ? (import.meta as any).env?.PUBLIC_API_URL : undefined);

  return requirePublicEnv("PUBLIC_API_URL", value);
}

export const API_URL = getApiUrl();
