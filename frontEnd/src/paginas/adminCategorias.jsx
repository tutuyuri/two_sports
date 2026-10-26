import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { criarCategoria, excluirCategoria, listarCategoriasAdmin } from "../services/admin.js";
import { SecaoConfig } from "../reutilizavel/secaoConfig.jsx";
import "./admin.css";

const VAZIA = { tipo: "", texto: "" };

// Mesma regra do servidor: "Natação & Água" -> "natacao-agua"
function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export function AdminCategorias() {
  const [categorias, setCategorias] = useState(null);
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState(VAZIA);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    listarCategoriasAdmin()
      .then((dados) => {
        if (!cancelado) setCategorias(dados.categorias);
      })
      .catch((e) => {
        if (!cancelado) setMensagem({ tipo: "erro", texto: e.message });
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Devolve true se deu certo, para o formulário só limpar nesse caso.
  async function executar(acao, textoSucesso) {
    setOcupado(true);
    setMensagem(VAZIA);
    try {
      const dados = await acao();
      setCategorias(dados.categorias);
      setMensagem({ tipo: "sucesso", texto: textoSucesso });
      return true;
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function criar(evento) {
    evento.preventDefault();
    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 2) {
      return setMensagem({ tipo: "erro", texto: "Digite o nome da categoria." });
    }
    if (gerarSlug(nomeLimpo).length < 2) {
      return setMensagem({ tipo: "erro", texto: "Use letras ou números no nome da categoria." });
    }

    const criada = await executar(
      () => criarCategoria(nomeLimpo),
      `Categoria "${nomeLimpo}" criada. Ela já pode ser escolhida ao cadastrar produtos.`
    );
    if (criada) setNome("");
  }

  const slug = gerarSlug(nome);

  return (
    <div className="adminPagina">
      <div className="adminTopo">
        <h2>Categorias</h2>
      </div>
      <Link to="/admin" className="adminVoltar">← Painel</Link>

      <SecaoConfig
        id="nova-categoria"
        titulo="Nova categoria"
        descricao="Ela aparece como filtro na loja assim que tiver pelo menos um produto."
      >
        <form className="configForm" onSubmit={criar} noValidate>
          <div className="campo">
            <label htmlFor="categoria-nome">Nome da categoria</label>
            <input
              id="categoria-nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setMensagem(VAZIA);
              }}
              maxLength={40}
              placeholder="Ex.: Natação"
            />
            {slug && <small>Endereço na loja: {slug}</small>}
          </div>

          <p
            className={`configMensagem configMensagem--${mensagem.tipo}`}
            role="status"
            aria-live="polite"
          >
            {mensagem.texto}
          </p>

          <button type="submit" className="botaoConfig botaoConfig--principal" disabled={ocupado}>
            Criar categoria
          </button>
        </form>
      </SecaoConfig>

      <SecaoConfig id="lista-categorias" titulo="Categorias existentes">
        {!categorias && <p>Carregando...</p>}

        <ul className="adminLista">
          {(categorias ?? []).map((c) => {
            const protegida = c.slug === "outros";
            const motivo = protegida
              ? 'A categoria "Outros" não pode ser excluída.'
              : c.total > 0
                ? "Mude os produtos para outra categoria antes de excluir."
                : "";

            return (
              <li key={c.slug} className="adminItem adminItem--simples">
                <div>
                  <div className="adminItem__titulo">{c.nome}</div>
                  <div className="adminItem__meta">
                    {c.slug} · {c.total} {c.total === 1 ? "produto" : "produtos"}
                  </div>
                </div>
                <button
                  type="button"
                  className="botaoConfig botaoConfig--perigo"
                  disabled={ocupado || protegida || c.total > 0}
                  title={motivo}
                  onClick={() => {
                    if (window.confirm(`Excluir a categoria "${c.nome}"?`)) {
                      executar(() => excluirCategoria(c.slug), "Categoria excluída.");
                    }
                  }}
                >
                  Excluir
                </button>
              </li>
            );
          })}
        </ul>
      </SecaoConfig>
    </div>
  );
}