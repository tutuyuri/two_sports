import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./autenticacao.css";

export function CardAutenticacao({ icone: Icone, titulo, subtitulo, children, rodape }) {
  return (
    <section className="autenticacao" aria-labelledby="autenticacao-titulo">
      <div className="autenticacao__cabecalho">
        {Icone && <Icone className="autenticacao__icone" size={56} />}
        <h2 id="autenticacao-titulo">{titulo}</h2>
        <p>{subtitulo}</p>
      </div>

      {children}

      {rodape && <div className="autenticacao__rodape">{rodape}</div>}
    </section>
  );
}

export function CampoSenha({ id, name, rotulo, placeholder, autoComplete }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <div className="campo__senha">
        <input
          id={id}
          name={name}
          type={visivel ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="campo__alternar"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
        >
          {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}