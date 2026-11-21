// npm i lucide-react   (mavzu CSS o'zgaruvchilar orqali ishlaydi, Tailwind dark sozlamasi shart emas)
import { useEffect, useState } from "react";
import {
  ShoppingBag, Building2, User, Store, ShoppingBasket, Settings, Search, Home,
  ClipboardList, Phone, Send, MapPin, ShoppingCart, Plus, Minus, Check, ChevronLeft, ChevronRight, Tag, X,
} from "lucide-react";
import logoImg from "./assets/logo.png";
import mascotImg from "./assets/mascot.png";
import imgStolichnaya from "./assets/stolichnaya.jpg";
import imgOlimp from "./assets/olimp.jpg";
import imgMilliy from "./assets/milliy.jpg";
import imgToorli from "./assets/toorli.jpg";
import imgYoyol from "./assets/yoyol.jpg";
import imgSalyami from "./assets/salyami.jpg";
import imgJori from "./assets/jori.jpg";
import { CATALOG } from "../shared/catalog.js"; // narxlar: shared/catalog.js

/* ============ SOZLAMALAR: shu yerni o'zgartiring ============ */
const BRAND = "Milliy"; // kampaniya nomi
const DEMO = import.meta.env?.VITE_DEMO === "1"; // demo sahifada server yo'q, buyurtma faqat qurilmada saqlanadi
const PHONE = "+998 88 330 58 58";
const TELEGRAM = "N0_Name_030";
const ADDRESS = "Manzilni shu yerga yozing";
const REGIONS = ["Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Farg'ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", "Qoraqalpog'iston", "Samarqand", "Sirdaryo", "Surxondaryo"];


