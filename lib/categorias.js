export const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// "palavras": termos em inglês que aparecem no nome do produto.
// "termos": palavras em português que o cliente pode digitar na pesquisa.
export const CATEGORIAS = [
  {
    slug: "bolas",
    nome: "Bolas",
    palavras: ["ball", "football", "basketball", "volleyball", "soccer"],
    termos: ["bola", "bolas"],
  },
  {
    slug: "raquetes-tacos",
    nome: "Raquetes e tacos",
    palavras: ["racket", "racquet", "bat", "club", "iron", "stick"],
    termos: ["raquete", "raquetes", "taco", "tacos"],
  },
  {
    slug: "protecao",
    nome: "Proteção",
    palavras: ["helmet", "glove", "gloves", "guard", "pad", "pads", "mask"],
    termos: ["protecao", "capacete", "capacetes", "luva", "luvas"],
  },
  {
    slug: "equipamentos",
    nome: "Equipamentos",
    palavras: ["rim", "hoop", "net", "wicket", "stumps", "goal", "pump", "bag"],
    termos: ["equipamento", "equipamentos", "cesta", "rede", "trave"],
  },
  { slug: "outros", nome: "Outros", palavras: [], termos: [] },
];

// Tradução de palavras da pesquisa (português -> inglês, como estão os nomes).
export const SINONIMOS = {
  bola: "ball",
  bolas: "ball",
  futebol: "football",
  basquete: "basketball",
  volei: "volleyball",
  tenis: "tennis",
  golfe: "golf",
  beisebol: "baseball",
  criquete: "cricket",
  raquete: "racket",
  raquetes: "racket",
  taco: "bat",
  tacos: "bat",
  luva: "glove",
  luvas: "glove",
  capacete: "helmet",
  capacetes: "helmet",
};

// A ordem importa: "Basketball Rim" é equipamento, não bola.
const ORDEM_DAS_REGRAS = ["equipamentos", "protecao", "raquetes-tacos", "bolas"];

export function categoriaDoProduto(titulo) {
  const palavras = normalizar(titulo).split(/[^a-z0-9]+/);

  for (const slug of ORDEM_DAS_REGRAS) {
    const categoria = CATEGORIAS.find((c) => c.slug === slug);
    if (categoria.palavras.some((p) => palavras.includes(p))) return slug;
  }
  return "outros";
}

// Palavras extras em português para as categorias que já existiam.
const TERMOS_EXTRAS = {
  bolas: ["bola", "bolas"],
  "raquetes-tacos": ["raquete", "raquetes", "taco", "tacos"],
  protecao: ["protecao", "capacete", "capacetes", "luva", "luvas"],
  equipamentos: ["equipamento", "equipamentos", "cesta", "rede", "trave"],
};

// Quais categorias (do banco) combinam com uma palavra digitada na pesquisa.
export function categoriasDoTermo(token, categorias) {
  return categorias
    .filter((c) => {
      const palavras = normalizar(c.nome)
        .split(/\s+/)
        .filter((p) => p.length >= 3);
      const termos = [...palavras, ...(TERMOS_EXTRAS[c.slug] ?? [])];
      return termos.some((t) => t.startsWith(token) || token.startsWith(t));
    })
    .map((c) => c.slug);
}

// "Natação & Água" -> "natacao-agua"
export function gerarSlug(nome) {
  return normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}