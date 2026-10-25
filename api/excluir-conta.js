import { sql } from "../lib/db.js";
import { conferirSenha, encerrarSessao, usuarioLogado } from "../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import { esquemaExcluirConta, validar } from "../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    const { senha, confirmacao } = validar(esquemaExcluirConta, req.body);

    const [usuario] = await sql`
      SELECT email, senha_hash FROM usuarios WHERE id = ${sessao.id}
    `;
    if (!usuario) throw new ErroHttp(401, "Você não está logado.");

    if (usuario.senha_hash) {
      if (!senha || !(await conferirSenha(senha, usuario.senha_hash))) {
        throw new ErroHttp(400, "Senha incorreta.");
      }
    } else if (confirmacao.toLowerCase() !== usuario.email) {
      throw new ErroHttp(400, "Digite o e-mail da sua conta para confirmar.");
    }

    // Pedidos, itens dos pedidos, carrinho e pedidos de redefinição saem junto (CASCADE).
    await sql`DELETE FROM usuarios WHERE id = ${sessao.id}`;

    encerrarSessao(res);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ok: true });
  } catch (e) {
    responderErro(res, e);
  }
}