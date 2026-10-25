import { sql } from "../db.js";
import { conferirSenha, criarSessao } from "../auth.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { esquemaLogin, validar } from "../validacao.js";

export default async function login(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const dados = validar(esquemaLogin, req.body);

    const [usuario] = await sql`
      SELECT id, nome, email, senha_hash
      FROM usuarios
      WHERE email = ${dados.email}
    `;

    // Conta criada só com o Google não tem senha: nunca confere.
    const senhaCorreta = usuario?.senha_hash
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