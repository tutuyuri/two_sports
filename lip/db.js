import { neon } from "@neondatabase/serverless";

// Conexão por HTTP: ideal para funções serverless (sem pool para gerenciar).
export const sql = neon(process.env.DATABASE_URL);