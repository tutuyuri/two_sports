export class NaoAutenticado extends Error {}

export async function chamar(url, opcoes = {}) {
  const res = await fetch(url, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...opcoes.headers },
  });

  if (res.status === 401) throw new NaoAutenticado();

  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro ?? "Erro inesperado. Tente novamente.");
  return dados;
}

export const adicionarAoCarrinho = (produtoId, quantidade = 1) =>
  chamar("/api/carrinho", {
    method: "POST",
    body: JSON.stringify({ produtoId, quantidade }),
  });

export const getCarrinho = () => chamar("/api/carrinho");

export const alterarQuantidade = (produtoId, quantidade) =>
  chamar("/api/carrinho", {
    method: "PATCH",
    body: JSON.stringify({ produtoId, quantidade }),
  });

export const removerDoCarrinho = (produtoId) =>
  chamar(`/api/carrinho?produtoId=${encodeURIComponent(produtoId)}`, {
    method: "DELETE",
  });

export const finalizarPedido = (dados) =>
  chamar("/api/pedidos", { method: "POST", body: JSON.stringify(dados) });

export const getPedidos = () => chamar("/api/pedidos");