/**
 * ==============================================================================
 * Configuração e Validação de Ambiente - Frontend Colupe
 * ==============================================================================
 * Diretriz 3: Sem fallbacks silenciosos em variáveis de ambiente.
 * ==============================================================================
 */

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

export const API_URL = requirePublicEnv(
  "PUBLIC_API_URL",
  import.meta.env.PUBLIC_API_URL
);