/* ============ TARJIMALAR ============ */
const T = {
  uz: {
    next: "Oldinga", back: "Orqaga", whoAreYou: "Siz kimsiz?",
    legal: "Yuridik shaxs", legalDesc: "Do'kon yoki supermarket uchun",
    person: "Jismoniy shaxs", personDesc: "O'zim uchun xarid qilaman (chakana)",
    orgInfo: "Tashkilot ma'lumotlari", yourInfo: "Shaxsiy ma'lumotlar",
    firstName: "Ism", lastName: "Familya", phone: "Telefon raqam", region: "Viloyat",
    district: "Tuman", orgName: "Tashkilot nomi", shop: "Do'kon", supermarket: "Supermarket",
    search: "Mahsulot qidirish...", home: "Bosh sahifa", orders: "Buyurtmalar", settings: "Sozlamalar",
    profile: "Profil", contact: "Murojaat uchun", address: "Manzil", specials: "Maxsus takliflar",
    noOrders: "Hozircha buyurtmalar yo'q", noResult: "Hech narsa topilmadi", language: "Ilova tili",
    som: "so'm", edit: "Ma'lumotlarni o'zgartirish",
    ads: [{ title: "Sifat — Milliydan!", text: "Do'kon va supermarketlar uchun ulgurji narxlar" }, { title: "Tabiiy mahsulot, mazali ta'm", text: "Milliy kolbasalarining barcha turlari" }, { title: "Tez va qulay yetkazib berish", text: "Butun O'zbekiston bo'ylab" }],
    products: [{ name: "Stolichnaya pishirilgan kolbasa", desc: "Milliy brendining pishirilgan kolbasasi. Sifat — Milliydan!" }, { name: "Milliy Olimp 2024 kolbasa", desc: "Maxsus Olimp 2024 o'ramidagi kolbasa. Sifat va ta'm birinchi o'rinda!" }, { name: "Milliy kolbasa", desc: "Tabiiy mahsulot, mazali ta'm, sifat kafolati." }, { name: "Milliy kolbasa (to'rli)", desc: "To'rli o'ramdagi Milliy kolbasa. Sifat — Milliydan!" }, { name: "Milliy yo'l-yo'l kolbasa", desc: "Yorqin o'ramdagi Milliy kolbasa, do'kon va supermarketlar uchun." }, { name: "Salyami Milliy", desc: "Sifat va ta'm birinchi o'rinda!" }, { name: "Milliy kolbasa (qizil)", desc: "Milliy brendining mazali kolbasasi. Sifat — Milliydan!" }],
    about: "Mahsulot haqida", close: "Yopish", addToCart: "Savatga solish", cart: "Savat", cartEmpty: "Savat bo'sh", total: "Jami", placeOrder: "Buyurtma berish", catalog: "Mahsulotlar",
    orderSaved: "Buyurtma muvaffaqiyatli saqlandi!", orderNo: "Buyurtma raqami", tgSent: "Buyurtma Telegramga yuborildi", tgFail: "Telegramga yuborib bo'lmadi, buyurtma qurilmada saqlandi", ok: "Yaxshi", sending: "Yuborilmoqda...",
    checkout: "Buyurtmani tasdiqlash", confirm: "Tasdiqlash", addrField: "Manzil (ko'cha, uy)", comment: "Izoh (ixtiyoriy)", sendFail: "Buyurtmani yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.",
    orderOk: "Buyurtmangiz qabul qilindi!", willCall: "Tez orada siz bilan bog'lanamiz.", receipt: "Buyurtma cheki", rcCheck: "Chek", rcDate: "Sana", rcClient: "Mijoz", rcStamp: "Qabul qilindi", thanks: "Xaridingiz uchun rahmat!",
  },
  ru: {
    next: "Далее", back: "Назад", whoAreYou: "Кто вы?",
    legal: "Юридическое лицо", legalDesc: "Для магазина или супермаркета",
    person: "Физическое лицо", personDesc: "Покупаю для себя (розница)",
    orgInfo: "Данные организации", yourInfo: "Личные данные",
    firstName: "Имя", lastName: "Фамилия", phone: "Номер телефона", region: "Область",
    district: "Район", orgName: "Название организации", shop: "Магазин", supermarket: "Супермаркет",
    search: "Поиск товаров...", home: "Главная", orders: "Заказы", settings: "Настройки",
    profile: "Профиль", contact: "Контакты", address: "Адрес", specials: "Спецпредложения",
    noOrders: "Заказов пока нет", noResult: "Ничего не найдено", language: "Язык приложения",
    som: "сум", edit: "Изменить данные",
    ads: [{ title: "Качество — от Milliy!", text: "Оптовые цены для магазинов и супермаркетов" }, { title: "Натуральный продукт, вкусный", text: "Все виды колбас Milliy" }, { title: "Быстрая и удобная доставка", text: "По всему Узбекистану" }],
    products: [{ name: "Столичная варёная колбаса", desc: "Варёная колбаса бренда Milliy. Качество — от Milliy!" }, { name: "Колбаса Milliy Олимп 2024", desc: "Колбаса в особой упаковке Олимп 2024. Качество и вкус на первом месте!" }, { name: "Колбаса Milliy", desc: "Натуральный продукт, вкусная, с гарантией качества." }, { name: "Колбаса Milliy (в сетке)", desc: "Колбаса Milliy в сетчатой упаковке. Качество — от Milliy!" }, { name: "Полосатая колбаса Milliy", desc: "Колбаса Milliy в яркой упаковке для магазинов и супермаркетов." }, { name: "Салями Milliy", desc: "Качество и вкус на первом месте!" }, { name: "Колбаса Milliy (красная)", desc: "Вкусная колбаса бренда Milliy. Качество — от Milliy!" }],
    about: "О товаре", close: "Закрыть", addToCart: "В корзину", cart: "Корзина", cartEmpty: "Корзина пуста", total: "Итого", placeOrder: "Оформить заказ", catalog: "Товары",
    orderSaved: "Заказ успешно сохранён!", orderNo: "Номер заказа", tgSent: "Заказ отправлен в Telegram", tgFail: "Не удалось отправить в Telegram, заказ сохранён на устройстве", ok: "Хорошо", sending: "Отправка...",
    checkout: "Подтверждение заказа", confirm: "Подтвердить", addrField: "Адрес (улица, дом)", comment: "Комментарий (необязательно)", sendFail: "Не удалось отправить заказ. Проверьте интернет и попробуйте снова.",
    orderOk: "Ваш заказ принят!", willCall: "Мы скоро свяжемся с вами.", receipt: "Чек заказа", rcCheck: "Чек", rcDate: "Дата", rcClient: "Клиент", rcStamp: "Принято", thanks: "Спасибо за покупку!",
  },
  en: {
    next: "Next", back: "Back", whoAreYou: "Who are you?",
    legal: "Business", legalDesc: "For a shop or supermarket",
    person: "Individual", personDesc: "I buy for myself (retail)",
    orgInfo: "Organization details", yourInfo: "Your details",
    firstName: "First name", lastName: "Last name", phone: "Phone number", region: "Region",
    district: "District", orgName: "Organization name", shop: "Shop", supermarket: "Supermarket",
    search: "Search products...", home: "Home", orders: "Orders", settings: "Settings",
    profile: "Profile", contact: "Contact us", address: "Address", specials: "Special offers",
    noOrders: "No orders yet", noResult: "Nothing found", language: "App language",
    som: "UZS", edit: "Edit my details",
    ads: [{ title: "Quality comes from Milliy!", text: "Wholesale prices for shops and supermarkets" }, { title: "Natural product, great taste", text: "All kinds of Milliy sausages" }, { title: "Fast and easy delivery", text: "All across Uzbekistan" }],
    products: [{ name: "Stolichnaya cooked sausage", desc: "Cooked sausage by Milliy. Quality comes from Milliy!" }, { name: "Milliy Olympics 2024 sausage", desc: "Sausage in special Olympics 2024 packaging. Quality and taste come first!" }, { name: "Milliy sausage", desc: "Natural product, great taste, quality guaranteed." }, { name: "Milliy sausage (netted)", desc: "Milliy sausage in net packaging. Quality comes from Milliy!" }, { name: "Milliy striped sausage", desc: "Milliy sausage in bright packaging for shops and supermarkets." }, { name: "Milliy salami", desc: "Quality and taste come first!" }, { name: "Milliy sausage (red)", desc: "Tasty sausage by Milliy. Quality comes from Milliy!" }],
    about: "About this product", close: "Close", addToCart: "Add to cart", cart: "Cart", cartEmpty: "Your cart is empty", total: "Total", placeOrder: "Place order", catalog: "Products",
    orderSaved: "Order saved successfully!", orderNo: "Order number", tgSent: "Order sent to Telegram", tgFail: "Could not send to Telegram, the order is saved on this device", ok: "OK", sending: "Sending...",
    checkout: "Confirm your order", confirm: "Confirm", addrField: "Address (street, house)", comment: "Comment (optional)", sendFail: "Could not send the order. Check your connection and try again.",
    orderOk: "Your order has been received!", willCall: "We will contact you shortly.", receipt: "Order receipt", rcCheck: "Receipt", rcDate: "Date", rcClient: "Customer", rcStamp: "Accepted", thanks: "Thank you for your purchase!",
  },
};
const LANGS = [
  { id: "uz", flag: "🇺🇿", name: "O'zbekcha" },
  { id: "ru", flag: "🇷🇺", name: "Русский" },
  { id: "en", flag: "🇬🇧", name: "English" },
];
const AD_STYLE = [
  { bg: "from-red-900 to-red-600", img: imgSalyami },
  { bg: "from-amber-600 to-orange-500", img: imgToorli },
  { bg: "from-red-950 to-red-700", img: imgStolichnaya },
];
const IMAGES = [imgStolichnaya, imgOlimp, imgMilliy, imgToorli, imgYoyol, imgSalyami, imgJori];
const PRODUCTS = CATALOG.map((c, i) => ({ ...c, image: IMAGES[i] }));
const getProducts = (t) => PRODUCTS.map((p, i) => ({ ...p, id: i, ...t.products[i] }));
const pct = (p) => Math.round((1 - p.price / p.old) * 100);

