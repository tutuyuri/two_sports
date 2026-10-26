import { useId, useState } from "react";
import { Star } from "lucide-react";
import { NaoAutenticado } from "../services/carrinho.js";
import { salvarAvaliacao } from "../services/avaliacoes.js";
import "./configuracoes.css";
import "./formAvaliacao.css";

export function FormAvaliacao({
  produtoId,
  titulo,
  notaInicial,
  comentarioInicial,
  editando,
  aoSalvar,
  aoCancelar,
  aoExpirar,
}) {
  const idUnico = useId();
  const [nota, setNota] = useState(notaInicial);
  const [comentario, setComentario] = useState(comentarioInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(evento) {
    evento.preventDefault();

    if (nota < 1) return setErro("Escolha de 1 a 5 estrelas.");

    setSalvando(true);
    setErro("");
    try {
      const textoLimpo = comentario.trim();
      await salvarAvaliacao({ produtoId, nota, comentario: textoLimpo });
      aoSalvar(nota, textoLimpo);
    } catch (e) {
      if (e instanceof NaoAutenticado) aoExpirar();
      else setErro(e.message);
      setSalvando(false);
    }
  }

  return (
    <form className="formAvaliacao" onSubmit={enviar} noValidate>
      <fieldset className="estrelasInput">
        <legend>
          {editando ? "Edite a sua nota" : "Qual é a sua nota?"}
          <span className="estrelasInput__produto">{titulo}</span>
        </legend>

        <div className="estrelasInput__lista">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={`estrelasInput__estrela ${n <= nota ? "estrelasInput__estrela--ativa" : ""}`}
            >
              <input
                type="radio"
                name={`nota-${idUnico}`}
                value={n}
                checked={nota === n}
                onChange={() => {
                  setNota(n);
                  setErro("");
                }}
              />
              <Star size={30} fill={n <= nota ? "currentColor" : "none"} aria-hidden="true" />
              <span className="visualmenteOculto">
                {n} {n === 1 ? "estrela" : "estrelas"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="formAvaliacao__campo">
        <label htmlFor={`comentario-${idUnico}`}>Comentário (opcional)</label>
        <textarea
          id={`comentario-${idUnico}`}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={1000}
          placeholder="Conte o que você achou do produto"
        />
      </div>

      <p className="formAvaliacao__erro" role="status" aria-live="polite">
        {erro}
      </p>

      <div className="configAcoes">
        <button type="submit" className="botaoConfig botaoConfig--principal" disabled={salvando}>
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Publicar avaliação"}
        </button>
        <button type="button" className="botaoConfig" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}