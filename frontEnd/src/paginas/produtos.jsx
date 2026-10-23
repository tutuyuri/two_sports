import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { CardProduto } from "../reutilizavel/cardProduto.jsx";
import { buscarProdutos } from "../services/produtos.js";
import { moeda } from "../utils/moeda.js";
import "./produtos.css";

const ORDENS = [
  { id: "relevancia", rotulo: "Mais relevantes" },
  { id: "menor-preco", rotulo: "Menor preço" },
  { id: "maior-preco", rotulo: "Maior preço" },
  { id: "avaliados", rotulo: "Melhores avaliados" },
  { id: "vendidos", rotulo: "Mais vendidos" },
];

export function Produtos() {
  const [parametros, setParametros] = useSearchParams();

  // A URL é a fonte da verdade: pesquisa, atalhos e categorias só mudam a URL.
  const q = (parametros.get("q") ?? "").trim();
  const categoria = parametros.get("categoria") ?? "";
  const freteGratis = parametros.get("freteGratis") === "1";
  const precoBruto = Number(parametros.get("precoMax"));
  const precoMax = Number.isFinite(precoBruto) && precoBruto > 0 ? precoBruto : 0;
  const ordemBruta = parametros.get("ordem");
  const ordem = ORDENS.some((o) => o.id === ordemBruta) ? ordemBruta : "relevancia";

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");

    buscarProdutos({ q, categoria, precoMax, freteGratis, ordem })
      .then((resultado) => {
        if (!cancelado) setDados(resultado);
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [q, categoria, precoMax, freteGratis, ordem]);

  function atualizar(mudancas) {
    const proximos = new URLSearchParams(parametros);

    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor === "" || valor === null || valor === false) {
        proximos.delete(chave);
      } else {
        proximos.set(chave, valor === true ? "1" : String(valor));
      }
    }

    setParametros(proximos);
  }

  const categorias = dados?.categorias ?? [];
  const categoriaAtual = categorias.find((c) => c.slug === categoria);
  const titulo = q
    ? `Resultados para “${q}”`
    : categoriaAtual
      ? categoriaAtual.nome
      : "Todos os produtos";

  const temFiltro = Boolean(q || categoria || freteGratis || precoMax || ordem !== "relevancia");

  return (
    <section className="catalogo" aria-labelledby="titulo-catalogo">
      <header className="catalogo__topo">
        <div>
          <h2 id="titulo-catalogo">{titulo}</h2>
          {dados && (
            <p className="catalogo__contagem" aria-live="polite">
              {dados.total} {dados.total === 1 ? "produto" : "produtos"}
            </p>
          )}
        </div>

        <label className="catalogo__ordem">
          <span>Ordenar por</span>
          <select value={ordem} onChange={(e) => atualizar({ ordem: e.target.value === "relevancia" ? "" : e.target.value })}>
            {ORDENS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="catalogo__filtros">
        <div className="chips" role="group" aria-label="Categorias">
          <button
            type="button"
            className={`chip ${!categoria ? "chip--ativo" : ""}`}
            aria-pressed={!categoria}
            onClick={() => atualizar({ categoria: "" })}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`chip ${categoria === c.slug ? "chip--ativo" : ""}`}
              aria-pressed={categoria === c.slug}
              onClick={() => atualizar({ categoria: c.slug })}
            >
              {c.nome} ({c.total})
            </button>
          ))}
        </div>

        <div className="chips" role="group" aria-label="Filtros">
          <button
            type="button"
            className={`chip ${freteGratis ? "chip--ativo" : ""}`}
            aria-pressed={freteGratis}
            onClick={() => atualizar({ freteGratis: !freteGratis })}
          >
            Frete grátis
          </button>
          <button
            type="button"
            className={`chip ${precoMax ? "chip--ativo" : ""}`}
            aria-pressed={Boolean(precoMax)}
            onClick={() => atualizar({ precoMax: precoMax ? "" : 100 })}
          >
            Até {moeda.format(precoMax || 100)}
          </button>
        </div>
      </div>

      {erro && <p className="catalogo__erro">{erro}</p>}
      {!dados && carregando && <p>Carregando produtos...</p>}

      {dados && dados.produtos.length === 0 && !erro && (
        <div className="catalogo__vazio">
          <SearchX size={48} />
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outra palavra ou remova alguns filtros.</p>
          {temFiltro && (
            <button type="button" className="chip chip--ativo" onClick={() => setParametros({})}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {dados && dados.produtos.length > 0 && (
        <ul className={`gradeProdutos ${carregando ? "gradeProdutos--carregando" : ""}`}>
          {dados.produtos.map((produto) => (
            <li key={produto.id}>
              <CardProduto produto={produto} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}