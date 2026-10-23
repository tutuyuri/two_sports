import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { getPedidos, NaoAutenticado } from "../services/carrinho.js";
import { moeda } from "../utils/moeda.js";
import "./compras.css";
import "./minhasCompras.css";

const PAGAMENTOS = {
  pix: "Pix",
  cartao: "Cartão de crédito",
  boleto: "Boleto",
};

export function MinhasCompras() {
  const navegar = useNavigate();
  const [pedidos, setPedidos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    getPedidos()
      .then((dados) => {
        if (!cancelado) setPedidos(dados.pedidos);
      })
      .catch((e) => {
        if (cancelado) return;
        if (e instanceof NaoAutenticado) {
          navegar("/login", { state: { voltarPara: "/minhas-compras" } });
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

  if (carregando) return <p>Carregando suas compras...</p>;
  if (!pedidos) return <p className="compras__erro">{erro}</p>;

  if (pedidos.length === 0) {
    return (
      <div className="compras__vazio">
        <PackageOpen size={56} />
        <h2>Você ainda não fez nenhuma compra</h2>
        <p>Quando você finalizar um pedido, ele aparece aqui.</p>
        <Link to="/" className="compras__botao compras__botao--principal">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="historico">
      {pedidos.map((pedido) => {
        const e = pedido.endereco;

        return (
          <article
            key={pedido.id}
            className="pedido"
            aria-labelledby={`pedido-${pedido.id}`}
          >
            <header className="pedido__topo">
              <div>
                <h2 id={`pedido-${pedido.id}`}>Pedido #{pedido.id}</h2>
                <span className="pedido__data">
                  {new Date(pedido.criadoEm).toLocaleString("pt-BR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <span className="pedido__status">
                {pedido.status === "confirmado" ? "Confirmado" : pedido.status}
              </span>
            </header>

            <ul className="pedido__itens">
              {pedido.itens.map((item) => (
                <li key={item.id} className="pedidoItem">
                  <div className="pedidoItem__imagem">
                    {item.imagem && <img src={item.imagem} alt={item.titulo} />}
                  </div>

                  <div className="pedidoItem__info">
                    {item.produtoId ? (
                      <Link to={`/produtos/${item.produtoId}`}>{item.titulo}</Link>
                    ) : (
                      <span>{item.titulo}</span>
                    )}
                    <span className="pedidoItem__detalhe">
                      {item.quantidade}× {moeda.format(item.preco)}
                    </span>
                  </div>

                  <strong>{moeda.format(item.preco * item.quantidade)}</strong>
                </li>
              ))}
            </ul>

            <footer className="pedido__rodape">
              <div className="pedido__entrega">
                <span>
                  <strong>Entrega:</strong> {e.rua}, {e.numero}
                  {e.complemento ? ` (${e.complemento})` : ""} - {e.bairro},{" "}
                  {e.cidade}/{e.uf} - CEP {e.cep}
                </span>
                <span>
                  <strong>Pagamento:</strong>{" "}
                  {PAGAMENTOS[pedido.pagamento] ?? pedido.pagamento}
                </span>
              </div>

              <dl className="pedido__totais">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{moeda.format(pedido.subtotal)}</dd>
                </div>
                <div>
                  <dt>Frete</dt>
                  <dd>{pedido.frete === 0 ? "Grátis" : moeda.format(pedido.frete)}</dd>
                </div>
                <div className="pedido__total">
                  <dt>Total</dt>
                  <dd>{moeda.format(pedido.total)}</dd>
                </div>
              </dl>
            </footer>
          </article>
        );
      })}
    </div>
  );
}