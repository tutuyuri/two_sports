import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NaoAutenticado } from "../services/carrinho.js";
import {
  alterarNome,
  alterarSenha,
  excluirConta,
  salvarNotificacoes,
} from "../services/conta.js";
import { useSessao } from "../contexto/sessaoContexto.js";
import { CampoSenha } from "./autenticacao.jsx";
import { Interruptor, SecaoConfig } from "./secaoConfig.jsx";

const VAZIA = { tipo: "", texto: "" };

function Mensagem({ mensagem }) {
  return (
    <p
      className={`configMensagem configMensagem--${mensagem.tipo}`}
      role="status"
      aria-live="polite"
    >
      {mensagem.texto}
    </p>
  );
}

/* ---------------------------- Conta (nome) ---------------------------- */

export function SecaoConta({ conta, aoAtualizarConta, aoExpirar }) {
  const { atualizar } = useSessao();
  const [mensagem, setMensagem] = useState(VAZIA);
  const [salvando, setSalvando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const nome = new FormData(evento.currentTarget).get("nome").trim();

    if (nome.length < 3) {
      return setMensagem({ tipo: "erro", texto: "Digite seu nome completo." });
    }
    if (nome === conta.nome) {
      return setMensagem({ tipo: "erro", texto: "Esse já é o nome da sua conta." });
    }

    setSalvando(true);
    setMensagem(VAZIA);
    try {
      const resposta = await alterarNome(nome);
      aoAtualizarConta(resposta.conta);
      await atualizar(); // atualiza o "Olá, Nome" do cabeçalho
      setMensagem({ tipo: "sucesso", texto: "Nome atualizado com sucesso." });
    } catch (e) {
      if (e instanceof NaoAutenticado) aoExpirar();
      else setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SecaoConfig id="conta" titulo="Conta" descricao="Informações básicas do seu perfil.">
      <form className="configForm" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="config-nome">Nome da conta</label>
          <input
            id="config-nome"
            name="nome"
            defaultValue={conta.nome}
            autoComplete="name"
            maxLength={100}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="config-email">E-mail</label>
          <input id="config-email" value={conta.email} readOnly disabled />
          <small>O e-mail não pode ser alterado por aqui.</small>
        </div>

        <Mensagem mensagem={mensagem} />

        <button
          type="submit"
          className="botaoConfig botaoConfig--principal"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar nome"}
        </button>
      </form>
    </SecaoConfig>
  );
}

/* ------------------------------ Segurança ----------------------------- */

export function SecaoSeguranca({ aoExpirar }) {
  const [mensagem, setMensagem] = useState(VAZIA);
  const [salvando, setSalvando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const dados = new FormData(form);
    const senhaAtual = dados.get("senhaAtual");
    const novaSenha = dados.get("novaSenha");
    const confirmar = dados.get("confirmarNovaSenha");

    if (!senhaAtual) {
      return setMensagem({ tipo: "erro", texto: "Digite sua senha atual." });
    }
    if (novaSenha.length < 6) {
      return setMensagem({
        tipo: "erro",
        texto: "A nova senha precisa ter no mínimo 6 caracteres.",
      });
    }
    if (novaSenha !== confirmar) {
      return setMensagem({ tipo: "erro", texto: "As senhas novas não são iguais." });
    }

    setSalvando(true);
    setMensagem(VAZIA);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      form.reset();
      setMensagem({ tipo: "sucesso", texto: "Senha alterada com sucesso." });
    } catch (e) {
      if (e instanceof NaoAutenticado) aoExpirar();
      else setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SecaoConfig id="seguranca" titulo="Segurança" descricao="Troque a senha da sua conta.">
      <form className="configForm" onSubmit={enviar} noValidate>
        <CampoSenha
          id="config-senha-atual"
          name="senhaAtual"
          rotulo="Senha atual"
          placeholder="Digite sua senha atual"
          autoComplete="current-password"
        />
        <CampoSenha
          id="config-nova-senha"
          name="novaSenha"
          rotulo="Nova senha"
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
        />
        <CampoSenha
          id="config-confirmar-senha"
          name="confirmarNovaSenha"
          rotulo="Confirme a nova senha"
          placeholder="Digite a nova senha novamente"
          autoComplete="new-password"
        />

        <Mensagem mensagem={mensagem} />

        <button
          type="submit"
          className="botaoConfig botaoConfig--principal"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Alterar senha"}
        </button>
      </form>
    </SecaoConfig>
  );
}

/* ---------------------------- Notificações ---------------------------- */

export function SecaoNotificacoes({ conta, aoAtualizarConta, aoExpirar }) {
  const [valores, setValores] = useState(conta.notificacoes);
  const [mensagem, setMensagem] = useState(VAZIA);
  const [salvando, setSalvando] = useState(false);

  function mudar(chave, marcado) {
    setValores((atual) => ({ ...atual, [chave]: marcado }));
    setMensagem(VAZIA);
  }

  async function salvar() {
    setSalvando(true);
    setMensagem(VAZIA);
    try {
      const resposta = await salvarNotificacoes(valores);
      aoAtualizarConta(resposta.conta);
      setMensagem({ tipo: "sucesso", texto: "Preferências salvas." });
    } catch (e) {
      if (e instanceof NaoAutenticado) aoExpirar();
      else setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SecaoConfig
      id="notificacoes"
      titulo="Notificações"
      descricao="Escolha o que você quer receber. Como o projeto é fictício, nenhum e-mail é enviado de verdade: as preferências só ficam salvas na sua conta."
    >
      <Interruptor
        id="notif-pedidos"
        rotulo="Atualizações dos pedidos"
        descricao="Avisos sobre confirmação e andamento das suas compras."
        marcado={valores.pedidos}
        aoMudar={(v) => mudar("pedidos", v)}
      />
      <Interruptor
        id="notif-promocoes"
        rotulo="Ofertas e promoções"
        descricao="Descontos e frete grátis em produtos esportivos."
        marcado={valores.promocoes}
        aoMudar={(v) => mudar("promocoes", v)}
      />
      <Interruptor
        id="notif-novidades"
        rotulo="Novidades da loja"
        descricao="Lançamentos e novas categorias."
        marcado={valores.novidades}
        aoMudar={(v) => mudar("novidades", v)}
      />

      <Mensagem mensagem={mensagem} />

      <button
        type="button"
        className="botaoConfig botaoConfig--principal"
        onClick={salvar}
        disabled={salvando}
      >
        {salvando ? "Salvando..." : "Salvar preferências"}
      </button>
    </SecaoConfig>
  );
}

/* ---------------------------- Excluir conta --------------------------- */

export function SecaoExcluirConta({ aoExpirar }) {
  const navegar = useNavigate();
  const { atualizar } = useSessao();
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState(VAZIA);
  const [excluindo, setExcluindo] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const senha = dados.get("senha");

    if (!senha) {
      return setMensagem({ tipo: "erro", texto: "Digite sua senha para confirmar." });
    }
    if (dados.get("entendo") !== "on") {
      return setMensagem({ tipo: "erro", texto: "Marque a confirmação para continuar." });
    }

    setExcluindo(true);
    setMensagem(VAZIA);
    try {
      await excluirConta(senha);
      await atualizar(); // o servidor já encerrou a sessão
      navegar("/");
    } catch (e) {
      if (e instanceof NaoAutenticado) aoExpirar();
      else setMensagem({ tipo: "erro", texto: e.message });
      setExcluindo(false);
    }
  }

  return (
    <SecaoConfig
      id="excluir"
      titulo="Excluir conta"
      descricao="Apaga sua conta de forma definitiva."
      perigo
    >
      {!aberto ? (
        <button
          type="button"
          className="botaoConfig botaoConfig--perigo"
          onClick={() => setAberto(true)}
        >
          Excluir minha conta
        </button>
      ) : (
        <form className="configForm" onSubmit={enviar} noValidate>
          <p className="configAviso">
            Esta ação <strong>não pode ser desfeita</strong>. Serão apagados seu
            perfil, seu carrinho e todo o seu histórico de compras.
          </p>

          <CampoSenha
            id="excluir-senha"
            name="senha"
            rotulo="Digite sua senha para confirmar"
            placeholder="Sua senha"
            autoComplete="current-password"
          />

          <label className="campo__check">
            <input type="checkbox" name="entendo" />
            <span>Entendo que não poderei recuperar minha conta nem minhas compras.</span>
          </label>

          <Mensagem mensagem={mensagem} />

          <div className="configAcoes">
            <button
              type="submit"
              className="botaoConfig botaoConfig--perigo-solido"
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir definitivamente"}
            </button>
            <button
              type="button"
              className="botaoConfig"
              onClick={() => {
                setAberto(false);
                setMensagem(VAZIA);
              }}
              disabled={excluindo}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </SecaoConfig>
  );
}