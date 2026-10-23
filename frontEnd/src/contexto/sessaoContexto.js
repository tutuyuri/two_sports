import { createContext, useContext } from "react";

export const SessaoContexto = createContext(null);

export function useSessao() {
  const valor = useContext(SessaoContexto);
  if (!valor) {
    throw new Error("useSessao precisa ser usado dentro do SessaoProvider.");
  }
  return valor;
}