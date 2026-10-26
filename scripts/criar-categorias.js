import { sql } from "../lib/db.js";
import { CATEGORIAS } from "../lib/categorias.js";

await sql`
  CREATE TABLE IF NOT EXISTS categorias (
    slug       TEXT PRIMARY KEY,
    nome       TEXT NOT NULL UNIQUE,
    ordem      INTEGER NOT NULL DEFAULT 0,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// Copia as categorias que já existiam no código. "Outros" fica sempre por último.
for (const [indice, categoria] of CATEGORIAS.entries()) {
  const ordem = categoria.slug === "outros" ? 9999 : (indice + 1) * 10;

  await sql`
    INSERT INTO categorias (slug, nome, ordem)
    VALUES (${categoria.slug}, ${categoria.nome}, ${ordem})
    ON CONFLICT (slug) DO NOTHING
  `;
}

console.log("Tabela de categorias pronta.");