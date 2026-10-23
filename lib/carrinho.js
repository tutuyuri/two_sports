import { sql } from "./db.js";

const FRETE_FIXO_CENTAVOS = 1990;

export async function buscarCarrinho(usuarioId) {
  const linhas = await sql`
    SELECT c.produto_id AS "produtoId", c.quantidade,
           p.titulo, p.imagem, p.preco, p.frete_gratis AS "freteGratis"
    FROM carrinho_itens c
    JOIN produtos p ON p.id = c.produto_id
    WHERE c.usuario_id = ${usuarioId}
    ORDER BY c.produto_id
  `;

  // Contas em centavos para evitar erros de arredondamento.
  let subtotalCentavos = 0;
  let quantidadeTotal = 0;

  const itens = linhas.map((l) => {
    const precoCentavos = Math.round(Number(l.preco) * 100);
    subtotalCentavos += precoCentavos * l.quantidade;
    quantidadeTotal += l.quantidade;

    return {
      produtoId: l.produtoId,
      titulo: l.titulo,
      imagem: l.imagem,
      freteGratis: l.freteGratis,
      quantidade: l.quantidade,
      preco: precoCentavos / 100,
      subtotal: (precoCentavos * l.quantidade) / 100,
    };
  });

  const freteCentavos =
    itens.length === 0 || itens.every((i) => i.freteGratis)
      ? 0
      : FRETE_FIXO_CENTAVOS;

  return {
    itens,
    resumo: {
      quantidadeTotal,
      subtotal: subtotalCentavos / 100,
      frete: freteCentavos / 100,
      total: (subtotalCentavos + freteCentavos) / 100,
    },
  };
}