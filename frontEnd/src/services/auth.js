async function requisitar(url, corpo) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro ?? "Erro inesperado. Tente novamente.");
  return dados;
}

export const registrar = (dados) => requisitar("/api/auth/registro", dados);
export const entrar = (dados) => requisitar("/api/auth/login", dados);
export const sair = () => requisitar("/api/auth/logout");

export async function usuarioAtual() {
  const res = await fetch("/api/auth/eu");
  if (!res.ok) return null;
  return (await res.json()).usuario;
}

export const pedirRedefinicao = (email) =>
  requisitar("/api/auth/esqueci-senha", { email });

export const redefinirSenha = (token, novaSenha) =>
  requisitar("/api/auth/redefinir-senha", { token, novaSenha });