import { sql } from "../db.js";
import { gerarHash, criarSessao } from "../auth.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { esquemaRegistro, validar } from "../validacao.js";

export default async function registro(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const dados = validar(esquemaRegistro, req.body);
    const hash = await gerarHash(dados.senha);

    // ON CONFLICT evita e-mail duplicado mesmo com dois cadastros simultâneos.
    const [usuario] = await sql`
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES (${dados.nome}, ${dados.email}, ${hash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, nome, email
    `;

    if (!usuario) {
      throw new ErroHttp(409, "Já existe uma conta com esse e-mail.");
    }

    await criarSessao(res, usuario);
    res.status(201).json({ usuario });
  } catch (e) {
    responderErro(res, e);
  }
}