import { metodos, responderErro } from "../lib/http.js";
import { lerTema } from "../lib/tema.js";

export default async function handler(req, res) {
  if (!metodos(req, res, ["GET"])) return;

  try {
    const tema = await lerTema();
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    res.status(200).json({ tema });
  } catch (e) {
    responderErro(res, e);
  }
}