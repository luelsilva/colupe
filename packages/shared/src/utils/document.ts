/**
 * Utilitários de Validação Matemática e Formatação de Documentos Brasileiros (CPF / CNPJ)
 */

/**
 * Valida matematicamente um número de CPF através do algoritmo dos dígitos verificadores (Módulo 11).
 * @param cpf Número de CPF formatado ou apenas dígitos
 * @returns true se o CPF for válido
 */
export function validateCpf(cpf: string): boolean {
  if (!cpf) return false;

  const clean = cpf.replace(/\D/g, "");

  // CPF deve conter exatamente 11 dígitos
  if (clean.length !== 11) return false;

  // Rejeita sequências com todos os dígitos iguais (ex: 000.000.000-00, 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Cálculo do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(clean.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(clean.charAt(9))) return false;

  // Cálculo do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(clean.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(clean.charAt(10))) return false;

  return true;
}

/**
 * Valida matematicamente um número de CNPJ através do algoritmo dos dígitos verificadores (Módulo 11).
 * @param cnpj Número de CNPJ formatado ou apenas dígitos
 * @returns true se o CNPJ for válido
 */
export function validateCnpj(cnpj: string): boolean {
  if (!cnpj) return false;

  const clean = cnpj.replace(/\D/g, "");

  // CNPJ deve conter exatamente 14 dígitos
  if (clean.length !== 14) return false;

  // Rejeita sequências com todos os dígitos iguais (ex: 00.000.000/0000-00, 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Multiplicadores do 1º dígito
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(clean.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== Number(clean.charAt(12))) return false;

  // Multiplicadores do 2º dígito
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number(clean.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== Number(clean.charAt(13))) return false;

  return true;
}

/**
 * Valida matematicamente CPF ou CNPJ de acordo com o tipo informado.
 */
export function validateDocument(doc: string, type: "CPF" | "CNPJ"): boolean {
  return type === "CPF" ? validateCpf(doc) : validateCnpj(doc);
}
