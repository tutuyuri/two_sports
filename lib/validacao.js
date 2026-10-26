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

export const esquemaBusca = z.object({
  q: z.string().trim().max(80).default(""),
  categoria: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z-]*$/, "Categoria inválida.")
    .default(""),
  precoMax: z.coerce.number().positive("Preço inválido.").max(100000).optional(),
  freteGratis: z.enum(["0", "1"]).default("0"),
  ordem: z
    .enum(["relevancia", "menor-preco", "maior-preco", "avaliados", "vendidos"])
    .default("relevancia"),
});

export const esquemaNome = z.object({
  nome: z.string().trim().min(3, "Digite seu nome completo.").max(100),
});

export const esquemaSenha = z.object({
  senhaAtual: z.string().max(72).default(""),
  novaSenha: z
    .string()
    .min(6, "A nova senha precisa ter no mínimo 6 caracteres.")
    .max(72, "A senha pode ter no máximo 72 caracteres."),
});

export const esquemaNotificacoes = z.object({
  pedidos: z.boolean(),
  promocoes: z.boolean(),
  novidades: z.boolean(),
});

export const esquemaExcluirConta = z.object({
  senha: z.string().max(72).default(""),
  confirmacao: z.string().trim().max(254).default(""),
});

export const esquemaEsqueciSenha = z.object({ email });

export const esquemaRedefinirSenha = z.object({
  token: z.string().trim().regex(/^[a-f0-9]{64}$/, "Este link é inválido ou expirou."),
  novaSenha: z
    .string()
    .min(6, "A nova senha precisa ter no mínimo 6 caracteres.")
    .max(72, "A senha pode ter no máximo 72 caracteres."),
});

export const esquemaProdutoAdmin = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "Digite o nome do produto.")
    .max(120, "O nome pode ter no máximo 120 caracteres."),
  descricao: z
    .string()
    .trim()
    .max(2000, "A descrição pode ter no máximo 2000 caracteres.")
    .default(""),
  categoria: z.string().trim().regex(/^[a-z0-9-]{2,40}$/, "Escolha uma categoria válida."),
  imagem: z
    .string()
    .trim()
    .max(500, "O endereço da imagem é longo demais.")
    .regex(/^https?:\/\//i, "O endereço da imagem precisa começar com http:// ou https://."),
  preco: z.coerce
    .number()
    .positive("O preço precisa ser maior que zero.")
    .max(100000, "O preço máximo é R$ 100.000,00."),
  freteGratis: z.boolean(),
});

export const esquemaNovoAdmin = z.object({ email });

export const esquemaTema = z.object({
  modo: z.enum(["claro", "escuro"]),
  cores: z.record(z.string(), z.string()),
});

export const esquemaCategoria = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Digite o nome da categoria.")
    .max(40, "O nome pode ter no máximo 40 caracteres."),
});