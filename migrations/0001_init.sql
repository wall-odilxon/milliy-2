-- Milliy: admin panel uchun baza. Bir marta bajariladi:  npx wrangler d1 migrations apply milliy-db --remote
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_uz TEXT NOT NULL, name_ru TEXT, name_en TEXT,
  desc_uz TEXT, desc_ru TEXT, desc_en TEXT,
  price INTEGER NOT NULL, old_price INTEGER,
  image TEXT, active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime TEXT NOT NULL, data TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts (ip, at);

-- Hozirgi 7 ta mahsulot (id 0..6: mijozlarning eski savati/buyurtmalari buzilmasligi uchun). Narxlar VAQTINCHALIK.
INSERT INTO products (id, name_uz, name_ru, name_en, desc_uz, desc_ru, desc_en, price, old_price, image) VALUES
  (0, 'Stolichnaya pishirilgan kolbasa', 'Столичная варёная колбаса', 'Stolichnaya cooked sausage', 'Milliy brendining pishirilgan kolbasasi. Sifat — Milliydan!', 'Варёная колбаса бренда Milliy. Качество — от Milliy!', 'Cooked sausage by Milliy. Quality comes from Milliy!', 48000, 55000, '/products/stolichnaya.jpg'),
  (1, 'Milliy Olimp 2024 kolbasa', 'Колбаса Milliy Олимп 2024', 'Milliy Olympics 2024 sausage', 'Maxsus Olimp 2024 o''ramidagi kolbasa. Sifat va ta''m birinchi o''rinda!', 'Колбаса в особой упаковке Олимп 2024. Качество и вкус на первом месте!', 'Sausage in special Olympics 2024 packaging. Quality and taste come first!', 62000, NULL, '/products/olimp.jpg'),
  (2, 'Milliy kolbasa', 'Колбаса Milliy', 'Milliy sausage', 'Tabiiy mahsulot, mazali ta''m, sifat kafolati.', 'Натуральный продукт, вкусная, с гарантией качества.', 'Natural product, great taste, quality guaranteed.', 58000, 66000, '/products/milliy.jpg'),
  (3, 'Milliy kolbasa (to''rli)', 'Колбаса Milliy (в сетке)', 'Milliy sausage (netted)', 'To''rli o''ramdagi Milliy kolbasa. Sifat — Milliydan!', 'Колбаса Milliy в сетчатой упаковке. Качество — от Milliy!', 'Milliy sausage in net packaging. Quality comes from Milliy!', 64000, NULL, '/products/toorli.jpg'),
  (4, 'Milliy yo''l-yo''l kolbasa', 'Полосатая колбаса Milliy', 'Milliy striped sausage', 'Yorqin o''ramdagi Milliy kolbasa, do''kon va supermarketlar uchun.', 'Колбаса Milliy в яркой упаковке для магазинов и супермаркетов.', 'Milliy sausage in bright packaging for shops and supermarkets.', 45000, 52000, '/products/yoyol.jpg'),
  (5, 'Salyami Milliy', 'Салями Milliy', 'Milliy salami', 'Sifat va ta''m birinchi o''rinda!', 'Качество и вкус на первом месте!', 'Quality and taste come first!', 72000, NULL, '/products/salyami.jpg'),
  (6, 'Milliy kolbasa (qizil)', 'Колбаса Milliy (красная)', 'Milliy sausage (red)', 'Milliy brendining mazali kolbasasi. Sifat — Milliydan!', 'Вкусная колбаса бренда Milliy. Качество — от Milliy!', 'Tasty sausage by Milliy. Quality comes from Milliy!', 54000, NULL, '/products/jori.jpg');
