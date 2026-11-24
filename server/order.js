// Buyurtmani tekshirish va Telegramga yuborish. Ham lokal server (server/index.js),
// Vercel funksiyasi (api/order.js) va Cloudflare Worker (worker/index.js) shu faylni ishlatadi.
import { CATALOG } from "../shared/catalog.js";

const clean = (v, max = 100) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const money = (n) => `${n.toLocaleString("ru-RU")} so'm`;

// env: Cloudflare Worker o'z `env` ob'ektini beradi; Vercel va lokal serverda process.env ishlatiladi
export const telegramConfigured = (env = process.env) => Boolean(env.TG_BOT_TOKEN && env.TG_CHAT_ID);

// Narx mijozdan OLINMAYDI, katalogdan olinadi.
function parseOrder(body, catalog) {
  const c = body?.customer ?? {};
  const customer = {
    type: c.type === "legal" ? "legal" : "person",
    firstName: clean(c.firstName, 50), lastName: clean(c.lastName, 50), phone: clean(c.phone, 25),
    region: clean(c.region, 50), district: clean(c.district, 60), address: clean(c.address, 150),
    orgName: clean(c.orgName, 100), bizType: c.bizType === "supermarket" ? "supermarket" : "shop",
  };
  const comment = clean(body?.comment, 300);
  if (!customer.firstName || !customer.lastName || !customer.region || !customer.district) return { error: "customer_incomplete" };
  if (customer.phone.replace(/\D/g, "").length < 9) return { error: "bad_phone" };
  if (customer.type === "legal" && !customer.orgName) return { error: "org_required" };
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 50) return { error: "bad_items" };
  const items = [];
  for (const it of body.items) {
    const id = Number(it?.id), qty = Number(it?.qty);
    const p = catalog ? catalog.get(id) : CATALOG[id]; // catalog: Map (Cloudflare bazasi), bo'lmasa fayldagi ro'yxat
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 1000) return { error: "bad_items" };
    items.push({ name: p.name, price: p.price, qty });
  }
  return { customer, comment, items };
}

function buildMessage(no, { customer: c, comment, items }) {
  const who = c.type === "legal" ? `Yuridik shaxs · ${c.bizType === "shop" ? "Do'kon" : "Supermarket"} · ${c.orgName}` : "Jismoniy shaxs";
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const lines = items.map((i, n) => `${n + 1}. ${i.name} — ${i.qty} dona × ${money(i.price)} = ${money(i.price * i.qty)}`);
  const date = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" });
  return {
    total,
    text: [
      `🛒 Yangi buyurtma №${String(no).slice(-6)}`, `🕒 ${date}`, "",
      `👤 ${c.firstName} ${c.lastName}`, `📞 ${c.phone}`, `🏢 ${who}`,
      `📍 ${[c.region, c.district, c.address].filter(Boolean).join(", ")}`,
      ...(comment ? [`💬 ${comment}`] : []), "",
      ...lines, "", `💰 Jami: ${money(total)}`,
    ].join("\n"),
  };
}

// Natija: { status, body } — HTTP javobi sifatida qaytariladi
export async function processOrder(rawBody, env = process.env, catalog) {
  const { TG_BOT_TOKEN, TG_CHAT_ID, TG_API_BASE = "https://api.telegram.org" } = env;
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return { status: 503, body: { error: "telegram_not_configured" } };
  let body = rawBody;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { return { status: 400, body: { error: "bad_json" } }; } }
  const parsed = parseOrder(body, catalog);
  if (parsed.error) return { status: 400, body: { error: parsed.error } };
  const no = Date.now();
  const { text, total } = buildMessage(no, parsed);
  try {
    const r = await fetch(`${TG_API_BASE}/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      console.error("Telegram xatosi:", r.status, d.description);
      return { status: 502, body: { error: "telegram_failed" } };
    }
    return { status: 200, body: { ok: true, no, total } };
  } catch (e) {
    console.error("Telegramga ulanib bo'lmadi:", e.message);
    return { status: 502, body: { error: "telegram_unreachable" } };
  }
}
