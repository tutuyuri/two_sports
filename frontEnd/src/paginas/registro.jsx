import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { CardAutenticacao, CampoSenha } from "../reutilizavel/autenticacao.jsx";
import { useNavigate } from "react-router-dom";
import { registrar } from "../services/auth.js";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Registro() {
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const navegar = useNavigate();
  
  async function enviar(evento) {
    evento.preventDefault();

    const dados = new FormData(evento.currentTarget);
    const nome = dados.get("nome").trim();
    const email = dados.get("email").trim();
    const senha = dados.get("senha");
    const confirmar = dados.get("confirmarSenha");
    const aceitou = dados.get("termos") === "on";

    if (nome.length < 3) {
      return setMensagem({ tipo: "erro", texto: "Digite seu nome completo." });
    }
    if (!EMAIL_VALIDO.test(email)) {
      return setMensagem({ tipo: "erro", texto: "Digite um e-mail válido." });
    }
    if (senha.length < 6) {
      return setMensagem({ tipo: "erro", texto: "A senha precisa ter no mínimo 6 caracteres." });
    }
    if (senha !== confirmar) {
      return setMensagem({ tipo: "erro", texto: "As senhas não são iguais." });
    }
    if (!aceitou) {
      return setMensagem({ tipo: "erro", texto: "Aceite os termos para continuar." });
    }

    try {
      await registrar({ nome, email, senha });
      navegar("/");
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    }
  }

  return (
    <CardAutenticacao
      icone={UserPlus}
      titulo="Crie sua conta"
      subtitulo="Cadastre-se para acompanhar seus pedidos."
      rodape={
        <>
          <span>Já possui uma conta?</span>
          <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="autenticacao__form" onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="nome">Nome completo</label>
          <input
            id="nome"
            name="nome"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            required
          />
        </div>

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
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
        />

        <CampoSenha
          id="confirmar-senha"
          name="confirmarSenha"
          rotulo="Confirme sua senha"
          placeholder="Digite a senha novamente"
          autoComplete="new-password"
        />

        <label className="campo__check">
          <input type="checkbox" name="termos" />
          <span>
            Li e aceito os <Link to="/termos">Termos de uso</Link> e a{" "}
            <Link to="/privacidade">Política de privacidade</Link>.
          </span>
        </label>

        <p
          className={`autenticacao__mensagem autenticacao__mensagem--${mensagem.tipo}`}
          role="status"
          aria-live="polite"
        >
          {mensagem.texto}
        </p>

        <button type="submit" className="autenticacao__botao">
          <UserPlus size={18} /> Criar conta
        </button>
      </form>
    </CardAutenticacao>
  );
}