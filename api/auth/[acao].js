import registro from "../../lib/rotas/registro.js";
import login from "../../lib/rotas/login.js";
import logout from "../../lib/rotas/logout.js";
import eu from "../../lib/rotas/eu.js";
import esqueciSenha from "../../lib/rotas/esqueci-senha.js";
import redefinirSenha from "../../lib/rotas/redefinir-senha.js";
import google from "../../lib/rotas/google.js";
import googleCallback from "../../lib/rotas/google-callback.js";

const ROTAS = {
  registro,
  login,
  logout,
  eu,
  "esqueci-senha": esqueciSenha,
  "redefinir-senha": redefinirSenha,
  google,
  "google-callback": googleCallback,
};

// Uma única função da Vercel atende todas as rotas /api/auth/*
export default async function handler(req, res) {
  const rota = Object.hasOwn(ROTAS, req.query.acao) ? ROTAS[req.query.acao] : null;

  if (!rota) {
    res.status(404).json({ erro: "Rota não encontrada." });
    return;
  }

  return rota(req, res);
}