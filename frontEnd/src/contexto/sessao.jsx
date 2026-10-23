import { useCallback, useEffect, useMemo, useState } from "react";
import { SessaoContexto } from "./sessaoContexto.js";
import { sair as sairNoServidor, usuarioAtual } from "../services/auth.js";

export function SessaoProvider({ children }) {
  // undefined = ainda verificando | null = ninguém logado | objeto = logado
  const [usuario, setUsuario] = useState(undefined);

  const atualizar = useCallback(async () => {
    try {
      setUsuario(await usuarioAtual());
    } catch {
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    atualizar();
  }, [atualizar]);

  // Devolve true se saiu mesmo (cookie apagado no servidor).
  const sair = useCallback(async () => {
    try {
      await sairNoServidor();
      setUsuario(null);
      return true;
    } catch {
      return false;
    }
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando: usuario === undefined, atualizar, sair }),
    [usuario, atualizar, sair]
  );

  return <SessaoContexto.Provider value={valor}>{children}</SessaoContexto.Provider>;
}