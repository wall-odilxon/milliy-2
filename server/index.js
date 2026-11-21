// Lokal backend (npm run dev / npm start). Vercel'da buning o'rniga api/ papkasi ishlaydi.
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processOrder, telegramConfigured } from "./order.js";

const PORT = process.env.PORT || 3001;
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const app = express();
app.use(express.json({ limit: "20kb" }));

// Oddiy himoya: bitta IP'dan daqiqasiga 10 ta buyurtma
const hits = new Map();
setInterval(() => hits.clear(), 10 * 60_000).unref();
function rateLimit(req, res, next) {
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= 10) return res.status(429).json({ error: "too_many_requests" });
  list.push(now);
  hits.set(req.ip, list);
  next();
}

app.get("/api/health", (_req, res) => res.json({ ok: true, telegram: telegramConfigured() }));
app.post("/api/order", rateLimit, async (req, res) => {
  const r = await processOrder(req.body);
  res.status(r.status).json(r.body);
});
app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
  if (!telegramConfigured()) console.warn("DIQQAT: .env da TG_BOT_TOKEN va TG_CHAT_ID yozilmagan. Buyurtmalar Telegramga ketmaydi.");
});
