import { sql } from "../lib/db.js";
import { metodos, responderErro, ErroHttp } from "../lib/http.js";
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



export default async function handler(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  try {
    const id = Number(req.query.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ErroHttp(400, "Produto inválido.");
    }

    const [produto] = await sql`
      SELECT id, titulo, descricao, imagem, preco, nota, vendidos,
      frete_gratis AS "freteGratis"
      FROM produtos
      WHERE id = ${id}
    `;
    if (!produto) throw new ErroHttp(404, "Produto não encontrado.");

    const [avaliacoes, [{ total }]] = await Promise.all([
      sql`
        SELECT id, autor, nota, comentario, criado_em AS "criadoEm"
        FROM avaliacoes
        WHERE produto_id = ${id}
        ORDER BY criado_em DESC
        LIMIT 20
      `,
      sql`SELECT COUNT(*)::int AS total FROM avaliacoes WHERE produto_id = ${id}`,
    ]);

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      produto: {
        ...produto,
        preco: Number(produto.preco),
        nota: Number(produto.nota),
      },
      avaliacoes,
      totalAvaliacoes: total,
    });
  } catch (e) {
    responderErro(res, e);
  }
}

export async function getProduto(id) {
  const res = await fetch(`/api/produto?id=${encodeURIComponent(id)}`);
  const dados = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(dados?.erro ?? "Não foi possível carregar o produto.");
  }
  if (!dados?.produto) {
    throw new Error("O servidor devolveu uma resposta inesperada para este produto.");
  }

  return dados; // { produto, avaliacoes, totalAvaliacoes }
}