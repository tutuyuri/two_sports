export async function getProdutos({ filtro = "todos" } = {}) {
  const res = await fetch(`/api/produtos?filtro=${encodeURIComponent(filtro)}`);
  if (!res.ok) throw new Error("Não foi possível carregar os produtos.");

  const { produtos } = await res.json();
  console.log(produtos)
  return produtos;
}