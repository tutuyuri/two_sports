import { sql } from "../lib/db.js";

await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS admin BOOLEAN NOT NULL DEFAULT false`;

// Guarda configurações do site (aqui, as cores personalizadas).
await sql`
  CREATE TABLE IF NOT EXISTS configuracoes (
    chave         TEXT PRIMARY KEY,
    valor         JSONB NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

console.log("Banco atualizado para o painel de administração.");