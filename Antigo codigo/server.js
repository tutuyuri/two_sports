import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();
const port = Number(process.env.PORT || 3000);
const baseUrl = (process.env.BASE_URL || `http://localhost:${port}`).replace(
  /\/$/,
  "",
);
const products = {
  "bola-futebol": { title: "Bola de Futebol", unit_price: 129.9, stock: 12 },
  "chuteira-nike": { title: "Chuteira Nike", unit_price: 349.9, stock: 6 },
  "tenis-corrida": { title: "Tênis de Corrida", unit_price: 299.9, stock: 8 },
  "luva-goleiro": { title: "Luva de Goleiro", unit_price: 159.9, stock: 5 },
  "camiseta-dry-fit": {
    title: "Camiseta Dry Fit",
    unit_price: 89.9,
    stock: 15,
  },
  "garrafa-termica": { title: "Garrafa Térmica", unit_price: 69.9, stock: 10 },
};

app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
  const origin = req.get("origin");
  const isLocalOrigin =
    origin === "null" ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
  if (!isLocalOrigin) return next();
  res.setHeader(
    "Access-Control-Allow-Origin",
    origin === "null" ? "*" : origin,
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});
app.use(express.static(".", { dotfiles: "deny" }));
app.post("/api/checkout", async (req, res) => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken || accessToken.includes("COLE_SEU")) {
    return res
      .status(503)
      .json({
        message:
          "Configure MERCADO_PAGO_ACCESS_TOKEN no arquivo .env e reinicie o servidor.",
      });
  }
  const cart = req.body?.items;
  if (!Array.isArray(cart) || !cart.length || cart.length > 20)
    return res.status(400).json({ message: "Carrinho inválido." });
  const items = [];
  let subtotal = 0;
  for (const item of cart) {
    const product = products[item?.id];
    const quantity = Number(item?.quantity);
    if (
      !product ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.stock
    )
      return res
        .status(400)
        .json({ message: "Um item do carrinho está inválido ou sem estoque." });
    const variations =
      item.variations && typeof item.variations === "object"
        ? Object.entries(item.variations)
            .map(([name, value]) => `${name}: ${String(value).slice(0, 40)}`)
            .join(" · ")
        : "";
    items.push({
      id: item.id,
      title: variations ? `${product.title} (${variations})` : product.title,
      quantity,
      unit_price: product.unit_price,
      currency_id: "BRL",
    });
    subtotal += product.unit_price * quantity;
  }
  if (subtotal < 250)
    items.push({
      id: "frete",
      title: "Frete",
      quantity: 1,
      unit_price: 19.9,
      currency_id: "BRL",
    });
  try {
    const preference = new Preference(new MercadoPagoConfig({ accessToken }));
    const result = await preference.create({
      body: {
        items,
        external_reference: `two-sports-${crypto.randomUUID()}`,
        back_urls: {
          success: `${baseUrl}/pagamento-sucesso.html`,
          failure: `${baseUrl}/pagamento-falhou.html`,
          pending: `${baseUrl}/pagamento-pendente.html`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercado-pago`,
        statement_descriptor: "TWO SPORTS",
      },
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });
    return res.json({ checkoutUrl: result.init_point });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return res
      .status(502)
      .json({
        message: "Não foi possível iniciar o checkout. Tente novamente.",
      });
  }
});
app.post("/api/webhooks/mercado-pago", (req, res) => {
  console.log("Notificação Mercado Pago:", req.body?.type || req.body?.topic);
  res.sendStatus(200);
});
app.listen(port, () => console.log(`Two Sports em ${baseUrl}`));
