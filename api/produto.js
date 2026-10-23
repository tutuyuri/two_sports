import { sql } from "../lib/db.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";

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