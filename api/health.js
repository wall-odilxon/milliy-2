// Vercel: GET /api/health — token ulanganini tekshirish uchun
import { telegramConfigured } from "../server/order.js";

export default function handler(_req, res) {
  res.status(200).json({ ok: true, telegram: telegramConfigured() });
}
