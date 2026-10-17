import { z } from "zod";
import { ErroHttp } from "./http.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .regex(EMAIL, "Digite um e-mail válido.");

export const esquemaRegistro = z.object({
  nome: z.string().trim().min(3, "Digite seu nome completo.").max(100),
  email,
  // 72 é o limite de bytes que o bcrypt considera.
  senha: z
    .string()
    .min(6, "A senha precisa ter no mínimo 6 caracteres.")
    .max(72, "A senha pode ter no máximo 72 caracteres."),
});

export const esquemaLogin = z.object({
  email,
  senha: z.string().min(1, "Digite sua senha.").max(72),
});

export const esquemaProdutos = z.object({
  filtro: z
    .enum(["todos", "menor-preco", "avaliados", "vendidos", "frete-gratis"])
    .default("todos"),
});

export function validar(esquema, dados) {
  const resultado = esquema.safeParse(dados ?? {});
  if (!resultado.success) {
    throw new ErroHttp(400, resultado.error.issues[0].message);
  }
  return resultado.data;
}