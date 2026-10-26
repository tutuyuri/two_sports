import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackageOpen, Pencil, Star } from "lucide-react";
import { getPedidos, NaoAutenticado } from "../services/carrinho.js";
import { Estrelas } from "../reutilizavel/detalheProduto.jsx";
import { FormAvaliacao } from "../reutilizavel/formAvaliacao.jsx";
import { moeda } from "../utils/moeda.js";
import "../reutilizavel/configuracoes.css";
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
  const [abertoId, setAbertoId] = useState(null); // formulário de avaliação aberto

  const irParaLogin = () =>
    navegar("/login", { state: { voltarPara: "/minhas-compras" } });

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

  // A avaliação vale para o produto: atualiza todas as compras dele.
  function aoAvaliar(produtoId, nota, comentario) {
    setPedidos((atuais) =>
      atuais.map((pedido) => ({
        ...pedido,
        itens: pedido.itens.map((item) =>
          item.produtoId === produtoId
            ? { ...item, minhaNota: nota, meuComentario: comentario }
            : item
        ),
      }))
    );
    setAbertoId(null);
  }

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
              {pedido.itens.map((item) => {
                const chave = `${pedido.id}-${item.id}`;
                const avaliado = item.minhaNota != null;
                const aberto = abertoId === chave;

                return (
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

                      {item.produtoId && (
                        <div className="pedidoItem__avaliacao">
                          {avaliado && (
                            <span className="pedidoItem__nota">
                              <Estrelas nota={item.minhaNota} tamanho={14} />
                              Sua avaliação
                            </span>
                          )}
                          <button
                            type="button"
                            className="botaoConfig pedidoItem__botao"
                            aria-expanded={aberto}
                            onClick={() => setAbertoId(aberto ? null : chave)}
                          >
                            {avaliado ? <Pencil size={14} /> : <Star size={14} />}
                            {avaliado ? "Editar avaliação" : "Avaliar"}
                          </button>
                        </div>
                      )}
                    </div>

                    <strong>{moeda.format(item.preco * item.quantidade)}</strong>

                    {aberto && (
                      <div className="pedidoItem__form">
                        <FormAvaliacao
                          produtoId={item.produtoId}
                          titulo={item.titulo}
                          notaInicial={item.minhaNota ?? 0}
                          comentarioInicial={item.meuComentario ?? ""}
                          editando={avaliado}
                          aoSalvar={(nota, comentario) =>
                            aoAvaliar(item.produtoId, nota, comentario)
                          }
                          aoCancelar={() => setAbertoId(null)}
                          aoExpirar={irParaLogin}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
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