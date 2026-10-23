import { sql } from "../lib/db.js";
import { usuarioLogado } from "../lib/auth.js";
import { buscarCarrinho } from "../lib/carrinho.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import { esquemaPedido, validar } from "../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET", "POST"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    res.setHeader("Cache-Control", "no-store");

    // Listar as compras do usuário logado (mais recentes primeiro)
    if (req.method === "GET") {
      const linhas = await sql`
        SELECT p.id, p.subtotal, p.frete, p.total, p.pagamento, p.status,
              p.endereco, p.criado_em AS "criadoEm",
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', i.id,
                    'produtoId', i.produto_id,
                    'titulo', i.titulo,
                    'preco', i.preco_unitario,
                    'quantidade', i.quantidade,
                    'imagem', pr.imagem
                  ) ORDER BY i.id
                ) FILTER (WHERE i.id IS NOT NULL),
                '[]'::json
              ) AS itens
        FROM pedidos p
        LEFT JOIN pedido_itens i ON i.pedido_id = p.id
        LEFT JOIN produtos pr ON pr.id = i.produto_id
        WHERE p.usuario_id = ${sessao.id}
        GROUP BY p.id
        ORDER BY p.criado_em DESC
        LIMIT 50
      `;

      // O driver devolve NUMERIC como texto: converte para número.
      const pedidos = linhas.map((p) => ({
        ...p,
        subtotal: Number(p.subtotal),
        frete: Number(p.frete),
        total: Number(p.total),
        itens: p.itens.map((item) => ({ ...item, preco: Number(item.preco) })),
      }));

      return res.status(200).json({ pedidos });
    }

    // Finalizar compra (POST)
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

    res.status(201).json({ pedido: { id: pedido.id, pagamento, ...resumo } });
  } catch (e) {
    responderErro(res, e);
  }
}
