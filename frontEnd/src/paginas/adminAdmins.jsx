import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSessao } from "../contexto/sessaoContexto.js";
import { adicionarAdmin, listarAdmins, removerAdmin } from "../services/admin.js";
import { SecaoConfig } from "../reutilizavel/secaoConfig.jsx";
import "./admin.css";

const VAZIA = { tipo: "", texto: "" };

export function AdminAdmins() {
  const { usuario } = useSessao();
  const [admins, setAdmins] = useState(null);
  const [mensagem, setMensagem] = useState(VAZIA);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    listarAdmins()
      .then((dados) => {
        if (!cancelado) setAdmins(dados.admins);
      })
      .catch((e) => {
        if (!cancelado) setMensagem({ tipo: "erro", texto: e.message });
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function executar(acao, textoSucesso) {
    setOcupado(true);
    setMensagem(VAZIA);
    try {
      const dados = await acao();
      setAdmins(dados.admins);
      setMensagem({ tipo: "sucesso", texto: textoSucesso });
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setOcupado(false);
    }
  }

  function adicionar(evento) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const email = new FormData(form).get("email").trim();
    if (!email) return setMensagem({ tipo: "erro", texto: "Digite o e-mail da conta." });

    executar(() => adicionarAdmin(email), "Administrador adicionado.").then(() => form.reset());
  }

  return (
    <div>
      <div className="adminTopo">
        <h2>Administradores</h2>
      </div>
      <Link to="/admin" className="adminVoltar">← Painel</Link>

      <SecaoConfig
        id="novo-admin"
        titulo="Adicionar administrador"
        descricao="A pessoa precisa já ter uma conta no site. Digite o e-mail dela."
      >
        <form className="configForm" onSubmit={adicionar} noValidate>
          <div className="campo">
            <label htmlFor="novo-admin-email">E-mail da conta</label>
            <input id="novo-admin-email" name="email" type="email" placeholder="pessoa@exemplo.com" />
          </div>

          <p
            className={`configMensagem configMensagem--${mensagem.tipo}`}
            role="status"
            aria-live="polite"
          >
            {mensagem.texto}
          </p>

          <button type="submit" className="botaoConfig botaoConfig--principal" disabled={ocupado}>
            Adicionar
          </button>
        </form>
      </SecaoConfig>

      <SecaoConfig id="lista-admins" titulo="Quem é administrador">
        {!admins && <p>Carregando...</p>}
        <ul className="adminLista">
          {(admins ?? []).map((a) => (
            <li key={a.id} className="adminItem adminItem--simples">
              <div>
                <div className="adminItem__titulo">
                  {a.nome} {a.id === usuario?.id && "(você)"}
                </div>
                <div className="adminItem__meta">{a.email}</div>
              </div>
              <button
                type="button"
                className="botaoConfig botaoConfig--perigo"
                disabled={ocupado || a.id === usuario?.id}
                onClick={() => executar(() => removerAdmin(a.id), "Acesso removido.")}
              >
                Remover acesso
              </button>
            </li>
          ))}
        </ul>
      </SecaoConfig>
    </div>
  );
}