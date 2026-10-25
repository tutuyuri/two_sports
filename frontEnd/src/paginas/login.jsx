import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { BotaoGoogle, CardAutenticacao, CampoSenha } from "../reutilizavel/autenticacao.jsx";
import { entrar } from "../services/auth.js";
import { useSessao } from "../contexto/sessaoContexto.js";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROS_GOOGLE = {
  google: "Não foi possível entrar com o Google. Tente novamente.",
  "google-cancelado": "O login com o Google foi cancelado.",
  "google-email": "Sua conta Google não tem um e-mail verificado.",
  "google-config": "O login com o Google ainda não está configurado neste site.",
};

export function Login() {
  const [params] = useSearchParams();
  const erroDaUrl = ERROS_GOOGLE[params.get("erro")] ?? "";

  const [mensagem, setMensagem] = useState({
    tipo: erroDaUrl ? "erro" : "",
    texto: erroDaUrl,
  });
  const [enviando, setEnviando] = useState(false);
  const navegar = useNavigate();
  const local = useLocation();
  const { atualizar } = useSessao();
  const voltarPara = local.state?.voltarPara ?? "/";

  async function enviar(evento) {
    evento.preventDefault();

    const dados = new FormData(evento.currentTarget);
    const email = dados.get("email").trim();
    const senha = dados.get("senha");

    if (!EMAIL_VALIDO.test(email)) {
      return setMensagem({ tipo: "erro", texto: "Digite um e-mail válido." });
    }
    if (senha.length < 6) {
      return setMensagem({ tipo: "erro", texto: "A senha precisa ter no mínimo 6 caracteres." });
    }

    setEnviando(true);
    try {
      await entrar({ email, senha });
      await atualizar();
      navegar(voltarPara);
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
      setEnviando(false);
    }
  }

  return (
    <CardAutenticacao
      icone={LogIn}
      titulo="Entre na sua conta"
      subtitulo="Acompanhe seus pedidos e finalize suas compras."
      rodape={
        <>
          <span>Ainda não tem conta?</span>
          <Link to="/registro" state={local.state}>Criar conta</Link>
        </>
      }
    >
      {local.state?.voltarPara && (
        <p className="autenticacao__mensagem">Faça login para continuar sua compra.</p>
      )}

      <BotaoGoogle voltarPara={voltarPara} />

      <div className="autenticacao__divisor">
        <span>ou entre com seu e-mail</span>
      </div>

      <form className="autenticacao__form" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            required
          />
        </div>

        <CampoSenha
          id="senha"
          name="senha"
          rotulo="Senha"
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />

        <Link to="/esqueci-senha" className="autenticacao__ajuda">
          Esqueceu a senha?
        </Link>

        <p
          className={`autenticacao__mensagem autenticacao__mensagem--${mensagem.tipo}`}
          role="status"
          aria-live="polite"
        >
          {mensagem.texto}
        </p>

        <button type="submit" className="autenticacao__botao" disabled={enviando}>
          <LogIn size={18} /> Entrar
        </button>
      </form>
    </CardAutenticacao>
  );
}