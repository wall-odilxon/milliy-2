// Admin panel: /admin manzilida ochiladi. Login va parol Cloudflare Secrets'da (ADMIN_USER, ADMIN_PASSWORD).
import { useEffect, useState } from "react";

const BTN = "rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40";
const BTN_LIGHT = "rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200";
const BTN_DANGER = "rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100";
const INPUT = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200";
const money = (n) => `${Number(n).toLocaleString("ru-RU")} so'm`;

const ERR = {
  bad_credentials: "Login yoki parol xato.",
  too_many_attempts: "Juda ko'p noto'g'ri urinish. 15 daqiqadan keyin qayta urinib ko'ring.",
  admin_not_configured: "Admin login/paroli hali kiritilmagan. Cloudflare'da ADMIN_USER va ADMIN_PASSWORD ni kiriting.",
  admin_password_too_short: "ADMIN_PASSWORD kamida 8 belgidan iborat bo'lishi kerak.",
  unauthorized: "Sessiya tugadi, qayta kiring.",
  name_required: "Mahsulot nomini (o'zbekcha) kiriting.",
  bad_price: "Narx noto'g'ri: 0 dan katta butun son kiriting.",
  bad_old_price: "Eski narx hozirgi narxdan katta bo'lishi kerak.",
  bad_image: "Rasm havolasi noto'g'ri (https:// bilan boshlansin).",
  bad_image_type: "Faqat JPG, PNG yoki WEBP rasm yuklang.",
  bad_image_data: "Rasm juda katta yoki buzilgan.",
};
const errText = (r) => ERR[r?.data?.error] || `Xatolik (${r?.status ?? "net"}). Qayta urinib ko'ring.`;