/* ============ YORDAMCHILAR ============ */
function useLocal(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV];
}

const BTN = "w-full rounded-2xl bg-blue-900 py-3.5 font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_GHOST = "w-full rounded-2xl py-3 font-medium text-slate-500 hover:bg-slate-200/60";
const BTN_SM = BTN.replace("py-3.5", "py-2.5 text-sm");
const INPUT = "w-full text-slate-900 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200";
const HEAD_BG = "bg-gradient-to-br from-red-950 via-red-800 to-red-600";
const fmt = (n, som) => `${n.toLocaleString("ru-RU")} ${som}`;

/* ============ UMUMIY KOMPONENTLAR ============ */
function Logo({ size = "md" }) {
  const big = size === "lg";
  return (
    <div className="flex items-center gap-2.5 text-white">
      <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-2 ring-white/40 ${big ? "h-24 w-24" : "h-11 w-11"}`}>
        <img src={mascotImg} alt={BRAND} className="h-full w-full object-contain p-1" />
      </span>
      <span className={`font-extrabold uppercase tracking-tight ${big ? "text-4xl" : "text-xl"}`}>{BRAND}</span>
    </div>
  );
}

function GlassIcon({ icon: Icon, className = "" }) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-md ${className}`}>
      <Icon size={20} />
    </span>
  );
}

// Onboarding oynalari uchun umumiy karkas: tepada logo + mos fon
function Screen({ children, footer }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className={`${HEAD_BG} flex justify-center rounded-b-[2rem] px-4 pb-8 pt-8`}><Logo /></div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-5 py-6">{children}</main>
      <div className="mx-auto w-full max-w-md space-y-2 px-5 pb-8">{footer}</div>
    </div>
  );
}

function Carousel({ items, interval = 4000, render }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((x) => x + 1), interval);
    return () => clearInterval(id);
  }, [items.length, interval]);
  const idx = items.length ? i % items.length : 0;
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="flex transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {items.map((it, n) => <div key={n} className="min-w-full">{render(it, n)}</div>)}
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {items.map((_, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`${n + 1}`} className={`h-1.5 rounded-full transition-all ${n === idx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

/* ============ KIRISH OYNALARI ============ */
function LangScreen({ lang, setLang, onNext }) {
  return (
    <Screen footer={<button className={BTN} onClick={onNext}>{T[lang].next}</button>}>
      <h1 className="mb-2 text-center text-lg font-bold">Tilni tanlang · Выберите язык · Choose language</h1>
      {LANGS.map((l) => (
        <button key={l.id} onClick={() => setLang(l.id)}
          className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left text-lg font-semibold ${lang === l.id ? "border-blue-900" : "border-transparent ring-1 ring-slate-200"}`}>
          <span className="text-3xl">{l.flag}</span><span className="flex-1">{l.name}</span>
          {lang === l.id && <Check className="text-blue-900" />}
        </button>
      ))}
    </Screen>
  );
}

function TypeScreen({ t, type, setType, onNext, onBack }) {
  const opts = [
    { id: "legal", icon: Building2, title: t.legal, desc: t.legalDesc },
    { id: "person", icon: User, title: t.person, desc: t.personDesc },
  ];
  return (
    <Screen footer={<><button className={BTN} disabled={!type} onClick={onNext}>{t.next}</button><button className={BTN_GHOST} onClick={onBack}>{t.back}</button></>}>
      <h1 className="mb-2 text-center text-2xl font-extrabold">{t.whoAreYou}</h1>
      {opts.map(({ id, icon: Icon, title, desc }) => (
        <button key={id} onClick={() => setType(id)}
          className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-5 text-left ${type === id ? "border-blue-900" : "border-transparent ring-1 ring-slate-200"}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white"><Icon size={24} /></span>
          <span className="flex-1"><b className="block text-base">{title}</b><span className="text-sm text-slate-500">{desc}</span></span>
        </button>
      ))}
    </Screen>
  );
}

