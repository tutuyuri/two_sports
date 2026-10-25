import { randomBytes } from "node:crypto";
import { caminhoSeguro, gravarCookieOauth, urlDeRetorno } from "../google.js";
import { metodos } from "../http.js";

function redirecionar(res, destino) {
  res.statusCode = 302;
  res.setHeader("Location", destino);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

export default async function google(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirecionar(res, "/login?erro=google-config");
  }

  const state = randomBytes(24).toString("hex");
  await gravarCookieOauth(res, {
    state,
    voltarPara: caminhoSeguro(req.query.voltarPara),
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: urlDeRetorno(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  redirecionar(res, url.toString());
}