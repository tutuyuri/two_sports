import { useState } from "react";
import {
  aplicarPreferencias,
  lerPreferencias,
  PADRAO,
  salvarPreferencias,
} from "../utils/preferencias.js";
import { GrupoOpcoes, Interruptor, SecaoConfig } from "./secaoConfig.jsx";

const TEMAS = [
  { valor: "escuro", rotulo: "Escuro" },
  { valor: "claro", rotulo: "Claro" },
  { valor: "sistema", rotulo: "Automático (igual ao dispositivo)" },
];

const TAMANHOS = [
  { valor: "normal", rotulo: "Normal" },
  { valor: "grande", rotulo: "Grande" },
  { valor: "maior", rotulo: "Maior" },
];

export function PreferenciasDoSite() {
  const [prefs, setPrefs] = useState(lerPreferencias);

  function mudar(parcial) {
    const novas = { ...prefs, ...parcial };
    setPrefs(novas);
    salvarPreferencias(novas);
    aplicarPreferencias(novas);
  }

  return (
    <>
      <SecaoConfig
        id="aparencia"
        titulo="Aparência"
        descricao="Escolha o tema do site. A escolha vale para este navegador."
      >
        <GrupoOpcoes
          legenda="Tema"
          nome="tema"
          valor={prefs.tema}
          opcoes={TEMAS}
          aoMudar={(tema) => mudar({ tema })}
        />
      </SecaoConfig>

      <SecaoConfig
        id="acessibilidade"
        titulo="Acessibilidade"
        descricao="Ajustes para deixar o site mais confortável de ler e usar."
      >
        <GrupoOpcoes
          legenda="Tamanho do texto"
          nome="texto"
          valor={prefs.texto}
          opcoes={TAMANHOS}
          aoMudar={(texto) => mudar({ texto })}
        />

        <Interruptor
          id="alto-contraste"
          rotulo="Alto contraste"
          descricao="Cores mais fortes e bordas bem visíveis."
          marcado={prefs.altoContraste}
          aoMudar={(altoContraste) => mudar({ altoContraste })}
        />

        <Interruptor
          id="reduzir-movimento"
          rotulo="Reduzir animações"
          descricao="Remove transições e movimentos. Também respeitamos a configuração do seu dispositivo."
          marcado={prefs.reduzirMovimento}
          aoMudar={(reduzirMovimento) => mudar({ reduzirMovimento })}
        />

        <Interruptor
          id="sublinhar-links"
          rotulo="Sublinhar links"
          descricao="Deixa os links mais fáceis de identificar."
          marcado={prefs.sublinharLinks}
          aoMudar={(sublinharLinks) => mudar({ sublinharLinks })}
        />

        <button
          type="button"
          className="botaoConfig"
          onClick={() =>
            mudar({
              texto: PADRAO.texto,
              altoContraste: PADRAO.altoContraste,
              reduzirMovimento: PADRAO.reduzirMovimento,
              sublinharLinks: PADRAO.sublinharLinks,
            })
          }
        >
          Restaurar padrões de acessibilidade
        </button>
      </SecaoConfig>
    </>
  );
}