import { encerrarSessao } from "../../lib/auth.js";
import { metodos } from "../../lib/http.js";

export default function handler(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  encerrarSessao(res);
  res.status(200).json({ ok: true });
}