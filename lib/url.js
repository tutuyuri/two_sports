// Endereço do próprio site, usado nos links de e-mail e no retorno do Google.
export function origemDoSite(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");

  const protocolo = req.headers["x-forwarded-proto"]?.split(",")[0] ?? "https";
  const host = req.headers["x-forwarded-host"]?.split(",")[0] ?? req.headers.host;
  return `${protocolo}://${host}`;
}