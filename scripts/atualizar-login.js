import { sql } from "../lib/db.js";

// Contas criadas pelo Google não têm senha.
await sql`ALTER TABLE usuarios ALTER COLUMN senha_hash DROP NOT NULL`;
await sql`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`;

// Guarda só o hash do código enviado por e-mail, nunca o código em si.
await sql`
  CREATE TABLE IF NOT EXISTS redefinicoes_senha (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expira_em   TIMESTAMPTZ NOT NULL,
    usado_em    TIMESTAMPTZ,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_redefinicoes_usuario
  ON redefinicoes_senha (usuario_id, criado_em DESC)
`;

console.log("Banco atualizado para redefinição de senha e login com o Google.");