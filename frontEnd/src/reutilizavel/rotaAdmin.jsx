import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSessao } from "../contexto/sessaoContexto.js";
import "../paginas/compras.css";

export function RotaAdmin({ children }) {
  const { usuario } = useSessao();
  const navegar = useNavigate();
  const local = useLocation();

  useEffect(() => {
    if (usuario === null) {
      navegar("/login", { state: { voltarPara: local.pathname } });
    }
  }, [usuario, navegar, local.pathname]);

  if (!usuario) return <p>Carregando...</p>;

  if (!usuario.admin) {
    return (
      <div className="compras__vazio">
        <h2>Acesso restrito</h2>
        <p>Esta área é só para administradores.</p>
        <Link to="/" className="compras__botao compras__botao--principal">
          Voltar para o início
        </Link>
      </div>
    );
  }

  return children;
}