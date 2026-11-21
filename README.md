# Milliy — internet-do'kon (React + Tailwind + Node.js backend)

Mijoz buyurtmani tasdiqlaydi → brauzer `/api/order` ga yuboradi → **backend** Telegram botga `sendMessage` qiladi.
Bot tokeni faqat serverda (`.env`) turadi, brauzerga chiqmaydi. Narxlarni backend o'zi hisoblaydi.

## Ishga tushirish (kompyuterda)
1. Node.js (LTS) o'rnating: https://nodejs.org
2. `npm install`
3. `cp .env.example .env` va `.env` ni to'ldiring (pastga qarang)
4. `npm run dev`  → sayt http://localhost:5173 (backend avtomatik 3001 portda ishga tushadi)

## .env (faqat serverda o'qiladi)
    TG_BOT_TOKEN=...   # @BotFather bergan token
    TG_CHAT_ID=...     # buyurtmalar keladigan chat ID (guruh bo'lsa -100... bilan)
    PORT=3001

Chat ID olish: botga **Start** bosib xabar yozing, so'ng `@userinfobot` dan ID'ingizni oling.
Chat ID faqat raqam bo'lishi kerak (`7413551630`) yoki guruh uchun manfiy raqam (`-100...`). Qo'shimcha `Id:` belgilarini qo'ymang.
Biror token `.env.example` ichida qolgan bo'lsa, ishlatmaslik uchun @BotFather orqali **Revoke** qiling va yangi token yarating.
`.env` o'zgarsa, `npm run dev` ni to'xtatib qayta ishga tushiring.

## Haqiqiy serverga qo'yish (production)
    npm install
    npm run build      # saytni dist/ ga yig'adi
    npm start          # backend + tayyor saytni birga beradi (PORT)
`.env` ni serverda yarating (Render, Railway, VPS va h.k.). Faqat statik hosting (oddiy Netlify) backendni ishlata olmaydi.

## Vercel'ga qo'yish (GitHub orqali)
Sayt Vercel'da turadi, backend esa `api/` papkasidagi Vercel funksiyalari (`api/order.js`, `api/health.js`) sifatida ishlaydi.
1. Kodni GitHub'ga yuboring (`git add . && git commit -m "..." && git push`), Vercel o'zi qayta quradi.
2. Vercel → loyiha → **Settings → Environment Variables** ga ikkita qiymat qo'shing (nomlari aynan shunday, `VITE_` YOZMANG):
   `TG_BOT_TOKEN` va `TG_CHAT_ID`
3. **Deployments → oxirgi deploy → Redeploy** bosing (o'zgaruvchilar faqat yangi deploydan keyin kuchga kiradi).
4. Tekshirish: brauzerda `https://SAYT-NOMI.vercel.app/api/health` ni oching.
   `{"ok":true,"telegram":true}` chiqsa tayyor. `telegram:false` bo'lsa, 2-3 qadamni takrorlang. 404 chiqsa, `api/` papkasi GitHub'ga yuborilmagan.

## Vercel'da xato chiqsa
Buyurtma xatosi oxirida kod ko'rinadi, masalan "(404)":
- `404`   — `api/` papkasi GitHub'da yo'q yoki Vercel deploy'ida yo'q (push qiling va deploy tugashini kuting)
- `503`   — Vercel'da `TG_BOT_TOKEN` / `TG_CHAT_ID` kiritilmagan yoki Redeploy qilinmagan
- `502`   — Telegram rad etdi (chat ID xato yoki botga Start bosilmagan). Vercel > Logs da sababi yozilgan
- `400`   — mijoz ma'lumoti to'liq emas
- `net`   — so'rov serverga yetmadi (internet yoki noto'g'ri manzil)
Tekshirish: `https://SAYT.vercel.app/api/health` -> `{"ok":true,"telegram":true}` bo'lishi kerak.

## GitHub'ga yuklash
`bash upload-to-github.sh` — `bozorcha.zip` ni (Downloads ichida) GitHub repo'ga o'zi yuklaydi.

## Fayllar
    server/order.js     buyurtma mantig'i: tekshiruv + Telegram sendMessage (umumiy)
    server/index.js     lokal backend (npm run dev)
    api/                Vercel funksiyalari (haqiqiy saytda backend shu)
    shared/catalog.js   mahsulot nomi va narxlari (frontend va backend uchun YAGONA joy)
    src/App.jsx         butun frontend (BRAND, ADDRESS, PHONE, TELEGRAM shu faylning boshida)
    src/assets/         logo va mahsulot rasmlari
    .env                tokenlar (git'ga qo'shilmaydi)

## API
    POST /api/order  { customer:{firstName,lastName,phone,region,district,address,orgName,type,bizType}, comment, items:[{id,qty}] }
    -> 200 {ok:true,no,total} | 400 {error} | 429 | 502 (Telegram xatosi) | 503 (.env to'ldirilmagan)
    GET  /api/health
