import { sql } from "../lib/db.js";
import { usuarioLogado } from "../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import { esquemaAvaliacao, validar } from "../lib/validacao.js";

// "João Silva Santos" -> "João S."
function nomePublico(nome) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

// PUT cria a avaliação ou, se ela já existir, edita.
export default async function handler(req, res) {
  if (!metodos(req, res, ["PUT"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    res.setHeader("Cache-Control", "no-store");

    const { produtoId, nota, comentario } = validar(esquemaAvaliacao, req.body);

    // Só quem comprou o produto pode avaliá-lo (403 e não 401, para não parecer sessão expirada).
    const [compra] = await sql`
      SELECT 1 AS ok
      FROM pedido_itens i
      JOIN pedidos p ON p.id = i.pedido_id
      WHERE p.usuario_id = ${sessao.id} AND i.produto_id = ${produtoId}
      LIMIT 1
    `;
    if (!compra) throw new ErroHttp(403, "Só quem comprou este produto pode avaliá-lo.");

    const [usuario] = await sql`SELECT nome FROM usuarios WHERE id = ${sessao.id}`;
    if (!usuario) throw new ErroHttp(401, "Você não está logado.");

    await sql`
      INSERT INTO avaliacoes (produto_id, usuario_id, autor, nota, comentario)
      VALUES (${produtoId}, ${sessao.id}, ${nomePublico(usuario.nome)}, ${nota}, ${comentario})
      ON CONFLICT (produto_id, usuario_id) WHERE usuario_id IS NOT NULL
      DO UPDATE SET nota = EXCLUDED.nota,
                    comentario = EXCLUDED.comentario,
                    autor = EXCLUDED.autor,
                    atualizado_em = now()
    `;

    // A nota do produto passa a ser a média das avaliações.
    await sql`
      UPDATE produtos
      SET nota = COALESCE(
        (SELECT ROUND(AVG(nota)::numeric, 2) FROM avaliacoes WHERE produto_id = ${produtoId}),
        nota
      )
      WHERE id = ${produtoId}
    `;

    res.status(200).json({ ok: true });
  } catch (e) {
    responderErro(res, e);
  }
}