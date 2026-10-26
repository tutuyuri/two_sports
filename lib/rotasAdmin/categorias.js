import { sql } from "../db.js";
import { exigirAdmin } from "../admin.js";
import { gerarSlug } from "../categorias.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { esquemaCategoria, validar } from "../validacao.js";

const listar = () => sql`
  SELECT c.slug, c.nome, COUNT(p.id)::int AS total
  FROM categorias c
  LEFT JOIN produtos p ON p.categoria = c.slug
  GROUP BY c.slug, c.nome, c.ordem
  ORDER BY c.ordem, c.nome
`;

export default async function categoriasAdmin(req, res) {
  if (!metodos(req, res, ["GET", "POST", "DELETE"])) return;

  try {
    await exigirAdmin(req);
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "POST") {
      const { nome } = validar(esquemaCategoria, req.body);
      const slug = gerarSlug(nome);
      if (slug.length < 2) {
        throw new ErroHttp(400, "Use letras ou números no nome da categoria.");
      }

      // Entra antes de "Outros", depois das demais.
      const [criada] = await sql`
        INSERT INTO categorias (slug, nome, ordem)
        VALUES (
          ${slug}, ${nome},
          COALESCE((SELECT MAX(ordem) FROM categorias WHERE slug <> 'outros'), 0) + 10
        )
        ON CONFLICT DO NOTHING
        RETURNING slug
      `;
      if (!criada) throw new ErroHttp(409, "Já existe uma categoria com esse nome.");
    }

    if (req.method === "DELETE") {
      const slug = String(req.query.slug ?? "");

      if (slug === "outros") {
        throw new ErroHttp(400, 'A categoria "Outros" não pode ser excluída.');
      }

      const [uso] = await sql`SELECT COUNT(*)::int AS total FROM produtos WHERE categoria = ${slug}`;
      if (uso.total > 0) {
        throw new ErroHttp(400, "Mude os produtos desta categoria para outra antes de excluí-la.");
      }

      const [apagada] = await sql`DELETE FROM categorias WHERE slug = ${slug} RETURNING slug`;
      if (!apagada) throw new ErroHttp(404, "Categoria não encontrada.");
    }

    // GET, POST e DELETE respondem com a lista atualizada.
    res.status(200).json({ categorias: await listar() });
  } catch (e) {
    responderErro(res, e);
  }
}