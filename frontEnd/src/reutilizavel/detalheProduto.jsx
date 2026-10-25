import { useState } from "react";
import { Star, Truck } from "lucide-react";
import { moeda } from "../utils/moeda.js";
import "../paginas/produto.css";

export function Estrelas({ nota, tamanho = 18 }) {
  return (
    <span className="estrelas" role="img" aria-label={`Nota ${nota.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={tamanho}
          fill={n <= Math.round(nota) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

function ImagemProduto({ src, alt }) {
  const [falhou, setFalhou] = useState(false);

  if (!src || falhou) return <div className="produto__semImagem">Sem imagem</div>;
  return <img src={src} alt={alt} onError={() => setFalhou(true)} />;
}

// Mostra o produto como o cliente vê. "acoes" são os botões (reais na venda, desativados na prévia).
export function DetalheProduto({ produto, avaliacoes, totalAvaliacoes, acoes }) {
  return (
    <article className="produto">
      <div className="produto__topo">
        <div className="produto__imagem">
          <ImagemProduto key={produto.imagem} src={produto.imagem} alt={produto.titulo} />
        </div>

        <div className="produto__info">
          <h2>{produto.titulo || "Nome do produto"}</h2>

          <div className="produto__resumo">
            <Estrelas nota={produto.nota} />
            <strong>{produto.nota.toFixed(1)}</strong>
            <span>({totalAvaliacoes} avaliações)</span>
            <span className="produto__separador">|</span>
            <span>{produto.vendidos} vendidos</span>
          </div>

          <strong className="produto__preco">{moeda.format(produto.preco)}</strong>

          {produto.freteGratis && (
            <span className="produto__frete">
              <Truck size={16} /> Frete grátis
            </span>
          )}

          <p className="produto__descricao">{produto.descricao}</p>

          {acoes}
        </div>
      </div>

      <section className="avaliacoes" aria-labelledby="titulo-avaliacoes">
        <h3 id="titulo-avaliacoes">Avaliações</h3>

        {avaliacoes.length === 0 && <p>Este produto ainda não tem avaliações.</p>}

        <ul className="avaliacoes__lista">
          {avaliacoes.map((a) => (
            <li key={a.id} className="avaliacao">
              <div className="avaliacao__cabecalho">
                <strong>{a.autor}</strong>
                <span>{new Date(a.criadoEm).toLocaleDateString("pt-BR")}</span>
              </div>
              <Estrelas nota={a.nota} tamanho={14} />
              <p>{a.comentario}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}