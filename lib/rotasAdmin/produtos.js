import { sql } from "../db.js";
import { exigirAdmin } from "../admin.js";
import { ErroHttp, metodos, responderErro } from "../http.js";
import { esquemaProdutoAdmin, validar } from "../validacao.js";

export default async function produtosAdmin(req, res) {
  if (!metodos(req, res, ["GET", "POST", "PATCH"])) return;

  try {
    await exigirAdmin(req);
    res.setHeader("Cache-Control", "no-store");

    if (req.method === "GET") {
      const linhas = await sql`
        SELECT p.id, p.titulo, p.categoria, c.nome AS "categoriaNome", p.imagem,
               p.preco, p.nota, p.vendidos, p.frete_gratis AS "freteGratis"
        FROM produtos p
        LEFT JOIN categorias c ON c.slug = p.categoria
        ORDER BY p.id DESC
        LIMIT 300
      `;
      return res.status(200).json({
        produtos: linhas.map((p) => ({ ...p, preco: Number(p.preco), nota: Number(p.nota) })),
      });
    }

    const dados = validar(esquemaProdutoAdmin, req.body);
    const preco = Math.round(dados.preco * 100) / 100;

    const [categoria] = await sql`SELECT slug FROM categorias WHERE slug = ${dados.categoria}`;
    if (!categoria) throw new ErroHttp(400, "Escolha uma categoria válida.");

    if (req.method === "POST") {
      const [produto] = await sql`
        INSERT INTO produtos (titulo, descricao, categoria, imagem, preco, frete_gratis)
        VALUES (${dados.titulo}, ${dados.descricao}, ${dados.categoria},
                ${dados.imagem}, ${preco}, ${dados.freteGratis})
        RETURNING id
      `;
      return res.status(201).json({ id: produto.id });
    }

    // PATCH
    const id = Number(req.query.id);
    if (!Number.isInteger(id) || id <= 0) throw new ErroHttp(400, "Produto inválido.");

    const [produto] = await sql`
      UPDATE produtos
      SET titulo = ${dados.titulo}, descricao = ${dados.descricao},
          categoria = ${dados.categoria}, imagem = ${dados.imagem},
          preco = ${preco}, frete_gratis = ${dados.freteGratis}
      WHERE id = ${id}
      RETURNING id
    `;
    if (!produto) throw new ErroHttp(404, "Produto não encontrado.");

    res.status(200).json({ id: produto.id });
  } catch (e) {
    responderErro(res, e);
  }
}