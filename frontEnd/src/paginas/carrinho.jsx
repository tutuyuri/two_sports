import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import {
  alterarQuantidade,
  getCarrinho,
  NaoAutenticado,
  removerDoCarrinho,
} from "../services/carrinho.js";
import { moeda } from "../utils/moeda.js";
import "./compras.css";

export function Carrinho() {
  const navegar = useNavigate();
  const [carrinho, setCarrinho] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    getCarrinho()
      .then((dados) => {
        if (!cancelado) setCarrinho(dados);
      })
      .catch((e) => {
        if (cancelado) return;
        if (e instanceof NaoAutenticado) {
          navegar("/login", { state: { voltarPara: "/carrinho" } });
        } else {
          setErro(e.message);
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [navegar]);

  // Executa uma ação (alterar/remover) e atualiza o carrinho com a resposta.
  async function executar(acao) {
    setOcupado(true);
    setErro("");
    try {
      setCarrinho(await acao());
    } catch (e) {
      if (e instanceof NaoAutenticado) {
        navegar("/login", { state: { voltarPara: "/carrinho" } });
      } else {
        setErro(e.message);
      }
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) return <p>Carregando carrinho...</p>;
  if (!carrinho) return <p className="compras__erro">{erro}</p>;

  const { itens, resumo } = carrinho;

  if (itens.length === 0) {
    return (
      <div className="compras__vazio">
        <ShoppingCart size={56} />
        <h2>Seu carrinho está vazio</h2>
        <p>Que tal dar uma olhada nos produtos?</p>
        <Link to="/" className="compras__botao compras__botao--principal">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="compras">
      <section className="compras__lista" aria-label="Itens do carrinho">
        <h2>
          Carrinho ({resumo.quantidadeTotal}{" "}
          {resumo.quantidadeTotal === 1 ? "item" : "itens"})
        </h2>

        <ul>
          {itens.map((item) => (
            <li key={item.produtoId} className="itemCarrinho">
              <Link to={`/produtos/${item.produtoId}`} className="itemCarrinho__imagem">
                <img src={item.imagem} alt={item.titulo} />
              </Link>

              <div className="itemCarrinho__info">
                <Link to={`/produtos/${item.produtoId}`} className="itemCarrinho__titulo">
                  {item.titulo}
                </Link>
                {item.freteGratis && (
                  <span className="itemCarrinho__frete">
                    <Truck size={14} /> Frete grátis
                  </span>
                )}
                <span className="itemCarrinho__preco">
                  {moeda.format(item.preco)} cada
                </span>
              </div>

              <div
                className="itemCarrinho__quantidade"
                role="group"
                aria-label={`Quantidade de ${item.titulo}`}
              >
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  disabled={ocupado || item.quantidade <= 1}
                  onClick={() =>
                    executar(() => alterarQuantidade(item.produtoId, item.quantidade - 1))
                  }
                >
                  <Minus size={16} />
                </button>
                <span aria-live="polite">{item.quantidade}</span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  disabled={ocupado || item.quantidade >= 20}
                  onClick={() =>
                    executar(() => alterarQuantidade(item.produtoId, item.quantidade + 1))
                  }
                >
                  <Plus size={16} />
                </button>
              </div>

              <strong className="itemCarrinho__subtotal">
                {moeda.format(item.subtotal)}
              </strong>

              <button
                type="button"
                className="itemCarrinho__remover"
                aria-label={`Remover ${item.titulo}`}
                disabled={ocupado}
                onClick={() => executar(() => removerDoCarrinho(item.produtoId))}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="resumo" aria-label="Resumo do pedido">
        <h3>Resumo</h3>

        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{moeda.format(resumo.subtotal)}</dd>
          </div>
          <div>
            <dt>Frete</dt>
            <dd>{resumo.frete === 0 ? "Grátis" : moeda.format(resumo.frete)}</dd>
          </div>
          <div className="resumo__total">
            <dt>Total</dt>
            <dd>{moeda.format(resumo.total)}</dd>
          </div>
        </dl>

        <Link to="/checkout" className="compras__botao compras__botao--principal">
          Finalizar compra
        </Link>
        <Link to="/" className="resumo__continuar">
          Continuar comprando
        </Link>

        <p className="compras__erro" role="status" aria-live="polite">
          {erro}
        </p>
      </aside>
    </div>
  );
}