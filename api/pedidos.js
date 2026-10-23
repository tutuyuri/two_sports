import { sql } from "../lib/db.js";
import { usuarioLogado } from "../lib/auth.js";
import { buscarCarrinho } from "../lib/carrinho.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import { esquemaPedido, validar } from "../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    const { endereco, pagamento } = validar(esquemaPedido, req.body);

    // Os valores vêm sempre do banco, nunca do navegador.
    const { itens, resumo } = await buscarCarrinho(sessao.id);
    if (itens.length === 0) throw new ErroHttp(400, "Seu carrinho está vazio.");

    // Uma única instrução: cria o pedido, copia os itens e esvazia o carrinho.
    // Ou tudo acontece, ou nada.
    const [pedido] = await sql`
      WITH novo AS (
        INSERT INTO pedidos (usuario_id, subtotal, frete, total, endereco, pagamento)
        VALUES (${sessao.id}, ${resumo.subtotal}, ${resumo.frete}, ${resumo.total},
                ${JSON.stringify(endereco)}::jsonb, ${pagamento})
        RETURNING id
      ),
      itens_pedido AS (
        INSERT INTO pedido_itens (pedido_id, produto_id, titulo, preco_unitario, quantidade)
        SELECT novo.id, c.produto_id, p.titulo, p.preco, c.quantidade
        FROM carrinho_itens c
        JOIN produtos p ON p.id = c.produto_id
        CROSS JOIN novo
        WHERE c.usuario_id = ${sessao.id}
      ),
      limpar AS (
        DELETE FROM carrinho_itens WHERE usuario_id = ${sessao.id}
      )
      SELECT id FROM novo
    `;

    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ pedido: { id: pedido.id, pagamento, ...resumo } });
  } catch (e) {
    responderErro(res, e);
  }
}