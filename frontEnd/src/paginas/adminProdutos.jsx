import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarProdutosAdmin } from "../services/admin.js";
import { CATEGORIAS } from "../utils/categorias.js";
import { moeda } from "../utils/moeda.js";
import "../reutilizavel/configuracoes.css";
import "./admin.css";

export function AdminProdutos() {
  const [produtos, setProdutos] = useState(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    let cancelado = false;

    listarProdutosAdmin()
      .then((dados) => {
        if (!cancelado) setProdutos(dados.produtos);
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const visiveis = (produtos ?? []).filter((p) =>
    p.titulo.toLowerCase().includes(filtro.trim().toLowerCase())
  );

  return (
    <div>
      <div className="adminTopo">
        <h2>Produtos</h2>
        <Link to="/admin/produtos/novo" className="botaoConfig botaoConfig--principal adminLink">
          Novo produto
        </Link>
      </div>

      <Link to="/admin" className="adminVoltar">← Painel</Link>

      {erro && <p className="configMensagem configMensagem--erro">{erro}</p>}
      {!produtos && !erro && <p>Carregando produtos...</p>}

      {produtos && (
        <>
          <div className="campo adminBusca">
            <label htmlFor="admin-busca">Buscar produto</label>
            <input
              id="admin-busca"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Digite parte do nome"
            />
          </div>

          <ul className="adminLista">
            {visiveis.map((p) => (
              <li key={p.id} className="adminItem">
                <img src={p.imagem} alt="" loading="lazy" />
                <div>
                  <div className="adminItem__titulo">{p.titulo}</div>
                  <div className="adminItem__meta">
                    {CATEGORIAS.find((c) => c.slug === p.categoria)?.nome ?? p.categoria}
                    {p.freteGratis ? " · Frete grátis" : ""}
                  </div>
                </div>
                <strong>{moeda.format(p.preco)}</strong>
                <Link to={`/admin/produtos/${p.id}`} className="botaoConfig adminLink">
                  Editar
                </Link>
              </li>
            ))}
          </ul>

          {visiveis.length === 0 && <p>Nenhum produto encontrado.</p>}
        </>
      )}
    </div>
  );
}