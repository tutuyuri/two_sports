import { chamar } from "./carrinho.js";

export const getConta = () => chamar("/api/conta");

export const alterarNome = (nome) =>
  chamar("/api/conta", {
    method: "PATCH",
    body: JSON.stringify({ acao: "nome", nome }),
  });

export const alterarSenha = (senhaAtual, novaSenha) =>
  chamar("/api/conta", {
    method: "PATCH",
    body: JSON.stringify({ acao: "senha", senhaAtual, novaSenha }),
  });

export const salvarNotificacoes = (notificacoes) =>
  chamar("/api/conta", {
    method: "PATCH",
    body: JSON.stringify({ acao: "notificacoes", notificacoes }),
  });

export const excluirConta = (dados) =>
  chamar("/api/excluir-conta", {
    method: "POST",
    body: JSON.stringify(dados),
  });