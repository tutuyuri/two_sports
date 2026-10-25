import { sql } from "../db.js";
import { exigirAdmin } from "../admin.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { esquemaNovoAdmin, validar } from "../validacao.js";

const listar = () => sql`SELECT id, nome, email FROM usuarios WHERE admin ORDER BY nome`;

export default async function adminsAdmin(req, res) {
  if (!metodos(req, res, ["GET", "POST", "DELETE"])) return;

  try {
    const atual = await exigirAdmin(req);
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "POST") {
      const { email } = validar(esquemaNovoAdmin, req.body);

      const [usuario] = await sql`
        UPDATE usuarios SET admin = true WHERE email = ${email} RETURNING id
      `;
      if (!usuario) {
        throw new ErroHttp(404, "Nenhuma conta com esse e-mail. A pessoa precisa se cadastrar antes.");
      }
    }

    if (req.method === "DELETE") {
      const id = Number(req.query.id);
      if (!Number.isInteger(id) || id <= 0) throw new ErroHttp(400, "Usuário inválido.");
      if (id === atual.id) {
        throw new ErroHttp(400, "Você não pode remover o seu próprio acesso.");
      }

      const [usuario] = await sql`
        UPDATE usuarios SET admin = false WHERE id = ${id} AND admin RETURNING id
      `;
      if (!usuario) throw new ErroHttp(404, "Administrador não encontrado.");
    }

    // GET, POST e DELETE respondem com a lista atualizada.
    res.status(200).json({ admins: await listar() });
  } catch (e) {
    responderErro(res, e);
  }
}