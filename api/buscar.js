import { sql } from "../lib/db.js";
import { metodos, responderErro } from "../lib/http.js";
import { esquemaBusca, validar } from "../lib/validacao.js";
import {
  CATEGORIAS,
  SINONIMOS,
  categoriasDoTermo,
  normalizar,
} from "../lib/categorias.js";

// Valores fixos (vêm do enum validado), por isso é seguro montar o ORDER BY.
const ORDENS = {
  relevancia: "vendidos DESC, nota DESC, id",
  "menor-preco": "preco ASC, id",
  "maior-preco": "preco DESC, id",
  avaliados: "nota DESC, vendidos DESC, id",
  vendidos: "vendidos DESC, id",
};

const escaparLike = (texto) => texto.replace(/[\\%_]/g, "\\$&");

// Cada palavra digitada precisa casar com o nome do produto
// (em português ou na tradução) ou com uma categoria.
function condicoesDeTexto(texto, add) {
  let tokens = normalizar(texto)
    .split(/\s+/)
    .filter((t) => t.length >= 3)
    .slice(0, 5);
  if (tokens.length === 0) tokens = [normalizar(texto)];

  return tokens.map((token) => {
    const variantes = [token, SINONIMOS[token]].filter(Boolean);
    const partes = variantes.map(
      (v) => `titulo ILIKE ${add(`%${escaparLike(v)}%`)}`
    );

    const slugs = categoriasDoTermo(token);
    if (slugs.length) partes.push(`categoria IN (${slugs.map((s) => add(s)).join(", ")})`);

    return `(${partes.join(" OR ")})`;
  });
}

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  try {
    const { q, categoria, precoMax, freteGratis, ordem } = validar(
      esquemaBusca,
      req.query
    );

    const params = [];
    const add = (valor) => {
      params.push(valor);
      return `$${params.length}`;
    };

    const condicoes = [];
    if (q) condicoes.push(...condicoesDeTexto(q, add));
    if (categoria) condicoes.push(`categoria = ${add(categoria)}`);
    if (precoMax) condicoes.push(`preco <= ${add(precoMax)}`);
    if (freteGratis === "1") condicoes.push("frete_gratis");

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

    const [linhas, contagens] = await Promise.all([
      sql.query(
        `SELECT id, titulo, imagem, preco, nota, vendidos,
                frete_gratis AS "freteGratis"
        FROM produtos
        ${where}
        ORDER BY ${ORDENS[ordem]}
        LIMIT 60`,
        params
      ),
      sql`SELECT categoria, COUNT(*)::int AS total FROM produtos GROUP BY categoria`,
    ]);

    const produtos = linhas.map((p) => ({
      ...p,
      preco: Number(p.preco),
      nota: Number(p.nota),
    }));

    const categorias = CATEGORIAS.map((c) => ({
      slug: c.slug,
      nome: c.nome,
      total: contagens.find((x) => x.categoria === c.slug)?.total ?? 0,
    })).filter((c) => c.total > 0);

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ produtos, total: produtos.length, categorias });
  } catch (e) {
    responderErro(res, e);
  }
}