import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// DEMO=1 VITE_DEMO=1 npm run build -> bitta faylli demo uchun (rasmlar ichiga joylanadi, server yo'q)
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3001" } }, // dev paytida /api ni backendga yo'naltiradi
  build: { assetsInlineLimit: process.env.DEMO ? 100000000 : 4096 },
});
