import { sql } from "../lib/db.js";

// Liga a avaliação a uma conta. As avaliações de exemplo ficam sem conta.
await sql`
  ALTER TABLE avaliacoes
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE
`;
await sql`ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ`;

// Cada cliente avalia cada produto uma única vez (depois, só edita).
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_unica
  ON avaliacoes (produto_id, usuario_id)
  WHERE usuario_id IS NOT NULL
`;

console.log("Tabela de avaliações pronta para receber avaliações dos clientes.");