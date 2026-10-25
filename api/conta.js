import { sql } from "../lib/db.js";
import { conferirSenha, gerarHash, usuarioLogado } from "../lib/auth.js";
import { ErroHttp, metodos, responderErro } from "../lib/http.js";
import {
  esquemaNome,
  esquemaNotificacoes,
  esquemaSenha,
  validar,
} from "../lib/validacao.js";

const NOTIFICACOES_PADRAO = { pedidos: true, promocoes: false, novidades: false };

function montarConta(u) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    temSenha: u.temSenha,
    notificacoes: { ...NOTIFICACOES_PADRAO, ...(u.preferencias?.notificacoes ?? {}) },
  };
}

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET", "PATCH"])) return;

  try {
    const sessao = await usuarioLogado(req);
    if (!sessao) throw new ErroHttp(401, "Faça login para continuar.");

    res.setHeader("Cache-Control", "no-store");

    if (req.method === "GET") {
      const [u] = await sql`
        SELECT id, nome, email, preferencias, (senha_hash IS NOT NULL) AS "temSenha"
        FROM usuarios WHERE id = ${sessao.id}
      `;
      if (!u) throw new ErroHttp(401, "Você não está logado.");
      return res.status(200).json({ conta: montarConta(u) });
    }

    // PATCH: o campo "acao" diz o que alterar.
    const acao = req.body?.acao;

    if (acao === "nome") {
      const { nome } = validar(esquemaNome, req.body);
      const [u] = await sql`
        UPDATE usuarios SET nome = ${nome}
        WHERE id = ${sessao.id}
        RETURNING id, nome, email, preferencias, (senha_hash IS NOT NULL) AS "temSenha"
      `;
      if (!u) throw new ErroHttp(401, "Você não está logado.");
      return res.status(200).json({ conta: montarConta(u) });
    }

    if (acao === "senha") {
      const { senhaAtual, novaSenha } = validar(esquemaSenha, req.body);

      const [u] = await sql`SELECT senha_hash FROM usuarios WHERE id = ${sessao.id}`;
      if (!u) throw new ErroHttp(401, "Você não está logado.");

      // Conta com senha: confere a atual. Conta só do Google: está criando a primeira.
      // Atenção: 400 e não 401, senão o site entenderia como "sessão expirada".
      if (u.senha_hash) {
        if (!senhaAtual) throw new ErroHttp(400, "Digite sua senha atual.");
        if (!(await conferirSenha(senhaAtual, u.senha_hash))) {
          throw new ErroHttp(400, "A senha atual está incorreta.");
        }
        if (senhaAtual === novaSenha) {
          throw new ErroHttp(400, "A nova senha precisa ser diferente da atual.");
        }
      }

      const hash = await gerarHash(novaSenha);
      await sql`UPDATE usuarios SET senha_hash = ${hash} WHERE id = ${sessao.id}`;
      return res.status(200).json({ ok: true });
    }

    if (acao === "notificacoes") {
      const notificacoes = validar(esquemaNotificacoes, req.body.notificacoes);
      const [u] = await sql`
        UPDATE usuarios
        SET preferencias = jsonb_set(
          preferencias, '{notificacoes}', ${JSON.stringify(notificacoes)}::jsonb, true
        )
        WHERE id = ${sessao.id}
        RETURNING id, nome, email, preferencias, (senha_hash IS NOT NULL) AS "temSenha"
      `;
      if (!u) throw new ErroHttp(401, "Você não está logado.");
      return res.status(200).json({ conta: montarConta(u) });
    }

    throw new ErroHttp(400, "Ação inválida.");
  } catch (e) {
    responderErro(res, e);
  }
}