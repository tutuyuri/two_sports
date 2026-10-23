import { sql } from "../lib/db.js";
import { metodos, responderErro } from "../lib/http.js";
import { esquemaProdutos, validar } from "../lib/validacao.js";

// Cada filtro tem sua própria consulta (o ORDER BY não aceita parâmetro).
const consultas = {
  todos: () => sql`
    SELECT id, titulo, imagem, preco, nota, vendidos, frete_gratis AS "freteGratis"
    FROM produtos ORDER BY id`,
  "menor-preco": () => sql`
    SELECT id, titulo, imagem, preco, nota, vendidos, frete_gratis AS "freteGratis"
    FROM produtos ORDER BY preco ASC`,
  avaliados: () => sql`
    SELECT id, titulo, imagem, preco, nota, vendidos, frete_gratis AS "freteGratis"
    FROM produtos ORDER BY nota DESC, vendidos DESC`,
  vendidos: () => sql`
    SELECT id, titulo, imagem, preco, nota, vendidos, frete_gratis AS "freteGratis"
    FROM produtos ORDER BY vendidos DESC`,
  "frete-gratis": () => sql`
    SELECT id, titulo, imagem, preco, nota, vendidos, frete_gratis AS "freteGratis"
    FROM produtos WHERE frete_gratis ORDER BY preco ASC`,
};

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  try {
    const { filtro } = validar(esquemaProdutos, req.query);
    const linhas = await consultas[filtro]();

    // O driver devolve NUMERIC como texto: converte para número.
    const produtos = linhas.map((p) => ({
      ...p,
      preco: Number(p.preco),
      nota: Number(p.nota),
    }));

    // Catálogo público: cache de 1 min na CDN da Vercel.
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ produtos });
  } catch (e) {
    responderErro(res, e);
  }
}

