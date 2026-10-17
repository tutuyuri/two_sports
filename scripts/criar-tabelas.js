import { sql } from "../lib/db.js";

await sql`
  CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nome        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    senha_hash  TEXT NOT NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS produtos (
    id           SERIAL PRIMARY KEY,
    titulo       TEXT NOT NULL,
    descricao    TEXT,
    categoria    TEXT NOT NULL,
    imagem       TEXT NOT NULL,
    preco        NUMERIC(10,2) NOT NULL,
    nota         NUMERIC(3,2) NOT NULL DEFAULT 0,
    vendidos     INTEGER NOT NULL DEFAULT 0,
    frete_gratis BOOLEAN NOT NULL DEFAULT false,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS idx_produtos_preco ON produtos (preco)`;
await sql`CREATE INDEX IF NOT EXISTS idx_produtos_nota ON produtos (nota DESC)`;
await sql`CREATE INDEX IF NOT EXISTS idx_produtos_vendidos ON produtos (vendidos DESC)`;

console.log("Tabelas criadas com sucesso.");