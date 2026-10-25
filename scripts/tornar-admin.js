import { sql } from "../lib/db.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Use: npm run admin:criar -- seu@email.com");
  process.exit(1);
}

const [usuario] = await sql`
  UPDATE usuarios SET admin = true WHERE email = ${email} RETURNING nome, email
`;

if (!usuario) {
  console.error("Nenhuma conta encontrada com esse e-mail. Cadastre-se primeiro no site.");
  process.exit(1);
}

console.log(`${usuario.nome} (${usuario.email}) agora é administrador.`);