function InfoScreen({ t, type, onSubmit, onBack }) {
  const legal = type === "legal";
  const [f, setF] = useState({ firstName: "", lastName: "", phone: "", region: "", district: "", orgName: "", bizType: "shop" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.firstName && f.lastName && f.region && f.district && f.phone.replace(/\D/g, "").length >= 9 && (!legal || f.orgName);
  return (
    <Screen footer={<><button className={BTN} disabled={!ok} onClick={() => onSubmit({ type, ...f })}>{t.next}</button><button className={BTN_GHOST} onClick={onBack}>{t.back}</button></>}>
      <h1 className="mb-1 text-center text-2xl font-extrabold">{legal ? t.orgInfo : t.yourInfo}</h1>
      <div className="grid grid-cols-2 gap-3">
        <input className={INPUT} placeholder={t.firstName} value={f.firstName} onChange={set("firstName")} />
        <input className={INPUT} placeholder={t.lastName} value={f.lastName} onChange={set("lastName")} />
      </div>
      <input className={INPUT} type="tel" placeholder={`${t.phone} (+998 ...)`} value={f.phone} onChange={set("phone")} />
      <div className="grid grid-cols-2 gap-3">
        <select className={INPUT} value={f.region} onChange={set("region")}>
          <option value="">{t.region}</option>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <input className={INPUT} placeholder={t.district} value={f.district} onChange={set("district")} />
      </div>
      {legal && (
        <>
          <input className={INPUT} placeholder={t.orgName} value={f.orgName} onChange={set("orgName")} />
          <div className="grid grid-cols-2 gap-3">
            {[{ id: "shop", icon: Store, label: t.shop }, { id: "supermarket", icon: ShoppingBasket, label: t.supermarket }].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setF({ ...f, bizType: id })}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ${f.bizType === id ? "bg-blue-900 text-white" : "bg-white ring-1 ring-slate-200"}`}>
                <Icon size={18} />{label}
              </button>
            ))}
          </div>
        </>
      )}
    </Screen>
  );
}

function Splash({ onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 2400); return () => clearTimeout(id); }, [onDone]);
  return (
    <div className={`${HEAD_BG} flex min-h-screen flex-col items-center justify-center gap-10`}>
      <style>{`
        @keyframes pop{0%{opacity:0;transform:scale(.4) rotate(-12deg)}70%{transform:scale(1.08) rotate(2deg)}100%{opacity:1;transform:none}}
        @keyframes rise{from{opacity:0;transform:translateY(16px);letter-spacing:.3em}to{opacity:1;transform:none;letter-spacing:-.02em}}
        @keyframes load{from{width:0}to{width:100%}}
        @media (prefers-reduced-motion:reduce){.sp{animation:none!important}}
      `}</style>
      <div className="sp flex flex-col items-center gap-5 text-white" style={{ animation: "pop .9s cubic-bezier(.2,.8,.2,1) both" }}>
        <span className="flex h-48 w-48 items-center justify-center rounded-[2rem] bg-white shadow-2xl ring-4 ring-white/30"><img src={logoImg} alt={BRAND} className="h-full w-full object-contain p-4" /></span>
        <span className="sp text-3xl font-extrabold uppercase" style={{ animation: "rise .9s .5s ease-out both" }}>{BRAND}</span>
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/20"><div className="sp h-full bg-white" style={{ animation: "load 2.2s ease-in-out both" }} /></div>
    </div>
  );
}

/* ============ ASOSIY ILOVA ============ */
function AppHeader({ cartCount, onCart, onSettings }) {
  return (
    <header className={`${HEAD_BG} sticky top-0 z-20 flex items-center justify-between rounded-b-3xl px-4 py-3 shadow-lg`}>
      <Logo />
      <div className="flex items-center gap-2">
        <button onClick={onCart} aria-label="Cart" className="relative">
          <GlassIcon icon={ShoppingCart} />
          {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-slate-900">{cartCount}</span>}
        </button>
        <button onClick={onSettings} aria-label="Settings"><GlassIcon icon={Settings} /></button>
      </div>
    </header>
  );
}

function QtyStepper({ qty, onQty, big }) {
  const b = `flex items-center justify-center rounded-xl bg-blue-900 text-white hover:bg-blue-800 active:scale-95 ${big ? "h-12 w-12" : "h-9 w-9"}`;
  return (
    <div className="flex items-center justify-between gap-2">
      <button className={b} onClick={() => onQty(-1)} aria-label="-"><Minus size={18} /></button>
      <span className={`min-w-8 text-center font-bold text-slate-900 ${big ? "text-xl" : ""}`}>{qty}</span>
      <button className={b} onClick={() => onQty(1)} aria-label="+"><Plus size={18} /></button>
    </div>
  );
}

// Savatda yo'q bo'lsa "Savatga solish", bor bo'lsa  − 1 +
function AddButton({ t, qty, onQty, big }) {
  if (qty > 0) return <QtyStepper qty={qty} onQty={onQty} big={big} />;
  return <button className={big ? BTN : BTN_SM} onClick={() => onQty(1)}>{t.addToCart}</button>;
}

function ProductModal({ t, p, qty, onQty, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white text-slate-900 shadow-2xl sm:rounded-3xl">
        <div className="relative flex h-72 items-center justify-center bg-gradient-to-br from-red-950 to-red-700">
          <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
          {p.old && <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-sm font-bold text-white">-{pct(p)}%</span>}
          <button onClick={onClose} aria-label={t.close} className="absolute right-4 top-4"><GlassIcon icon={X} /></button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-3xl font-extrabold text-slate-900">{fmt(p.price, t.som)} {p.old && <s className="text-base font-normal text-slate-400">{fmt(p.old, t.som)}</s>}</p>
          <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-slate-500">{t.about}</h4>
            <p className="leading-relaxed text-slate-700">{p.desc}</p>
          </div>
          <AddButton t={t} qty={qty} onQty={onQty} big />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ t, p, qty, onQty, onOpen }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <button onClick={onOpen} aria-label={p.name} className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-red-100">
        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
        {p.old && <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">-{pct(p)}%</span>}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-slate-900">{p.name}</h3>
        <p className="font-extrabold text-slate-900">{fmt(p.price, t.som)} {p.old && <s className="text-xs font-normal text-slate-400">{fmt(p.old, t.som)}</s>}</p>
        <div className="mt-auto"><AddButton t={t} qty={qty} onQty={onQty} /></div>
      </div>
    </article>
  );
}

function SpecialOffers({ t, items, onOpen }) {
  if (!items.length) return null;
  return (
    <section className="px-4">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold"><Tag size={20} className="text-blue-900" />{t.specials}</h2>
      <Carousel items={items} interval={3500} render={(o) => (
        <button onClick={() => onOpen(o.id)} className={`${HEAD_BG} flex w-full items-center gap-4 p-5 pb-8 text-left text-white`}>
          <img src={o.image} alt="" className="h-20 w-20 shrink-0 rounded-3xl object-cover ring-2 ring-white/40" />
          <span className="min-w-0">
            <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold">-{pct(o)}%</span>
            <span className="mt-1 block truncate text-lg font-bold">{o.name}</span>
            <span className="block text-xl font-extrabold">{fmt(o.price, t.som)} <s className="text-sm font-normal text-white/60">{fmt(o.old, t.som)}</s></span>
          </span>
        </button>
      )} />
    </section>
  );
}

function ContactFooter({ t }) {
  const rows = [
    { icon: Phone, label: PHONE, href: `tel:${PHONE.replace(/\s/g, "")}` },
    { icon: Send, label: `@${TELEGRAM}`, href: `https://t.me/${TELEGRAM}` },
    { icon: MapPin, label: ADDRESS },
  ];
  return (
    <footer className={`${HEAD_BG} mt-8 rounded-t-[2rem] px-5 pb-28 pt-7 text-white`}>
      <h2 className="mb-4 text-lg font-bold">{t.contact}</h2>
      <ul className="space-y-3">
        {rows.map(({ icon, label, href }) => (
          <li key={label}>
            {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-3 font-medium"><GlassIcon icon={icon} />{label}</a>
              : <div className="flex items-center gap-3"><GlassIcon icon={icon} />{label}</div>}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-xs text-white/50">© {new Date().getFullYear()} {BRAND}</p>
    </footer>
  );
}

function HomeTab({ t, products, cart, onQty }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const q = query.trim().toLowerCase();
  const found = products.filter((p) => p.name.toLowerCase().includes(q));
  const open = products.find((p) => p.id === openId);
  return (
    <div className="space-y-5 pt-4">
      <div className="relative px-4">
        <Search size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className={`${INPUT} pl-11`} placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {!q && (
        <div className="px-4">
          <Carousel items={t.ads} interval={4500} render={(ad, n) => (
            <div className={`flex h-44 items-center justify-between bg-gradient-to-r ${AD_STYLE[n].bg} p-6 text-white`}>
              <div className="max-w-[65%]"><h3 className="text-xl font-extrabold leading-tight">{ad.title}</h3><p className="mt-1 text-sm text-white/80">{ad.text}</p></div>
              <img src={AD_STYLE[n].img} alt="" className="h-32 w-32 shrink-0 rounded-2xl object-cover shadow-xl ring-2 ring-white/40" />
            </div>
          )} />
        </div>
      )}
      <SpecialOffers t={t} items={found.filter((p) => p.old)} onOpen={setOpenId} />
      <section className="px-4">
        <h2 className="mb-3 text-lg font-extrabold">{t.catalog}</h2>
        {found.length === 0 ? <p className="rounded-2xl bg-white p-6 text-center text-slate-500">{t.noResult}</p> : (
          <div className="grid grid-cols-2 gap-3">
            {found.map((p) => <ProductCard key={p.id} t={t} p={p} qty={cart[p.id] || 0} onQty={(d) => onQty(p.id, d)} onOpen={() => setOpenId(p.id)} />)}
          </div>
        )}
      </section>
      {open && <ProductModal t={t} p={open} qty={cart[open.id] || 0} onQty={(d) => onQty(open.id, d)} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function SettingsTab({ t, lang, setLang }) {
  return (
    <div className="p-4">
      <h2 className="mb-2 font-bold">{t.language}</h2>
      <div className="flex gap-2">
        {LANGS.map((l) => (
          <button key={l.id} onClick={() => setLang(l.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ${lang === l.id ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {l.flag} {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function CartTab({ t, products, cart, onQty, onOrder }) {
  const lines = products.filter((p) => cart[p.id]);
  const total = lines.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  return (
    <div className="space-y-3 p-4 pb-28">
      <h2 className="text-xl font-extrabold">{t.cart}</h2>
      {lines.length === 0 ? <p className="py-10 text-center text-slate-500">{t.cartEmpty}</p> : (
        <>
          {lines.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <img src={p.image} alt={p.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate font-semibold text-slate-900">{p.name}</p>
                <p className="text-sm font-bold text-blue-900">{fmt(p.price * cart[p.id], t.som)}</p>
                <div className="w-32"><QtyStepper qty={cart[p.id]} onQty={(d) => onQty(p.id, d)} /></div>
              </div>
            </div>
          ))}
          <p className="flex justify-between pt-2 text-lg font-extrabold text-slate-900"><span>{t.total}</span><span>{fmt(total, t.som)}</span></p>
          <button className={BTN} onClick={onOrder}>{t.placeOrder}</button>
        </>
      )}
    </div>
  );
}

function OrdersTab({ t, products, orders }) {
  if (!orders.length) return <p className="p-10 text-center text-slate-500">{t.noOrders}</p>;
  return (
    <div className="space-y-3 p-4 pb-28">
      {orders.map((o) => (
        <div key={o.no} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="mb-2 flex justify-between text-sm"><b className="text-slate-900">№{String(o.no).slice(-6)}</b><span className="text-slate-500">{o.date}</span></div>
          {o.items.map((it) => (
            <p key={it.id} className="flex items-center gap-2 py-1 text-sm text-slate-900">
              <img src={products[it.id].image} alt="" className="h-8 w-8 rounded-lg object-cover" /><span className="flex-1 truncate">{products[it.id].name}</span><span className="text-slate-500">×{it.qty}</span>
            </p>
          ))}
          <p className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900"><span>{t.total}</span><span>{fmt(o.total, t.som)}</span></p>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ t, profile, onEdit }) {
  const rows = [
    [t.firstName, `${profile.firstName} ${profile.lastName}`], [t.phone, profile.phone],
    [t.region, `${profile.region}, ${profile.district}`],
    ...(profile.type === "legal" ? [[t.orgName, profile.orgName], ["", profile.bizType === "shop" ? t.shop : t.supermarket]] : []),
  ];
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
        <p className="mb-3 font-bold">{profile.type === "legal" ? t.legal : t.person}</p>
        {rows.map(([k, v], i) => <p key={i} className="flex justify-between border-t border-slate-200 py-2 text-sm"><span className="text-slate-500">{k}</span><span className="font-medium">{v}</span></p>)}
      </div>
      <button className={BTN} onClick={onEdit}>{t.edit}</button>
    </div>
  );
}

function BottomNav({ t, tab, setTab }) {
  const items = [{ id: "home", icon: Home, label: t.home }, { id: "orders", icon: ClipboardList, label: t.orders }, { id: "settings", icon: Settings, label: t.settings }, { id: "profile", icon: User, label: t.profile }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {items.map(({ id, icon: Icon, label }) => (
          <li key={id}><button onClick={() => setTab(id)} className={`flex w-full flex-col items-center gap-1 py-2.5 text-xs font-medium ${tab === id ? "text-blue-900" : "text-slate-500"}`}><Icon size={22} />{label}</button></li>
        ))}
      </ul>
    </nav>
  );
}

/* ============ ROOT ============ */
// Buyurtmani O'Z SERVERIMIZGA yuboradi (/api/order). Telegram tokeni faqat serverda turadi.
// Natija: "sent" | "off" (server Telegramga ulanmagan yoki demo) | "fail"
async function submitOrder(customer, items, comment) {
  if (DEMO) return { status: "off" };
  try {
    const r = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, comment, items: items.map(({ id, qty }) => ({ id, qty })) }),
    });
    // 503 = server tokenni ko'rmayapti: lokal sinovda ruxsat ("off"), haqiqiy saytda esa XATO deb ko'rsatamiz
    if (r.status === 503) return { status: import.meta.env?.DEV ? "off" : "fail", code: 503 };
    if (!r.ok) return { status: "fail", code: r.status };
    const d = await r.json();
    return { status: "sent", no: d.no };
  } catch {
    return { status: "fail", code: "net" }; // so'rov serverga umuman yetmadi
  }
}

// Mijoz ma'lumotlarini tekshirib, "Tasdiqlash" bosadigan oyna
function CheckoutModal({ t, profile, lines, total, busy, error, onConfirm, onClose }) {
  const legal = profile?.type === "legal";
  const [f, setF] = useState({
    firstName: profile?.firstName || "", lastName: profile?.lastName || "", phone: profile?.phone || "",
    region: profile?.region || "", district: profile?.district || "", orgName: profile?.orgName || "", address: "", comment: "",
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.firstName && f.lastName && f.region && f.district && f.phone.replace(/\D/g, "").length >= 9 && (!legal || f.orgName);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={busy ? undefined : onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 text-slate-900 shadow-2xl sm:rounded-3xl">
        <h3 className="mb-4 text-xl font-extrabold">{t.checkout}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className={INPUT} placeholder={t.firstName} value={f.firstName} onChange={set("firstName")} />
            <input className={INPUT} placeholder={t.lastName} value={f.lastName} onChange={set("lastName")} />
          </div>
          <input className={INPUT} type="tel" placeholder={t.phone} value={f.phone} onChange={set("phone")} />
          <div className="grid grid-cols-2 gap-3">
            <select className={INPUT} value={f.region} onChange={set("region")}>
              <option value="">{t.region}</option>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <input className={INPUT} placeholder={t.district} value={f.district} onChange={set("district")} />
          </div>
          {legal && <input className={INPUT} placeholder={t.orgName} value={f.orgName} onChange={set("orgName")} />}
          <input className={INPUT} placeholder={t.addrField} value={f.address} onChange={set("address")} />
          <textarea className={INPUT} rows={2} placeholder={t.comment} value={f.comment} onChange={set("comment")} />
        </div>
        <div className="mt-4 space-y-1 rounded-2xl bg-slate-50 p-3 text-sm">
          {lines.map((l) => <p key={l.id} className="flex justify-between gap-3"><span className="truncate">{l.name}</span><span className="shrink-0 text-slate-500">× {l.qty}</span></p>)}
          <p className="flex justify-between border-t border-slate-200 pt-2 font-extrabold"><span>{t.total}</span><span>{fmt(total, t.som)}</span></p>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-rose-600">{t.sendFail} <span className="text-slate-400">({error})</span></p>}
        <div className="mt-4 space-y-2">
          <button className={BTN} disabled={!ok || busy} onClick={() => onConfirm({ ...f, type: profile?.type || "person", bizType: profile?.bizType || "shop" }, f.comment)}>{busy ? t.sending : t.confirm}</button>
          <button className={BTN_GHOST} disabled={busy} onClick={onClose}>{t.back}</button>
        </div>
      </div>
    </div>
  );
}

// Buyurtma qabul qilinganda "chop etilayotgan chek" animatsiyasi
const ZIGZAG = (() => {
  const pts = ["0 0", "100% 0"];
  for (let i = 20; i >= 0; i--) pts.push(`${(i * 100) / 20}% ${i % 2 ? "calc(100% - 8px)" : "100%"}`);
  return `polygon(${pts.join(",")})`;
})();

function Barcode({ seed }) {
  const digits = String(seed).padStart(12, "0").split("").map(Number);
  const bars = [];
  let x = 0;
  for (let i = 0; i < 48; i++) {
    const w = 1 + ((digits[i % digits.length] + i) % 3);
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="40" fill="#1e293b" />);
    x += w + 1;
  }
  return <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className="h-10 w-44" aria-hidden>{bars}</svg>;
}

function ReceiptModal({ t, info, onClose }) {
  const code = String(info.no).slice(-6);
  const row = (n) => ({ animation: `rc-in .5s ${0.9 + n * 0.18}s both` });
  const num = (n) => n.toLocaleString("ru-RU");
  const last = info.lines.length + 3;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-orange-50 via-white to-red-50 text-slate-900">
      <style>{`
        @keyframes rc-print{from{clip-path:inset(0 0 100% 0);transform:translateY(-28px)}to{clip-path:inset(0 0 0 0);transform:none}}
        @keyframes rc-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes rc-pop{0%{opacity:0;transform:scale(.3) rotate(-20deg)}70%{opacity:1;transform:scale(1.15) rotate(-8deg)}100%{opacity:1;transform:scale(1) rotate(-8deg)}}
        @keyframes rc-check{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
        @media (prefers-reduced-motion:reduce){.rc *{animation:none!important}}
      `}</style>
      <div role="dialog" aria-modal="true" className="rc mx-auto flex min-h-full max-w-md flex-col items-center px-5 py-8">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg" style={{ animation: "rc-check .6s .1s both" }}><Check size={30} strokeWidth={3} /></span>
        <h2 className="text-center text-2xl font-extrabold">{t.orderOk}</h2>
        <p className="mt-1 text-center text-sm text-slate-500">{t.willCall}</p>

        <div className="mt-6 h-3 w-[94%] rounded-full bg-slate-800 shadow-md" />
        <div className="w-[88%] drop-shadow-xl">
          <div style={{ animation: "rc-print 1.4s .3s ease-out both" }}>
            <div className="bg-white px-5 pb-9 pt-5 font-mono text-[13px]" style={{ clipPath: ZIGZAG }}>
              <div className="text-center" style={row(0)}>
                <img src={mascotImg} alt="" className="mx-auto h-10 object-contain" />
                <p className="mt-1 text-xl font-extrabold uppercase tracking-[0.3em]">{BRAND}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{t.receipt}</p>
              </div>
              <div className="my-3 border-t border-dashed border-slate-300" />
              <div className="space-y-1 text-[12px]" style={row(1)}>
                <p className="flex justify-between gap-3"><span className="uppercase text-slate-400">{t.rcCheck}</span><b>№ {code}</b></p>
                <p className="flex justify-between gap-3"><span className="uppercase text-slate-400">{t.rcDate}</span><span>{info.date}</span></p>
                <p className="flex justify-between gap-3"><span className="uppercase text-slate-400">{t.rcClient}</span><span className="truncate">{info.name}</span></p>
              </div>
              <div className="my-3 border-t border-dashed border-slate-300" />
              {info.lines.map((l, n) => (
                <div key={l.id} className="mb-2" style={row(2 + n)}>
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-right text-slate-500">{l.qty} × {num(l.price)} = {num(l.qty * l.price)}</p>
                </div>
              ))}
              <div className="my-3 border-t-2 border-slate-800" />
              <div className="flex items-end justify-between" style={row(2 + info.lines.length)}>
                <span className="font-bold uppercase">{t.total}</span>
                <span className="text-xl font-extrabold">{fmt(info.total, t.som)}</span>
              </div>
              <div className="mt-3 text-right">
                <span className="inline-block rounded border-2 border-emerald-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-600" style={{ transform: "rotate(-8deg)", animation: `rc-pop .5s ${0.9 + last * 0.18}s both` }}>{t.rcStamp}</span>
              </div>
              <div className="mt-3 flex justify-center" style={row(last)}><Barcode seed={info.no} /></div>
              <p className="mt-1 text-center text-[10px] tracking-[0.3em] text-slate-400" style={row(last)}>{code}</p>
              <p className="mt-3 text-center text-[11px] text-slate-500" style={row(last + 1)}>{t.thanks}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 w-full max-w-xs" style={row(last + 2)}><button className={BTN} onClick={onClose}>{t.ok}</button></div>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useLocal("lang", "uz");
  const [profile, setProfile] = useLocal("profile", null);
  const [cart, setCart] = useLocal("cart", {}); // { productId: soni }
  const [orders, setOrders] = useLocal("orders", []);
  const [stage, setStage] = useState(profile ? "splash" : "lang"); // lang → type → info → splash → app
  const [type, setType] = useState(null);
  const [tab, setTab] = useState("home");
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(false); // tasdiqlash oynasi
  const [sendError, setSendError] = useState(null); // xato kodi (404, 503, 502, net...) yoki null
  const [done, setDone] = useState(null); // muvaffaqiyatli buyurtma ma'lumoti
  const t = T[lang];
  const products = getProducts(t);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const changeQty = (id, d) =>
    setCart((c) => {
      const q = (c[id] || 0) + d;
      const next = { ...c };
      if (q > 0) next[id] = q; else delete next[id];
      return next;
    });

  const lines = products.filter((p) => cart[p.id]).map((p) => ({ id: p.id, name: p.name, qty: cart[p.id], price: p.price }));
  const cartTotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  // "Tasdiqlash" bosilganda: serverga yuboramiz; xato bo'lsa savat saqlanadi va qayta urinish mumkin
  const confirmOrder = async (customer, comment) => {
    if (busy) return;
    setBusy(true);
    setSendError(null);
    const res = await submitOrder(customer, lines, comment);
    if (res.status === "fail") { setBusy(false); setSendError(res.code ?? "?"); return; }
    const order = { no: res.no || Date.now(), date: new Date().toLocaleString(), items: lines.map(({ id, qty, price }) => ({ id, qty, price })), total: cartTotal, customer, tg: res.status };
    setOrders((o) => [order, ...o]);
    setCart({});
    setBusy(false);
    setCheckout(false);
    setDone({ no: order.no, date: order.date, name: `${customer.firstName} ${customer.lastName}`, lines, total: cartTotal, tg: res.status });
  };

  let view;
  if (stage === "lang") view = <LangScreen lang={lang} setLang={setLang} onNext={() => setStage("type")} />;
  else if (stage === "type") view = <TypeScreen t={t} type={type} setType={setType} onNext={() => setStage("info")} onBack={() => setStage("lang")} />;
  else if (stage === "info") view = <InfoScreen t={t} type={type} onBack={() => setStage("type")} onSubmit={(p) => { setProfile(p); setStage("splash"); }} />;
  else if (stage === "splash") view = <Splash onDone={() => setStage("app")} />;
  else view = (
    <div className="mx-auto min-h-screen max-w-3xl">
      <AppHeader cartCount={cartCount} onCart={() => setTab("cart")} onSettings={() => setTab("settings")} />
      {tab === "home" && <><HomeTab t={t} products={products} cart={cart} onQty={changeQty} /><ContactFooter t={t} /></>}
      {tab === "cart" && <CartTab t={t} products={products} cart={cart} onQty={changeQty} onOrder={() => { setSendError(null); setCheckout(true); }} />}
      {tab === "orders" && <OrdersTab t={t} products={products} orders={orders} />}
      {tab === "settings" && <SettingsTab t={t} lang={lang} setLang={setLang} />}
      {tab === "profile" && profile && <ProfileTab t={t} profile={profile} onEdit={() => { setStage("lang"); setTab("home"); }} />}
      {checkout && <CheckoutModal t={t} profile={profile} lines={lines} total={cartTotal} busy={busy} error={sendError} onConfirm={confirmOrder} onClose={() => setCheckout(false)} />}
      {done && <ReceiptModal t={t} info={done} onClose={() => { setDone(null); setTab("orders"); }} />}
      <BottomNav t={t} tab={tab} setTab={setTab} />
    </div>
  );

  return <div className="min-h-screen bg-slate-50 text-slate-900">{view}</div>;
}
