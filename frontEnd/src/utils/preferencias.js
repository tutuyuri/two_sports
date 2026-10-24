const CHAVE = "two_sports_preferencias";

export const PADRAO = {
  tema: "escuro", // "escuro" | "claro" | "sistema"
  texto: "normal", // "normal" | "grande" | "maior"
  altoContraste: false,
  reduzirMovimento: false,
  sublinharLinks: false,
};

export function lerPreferencias() {
  try {
    return { ...PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) ?? "{}") };
  } catch {
    return { ...PADRAO };
  }
}

export function salvarPreferencias(preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias));
  } catch {
    // Sem armazenamento disponível: a preferência vale só até recarregar.
  }
}

function definir(raiz, atributo, ligado, valor) {
  if (ligado) raiz.setAttribute(atributo, valor);
  else raiz.removeAttribute(atributo);
}

export function aplicarPreferencias(p) {
  const raiz = document.documentElement;
  const sistemaEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;

  let tema = "dark";
  if (p.tema === "claro") tema = "light";
  if (p.tema === "sistema") tema = sistemaEscuro ? "dark" : "light";

  raiz.setAttribute("data-theme", tema);
  raiz.setAttribute("data-texto", p.texto);
  definir(raiz, "data-contraste", p.altoContraste, "alto");
  definir(raiz, "data-movimento", p.reduzirMovimento, "reduzido");
  definir(raiz, "data-links", p.sublinharLinks, "sublinhados");
}

// Chamada uma vez ao abrir o site.
export function iniciarPreferencias() {
  aplicarPreferencias(lerPreferencias());

  // Se o tema for "automático", acompanha o dispositivo em tempo real.
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => aplicarPreferencias(lerPreferencias()));
}