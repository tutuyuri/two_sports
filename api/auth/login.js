import { sql } from "../../lib/db.js";
import { conferirSenha, criarSessao } from "../../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../../lib/http.js";
import { esquemaLogin, validar } from "../../lib/validacao.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const dados = validar(esquemaLogin, req.body);

    const [usuario] = await sql`
      SELECT id, nome, email, senha_hash
      FROM usuarios
      WHERE email = ${dados.email}
    `;

    const senhaCorreta = usuario
      ? await conferirSenha(dados.senha, usuario.senha_hash)
      : false;

    // Mesma mensagem para e-mail inexistente e senha errada.
    if (!senhaCorreta) {
      throw new ErroHttp(401, "E-mail ou senha incorretos.");
    }

    await criarSessao(res, usuario);
    res.status(200).json({
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (e) {
    responderErro(res, e);
  }
}