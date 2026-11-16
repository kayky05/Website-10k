import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // a etapa de pré-renderização não precisa copiar fotos e vídeos
  build: { copyPublicDir: !isSsrBuild },
  server: { watch: { ignored: ["**/dist/**", "**/dist-ssr/**"] } },
}));
