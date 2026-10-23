import { sql } from "../lib/db.js";

await sql`
  CREATE TABLE IF NOT EXISTS pedidos (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    subtotal    NUMERIC(10,2) NOT NULL,
    frete       NUMERIC(10,2) NOT NULL,
    total       NUMERIC(10,2) NOT NULL,
    endereco    JSONB NOT NULL,
    pagamento   TEXT NOT NULL CHECK (pagamento IN ('pix', 'cartao', 'boleto')),
    status      TEXT NOT NULL DEFAULT 'confirmado',
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS pedido_itens (
    id              SERIAL PRIMARY KEY,
    pedido_id       INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id      INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    titulo          TEXT NOT NULL,
    preco_unitario  NUMERIC(10,2) NOT NULL,
    quantidade      INTEGER NOT NULL CHECK (quantidade > 0)
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_pedidos_usuario
  ON pedidos (usuario_id, criado_em DESC)
`;

console.log("Tabelas de pedidos criadas com sucesso.");