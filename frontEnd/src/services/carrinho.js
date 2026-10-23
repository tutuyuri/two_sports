export class NaoAutenticado extends Error {}

export async function adicionarAoCarrinho(produtoId, quantidade = 1) {
  const res = await fetch("/api/carrinho", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ produtoId, quantidade }),
  });

  if (res.status === 401) throw new NaoAutenticado();

  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro ?? "Erro inesperado. Tente novamente.");
  return dados;
}