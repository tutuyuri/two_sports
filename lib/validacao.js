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

export const esquemaCarrinho = z.object({
  produtoId: z.coerce.number().int("Produto inválido.").positive("Produto inválido."),
  quantidade: z.coerce
    .number()
    .int("Quantidade inválida.")
    .min(1, "Quantidade inválida.")
    .max(20, "Quantidade máxima: 20.")
    .default(1),
});

export const esquemaQuantidade = z.object({
  produtoId: z.coerce.number().int("Produto inválido.").positive("Produto inválido."),
  quantidade: z.coerce
    .number()
    .int("Quantidade inválida.")
    .min(1, "Quantidade inválida.")
    .max(20, "Quantidade máxima: 20."),
});

export const esquemaPedido = z.object({
  endereco: z.object({
    cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido."),
    rua: z.string().trim().min(3, "Digite a rua.").max(120),
    numero: z.string().trim().min(1, "Digite o número.").max(10),
    complemento: z.string().trim().max(60).default(""),
    bairro: z.string().trim().min(2, "Digite o bairro.").max(80),
    cidade: z.string().trim().min(2, "Digite a cidade.").max(80),
    uf: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "UF inválida."),
  }),
  pagamento: z.enum(["pix", "cartao", "boleto"]),
});