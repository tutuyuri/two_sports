import { encerrarSessao } from "../auth.js";
import { metodos } from "../http.js";

export default function logout(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  encerrarSessao(res);
  res.status(200).json({ ok: true });
}