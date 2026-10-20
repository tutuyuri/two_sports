import { sql } from "../lib/db.js";
import { usuarioLogado } from "../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import { esquemaCarrinho, validar } from "../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    const { produtoId, quantidade } = validar(esquemaCarrinho, req.body);

    const [produto] = await sql`SELECT id FROM produtos WHERE id = ${produtoId}`;
    if (!produto) throw new ErroHttp(404, "Produto não encontrado.");

    // Se o item já está no carrinho, soma a quantidade (máximo de 20).
    await sql`
      INSERT INTO carrinho_itens (usuario_id, produto_id, quantidade)
      VALUES (${sessao.id}, ${produtoId}, ${quantidade})
      ON CONFLICT (usuario_id, produto_id)
      DO UPDATE SET quantidade = LEAST(carrinho_itens.quantidade + EXCLUDED.quantidade, 20)
    `;

    const [{ total }] = await sql`
      SELECT COALESCE(SUM(quantidade), 0)::int AS total
      FROM carrinho_itens
      WHERE usuario_id = ${sessao.id}
    `;

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ totalItens: total });
  } catch (e) {
    responderErro(res, e);
  }
}