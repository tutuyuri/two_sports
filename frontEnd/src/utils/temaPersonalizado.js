const CHAVE = "two_sports_tema";
const ID_ESTILO = "tema-personalizado";
const COR_HEX = /^#[0-9a-f]{6}$/i;

// Mesma lista de lib/tema.js no servidor: mantenha as duas iguais.
export const VARIAVEIS = [
  { nome: "--cor-destaque", rotulo: "Destaque (links, ícones, bordas)", grupo: "Marca" },
  { nome: "--cor-primaria", rotulo: "Primária", grupo: "Marca" },
  { nome: "--cor-primaria-hover", rotulo: "Primária (filtros ativos)", grupo: "Marca" },
  { nome: "--cor-fundo", rotulo: "Fundo da página", grupo: "Fundos" },
  { nome: "--cor-superficie", rotulo: "Fundo dos cartões", grupo: "Fundos" },
  { nome: "--cor-cabecalho", rotulo: "Cabeçalho", grupo: "Fundos" },
  { nome: "--cor-rodape", rotulo: "Rodapé", grupo: "Fundos" },
  { nome: "--cor-texto", rotulo: "Texto principal", grupo: "Textos" },
  { nome: "--cor-texto-secundario", rotulo: "Texto secundário", grupo: "Textos" },
  { nome: "--cor-botao", rotulo: "Botões", grupo: "Botões" },
  { nome: "--cor-botao-hover", rotulo: "Botões ao passar o mouse", grupo: "Botões" },
  { nome: "--cor-botao-texto", rotulo: "Texto dos botões", grupo: "Botões" },
];

// Só usadas na prévia, para ela ficar fiel ao modo escolhido.
const EXTRAS_PREVIA = ["--cor-borda", "--cor-borda-divisoria", "--cor-texto-invertido"];

function montarCss(tema) {
  const bloco = (modo, atributo) => {
    const linhas = Object.entries(tema?.[modo] ?? {})
      .filter(([nome, valor]) => VARIAVEIS.some((v) => v.nome === nome) && COR_HEX.test(valor))
      .map(([nome, valor]) => `  ${nome}: ${valor};`);
    return linhas.length ? `html:root[data-theme="${atributo}"] {\n${linhas.join("\n")}\n}\n` : "";
  };
  return bloco("escuro", "dark") + bloco("claro", "light");
}

export function aplicarTemaPersonalizado(tema, guardar = false) {
  let estilo = document.getElementById(ID_ESTILO);
  if (!estilo) {
    estilo = document.createElement("style");
    estilo.id = ID_ESTILO;
    document.head.appendChild(estilo);
  }
  estilo.textContent = montarCss(tema);

  if (guardar) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(tema));
    } catch {
      // sem armazenamento: só não fica em cache
    }
  }
}

// Aplica o último tema conhecido na hora (sem piscar) e depois confere com o servidor.
export function iniciarTemaPersonalizado() {
  try {
    aplicarTemaPersonalizado(JSON.parse(localStorage.getItem(CHAVE) ?? "{}"));
  } catch {
    // cache inválido: ignora
  }

  fetch("/api/tema")
    .then((r) => (r.ok ? r.json() : null))
    .then((dados) => {
      if (dados?.tema) aplicarTemaPersonalizado(dados.tema, true);
    })
    .catch(() => {});
}

export function normalizarCor(valor) {
  const contexto = document.createElement("canvas").getContext("2d");
  contexto.fillStyle = "#000000";
  contexto.fillStyle = valor; // valor inválido é ignorado
  return contexto.fillStyle; // "#rrggbb" para cores opacas
}

// Lê as cores originais (do cores.css) de um modo, ignorando o tema personalizado.
export function lerCoresPadrao(modo) {
  const raiz = document.documentElement;
  const estilo = document.getElementById(ID_ESTILO);

  const textoAnterior = estilo?.textContent ?? "";
  const temaAnterior = raiz.getAttribute("data-theme");
  const contrasteAnterior = raiz.getAttribute("data-contraste");

  if (estilo) estilo.textContent = "";
  raiz.removeAttribute("data-contraste");
  raiz.setAttribute("data-theme", modo === "claro" ? "light" : "dark");

  const computado = getComputedStyle(raiz);
  const cores = {};
  for (const nome of [...VARIAVEIS.map((v) => v.nome), ...EXTRAS_PREVIA]) {
    cores[nome] = normalizarCor(computado.getPropertyValue(nome).trim());
  }

  if (temaAnterior) raiz.setAttribute("data-theme", temaAnterior);
  if (contrasteAnterior) raiz.setAttribute("data-contraste", contrasteAnterior);
  if (estilo) estilo.textContent = textoAnterior;

  return cores;
}

function luminancia(hex) {
  const canais = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

// Razão de contraste (WCAG): 4,5 ou mais é o mínimo para texto comum.
export function contraste(corA, corB) {
  const [maior, menor] = [luminancia(corA), luminancia(corB)].sort((a, b) => b - a);
  return (maior + 0.05) / (menor + 0.05);
}