async function api(path, { method = "GET", body } = {}) {
  try {
    const r = await fetch(`/api/admin${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await r.json(); } catch { /* javob JSON emas */ }
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: "net", data: null };
  }
}

// Rasmni brauzerda kichraytirib (700px, JPEG), base64 qilib qaytaradi
function resizeToJpegBase64(file, max = 700) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

function Shell({ children, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between bg-gradient-to-br from-red-950 via-red-800 to-red-600 px-4 py-3 text-white shadow-lg">
        <b className="text-lg">Admin panel</b>
        <div className="flex items-center gap-3 text-sm">
          <a href="/" className="underline decoration-white/50">Saytga qaytish</a>
          {onLogout && <button onClick={onLogout} className="rounded-lg bg-white/15 px-3 py-1.5 font-medium hover:bg-white/25">Chiqish</button>}
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}

function Login({ onDone }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api("/login", { method: "POST", body: { user, password } });
    setBusy(false);
    if (r.ok) onDone(); else setError(errText(r));
  };
  return (
    <Shell>
      <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <h1 className="text-xl font-extrabold">Admin kirishi</h1>
        <input className={INPUT} placeholder="Login" autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} />
        <input className={INPUT} type="password" placeholder="Parol" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <button className={`${BTN} w-full`} disabled={busy || !user || !password}>{busy ? "Tekshirilmoqda..." : "Kirish"}</button>
      </form>
    </Shell>
  );
}

// ---------- Mahsulot qo'shish / tahrirlash ----------
function ProductForm({ product, onClose, onSaved }) {
  const isNew = !product;
  const [f, setF] = useState({
    uz: product?.name.uz || "", ru: product && product.name.ru !== product.name.uz ? product.name.ru : "", en: product && product.name.en !== product.name.uz ? product.name.en : "",
    duz: product?.desc.uz || "", dru: product && product.desc.ru !== product.desc.uz ? product.desc.ru : "", den: product && product.desc.en !== product.desc.uz ? product.desc.en : "",
    price: product ? String(product.price) : "", sale: Boolean(product?.old), old: product?.old ? String(product.old) : "",
    image: product?.image || "", active: product ? product.active : true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = await resizeToJpegBase64(file);
      const r = await api("/images", { method: "POST", body: { mime: "image/jpeg", data } });
      if (r.ok) setF((x) => ({ ...x, image: r.data.url })); else setError(errText(r));
    } catch {
      setError(ERR.bad_image_data);
    }
    setBusy(false);
  };

  const save = async () => {
    setError("");
    const price = Number(f.price);
    const old = Number(f.old);
    if (!f.uz.trim()) return setError(ERR.name_required);
    if (!Number.isInteger(price) || price < 1) return setError(ERR.bad_price);
    if (f.sale && (!Number.isInteger(old) || old <= price)) return setError(ERR.bad_old_price);
    setBusy(true);
    const body = {
      name: { uz: f.uz, ru: f.ru, en: f.en }, desc: { uz: f.duz, ru: f.dru, en: f.den },
      price, old: f.sale ? old : null, image: f.image, active: f.active,
    };
    const r = isNew ? await api("/products", { method: "POST", body }) : await api(`/products/${product.id}`, { method: "PUT", body });
    setBusy(false);
    if (r.ok) onSaved(); else setError(errText(r));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={busy ? undefined : onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[94vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <h2 className="text-xl font-extrabold">{isNew ? "Yangi mahsulot" : "Mahsulotni tahrirlash"}</h2>

        <div className="flex items-center gap-3">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs text-slate-400">
            {f.image ? <img src={f.image} alt="" className="h-full w-full object-cover" /> : "Rasm yo'q"}
          </div>
          <div className="space-y-2">
            <label className={`${BTN_LIGHT} inline-block cursor-pointer`}>
              Rasm yuklash
              <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
            </label>
            {f.image && <button type="button" className={`${BTN_DANGER} ml-2`} onClick={() => setF({ ...f, image: "" })}>Olib tashlash</button>}
            <input className={INPUT} placeholder="yoki rasm havolasi (https://...)" value={f.image.startsWith("/api/img/") || f.image.startsWith("/products/") ? "" : f.image} onChange={set("image")} />
          </div>
        </div>

        <input className={INPUT} placeholder="Nomi (o'zbekcha) *" value={f.uz} onChange={set("uz")} />
        <textarea className={INPUT} rows={2} placeholder="Ta'rifi (o'zbekcha)" value={f.duz} onChange={set("duz")} />
        <details className="rounded-xl bg-slate-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">Rus va ingliz tilidagi nomi (ixtiyoriy)</summary>
          <div className="mt-3 space-y-2">
            <input className={INPUT} placeholder="Nomi (ruscha)" value={f.ru} onChange={set("ru")} />
            <textarea className={INPUT} rows={2} placeholder="Ta'rifi (ruscha)" value={f.dru} onChange={set("dru")} />
            <input className={INPUT} placeholder="Nomi (inglizcha)" value={f.en} onChange={set("en")} />
            <textarea className={INPUT} rows={2} placeholder="Ta'rifi (inglizcha)" value={f.den} onChange={set("den")} />
            <p className="text-xs text-slate-500">Bo'sh qoldirilsa, o'zbekcha matn ko'rsatiladi.</p>
          </div>
        </details>

        <input className={INPUT} inputMode="numeric" placeholder="Narxi (so'm) *" value={f.price} onChange={set("price")} />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={f.sale} onChange={(e) => setF({ ...f, sale: e.target.checked })} />
          Maxsus taklif (aksiya): ruletkada chiqadi, eski narx o'chirilgan holda ko'rinadi
        </label>
        {f.sale && <input className={INPUT} inputMode="numeric" placeholder="Eski narx (hozirgi narxdan katta)" value={f.old} onChange={set("old")} />}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
          Saytda ko'rinsin
        </label>

        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <div className="flex gap-2">
          <button className={`${BTN} flex-1`} onClick={save} disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</button>
          <button className={BTN_LIGHT} onClick={onClose} disabled={busy}>Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Mahsulotlar ro'yxati ----------
function Panel({ onLogout }) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(undefined); // undefined: yopiq | null: yangi | mahsulot: tahrir
  const [note, setNote] = useState("");

  const load = async () => {
    const r = await api("/products");
    if (r.status === 401) return onLogout(true);
    if (r.ok) setItems(r.data.products); else setNote(errText(r));
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const body = (p, extra = {}) => ({ name: p.name, desc: p.desc, price: p.price, old: p.old, image: p.image, active: p.active, ...extra });
  const toggle = async (p) => { const r = await api(`/products/${p.id}`, { method: "PUT", body: body(p, { active: !p.active }) }); if (r.ok) load(); else setNote(errText(r)); };
  const remove = async (p) => {
    if (!window.confirm(`"${p.name.uz}" mahsuloti o'chirilsinmi? Buni qaytarib bo'lmaydi.`)) return;
    const r = await api(`/products/${p.id}`, { method: "DELETE" });
    if (r.ok) load(); else setNote(errText(r));
  };

  const shown = (items || []).filter((p) => (filter === "sale" ? p.old : filter === "hidden" ? !p.active : true));
  const chip = (id, label) => (
    <button onClick={() => setFilter(id)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === id ? "bg-blue-900 text-white" : "bg-white ring-1 ring-slate-200"}`}>{label}</button>
  );

  return (
    <Shell onLogout={() => onLogout(false)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">{chip("all", `Hammasi${items ? ` (${items.length})` : ""}`)}{chip("sale", "Aksiyada")}{chip("hidden", "Yashirin")}</div>
        <button className={BTN} onClick={() => setEditing(null)}>+ Yangi mahsulot</button>
      </div>
      {note && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{note}</p>}
      {!items ? <p className="py-10 text-center text-slate-500">Yuklanmoqda...</p> : shown.length === 0 ? <p className="py-10 text-center text-slate-500">Mahsulot yo'q</p> : (
        <ul className="space-y-3">
          {shown.map((p) => (
            <li key={p.id} className={`flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 ${p.active ? "" : "opacity-60"}`}>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs text-slate-400">
                {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : "Rasm yo'q"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name.uz}</p>
                <p className="text-sm font-bold">{money(p.price)} {p.old && <s className="font-normal text-slate-400">{money(p.old)}</s>}</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                  {p.old && <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700">Aksiya -{Math.round((1 - p.price / p.old) * 100)}%</span>}
                  {!p.active && <span className="rounded-full bg-slate-200 px-2 py-0.5 font-bold text-slate-600">Yashirin</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className={BTN_LIGHT} onClick={() => setEditing(p)}>Tahrirlash</button>
                  <button className={BTN_LIGHT} onClick={() => toggle(p)}>{p.active ? "Yashirish" : "Ko'rsatish"}</button>
                  <button className={BTN_DANGER} onClick={() => remove(p)}>O'chirish</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing !== undefined && <ProductForm product={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); setNote(""); load(); }} />}
    </Shell>
  );
}

export default function Admin() {
  const [phase, setPhase] = useState("loading"); // loading | login | panel | off
  const [why, setWhy] = useState("");

  useEffect(() => {
    api("/me").then((r) => {
      if (r.ok) setPhase("panel");
      else if (r.status === 401) setPhase("login");
      else {
        setWhy(r.status === 503 ? "Baza ulanmagan. CLOUDFLARE.md dagi \"Admin panel\" qo'llanmasini bajaring (D1 baza)." : "Admin panel faqat Cloudflare'dagi saytda ishlaydi (baza kerak).");
        setPhase("off");
      }
    });
  }, []);

  const logout = async (expired) => {
    if (!expired) await api("/logout", { method: "POST" });
    setPhase("login");
  };

  if (phase === "loading") return <Shell><p className="py-20 text-center text-slate-500">Yuklanmoqda...</p></Shell>;
  if (phase === "off") return <Shell><p className="mt-10 rounded-2xl bg-white p-6 text-center text-slate-700 ring-1 ring-slate-200">{why}</p></Shell>;
  if (phase === "login") return <Login onDone={() => setPhase("panel")} />;
  return <Panel onLogout={logout} />;
}
