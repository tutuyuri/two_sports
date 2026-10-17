export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function metodos(req, res, permitidos) {
  if (permitidos.includes(req.method)) return true;
  res.setHeader("Allow", permitidos.join(", "));
  res.status(405).json({ erro: "Método não permitido." });
  return false;
}

export function responderErro(res, e) {
  if (e instanceof ErroHttp) {
    return res.status(e.status).json({ erro: e.message });
  }
  console.error(e);
  return res.status(500).json({ erro: "Erro interno. Tente novamente." });
}