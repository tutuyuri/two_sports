import { sql } from "../lib/db.js";
import { usuarioLogado } from "../lib/auth.js";
import { buscarCarrinho } from "../lib/carrinho.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import {
  esquemaCarrinho,
  esquemaQuantidade,
  validar,
} from "../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    res.setHeader("Cache-Control", "no-store");

    // Adicionar item (usado pela página do produto)
    if (req.method === "POST") {
      const { produtoId, quantidade } = validar(esquemaCarrinho, req.body);

      const [produto] = await sql`SELECT id FROM produtos WHERE id = ${produtoId}`;
      if (!produto) throw new ErroHttp(404, "Produto não encontrado.");

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
      return res.status(200).json({ totalItens: total });
    }

    // Definir a quantidade de um item
    if (req.method === "PATCH") {
      const { produtoId, quantidade } = validar(esquemaQuantidade, req.body);

      const alterados = await sql`
        UPDATE carrinho_itens
        SET quantidade = ${quantidade}
        WHERE usuario_id = ${sessao.id} AND produto_id = ${produtoId}
        RETURNING produto_id
      `;
      if (alterados.length === 0) {
        throw new ErroHttp(404, "Item não encontrado no carrinho.");
      }
    }

    // Remover um item
    if (req.method === "DELETE") {
      const produtoId = Number(req.query.produtoId);
      if (!Number.isInteger(produtoId) || produtoId <= 0) {
        throw new ErroHttp(400, "Produto inválido.");
      }

      await sql`
        DELETE FROM carrinho_itens
        WHERE usuario_id = ${sessao.id} AND produto_id = ${produtoId}
      `;
    }

    // GET, PATCH e DELETE respondem com o carrinho atualizado.
    res.status(200).json(await buscarCarrinho(sessao.id));
  } catch (e) {
    responderErro(res, e);
  }
}