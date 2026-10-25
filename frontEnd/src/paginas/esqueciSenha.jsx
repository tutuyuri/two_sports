import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, MailCheck } from "lucide-react";
import { CardAutenticacao } from "../reutilizavel/autenticacao.jsx";
import { pedirRedefinicao } from "../services/auth.js";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EsqueciSenha() {
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const email = new FormData(evento.currentTarget).get("email").trim();

    if (!EMAIL_VALIDO.test(email)) {
      return setMensagem({ tipo: "erro", texto: "Digite um e-mail válido." });
    }

    setEnviando(true);
    setMensagem({ tipo: "", texto: "" });
    try {
      await pedirRedefinicao(email);
      setEnviado(true);
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <CardAutenticacao
        icone={MailCheck}
        titulo="Confira seu e-mail"
        subtitulo="Se existir uma conta com esse endereço, enviamos um link para criar uma nova senha. Ele vale por 1 hora."
        rodape={<Link to="/login">Voltar para o login</Link>}
      >
        <p className="autenticacao__texto">
          Não chegou? Veja a caixa de spam ou tente de novo em alguns minutos.
        </p>
      </CardAutenticacao>
    );
  }

  return (
    <CardAutenticacao
      icone={KeyRound}
      titulo="Esqueceu a senha?"
      subtitulo="Digite seu e-mail e enviaremos um link para criar uma nova senha."
      rodape={<Link to="/login">Voltar para o login</Link>}
    >
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

        <p
          className={`autenticacao__mensagem autenticacao__mensagem--${mensagem.tipo}`}
          role="status"
          aria-live="polite"
        >
          {mensagem.texto}
        </p>

        <button type="submit" className="autenticacao__botao" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </CardAutenticacao>
  );
}