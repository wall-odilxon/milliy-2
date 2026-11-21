#!/bin/bash
# Zipdagi loyihani GitHub repo'ga (eski kod o'rniga) yuklaydi. Eski kod GitHub tarixida saqlanib qoladi.
# Ishlatish:   bash upload-to-github.sh [zip-fayl-yo'li]
# Zip ko'rsatilmasa:  ~/Downloads/bozorcha.zip
REPO_URL="${REPO_URL:-https://github.com/wall-odilxon/muksinov_19.git}"
ZIP="${1:-$HOME/Downloads/bozorcha.zip}"

if [ ! -f "$ZIP" ]; then echo "XATO: zip topilmadi: $ZIP"; echo "Zip yo'lini oxirida yozing:  bash upload-to-github.sh /yo'l/bozorcha.zip"; exit 1; fi
if ! command -v git >/dev/null; then echo "XATO: git o'rnatilmagan."; exit 1; fi

WORK="$(mktemp -d)"
echo "1) Repo yuklanmoqda: $REPO_URL"
git clone -q "$REPO_URL" "$WORK/repo" || { echo "XATO: repo'ni yuklab bo'lmadi (manzil yoki GitHub ruxsatini tekshiring)."; exit 1; }
cd "$WORK/repo" || exit 1

echo "2) Eski fayllar o'chirilmoqda (.git qoladi)"
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

echo "3) Yangi loyiha joylanmoqda"
unzip -q "$ZIP" -d "$WORK/new" || { echo "XATO: zipni ochib bo'lmadi."; exit 1; }
SRC="$WORK/new/bozorcha"; [ -d "$SRC" ] || SRC="$WORK/new"
cp -R "$SRC/." .
rm -rf node_modules dist .env

for f in package.json api/order.js api/health.js server/order.js src/App.jsx; do
  [ -f "$f" ] || { echo "XATO: zipda $f yo'q. To'liq bozorcha.zip kerak."; exit 1; }
done

echo "4) GitHub'ga yuborilmoqda"
git add -A
if git diff --cached --quiet; then echo "O'zgarish yo'q: repo allaqachon shu holatda."; exit 0; fi
git commit -q -m "Milliy: to'liq yangilanish (Telegram buyurtma, Vercel funksiyalari)"
git push -q origin HEAD || { echo "XATO: push bo'lmadi (GitHub ruxsati: gh auth login yoki token kerak bo'lishi mumkin)."; exit 1; }

echo ""
echo "TAYYOR! Kod GitHub'ga yuklandi. Vercel o'zi qayta quradi (1-2 daqiqa)."
echo "Keyingi qadamlar:"
echo "  1) Vercel > Settings > Environment Variables: TG_BOT_TOKEN va TG_CHAT_ID"
echo "  2) Vercel > Deployments > Redeploy"
echo "  3) Tekshirish: https://SAYTINGIZ.vercel.app/api/health  ->  {\"ok\":true,\"telegram\":true}"
