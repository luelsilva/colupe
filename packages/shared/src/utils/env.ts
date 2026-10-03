/**
 * ==============================================================================
 * Require Env - Validador Universal de Variáveis de Ambiente (.env)
 * ==============================================================================
 * Bloqueia a inicialização de qualquer aplicação se variáveis obrigatórias
 * estiverem ausentes ou vazias no arquivo .env. Sem fallbacks silenciosos.
 * ==============================================================================
 */

export function requireEnv(key: string): string {
  const value = process.env[key];

  if (value === undefined || value.trim() === "") {
    console.error(`\n======================================================`);
    console.error(`❌ [ERRO CRÍTICO DE CONFIGURAÇÃO - .ENV]`);
    console.error(`A variável obrigatória '${key}' NÃO foi informada no .env!`);
    console.error(`A inicialização da aplicação foi abortada imediatamente.`);
    console.error(`======================================================\n`);
    process.exit(1);
  }

  return value.trim();
}

export function requireEnvNumber(key: string): number {
  const raw = requireEnv(key);
  const num = Number(raw);

  if (isNaN(num)) {
    console.error(`\n======================================================`);
    console.error(`❌ [ERRO CRÍTICO DE CONFIGURAÇÃO - .ENV]`);
    console.error(`A variável '${key}' deve ser um NÚMERO válido. Valor recebido: "${raw}"`);
    console.error(`A inicialização da aplicação foi abortada imediatamente.`);
    console.error(`======================================================\n`);
    process.exit(1);
  }

  return num;
}

export function requireEnvBoolean(key: string): boolean {
  const raw = requireEnv(key).toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;

  console.error(`\n======================================================`);
  console.error(`❌ [ERRO CRÍTICO DE CONFIGURAÇÃO - .ENV]`);
  console.error(`A variável '${key}' deve ser booleana ('true' ou 'false'). Valor recebido: "${raw}"`);
  console.error(`A inicialização da aplicação foi abortada imediatamente.`);
  console.error(`======================================================\n`);
  process.exit(1);
}

export function validateRequiredEnvs(keys: string[]): void {
  const missingKeys: string[] = [];

  for (const key of keys) {
    const value = process.env[key];
    if (value === undefined || value.trim() === "") {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.error(`\n======================================================`);
    console.error(`❌ [ERRO CRÍTICO DE CONFIGURAÇÃO - .ENV]`);
    console.error(`Foram encontradas ${missingKeys.length} variável(is) obrigatória(s) ausente(s) no .env:`);
    missingKeys.forEach((k) => console.error(`  - ❌ ${k}`));
    console.error(`\nA inicialização do servidor foi cancelada para evitar falhas em produção.`);
    console.error(`======================================================\n`);
    process.exit(1);
  }
}
