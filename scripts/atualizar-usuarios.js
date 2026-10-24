import { sql } from "../lib/db.js";

await sql`
  ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS preferencias JSONB NOT NULL DEFAULT '{}'::jsonb
`;

console.log("Coluna de preferências adicionada à tabela usuarios.");