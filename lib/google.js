import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import { origemDoSite } from "./url.js";

export const COOKIE_OAUTH = "two_sports_oauth";

const CHAVES_DO_GOOGLE = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

const segredo = () => new TextEncoder().encode(process.env.JWT_SECRET);

const sufixoSeguro = () =>
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development"
    ? "; Secure"
    : "";

export const urlDeRetorno = (req) => `${origemDoSite(req)}/api/auth/google-callback`;

// Só aceita caminhos do próprio site (evita redirecionar para sites externos).
export function caminhoSeguro(valor) {
  if (typeof valor !== "string") return "/";
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return "/";
  return valor;
}

// Cookie de 10 minutos com o "state" (proteção contra CSRF) e a página de volta.
export async function gravarCookieOauth(res, { state, voltarPara }) {
  const token = await new SignJWT({ state, voltarPara })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(segredo());

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_OAUTH}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${sufixoSeguro()}`
  );
}

// Acrescenta ao Set-Cookie já existente (por isso appendHeader).
export function limparCookieOauth(res) {
  res.appendHeader(
    "Set-Cookie",
    `${COOKIE_OAUTH}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${sufixoSeguro()}`
  );
}

export async function lerCookieOauth(req) {
  const cookies = (req.headers.cookie ?? "").split(";").map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_OAUTH}=`));
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie.slice(COOKIE_OAUTH.length + 1), segredo());
    return payload;
  } catch {
    return null;
  }
}

// Troca o código pelo token do Google e valida a assinatura, o emissor e o destinatário.
export async function perfilDoGoogle(code, redirectUri) {
  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!resposta.ok) {
    throw new Error(`O Google recusou o código de login (${resposta.status}).`);
  }

  const { id_token: idToken } = await resposta.json();

  const { payload } = await jwtVerify(idToken, CHAVES_DO_GOOGLE, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return payload; // sub, email, email_verified, name...
}