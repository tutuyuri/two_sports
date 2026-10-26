import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTema, salvarTema } from "../services/admin.js";
import {
  VARIAVEIS,
  aplicarTemaPersonalizado,
  contraste,
  lerCoresPadrao,
} from "../utils/temaPersonalizado.js";
import { SecaoConfig } from "../reutilizavel/secaoConfig.jsx";
import "./produtos.css";
import "./admin.css";

const MODOS = [
  { id: "escuro", rotulo: "Modo escuro" },
  { id: "claro", rotulo: "Modo claro" },
];

const GRUPOS = ["Marca", "Fundos", "Textos", "Botões"];

const VAZIA = { tipo: "", texto: "" };

function avaliar(razao) {
  if (razao >= 7) return "ótimo";
  if (razao >= 4.5) return "bom";
  return "baixo: difícil de ler";
}

export function AdminCores() {
  const [modo, setModo] = useState("escuro");
  const [padroes, setPadroes] = useState(null);
  const [rascunho, setRascunho] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(VAZIA);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const base = { escuro: lerCoresPadrao("escuro"), claro: lerCoresPadrao("claro") };

    getTema()
      .then(({ tema }) => {
        if (cancelado) return;
        setPadroes(base);
        setRascunho({
          escuro: { ...base.escuro, ...(tema.escuro ?? {}) },
          claro: { ...base.claro, ...(tema.claro ?? {}) },
        });
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (erro) return <p className="configMensagem configMensagem--erro">{erro}</p>;
  if (!rascunho) return <p>Carregando cores...</p>;

  const cores = rascunho[modo];
  const padrao = padroes[modo];

  function mudarCor(nome, valor) {
    setRascunho((atual) => ({ ...atual, [modo]: { ...atual[modo], [nome]: valor } }));
    setMensagem(VAZIA);
  }

  async function salvar() {
    // Só guarda o que for diferente do padrão.
    const diferentes = Object.fromEntries(
      VARIAVEIS.filter((v) => cores[v.nome] !== padrao[v.nome]).map((v) => [v.nome, cores[v.nome]])
    );

    setSalvando(true);
    try {
      const { tema } = await salvarTema(modo, diferentes);
      aplicarTemaPersonalizado(tema, true);
      setMensagem({ tipo: "sucesso", texto: "Cores salvas. Já valem para todos os visitantes." });
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  async function redefinir(modos) {
    const nomes = modos.map((m) => MODOS.find((x) => x.id === m).rotulo.toLowerCase()).join(" e ");
    if (!window.confirm(`Voltar as cores do ${nomes} ao padrão?`)) return;

    setSalvando(true);
    try {
      let ultimoTema = {};
      for (const m of modos) {
        ({ tema: ultimoTema } = await salvarTema(m, {}));
      }
      aplicarTemaPersonalizado(ultimoTema, true);
      setRascunho((atual) => {
        const proximo = { ...atual };
        for (const m of modos) proximo[m] = { ...padroes[m] };
        return proximo;
      });
      setMensagem({ tipo: "sucesso", texto: "Cores redefinidas ao padrão." });
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  const mudou = VARIAVEIS.some((v) => cores[v.nome] !== padrao[v.nome]);

  const verificacoes = [
    ["Texto sobre o fundo", contraste(cores["--cor-texto"], cores["--cor-fundo"])],
    ["Texto sobre os cartões", contraste(cores["--cor-texto"], cores["--cor-superficie"])],
    ["Texto dos botões", contraste(cores["--cor-botao-texto"], cores["--cor-botao"])],
  ];

  return (
    <div className="adminPagina">
      <div className="adminTopo">
        <h2>Cores do app</h2>
      </div>
      <Link to="/admin" className="adminVoltar">← Painel</Link>

      <div className="chips" role="group" aria-label="Modo a editar" style={{ margin: "12px 0" }}>
        {MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`chip ${modo === m.id ? "chip--ativo" : ""}`}
            aria-pressed={modo === m.id}
            onClick={() => {
              setModo(m.id);
              setMensagem(VAZIA);
            }}
          >
            {m.rotulo}
          </button>
        ))}
      </div>

      <div className="coresEditor">
        <SecaoConfig
          id="cores"
          titulo={MODOS.find((m) => m.id === modo).rotulo}
          descricao="As cores valem para todos os visitantes. O alto contraste da acessibilidade continua sobrepondo tudo."
        >
          {GRUPOS.map((grupo) => (
            <fieldset key={grupo} className="coresGrupo">
              <legend>{grupo}</legend>
              {VARIAVEIS.filter((v) => v.grupo === grupo).map((v) => (
                <label key={v.nome} className="corLinha">
                  <input
                    type="color"
                    value={cores[v.nome]}
                    onChange={(e) => mudarCor(v.nome, e.target.value)}
                  />
                  <span>{v.rotulo}</span>
                  <code>{cores[v.nome]}</code>
                </label>
              ))}
            </fieldset>
          ))}

          <ul className="contrastes" aria-label="Verificação de leitura">
            {verificacoes.map(([rotulo, razao]) => (
              <li key={rotulo} className={razao < 4.5 ? "contrastes--baixo" : ""}>
                {rotulo}: {razao.toFixed(1)}:1 ({avaliar(razao)})
              </li>
            ))}
          </ul>

          <p
            className={`configMensagem configMensagem--${mensagem.tipo}`}
            role="status"
            aria-live="polite"
          >
            {mensagem.texto}
          </p>

          <div className="configAcoes">
            <button
              type="button"
              className="botaoConfig botaoConfig--principal"
              onClick={salvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar cores"}
            </button>
            <button
              type="button"
              className="botaoConfig"
              onClick={() => redefinir([modo])}
              disabled={salvando}
            >
              Redefinir {modo === "escuro" ? "modo escuro" : "modo claro"} ao padrão
            </button>
            <button
              type="button"
              className="botaoConfig"
              onClick={() => redefinir(["escuro", "claro"])}
              disabled={salvando}
            >
              Redefinir os dois modos
            </button>
          </div>
          {mudou && <small>Você tem alterações ainda não salvas neste modo.</small>}
        </SecaoConfig>

        <div>
          <p className="adminForm__previaTitulo">Prévia do {modo === "escuro" ? "modo escuro" : "modo claro"}</p>

          <div className="previaCores" style={cores}>
            <div className="previaCores__topo">
              <strong>Two Sports</strong>
              <span className="previaCores__destaque">Entrar</span>
            </div>

            <div className="previaCores__faixa" />

            <div className="previaCores__corpo">
              <h3>Produtos em destaque</h3>
              <p className="previaCores__sec">Texto secundário, para descrições e detalhes.</p>

              <div className="previaCores__card">
                <strong>Bola de basquete</strong>
                <span className="previaCores__destaque">R$ 129,90</span>
                <span className="previaCores__chip">Filtro ativo</span>
              </div>

              <div className="previaCores__botoes">
                <span className="previaCores__botao">Comprar</span>
                <span className="previaCores__botao previaCores__botao--hover">Botão (mouse em cima)</span>
              </div>
            </div>

            <div className="previaCores__rodape">Rodapé do site</div>
          </div>
        </div>
      </div>
    </div>
  );
}