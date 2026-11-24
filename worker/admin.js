// Admin panel backend (Cloudflare Worker + D1): kirish, mahsulotlar, rasmlar.
// Admin login/paroli kodda EMAS: Cloudflare Secrets ichida (ADMIN_USER, ADMIN_PASSWORD).

const enc = new TextEncoder();
const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256Hex = async (s) => hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s))));

// Parollarni vaqtga bog'liq bo'lmagan usulda solishtirish
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

export const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

const now = () => Math.floor(Date.now() / 1000);
const SESSION_SECONDS = 12 * 3600;
const MAX_ATTEMPTS = 5; // 15 daqiqada noto'g'ri urinishlar soni

const getCookie = (request, name) => {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
};
const cookieFlags = (url) => `HttpOnly; SameSite=Strict; Path=/${url.protocol === "https:" ? "; Secure" : ""}`;

async function isAdmin(request, env) {
  const token = getCookie(request, "admin_session");
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false;
  const row = await env.DB.prepare("SELECT 1 AS ok FROM sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(await sha256Hex(token), now()).first();
  return Boolean(row);
}

// ---------- Ommaviy (mijozlar uchun) ----------
const toApi = (r) => ({
  id: r.id,
  name: { uz: r.name_uz, ru: r.name_ru || r.name_uz, en: r.name_en || r.name_uz },
  desc: { uz: r.desc_uz || "", ru: r.desc_ru || r.desc_uz || "", en: r.desc_en || r.desc_uz || "" },
  price: r.price, old: r.old_price, image: r.image, active: Boolean(r.active),
});

export async function listPublicProducts(env) {
  if (!env.DB) return json(503, { error: "db_not_configured" });
  try {
    const { results } = await env.DB.prepare("SELECT * FROM products WHERE active = 1 ORDER BY id").all();
    return json(200, { products: results.map(toApi) }, { "cache-control": "public, max-age=15" });
  } catch {
    return json(503, { error: "db_not_ready" });
  }
}

// Buyurtma narxlarini bazadan olish (server/order.js shuni ishlatadi). Baza yo'q bo'lsa undefined.
export async function loadCatalog(env) {
  if (!env.DB) return undefined;
  try {
    const { results } = await env.DB.prepare("SELECT id, name_uz, price FROM products WHERE active = 1").all();
    return new Map(results.map((r) => [r.id, { name: r.name_uz, price: r.price }]));
  } catch {
    return undefined;
  }
}

export async function serveImage(env, pathname) {
  const id = Number(pathname.split("/").pop());
  if (!env.DB || !Number.isInteger(id)) return json(404, { error: "not_found" });
  const row = await env.DB.prepare("SELECT mime, data FROM images WHERE id = ?").bind(id).first();
  if (!row) return json(404, { error: "not_found" });
  const bin = atob(row.data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, { headers: { "content-type": row.mime, "cache-control": "public, max-age=31536000, immutable" } });
}

// ---------- Admin ----------
async function login(request, env, url) {
  if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) return json(503, { error: "admin_not_configured" });
  if (String(env.ADMIN_PASSWORD).length < 8) return json(503, { error: "admin_password_too_short" });
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const t = now();
  await env.DB.prepare("DELETE FROM login_attempts WHERE at < ?").bind(t - 900).run();
  const c = await env.DB.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ?").bind(ip).first();
  if (c.n >= MAX_ATTEMPTS) return json(429, { error: "too_many_attempts" });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }
  const okUser = await safeEqual(String(body.user ?? ""), String(env.ADMIN_USER));
  const okPass = await safeEqual(String(body.password ?? ""), String(env.ADMIN_PASSWORD));
  if (!(okUser && okPass)) {
    await env.DB.prepare("INSERT INTO login_attempts (ip, at) VALUES (?, ?)").bind(ip, t).run();
    return json(401, { error: "bad_credentials" });
  }
  await env.DB.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(ip).run();
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(t).run();
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare("INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)").bind(await sha256Hex(token), t + SESSION_SECONDS).run();
  return json(200, { ok: true }, { "set-cookie": `admin_session=${token}; Max-Age=${SESSION_SECONDS}; ${cookieFlags(url)}` });
}

const str = (v, max) => String(v ?? "").trim().slice(0, max);

