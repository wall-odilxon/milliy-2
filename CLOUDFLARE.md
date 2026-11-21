# Cloudflare'ga joylash (Workers)

Sayt (dist/) va backend (worker/index.js) bitta Cloudflare Worker sifatida ishlaydi.
Buyurtma -> /api/order -> Telegram. Token faqat Cloudflare "Secrets" ichida turadi.

## 1. Tayyorgarlik
- Bepul akkaunt: https://dash.cloudflare.com/sign-up
- Node.js (LTS)
- loyiha papkasida:  npm install

## 2. (Ixtiyoriy) Lokal sinov
    cp .dev.vars.example .dev.vars     # ichiga TG_BOT_TOKEN va TG_CHAT_ID ni yozing
    npm run cf:dev                     # http://localhost:8787
.env faylini Cloudflare o'qimaydi, lokal sinov uchun .dev.vars ishlatiladi.

## 3. Cloudflare'ga kirish (bir marta)
    npx wrangler login
Brauzer ochiladi, "Allow" bosing.

## 4. Joylash
    npm run cf:deploy
Birinchi marta workers.dev uchun nom so'rashi mumkin (masalan "milliy"). Oxirida manzil chiqadi:
    https://milliy.<sizning-nom>.workers.dev

## 5. Token va chat ID (Secrets)
    npx wrangler secret put TG_BOT_TOKEN
    npx wrangler secret put TG_CHAT_ID
Har biri so'raganda qiymatni qo'ying (yozilgani ekranda ko'rinmaydi) va Enter bosing.

## 6. Tekshirish
    https://milliy.<sizning-nom>.workers.dev/api/health
    -> {"ok":true,"telegram":true}
Keyin saytda buyurtma bering: chek chiqadi va botga xabar keladi.

## Keyingi o'zgarishlar
Kodni o'zgartirgach:  npm run cf:deploy
Jonli loglar (xatolarni ko'rish):  npx wrangler tail

## GitHub'dan avtomatik joylash (ixtiyoriy)
Cloudflare Dashboard > Workers & Pages > Create > Git repo'ga ulash.
Build command: npm run build   |   Deploy command: npx wrangler deploy
Secrets: Worker > Settings > Variables and Secrets (turi: Secret).

## Muammolar
- telegram:false      -> 5-qadam bajarilmagan
- 404 / bo'sh sayt    -> "wrangler deploy"ni alohida emas, "npm run cf:deploy" bilan joylang (u avval saytni quradi)
- nom band            -> wrangler.jsonc dagi "name" ni o'zgartiring
- 502 / 403 / 400     -> npx wrangler tail da sababi yoziladi (chat not found: botga Start bosing; 403: chat ID o'rniga bot ID yozilgan)
