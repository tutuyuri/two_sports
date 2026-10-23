import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Star, Truck, Zap } from "lucide-react";
import { getProdutos } from "../services/produtos.js";
import { adicionarAoCarrinho, NaoAutenticado } from "../services/carrinho.js";
import "./produto.css";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function Estrelas({ nota, tamanho = 18 }) {
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

export function Produto() {
  const { id } = useParams();
  const navegar = useNavigate();
  const local = useLocation();

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");
    setMensagem({ tipo: "", texto: "" });

    getProdutos(id)
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
  }, [id]);

  async function agir(comprar) {
    setEnviando(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      await adicionarAoCarrinho(dados.produto.id);

      if (comprar) {
        navegar("/carrinho");
      } else {
        setMensagem({ tipo: "sucesso", texto: "Produto adicionado ao carrinho." });
      }
    } catch (e) {
      if (e instanceof NaoAutenticado) {
        // Não está logado: vai para o login e volta para este produto depois.
        navegar("/login", { state: { voltarPara: local.pathname } });
      } else {
        setMensagem({ tipo: "erro", texto: e.message });
      }
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p>Carregando produto...</p>;

  if (erro) {
    return (
      <>
        <p>{erro}</p>
        <Link to="/">Voltar para a página inicial</Link>
      </>
    );
  }
    if (!dados) return null;
  const { produto, avaliacoes, totalAvaliacoes } = dados;

  return (
    <article className="produto">
      <div className="produto__topo">
        <div className="produto__imagem">
          <img src={produto.imagem} alt={produto.titulo} />
        </div>

        <div className="produto__info">
          <h2>{produto.titulo}</h2>

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

          <div className="produto__acoes">
            <button
              type="button"
              className="produto__botao produto__botao--principal"
              onClick={() => agir(true)}
              disabled={enviando}
            >
              <Zap size={18} /> Comprar
            </button>
            <button
              type="button"
              className="produto__botao produto__botao--secundario"
              onClick={() => agir(false)}
              disabled={enviando}
            >
              <ShoppingCart size={18} /> Adicionar ao carrinho
            </button>
          </div>

          <p
            className={`produto__mensagem produto__mensagem--${mensagem.tipo}`}
            role="status"
            aria-live="polite"
          >
            {mensagem.texto}
          </p>
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