function parseProduct(b) {
  const name_uz = str(b?.name?.uz, 120);
  if (!name_uz) return { error: "name_required" };
  const price = Number(b?.price);
  if (!Number.isInteger(price) || price < 1 || price > 1_000_000_000) return { error: "bad_price" };
  const hasOld = b?.old !== null && b?.old !== undefined && b?.old !== "";
  const old = hasOld ? Number(b.old) : null;
  if (hasOld && (!Number.isInteger(old) || old <= price || old > 1_000_000_000)) return { error: "bad_old_price" };
  const image = str(b?.image, 300);
  if (image && !/^(\/api\/img\/\d+|\/products\/[\w.-]+|https:\/\/[^\s"'<>]+)$/.test(image)) return { error: "bad_image" };
  return {
    v: {
      name_uz, name_ru: str(b?.name?.ru, 120) || null, name_en: str(b?.name?.en, 120) || null,
      desc_uz: str(b?.desc?.uz, 600) || null, desc_ru: str(b?.desc?.ru, 600) || null, desc_en: str(b?.desc?.en, 600) || null,
      price, old, image: image || null, active: b?.active === false ? 0 : 1,
    },
  };
}

async function dropImage(env, image) {
  const m = /^\/api\/img\/(\d+)$/.exec(image || "");
  if (m) await env.DB.prepare("DELETE FROM images WHERE id = ?").bind(Number(m[1])).run();
}

async function uploadImage(request, env) {
  let b;
  try { b = await request.json(); } catch { return json(400, { error: "bad_json" }); }
  const mime = String(b?.mime ?? "");
  const data = String(b?.data ?? "");
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return json(400, { error: "bad_image_type" });
  if (!data || data.length > 700_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) return json(400, { error: "bad_image_data" });
  const r = await env.DB.prepare("INSERT INTO images (mime, data) VALUES (?, ?)").bind(mime, data).run();
  return json(200, { url: `/api/img/${r.meta.last_row_id}` });
}

export async function handleAdmin(request, env, url) {
  if (!env.DB) return json(503, { error: "db_not_configured" });
  const path = url.pathname.replace(/^\/api\/admin/, "");
  const method = request.method;

  // O'zgartiruvchi so'rovlar faqat shu saytning o'zidan kelsin (CSRF himoyasi)
  if (method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== url.host) return json(403, { error: "bad_origin" });
  }

  if (path === "/login" && method === "POST") return login(request, env, url);
  if (path === "/logout" && method === "POST") {
    const token = getCookie(request, "admin_session");
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
    return json(200, { ok: true }, { "set-cookie": `admin_session=; Max-Age=0; ${cookieFlags(url)}` });
  }

  if (!(await isAdmin(request, env))) return json(401, { error: "unauthorized" });

  if (path === "/me" && method === "GET") return json(200, { ok: true });
  if (path === "/images" && method === "POST") return uploadImage(request, env);

  if (path === "/products" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY id").all();
    return json(200, { products: results.map(toApi) });
  }
  if (path === "/products" && method === "POST") {
    let b;
    try { b = await request.json(); } catch { return json(400, { error: "bad_json" }); }
    const p = parseProduct(b);
    if (p.error) return json(400, { error: p.error });
    const v = p.v;
    const r = await env.DB.prepare(
      "INSERT INTO products (name_uz, name_ru, name_en, desc_uz, desc_ru, desc_en, price, old_price, image, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(v.name_uz, v.name_ru, v.name_en, v.desc_uz, v.desc_ru, v.desc_en, v.price, v.old, v.image, v.active).run();
    return json(200, { ok: true, id: r.meta.last_row_id });
  }

  const m = /^\/products\/(\d+)$/.exec(path);
  if (m) {
    const id = Number(m[1]);
    const cur = await env.DB.prepare("SELECT image FROM products WHERE id = ?").bind(id).first();
    if (!cur) return json(404, { error: "not_found" });
    if (method === "PUT") {
      let b;
      try { b = await request.json(); } catch { return json(400, { error: "bad_json" }); }
      const p = parseProduct(b);
      if (p.error) return json(400, { error: p.error });
      const v = p.v;
      await env.DB.prepare(
        "UPDATE products SET name_uz=?, name_ru=?, name_en=?, desc_uz=?, desc_ru=?, desc_en=?, price=?, old_price=?, image=?, active=? WHERE id=?"
      ).bind(v.name_uz, v.name_ru, v.name_en, v.desc_uz, v.desc_ru, v.desc_en, v.price, v.old, v.image, v.active, id).run();
      if (cur.image && cur.image !== v.image) await dropImage(env, cur.image);
      return json(200, { ok: true });
    }
    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
      await dropImage(env, cur.image);
      return json(200, { ok: true });
    }
  }
  return json(404, { error: "not_found" });
}
