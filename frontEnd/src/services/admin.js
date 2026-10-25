import { chamar } from "./carrinho.js";

const enviar = (url, metodo, corpo) =>
  chamar(url, {
    method: metodo,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

export const listarProdutosAdmin = () => chamar("/api/admin/produtos");
export const criarProduto = (dados) => enviar("/api/admin/produtos", "POST", dados);
export const atualizarProduto = (id, dados) =>
  enviar(`/api/admin/produtos?id=${encodeURIComponent(id)}`, "PATCH", dados);

export const listarAdmins = () => chamar("/api/admin/admins");
export const adicionarAdmin = (email) => enviar("/api/admin/admins", "POST", { email });
export const removerAdmin = (id) =>
  enviar(`/api/admin/admins?id=${encodeURIComponent(id)}`, "DELETE");

export const getTema = () => chamar("/api/tema");
export const salvarTema = (modo, cores) => enviar("/api/admin/tema", "PUT", { modo, cores });