/**
 * ==============================================================================
 * Require Env - Validador Universal de Variáveis de Ambiente (.env)
 * ==============================================================================
 * Bloqueia a inicialização de qualquer aplicação se variáveis obrigatórias
 * estiverem ausentes ou vazias no arquivo .env. Sem fallbacks silenciosos.
 * ==============================================================================
 */

/**
 * Valida e retorna uma variável de ambiente obrigatória.
 * Se a variável não existir ou for vazia, interrompe a execução do processo com erro crítico.
 *
 * @param key Nome da variável no .env (ex: 'DATABASE_URL', 'API_SECRET_KEY')
 * @returns O valor da variável (garantidamente string não vazia)
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

/**
 * Valida e retorna uma variável de ambiente convertida para número.
 * Se a variável não existir ou não for um número válido, interrompe o processo.
 */
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

/**
 * Valida e retorna uma variável de ambiente convertida para booleano.
 * Aceita 'true', '1', 'false', '0'.
 */
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

/**
 * Valida uma lista de variáveis de ambiente de uma só vez.
 * Se faltarem múltiplas variáveis, exibe TODAS elas no console antes de abortar.
 *
 * @param keys Array com os nomes das variáveis obrigatórias
 */
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
