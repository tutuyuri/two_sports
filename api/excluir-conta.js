import { sql } from "../lib/db.js";
import { conferirSenha, encerrarSessao, usuarioLogado } from "../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import { esquemaExcluirConta, validar } from "../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    const { senha } = validar(esquemaExcluirConta, req.body);

    const [usuario] = await sql`SELECT senha_hash FROM usuarios WHERE id = ${sessao.id}`;
    const confere = usuario ? await conferirSenha(senha, usuario.senha_hash) : false;
    if (!confere) throw new ErroHttp(400, "Senha incorreta.");

    // Pedidos, itens dos pedidos e carrinho são apagados junto (ON DELETE CASCADE).
    await sql`DELETE FROM usuarios WHERE id = ${sessao.id}`;

    encerrarSessao(res);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ok: true });
  } catch (e) {
    responderErro(res, e);
  }
}