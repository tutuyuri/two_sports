import { Link } from "react-router-dom";
import './areas.css'

export function Direcionaveis({
  titulo,
  descricao,
  direcionamento,
  textoBotao,
  icone: Icone,
}) {

  return (
    <Link
      to={direcionamento}
      className="direcionaveis"
    >
      <h2>{titulo}</h2>

      {Icone && <Icone className="icone" size={90}/>}

      <p>{descricao}</p>

      <span className="botaoDirecional">
        {textoBotao}
      </span>
    </Link>
  );
}
