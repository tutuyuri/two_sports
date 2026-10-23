
import {
  PackageOpen,
  CreditCardCheck,
  BanknoteArrowDown,
  ShoppingBasket,
  Grid2X2,
} from 'lucide-react';

import { Direcionaveis } from '../reutilizavel/areas.jsx';
import { Carrossel } from '../reutilizavel/carrossel.jsx';
import { CarrosselProdutos } from '../reutilizavel/carrosselProdutos.jsx';
import "./inicial.css"



export function Inicio() {
  const direcionaveis = [
    <Direcionaveis
      titulo="Frete grátis"
      descricao="Benefício por ser sua primeira compra."
      textoBotao="Mostrar produtos"
      direcionamento="/produtos"
      icone={PackageOpen}
    />,
    <Direcionaveis
      titulo="Menos de R$100,00"
      descricao="Confira produtos com preços baixos."
      textoBotao="Mostrar produtos"
      direcionamento="/produtos"
      icone={BanknoteArrowDown}
    />,
    <Direcionaveis
      titulo="Mais vendidos"
      descricao="Explore os produtos que são tendência."
      textoBotao="Ir para mais vendidos"
      direcionamento="/produtos"
      icone={ShoppingBasket}
    />,
    <Direcionaveis
      titulo="Nossas categorias"
      descricao="Encontre garrafas, roupas, bolas e muito mais."
      textoBotao="Ir para categorias"
      direcionamento="/produtos"
      icone={Grid2X2}
    />,
  ];
    return (
    <>
      <div className="atalho">
        <h2>Acesso rápido</h2>
        <Carrossel
          itens={direcionaveis}
          ariaLabel="Benefícios e atalhos da loja"
          larguraMinima={250}
        />
      </div>

      <div className="atalho atalho--produtos">
        <h2>Todos</h2>
        <CarrosselProdutos FILTRO={"todos"} />
      </div>

      <div className="atalho atalho--produtos">
        <h2>Menor preço</h2>
        <CarrosselProdutos FILTRO={"menor-preco"} />
      </div>

      <div className="atalho atalho--produtos">
        <h2>Melhores avaliados</h2>
        <CarrosselProdutos FILTRO={"avaliados"} />
      </div>

      <div className="atalho atalho--produtos">
        <h2>Mais vendidos</h2>
        <CarrosselProdutos FILTRO={"vendidos"} />
      </div>

      <div className="atalho atalho--produtos">
        <h2>Frete grátis</h2>
        <CarrosselProdutos FILTRO={"frete-gratis"} />
      </div>

    </>
  )
}
