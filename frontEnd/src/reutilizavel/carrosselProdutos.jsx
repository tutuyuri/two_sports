import { useEffect, useState } from "react";
import { Carrossel } from "./carrossel.jsx";
import { CardProduto } from "./cardProduto.jsx";
import { getProdutos } from "../services/produtos.js";

const FILTROS = [
  { id: "todos", rotulo: "Todos" },
  { id: "menor-preco", rotulo: "Menor preço" },
  { id: "avaliados", rotulo: "Melhores avaliados" },
  { id: "vendidos", rotulo: "Mais vendidos" },
  { id: "frete-gratis", rotulo: "Frete grátis" },
];

export function CarrosselProdutos({FILTRO}) {
  const filtro = FILTRO;
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");

    getProdutos({ filtro })
      .then((lista) => {
        if (!cancelado) setProdutos(lista);
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filtro]);

  return (
    <>

      {carregando && <p>Carregando produtos...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && produtos.length === 0 && (
        <p>Nenhum produto encontrado para esse filtro.</p>
      )}

      {!carregando && !erro && produtos.length > 0 && (
        <Carrossel
          key={filtro}
          itens={produtos.map((p) => (
            <CardProduto key={p.id} produto={p} />
          ))}
          ariaLabel="Produtos em destaque"
          larguraMinima={220}
        />
      )}
    </>
  );
}