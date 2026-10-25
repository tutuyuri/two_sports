import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getConta } from "../services/conta.js";
import { NaoAutenticado } from "../services/carrinho.js";
import { PreferenciasDoSite } from "../reutilizavel/configAparencia.jsx";
import {
  SecaoConta,
  SecaoExcluirConta,
  SecaoNotificacoes,
  SecaoSeguranca,
} from "../reutilizavel/configConta.jsx";
import { SecaoConfig } from "../reutilizavel/secaoConfig.jsx";

export function Config() {
  const navegar = useNavigate();
  // undefined = carregando | null = sem login | objeto = conta logada
  const [conta, setConta] = useState(undefined);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    getConta()
      .then((dados) => {
        if (!cancelado) setConta(dados.conta);
      })
      .catch((e) => {
        if (cancelado) return;
        if (!(e instanceof NaoAutenticado)) setErro(e.message);
        setConta(null);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const logado = Boolean(conta);
  const aoExpirar = () =>
    navegar("/login", { state: { voltarPara: "/configuracoes" } });

  return (
    <div className="configuracoes">
      <nav className="configuracoes__nav" aria-label="Seções das configurações">
        <ul>
          {logado && (
            <>
              <li><a href="#conta">Conta</a></li>
              <li><a href="#seguranca">Segurança</a></li>
            </>
          )}
          <li><a href="#aparencia">Aparência</a></li>
          <li><a href="#acessibilidade">Acessibilidade</a></li>
          {logado && (
            <>
              <li><a href="#notificacoes">Notificações</a></li>
              <li><a href="#excluir">Excluir conta</a></li>
            </>
          )}
        </ul>
      </nav>

      <div className="configuracoes__conteudo">
        {conta === undefined && <p>Carregando configurações...</p>}

        {erro && <p className="configMensagem configMensagem--erro">{erro}</p>}

        {conta === null && (
          <SecaoConfig
            id="entrar"
            titulo="Sua conta"
            descricao="Entre para alterar seu nome, sua senha e suas notificações."
          >
            <Link
              to="/login"
              state={{ voltarPara: "/configuracoes" }}
              className="botaoConfig botaoConfig--principal"
              style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
            >
              Entrar
            </Link>
          </SecaoConfig>
        )}

        {conta && (
          <>
            <SecaoConta conta={conta} aoAtualizarConta={setConta} aoExpirar={aoExpirar} />
            <SecaoSeguranca conta={conta} aoAtualizarConta={setConta} aoExpirar={aoExpirar} />
          </>
        )}

        <PreferenciasDoSite />

        {conta && (
          <>
            <SecaoNotificacoes conta={conta} aoAtualizarConta={setConta} aoExpirar={aoExpirar} />
            <SecaoExcluirConta conta={conta} aoExpirar={aoExpirar} />
          </>
        )}
      </div>
    </div>
  );
}