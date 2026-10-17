import { sql } from "../../lib/db.js";
import { usuarioLogado } from "../../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../../lib/http.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Você não está logado.");

    const [usuario] = await sql`
      SELECT id, nome, email FROM usuarios WHERE id = ${sessao.id}
    `;
    if (!usuario) throw new ErroHttp(401, "Você não está logado.");

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ usuario });
  } catch (e) {
    responderErro(res, e);
  }
}