import produtos from "../../lib/rotasAdmin/produtos.js";
import admins from "../../lib/rotasAdmin/admins.js";
import tema from "../../lib/rotasAdmin/tema.js";

const ROTAS = { produtos, admins, tema };

// Uma única função da Vercel atende todas as rotas /api/admin/*
export default async function handler(req, res) {
  const rota = Object.hasOwn(ROTAS, req.query.recurso) ? ROTAS[req.query.recurso] : null;

  if (!rota) {
    res.status(404).json({ erro: "Rota não encontrada." });
    return;
  }

  return rota(req, res);
}