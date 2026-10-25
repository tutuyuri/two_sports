import { createHash, randomBytes } from "node:crypto";
import { sql } from "../db.js";
import { enviarEmail } from "../email.js";
import { origemDoSite } from "../url.js";
import { metodos, responderErro } from "../http.js";
import { esquemaEsqueciSenha, validar } from "../validacao.js";

const escaparHtml = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export default async function esqueciSenha(req, res) {
  if (!metodos(req, res, ["POST"])) return;

  try {
    const { email } = validar(esquemaEsqueciSenha, req.body);

    const [usuario] = await sql`SELECT id, nome FROM usuarios WHERE email = ${email}`;

    if (usuario) {
      // No máximo um pedido por minuto para cada conta (evita spam de e-mails).
      const [recente] = await sql`
        SELECT id FROM redefinicoes_senha
        WHERE usuario_id = ${usuario.id} AND criado_em > now() - interval '60 seconds'
        LIMIT 1
      `;

      if (!recente) {
        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");

        // Só vale o link mais recente.
        await sql`DELETE FROM redefinicoes_senha WHERE usuario_id = ${usuario.id} AND usado_em IS NULL`;
        await sql`
          INSERT INTO redefinicoes_senha (usuario_id, token_hash, expira_em)
          VALUES (${usuario.id}, ${tokenHash}, now() + interval '60 minutes')
        `;

        const link = `${origemDoSite(req)}/redefinir-senha?token=${token}`;

        const resultado = await enviarEmail({
          para: email,
          assunto: "Redefinição de senha - Two Sports",
          html: `
            <p>Olá, ${escaparHtml(usuario.nome)}!</p>
            <p>Recebemos um pedido para redefinir a senha da sua conta no Two Sports (um projeto de demonstração).</p>
            <p><a href="${link}">Criar uma nova senha</a></p>
            <p>O link vale por 1 hora e só pode ser usado uma vez. Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.</p>
          `,
        });

        // Modo demonstração: sem e-mail configurado, o link aparece nos logs da Vercel.
        if (!resultado.enviado) {
          console.log(`[redefinição de senha] ${resultado.motivo}. Link para ${email}: ${link}`);
        }
      }
    }

    // Mesma resposta exista a conta ou não: não revela quem tem cadastro.
    res.status(200).json({ ok: true });
  } catch (e) {
    responderErro(res, e);
  }
}