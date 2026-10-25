import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, KeyRound } from "lucide-react";
import { CardAutenticacao, CampoSenha } from "../reutilizavel/autenticacao.jsx";
import { redefinirSenha } from "../services/auth.js";

export function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const novaSenha = dados.get("novaSenha");
    const confirmar = dados.get("confirmarNovaSenha");

    if (novaSenha.length < 6) {
      return setMensagem({
        tipo: "erro",
        texto: "A nova senha precisa ter no mínimo 6 caracteres.",
      });
    }
    if (novaSenha !== confirmar) {
      return setMensagem({ tipo: "erro", texto: "As senhas não são iguais." });
    }

    setEnviando(true);
    setMensagem({ tipo: "", texto: "" });
    try {
      await redefinirSenha(token, novaSenha);
      setConcluido(true);
    } catch (e) {
      setMensagem({ tipo: "erro", texto: e.message });
    } finally {
      setEnviando(false);
    }
  }

  if (!token) {
    return (
      <CardAutenticacao
        icone={KeyRound}
        titulo="Link inválido"
        subtitulo="Este link de redefinição está incompleto. Peça um novo."
        rodape={<Link to="/esqueci-senha">Pedir um novo link</Link>}
      />
    );
  }

  if (concluido) {
    return (
      <CardAutenticacao
        icone={CircleCheck}
        titulo="Senha alterada!"
        subtitulo="Agora você já pode entrar com a nova senha."
      >
        <Link to="/login" className="autenticacao__botao">
          Ir para o login
        </Link>
      </CardAutenticacao>
    );
  }

  return (
    <CardAutenticacao
      icone={KeyRound}
      titulo="Crie uma nova senha"
      subtitulo="Escolha uma senha com no mínimo 6 caracteres."
      rodape={<Link to="/login">Voltar para o login</Link>}
    >
      <form className="autenticacao__form" onSubmit={enviar} noValidate>
        <CampoSenha
          id="nova-senha"
          name="novaSenha"
          rotulo="Nova senha"
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
        />
        <CampoSenha
          id="confirmar-nova-senha"
          name="confirmarNovaSenha"
          rotulo="Confirme a nova senha"
          placeholder="Digite a senha novamente"
          autoComplete="new-password"
        />

        <p
          className={`autenticacao__mensagem autenticacao__mensagem--${mensagem.tipo}`}
          role="status"
          aria-live="polite"
        >
          {mensagem.texto}
        </p>

        <button type="submit" className="autenticacao__botao" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </CardAutenticacao>
  );
}