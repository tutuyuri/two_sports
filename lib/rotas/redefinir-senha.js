import { createHash } from "node:crypto";
import { sql } from "../db.js";
import { gerarHash } from "../auth.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { esquemaRedefinirSenha, validar } from "../validacao.js";

export default async function redefinirSenha(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const { token, novaSenha } = validar(esquemaRedefinirSenha, req.body);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const hash = await gerarHash(novaSenha);

    // "Consome" o link numa única instrução: só funciona uma vez e dentro do prazo.
    const [registro] = await sql`
      UPDATE redefinicoes_senha
      SET usado_em = now()
      WHERE token_hash = ${tokenHash} AND usado_em IS NULL AND expira_em > now()
      RETURNING usuario_id
    `;

    if (!registro) {
      throw new ErroHttp(400, "Este link é inválido ou expirou. Peça um novo.");
    }

    await sql`UPDATE usuarios SET senha_hash = ${hash} WHERE id = ${registro.usuario_id}`;
    await sql`DELETE FROM redefinicoes_senha WHERE usuario_id = ${registro.usuario_id} AND usado_em IS NULL`;

    res.status(200).json({ ok: true });
  } catch (e) {
    responderErro(res, e);
  }
}