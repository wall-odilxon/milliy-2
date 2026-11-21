// Vercel serverless funksiyasi: POST /api/order
import { processOrder } from "../server/order.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const r = await processOrder(req.body);
  res.status(r.status).json(r.body);
}
