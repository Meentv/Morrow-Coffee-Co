import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/** Multi-page config so every page is included in the production build. */
export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        menu: fileURLToPath(new URL("./menu.html", import.meta.url)),
        kitchen: fileURLToPath(new URL("./kitchen.html", import.meta.url)),
        order: fileURLToPath(new URL("./order.html", import.meta.url)),
        contact: fileURLToPath(new URL("./contact.html", import.meta.url)),
      },
    },
  },
});
