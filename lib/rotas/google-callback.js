import { sql } from "../db.js";
import { criarSessao } from "../auth.js";
import {
  caminhoSeguro,
  lerCookieOauth,
  limparCookieOauth,
  perfilDoGoogle,
  urlDeRetorno,
} from "../google.js";
import { metodos } from "../http.js";

function redirecionar(res, destino) {
  res.statusCode = 302;
  res.setHeader("Location", destino);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function falhar(res, codigo) {
  limparCookieOauth(res);
  redirecionar(res, `/login?erro=${codigo}`);
}

async function buscarOuCriarUsuario({ googleId, email, nome }) {
  let [usuario] = await sql`
    SELECT id, nome, email FROM usuarios WHERE google_id = ${googleId}
  `;
  if (usuario) return usuario;

  // Já existe conta com esse e-mail (que o Google confirmou ser seu): vincula.
  [usuario] = await sql`
    UPDATE usuarios SET google_id = ${googleId}
    WHERE email = ${email} AND google_id IS NULL
    RETURNING id, nome, email
  `;
  if (usuario) return usuario;

  [usuario] = await sql`
    INSERT INTO usuarios (nome, email, senha_hash, google_id)
    VALUES (${nome}, ${email}, NULL, ${googleId})
    ON CONFLICT DO NOTHING
    RETURNING id, nome, email
  `;
  return usuario ?? null;
}

export default async function googleCallback(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  try {
    const { code, state, error } = req.query;
    if (error) return falhar(res, "google-cancelado");

    const guardado = await lerCookieOauth(req);
    if (
      !guardado ||
      typeof code !== "string" ||
      typeof state !== "string" ||
      state !== guardado.state
    ) {
      return falhar(res, "google");
    }

    const perfil = await perfilDoGoogle(code, urlDeRetorno(req));

    const verificado = perfil.email_verified === true || perfil.email_verified === "true";
    if (!perfil.email || !verificado) return falhar(res, "google-email");

    const email = String(perfil.email).trim().toLowerCase();
    const nome = String(perfil.name ?? email.split("@")[0]).trim().slice(0, 100);

    const usuario = await buscarOuCriarUsuario({
      googleId: String(perfil.sub),
      email,
      nome,
    });
    if (!usuario) return falhar(res, "google");

    await criarSessao(res, usuario);
    limparCookieOauth(res); // depois da sessão, para os dois cookies seguirem juntos
    redirecionar(res, caminhoSeguro(guardado.voltarPara));
  } catch (e) {
    console.error(e);
    falhar(res, "google");
  }
}