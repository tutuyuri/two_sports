import "./configuracoes.css";

export function SecaoConfig({ id, titulo, descricao, perigo = false, children }) {
  return (
    <section
      id={id}
      className={`secaoConfig ${perigo ? "secaoConfig--perigo" : ""}`}
      aria-labelledby={`${id}-titulo`}
    >
      <header>
        <h2 id={`${id}-titulo`}>{titulo}</h2>
        {descricao && <p>{descricao}</p>}
      </header>
      {children}
    </section>
  );
}

export function GrupoOpcoes({ legenda, nome, valor, opcoes, aoMudar }) {
  return (
    <fieldset className="opcoes">
      <legend>{legenda}</legend>
      <div className="opcoes__lista">
        {opcoes.map((o) => (
          <label key={o.valor} className="opcao">
            <input
              type="radio"
              name={nome}
              value={o.valor}
              checked={valor === o.valor}
              onChange={() => aoMudar(o.valor)}
            />
            <span>{o.rotulo}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Interruptor({ id, rotulo, descricao, marcado, aoMudar }) {
  return (
    <label className="interruptor" htmlFor={id}>
      <span className="interruptor__texto">
        <strong>{rotulo}</strong>
        {descricao && <small>{descricao}</small>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={marcado}
        onChange={(e) => aoMudar(e.target.checked)}
      />
    </label>
  );
}