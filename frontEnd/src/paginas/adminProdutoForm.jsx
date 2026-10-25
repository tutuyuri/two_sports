import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Zap } from "lucide-react";
import { getProduto } from "../services/produtos.js";
import { NaoAutenticado } from "../services/carrinho.js";
import { atualizarProduto, criarProduto } from "../services/admin.js";
import { CATEGORIAS } from "../utils/categorias.js";
import { DetalheProduto } from "../reutilizavel/detalheProduto.jsx";
import { Interruptor, SecaoConfig } from "../reutilizavel/secaoConfig.jsx";
import "./admin.css";

const VAZIA = { tipo: "", texto: "" };

const CAMPOS_INICIAIS = {
  titulo: "",
  descricao: "",
  categoria: "outros",
  imagem: "",
  preco: "",
  freteGratis: false,
};

export function AdminProdutoForm() {
  const { id } = useParams(); // sem id = novo produto
  const editando = Boolean(id);
  const navegar = useNavigate();

  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [extra, setExtra] = useState({ nota: 0, vendidos: 0, avaliacoes: [], total: 0 });
  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(VAZIA);

  useEffect(() => {
    if (!editando) return;
    let cancelado = false;

    getProduto(id)
      .then(({ produto, avaliacoes, totalAvaliacoes }) => {
        if (cancelado) return;
        setCampos({
          titulo: produto.titulo,
          descricao: produto.descricao ?? "",
          categoria: produto.categoria,
          imagem: produto.imagem,
          preco: String(produto.preco).replace(".", ","),
          freteGratis: produto.freteGratis,
        });
        setExtra({
          nota: produto.nota,
          vendidos: produto.vendidos,
          avaliacoes,
          total: totalAvaliacoes,
        });
      })
      .catch((e) => {
        if (!cancelado) setErroCarga(e.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id, editando]);

  function mudar(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }));
    setMensagem(VAZIA);
  }

  const precoNumero = Number(String(campos.preco).replace(",", "."));

  // O que aparece na prévia: o mesmo componente da página de venda.
  const produtoPrevia = {
    id: id ?? 0,
    titulo: campos.titulo,
    descricao: campos.descricao,
    imagem: campos.imagem,
    preco: Number.isFinite(precoNumero) ? precoNumero : 0,
    nota: extra.nota,
    vendidos: extra.vendidos,
    freteGratis: campos.freteGratis,
  };

  async function salvar(evento) {
    evento.preventDefault();

    if (campos.titulo.trim().length < 3) {
      return setMensagem({ tipo: "erro", texto: "Digite o nome do produto." });
    }
    if (!(precoNumero > 0)) {
      return setMensagem({ tipo: "erro", texto: "Informe um preço maior que zero." });
    }

    const dados = {
      titulo: campos.titulo,
      descricao: campos.descricao,
      categoria: campos.categoria,
      imagem: campos.imagem,
      preco: precoNumero,
      freteGratis: campos.freteGratis,
    };

    setSalvando(true);
    setMensagem(VAZIA);
    try {
      if (editando) {
        await atualizarProduto(id, dados);
        setMensagem({
          tipo: "sucesso",
          texto: "Produto atualizado. Pode levar até 1 minuto para aparecer para os clientes.",
        });
      } else {
        await criarProduto(dados);
        navegar("/admin/produtos");
      }
    } catch (e) {
      if (e instanceof NaoAutenticado) {
        navegar("/login", { state: { voltarPara: "/admin/produtos" } });
      } else {
        setMensagem({ tipo: "erro", texto: e.message });
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando produto...</p>;
  if (erroCarga) {
    return (
      <>
        <p className="configMensagem configMensagem--erro">{erroCarga}</p>
        <Link to="/admin/produtos">Voltar para a lista</Link>
      </>
    );
  }

  return (
    <div>
      <div className="adminTopo">
        <h2>{editando ? "Editar produto" : "Novo produto"}</h2>
        {editando && (
          <Link to={`/produtos/${id}`} className="botaoConfig adminLink">
            Ver página de venda
          </Link>
        )}
      </div>

      <Link to="/admin/produtos" className="adminVoltar">← Lista de produtos</Link>

      <div className="adminForm">
        <SecaoConfig id="dados" titulo="Dados do produto">
          <form className="configForm" onSubmit={salvar} noValidate>
            <div className="campo">
              <label htmlFor="p-titulo">Nome</label>
              <input
                id="p-titulo"
                value={campos.titulo}
                onChange={(e) => mudar("titulo", e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="campo">
              <label htmlFor="p-imagem">Endereço da imagem (URL)</label>
              <input
                id="p-imagem"
                type="url"
                value={campos.imagem}
                onChange={(e) => mudar("imagem", e.target.value)}
                placeholder="https://..."
              />
              <small>Cole o link de uma imagem (.jpg, .png, .webp). A prévia atualiza ao lado.</small>
            </div>

            <div className="campo">
              <label htmlFor="p-preco">Preço (R$)</label>
              <input
                id="p-preco"
                inputMode="decimal"
                value={campos.preco}
                onChange={(e) => mudar("preco", e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="campo">
              <label htmlFor="p-categoria">Categoria</label>
              <select
                id="p-categoria"
                value={campos.categoria}
                onChange={(e) => mudar("categoria", e.target.value)}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="p-descricao">Descrição</label>
              <textarea
                id="p-descricao"
                value={campos.descricao}
                onChange={(e) => mudar("descricao", e.target.value)}
                maxLength={2000}
              />
            </div>

            <Interruptor
              id="p-frete"
              rotulo="Frete grátis"
              descricao="Mostra o selo na página de venda e entra no filtro de frete grátis."
              marcado={campos.freteGratis}
              aoMudar={(v) => mudar("freteGratis", v)}
            />

            <p
              className={`configMensagem configMensagem--${mensagem.tipo}`}
              role="status"
              aria-live="polite"
            >
              {mensagem.texto}
            </p>

            <button
              type="submit"
              className="botaoConfig botaoConfig--principal"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar produto"}
            </button>
          </form>
        </SecaoConfig>

        <div className="adminForm__previa">
          <p className="adminForm__previaTitulo">Prévia: como o cliente vai ver</p>
          <DetalheProduto
            produto={produtoPrevia}
            avaliacoes={extra.avaliacoes}
            totalAvaliacoes={extra.total}
            acoes={
              <div className="produto__acoes">
                <button type="button" className="produto__botao produto__botao--principal" disabled>
                  <Zap size={18} /> Comprar
                </button>
                <button type="button" className="produto__botao produto__botao--secundario" disabled>
                  <ShoppingCart size={18} /> Adicionar ao carrinho
                </button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}