import { sql } from "../db.js";
import { exigirAdmin } from "../admin.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { COR_HEX, VARIAVEIS_TEMA, lerTema } from "../tema.js";
import { esquemaTema, validar } from "../validacao.js";

export default async function temaAdmin(req, res) {
  if (!metodos(req, res, ["PUT"])) return;

  try {
    await exigirAdmin(req);
    const { modo, cores } = validar(esquemaTema, req.body);

    const limpas = {};
    for (const [nome, valor] of Object.entries(cores)) {
      if (!VARIAVEIS_TEMA.includes(nome) || !COR_HEX.test(valor)) {
        throw new ErroHttp(400, "Cor inválida.");
      }
      limpas[nome] = valor.toLowerCase();
    }

    // Troca só o modo editado. Sem nenhuma cor = volta ao padrão daquele modo.
    const tema = await lerTema();
    if (Object.keys(limpas).length === 0) delete tema[modo];
    else tema[modo] = limpas;

    await sql`
      INSERT INTO configuracoes (chave, valor, atualizado_em)
      VALUES ('tema', ${JSON.stringify(tema)}::jsonb, now())
      ON CONFLICT (chave)
      DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now()
    `;

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ tema });
  } catch (e) {
    responderErro(res, e);
  }
}