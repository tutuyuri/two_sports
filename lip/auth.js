import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const NOME_COOKIE = "two_sports_sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

const segredo = () => new TextEncoder().encode(process.env.JWT_SECRET);

// Em produção/preview o cookie só trafega por HTTPS.
const sufixoSeguro = () =>
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development"
    ? "; Secure"
    : "";

export const gerarHash = (senha) => bcrypt.hash(senha, 10);
export const conferirSenha = (senha, hash) => bcrypt.compare(senha, hash);

export async function criarSessao(res, usuario) {
  const token = await new SignJWT({ email: usuario.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id))
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(segredo());

  res.setHeader(
    "Set-Cookie",
    `${NOME_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${DURACAO_SEGUNDOS}${sufixoSeguro()}`
  );
}

export function encerrarSessao(res) {
  res.setHeader(
    "Set-Cookie",
    `${NOME_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${sufixoSeguro()}`
  );
}

export async function usuarioLogado(req) {
  const cookies = (req.headers.cookie ?? "").split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${NOME_COOKIE}=`));
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(
      cookie.slice(NOME_COOKIE.length + 1),
      segredo()
    );
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null; // token inválido ou expirado
  }
}