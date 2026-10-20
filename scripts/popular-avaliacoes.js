import { sql } from "../lib/db.js";

await sql`
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id          SERIAL PRIMARY KEY,
    produto_id  INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    autor       TEXT NOT NULL,
    nota        INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario  TEXT NOT NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto
  ON avaliacoes (produto_id, criado_em DESC)
`;

await sql`
  CREATE TABLE IF NOT EXISTS carrinho_itens (
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id  INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade  INTEGER NOT NULL CHECK (quantidade BETWEEN 1 AND 20),
    PRIMARY KEY (usuario_id, produto_id)
  )
`;

const URL = "https://dummyjson.com/products/category/sports-accessories?limit=30";
const resposta = await fetch(URL);
if (!resposta.ok) throw new Error("Falha ao buscar produtos na DummyJSON.");
const { products } = await resposta.json();

let inseridas = 0;

for (const p of products) {
  // Liga o produto da DummyJSON ao produto que já está no seu banco pelo título.
  const [produto] = await sql`SELECT id FROM produtos WHERE titulo = ${p.title}`;
  if (!produto) continue;

  const [{ total }] = await sql`
    SELECT COUNT(*)::int AS total FROM avaliacoes WHERE produto_id = ${produto.id}
  `;
  if (total > 0) continue; // já tem avaliações: não duplica

  for (const r of p.reviews ?? []) {
    await sql`
      INSERT INTO avaliacoes (produto_id, autor, nota, comentario, criado_em)
      VALUES (${produto.id}, ${r.reviewerName}, ${r.rating}, ${r.comment}, ${r.date})
    `;
    inseridas++;
  }
}

console.log(`Tabelas prontas. ${inseridas} avaliações inseridas.`);