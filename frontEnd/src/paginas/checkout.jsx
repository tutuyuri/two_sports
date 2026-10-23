import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, CreditCard, FileText, QrCode } from "lucide-react";
import {
  finalizarPedido,
  getCarrinho,
  NaoAutenticado,
} from "../services/carrinho.js";
import { moeda } from "../utils/moeda.js";
import "./compras.css";

const PAGAMENTOS = [
  { id: "pix", rotulo: "Pix", icone: QrCode },
  { id: "cartao", rotulo: "Cartão de crédito", icone: CreditCard },
  { id: "boleto", rotulo: "Boleto", icone: FileText },
];

export function Checkout() {
  const navegar = useNavigate();
  const [carrinho, setCarrinho] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    let cancelado = false;

    getCarrinho()
      .then((dados) => {
        if (!cancelado) setCarrinho(dados);
      })
      .catch((e) => {
        if (cancelado) return;
        if (e instanceof NaoAutenticado) {
          navegar("/login", { state: { voltarPara: "/checkout" } });
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

  async function enviar(evento) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);

    const dados = {
      endereco: {
        cep: form.get("cep"),
        rua: form.get("rua"),
        numero: form.get("numero"),
        complemento: form.get("complemento"),
        bairro: form.get("bairro"),
        cidade: form.get("cidade"),
        uf: form.get("uf"),
      },
      pagamento: form.get("pagamento"),
    };

    setEnviando(true);
    setErro("");
    try {
      const resposta = await finalizarPedido(dados);
      setPedido(resposta.pedido);
    } catch (e) {
      if (e instanceof NaoAutenticado) {
        navegar("/login", { state: { voltarPara: "/checkout" } });
      } else {
        setErro(e.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  if (pedido) {
    const forma = PAGAMENTOS.find((p) => p.id === pedido.pagamento)?.rotulo;
    return (
      <div className="compras__vazio">
        <Check size={56} />
        <h2>Pedido #{pedido.id} confirmado!</h2>
        <p>
          Total de {moeda.format(pedido.total)} no {forma}. Esta é uma compra
          fictícia: nenhum valor foi cobrado.
        </p>
        <Link to="/" className="compras__botao compras__botao--principal">
          Continuar comprando
        </Link>
      </div>
    );
  }

  if (!carrinho) return <p className="compras__erro">{erro}</p>;

  const { itens, resumo } = carrinho;

  if (itens.length === 0) {
    return (
      <div className="compras__vazio">
        <h2>Seu carrinho está vazio</h2>
        <p>Adicione produtos antes de finalizar a compra.</p>
        <Link to="/" className="compras__botao compras__botao--principal">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <form className="compras" onSubmit={enviar}>
      <div className="compras__lista">
        <section className="bloco" aria-labelledby="titulo-endereco">
          <h2 id="titulo-endereco">Endereço de entrega</h2>

          <div className="bloco__grade">
            <div className="campo">
              <label htmlFor="cep">CEP</label>
              <input id="cep" name="cep" placeholder="00000-000" autoComplete="postal-code" required />
            </div>
            <div className="campo">
              <label htmlFor="numero">Número</label>
              <input id="numero" name="numero" placeholder="123" required />
            </div>
            <div className="campo campo--larga">
              <label htmlFor="rua">Rua</label>
              <input id="rua" name="rua" placeholder="Nome da rua" autoComplete="address-line1" required />
            </div>
            <div className="campo">
              <label htmlFor="complemento">Complemento (opcional)</label>
              <input id="complemento" name="complemento" placeholder="Apto, bloco..." />
            </div>
            <div className="campo">
              <label htmlFor="bairro">Bairro</label>
              <input id="bairro" name="bairro" required />
            </div>
            <div className="campo">
              <label htmlFor="cidade">Cidade</label>
              <input id="cidade" name="cidade" autoComplete="address-level2" required />
            </div>
            <div className="campo">
              <label htmlFor="uf">UF</label>
              <input id="uf" name="uf" placeholder="SP" maxLength={2} autoComplete="address-level1" required />
            </div>
          </div>
        </section>

        <section className="bloco" aria-labelledby="titulo-pagamento">
          <h2 id="titulo-pagamento">Forma de pagamento</h2>

          <div className="pagamentos">
            {PAGAMENTOS.map(({ id, rotulo, icone: Icone }, indice) => (
              <label key={id} className="pagamento">
                <input type="radio" name="pagamento" value={id} defaultChecked={indice === 0} />
                <Icone size={20} />
                <span>{rotulo}</span>
              </label>
            ))}
          </div>
          <p className="bloco__nota">Pagamento simulado: não pedimos dados de cartão.</p>
        </section>
      </div>

      <aside className="resumo" aria-label="Resumo do pedido">
        <h3>Resumo do pedido</h3>

        <ul className="resumo__itens">
          {itens.map((item) => (
            <li key={item.produtoId}>
              <span>
                {item.quantidade}× {item.titulo}
              </span>
              <span>{moeda.format(item.subtotal)}</span>
            </li>
          ))}
        </ul>

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

        <button
          type="submit"
          className="compras__botao compras__botao--principal"
          disabled={enviando}
        >
          {enviando ? "Confirmando..." : "Confirmar pedido"}
        </button>
        <Link to="/carrinho" className="resumo__continuar">
          Voltar ao carrinho
        </Link>

        <p className="compras__erro" role="status" aria-live="polite">
          {erro}
        </p>
      </aside>
    </form>
  );
}