import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ArrowBigLeft,
  ArrowBigRight,
  Heading1,
} from 'lucide-react';

import './carrossel.css';

export function Carrossel({
  itens = [],
  larguraMinima = 190,
  espacamento = 16,
  ariaLabel = 'Conteúdo do carrossel',
  className = '',
  titulo = ''
}) {
  const listaRef = useRef(null);

  const [temAnterior, setTemAnterior] = useState(false);
  const [temProximo, setTemProximo] = useState(false);

  const atualizarCarrossel = useCallback(() => {
    const lista = listaRef.current;

    if (!lista) return;

    if (itens.length === 0) {
      setTemAnterior(false);
      setTemProximo(false);
      return;
    }

    const estilos = window.getComputedStyle(lista);

    const larguraDisponivel =
      lista.clientWidth -
      (parseFloat(estilos.paddingLeft) || 0) -
      (parseFloat(estilos.paddingRight) || 0);

    const gapAtual =
      parseFloat(estilos.columnGap) || espacamento;

    const quantidadePossivel = Math.max(
      1,
      Math.floor(
        (larguraDisponivel + gapAtual) /
        (larguraMinima + gapAtual)
      )
    );

    // Não calcula mais cards visíveis do que os existentes.
    const quantidadeVisivel = Math.min(
      itens.length,
      quantidadePossivel
    );

    const larguraCard = Math.max(
      larguraMinima,
      (
        larguraDisponivel -
        gapAtual * (quantidadeVisivel - 1)
      ) / quantidadeVisivel
    );

    lista.style.setProperty(
      '--largura-item-carrossel',
      `${larguraCard}px`
    );

    // Descobre se ainda existe conteúdo em cada direção.
    const limiteScroll =
      lista.scrollWidth - lista.clientWidth;

    setTemAnterior(lista.scrollLeft > 4);

    setTemProximo(
      limiteScroll - lista.scrollLeft > 1
    );
  }, [itens.length, larguraMinima, espacamento]);

  useEffect(() => {
    const lista = listaRef.current;

    if (!lista) return;

    atualizarCarrossel();

    lista.addEventListener(
      'scroll',
      atualizarCarrossel,
      { passive: true }
    );

    const observador = new ResizeObserver(
      atualizarCarrossel
    );

    observador.observe(lista);

    window.addEventListener(
      'resize',
      atualizarCarrossel
    );

    return () => {
      lista.removeEventListener(
        'scroll',
        atualizarCarrossel
      );

      observador.disconnect();

      window.removeEventListener(
        'resize',
        atualizarCarrossel
      );
    };
  }, [atualizarCarrossel]);

  function moverCarrossel(direcao) {
    const lista = listaRef.current;

    if (!lista) return;

    const primeiroItem = lista.querySelector(
      '.carrossel__item'
    );

    if (!primeiroItem) return;

    const estilos = window.getComputedStyle(lista);

    const gapAtual =
      parseFloat(estilos.columnGap) || espacamento;

    const distancia =
      primeiroItem.getBoundingClientRect().width +
      gapAtual;

    lista.scrollBy({
      left: direcao * distancia,
      behavior: 'smooth',
    });
  }

  if (itens.length === 0) {
    return null;
  }

  return (
    <div
      className={`carrossel ${className}`.trim()}
      style={{
        '--carrossel-gap': `${espacamento}px`,
        '--carrossel-largura-minima': `${larguraMinima}px`,
      }}
    >
      <button
        type="button"
        className={`carrossel__seta ${
          !temAnterior ? 'carrossel__seta--oculta' : ''
        }`}
        onClick={() => moverCarrossel(-1)}
        disabled={!temAnterior}
        aria-label="Ver itens anteriores"
        aria-hidden={!temAnterior}
        tabIndex={temAnterior ? 0 : -1}
      >
        <ArrowBigLeft size={30} />
      </button>

      <div
        className="carrossel__lista"
        ref={listaRef}
        aria-label={ariaLabel}
      >
        {itens.map((item, index) => (
          <div
            className="carrossel__item"
            key={index}
          >
            {item}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`carrossel__seta ${
          !temProximo ? 'carrossel__seta--oculta' : ''
        }`}
        onClick={() => moverCarrossel(1)}
        disabled={!temProximo}
        aria-label="Ver próximos itens"
        aria-hidden={!temProximo}
        tabIndex={temProximo ? 0 : -1}
      >
        <ArrowBigRight size={30} />
      </button>
    </div>
  );
}