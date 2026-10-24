import "./documentoLegal.css";

// Cada seção: { id, titulo, paragrafos?, itens?, depois? }
// Os textos podem ser strings ou trechos de JSX (para links e negrito).
export function DocumentoLegal({ atualizadoEm, aviso, introducao, secoes }) {
  return (
    <div className="documento">
      <nav className="documento__indice" aria-label="Índice do documento">
        <h2>Neste documento</h2>
        <ol>
          {secoes.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.titulo}</a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="documento__texto">
        <p className="documento__data">Última atualização: {atualizadoEm}</p>

        {aviso && <div className="documento__aviso">{aviso}</div>}

        {introducao.map((texto, i) => (
          <p key={i}>{texto}</p>
        ))}

        {secoes.map((s, indice) => (
          <section
            key={s.id}
            id={s.id}
            className="documento__secao"
            aria-labelledby={`${s.id}-titulo`}
          >
            <h2 id={`${s.id}-titulo`}>
              {indice + 1}. {s.titulo}
            </h2>

            {s.paragrafos?.map((texto, i) => (
              <p key={i}>{texto}</p>
            ))}

            {s.itens && (
              <ul>
                {s.itens.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            {s.depois?.map((texto, i) => (
              <p key={i}>{texto}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}