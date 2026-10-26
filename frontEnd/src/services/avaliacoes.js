import { chamar } from "./carrinho.js";

export const salvarAvaliacao = ({ produtoId, nota, comentario }) =>
  chamar("/api/avaliacoes", {
    method: "PUT",
    body: JSON.stringify({ produtoId, nota, comentario }),
  });