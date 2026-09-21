import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        dashboard: fileURLToPath(new URL("./index.html", import.meta.url)),
        landing: fileURLToPath(
          new URL("./landing/index.html", import.meta.url),
        ),
      },
    },
  },
  server: {
    port: 3000,
  },
});
