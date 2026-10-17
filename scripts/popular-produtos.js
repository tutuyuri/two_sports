import { sql } from "../lib/db.js";

const COTACAO_DOLAR = 5.5;
const URL = "https://dummyjson.com/products/category/sports-accessories?limit=30";

const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM produtos`;
if (total > 0) {
  console.log(`A tabela já tem ${total} produtos. Nada a fazer.`);
  process.exit(0);
}

const resposta = await fetch(URL);
if (!resposta.ok) throw new Error("Falha ao buscar produtos na DummyJSON.");
const { products } = await resposta.json();

for (const p of products) {
  const preco = Math.round(p.price * COTACAO_DOLAR * 100) / 100;
  const nota = Math.round(p.rating * 100) / 100;
  // A DummyJSON não tem "vendidos"; gera um valor fixo para o catálogo fictício.
  const vendidos = (p.id * 7919) % 1000;
  const freteGratis = preco >= 100;

  await sql`
    INSERT INTO produtos
      (titulo, descricao, categoria, imagem, preco, nota, vendidos, frete_gratis)
    VALUES
      (${p.title}, ${p.description}, ${p.category}, ${p.thumbnail},
       ${preco}, ${nota}, ${vendidos}, ${freteGratis})
  `;
}

console.log(`${products.length} produtos inseridos.`);