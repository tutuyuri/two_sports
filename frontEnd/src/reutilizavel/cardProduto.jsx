import { Link } from "react-router-dom";
import { Star, Truck } from "lucide-react";
import "./cardProduto.css";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CardProduto({ produto }) {
  return (
    <Link to={`/produtos/${produto.id}`} className="cardProduto">
      <img
        className="cardProduto__imagem"
        src={produto.imagem}
        alt={produto.titulo}
        loading="lazy"
      />

      <h3 className="cardProduto__titulo">{produto.titulo}</h3>

      <span className="cardProduto__nota">
        <Star size={14} /> {produto.nota.toFixed(1)}
      </span>

      <strong className="cardProduto__preco">{moeda.format(produto.preco)}</strong>

      {produto.freteGratis && (
        <span className="cardProduto__frete">
          <Truck size={14} /> Frete grátis
        </span>
      )}
    </Link>
  );
}