import { sql } from "../lib/db.js";
import { CATEGORIAS, categoriaDoProduto } from "../lib/categorias.js";

const produtos = await sql`SELECT id, titulo FROM produtos ORDER BY id`;

for (const p of produtos) {
  await sql`UPDATE produtos SET categoria = ${categoriaDoProduto(p.titulo)} WHERE id = ${p.id}`;
}

await sql`CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (categoria)`;

// Mostra como ficou, para você conferir.
const resumo = await sql`
  SELECT categoria, COUNT(*)::int AS total,
         string_agg(titulo, ' | ' ORDER BY id) AS produtos
  FROM produtos
  GROUP BY categoria
  ORDER BY categoria
`;

for (const linha of resumo) {
  const nome = CATEGORIAS.find((c) => c.slug === linha.categoria)?.nome ?? linha.categoria;
  console.log(`\n${nome} (${linha.total}):\n  ${linha.produtos}`);
}