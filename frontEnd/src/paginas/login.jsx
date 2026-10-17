import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { CardAutenticacao, CampoSenha } from "../reutilizavel/autenticacao.jsx";
import { useNavigate } from "react-router-dom";
import { entrar } from "../services/auth.js";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const navegar = useNavigate()

  function enviar(evento) {
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

      try {
        await entrar({ email, senha });
        navegar("/");
      } catch (e) {
        setMensagem({ tipo: "erro", texto: e.message });
      }
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
          <Link to="/registro">Criar conta</Link>
        </>
      }
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

        <CampoSenha
          id="senha"
          name="senha"
          rotulo="Senha"
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />

        <p
          className={`autenticacao__mensagem autenticacao__mensagem--${mensagem.tipo}`}
          role="status"
          aria-live="polite"
        >
          {mensagem.texto}
        </p>

        <button type="submit" className="autenticacao__botao">
          <LogIn size={18} /> Entrar
        </button>
      </form>
    </CardAutenticacao>
  );
}