// Cloudflare Worker: /api/* so'rovlarini shu kod qabul qiladi, qolgan hamma narsa (sayt) dist/ dan beriladi.
import { processOrder, telegramConfigured } from "../server/order.js";
import { handleAdmin, json, listPublicProducts, loadCatalog, serveImage } from "./admin.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    try {
      if (pathname === "/api/health") {
        return json(200, { ok: true, telegram: telegramConfigured(env), db: Boolean(env.DB), admin: Boolean(env.ADMIN_USER && env.ADMIN_PASSWORD) });
      }
      if (pathname === "/api/products" && request.method === "GET") return await listPublicProducts(env);
      if (pathname.startsWith("/api/img/") && request.method === "GET") return await serveImage(env, pathname);
      if (pathname.startsWith("/api/admin/")) return await handleAdmin(request, env, url);

      if (pathname === "/api/order") {
        if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
        let body;
        try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
        // Narxlar bazadan olinadi (admin o'zgartirgan bo'lishi mumkin); baza yo'q bo'lsa katalog fayli ishlatiladi
        const r = await processOrder(body, env, await loadCatalog(env));
        return json(r.status, r.body);
      }
      return json(404, { error: "not_found" });
    } catch (e) {
      console.error("Worker xatosi:", e.message);
      return json(500, { error: "server_error" });
    }
  },
};
