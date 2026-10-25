import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Zap } from "lucide-react";
import { getProduto } from "../services/produtos.js";
import { adicionarAoCarrinho, NaoAutenticado } from "../services/carrinho.js";
import { DetalheProduto } from "../reutilizavel/detalheProduto.jsx";
import "./produto.css";

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

    getProduto(id)
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

  return (
    <DetalheProduto
      produto={dados.produto}
      avaliacoes={dados.avaliacoes}
      totalAvaliacoes={dados.totalAvaliacoes}
      acoes={
        <>
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
        </>
      }
    />
  );
}