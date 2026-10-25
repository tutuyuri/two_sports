import { sql } from "./db.js";

// Mesma lista de utils/temaPersonalizado.js no front: mantenha as duas iguais.
export const VARIAVEIS_TEMA = [
  "--cor-destaque",
  "--cor-primaria",
  "--cor-primaria-hover",
  "--cor-fundo",
  "--cor-superficie",
  "--cor-cabecalho",
  "--cor-rodape",
  "--cor-texto",
  "--cor-texto-secundario",
  "--cor-botao",
  "--cor-botao-hover",
  "--cor-botao-texto",
];

export const COR_HEX = /^#[0-9a-f]{6}$/i;

// { escuro: { "--cor-destaque": "#..." }, claro: { ... } } ou {} (padrão do site)
export async function lerTema() {
  const [linha] = await sql`SELECT valor FROM configuracoes WHERE chave = 'tema'`;
  return linha?.valor ?? {};
}