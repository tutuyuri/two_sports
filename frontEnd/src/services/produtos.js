export async function getProdutos({ filtro = "todos" } = {}) {
  const res = await fetch(`/api/produtos?filtro=${encodeURIComponent(filtro)}`);
  if (!res.ok) throw new Error("Não foi possível carregar os produtos.");

  const { produtos } = await res.json();
  return produtos;
}

export async function getProduto(id) {
  const res = await fetch(`/api/produto?id=${encodeURIComponent(id)}`);
  const dados = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(dados?.erro ?? "Não foi possível carregar o produto.");
  }
  if (!dados?.produto) {
    throw new Error("O servidor devolveu uma resposta inesperada para este produto.");
  }

  return dados; // { produto, avaliacoes, totalAvaliacoes }
}