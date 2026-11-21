// Cloudflare Worker: /api/* so'rovlarini shu kod qabul qiladi, qolgan hamma narsa (sayt) dist/ dan beriladi.
import { processOrder, telegramConfigured } from "../server/order.js";

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/health") return json(200, { ok: true, telegram: telegramConfigured(env) });

    if (pathname === "/api/order") {
      if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
      let body;
      try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
      const r = await processOrder(body, env);
      return json(r.status, r.body);
    }

    return json(404, { error: "not_found" });
  },
};
