import { sql } from "./db.js";
import { usuarioLogado } from "./auth.js";
import { ErroHttp } from "./http.js";

// Confere no banco a cada chamada: remover o acesso de alguém vale na hora.
export async function exigirAdmin(req) {
  const sessao = await usuarioLogado(req);
  if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

  const [usuario] = await sql`SELECT id, admin FROM usuarios WHERE id = ${sessao.id}`;
  if (!usuario) throw new ErroHttp(401, "Faça login para continuar.");
  if (!usuario.admin) throw new ErroHttp(403, "Acesso restrito a administradores.");

  return { id: usuario.id };
}