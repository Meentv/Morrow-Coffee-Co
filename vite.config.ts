import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Allow the sandbox preview host and any tunnel domain.
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: "es2022",
    sourcemap: false,
    /**
     * The only chunk above 500 kB is the Three.js graph (940 kB raw / 252 kB
     * gzip), which is fetched lazily and never appears in the entry preloads.
     * Raising the limit keeps the build output honest instead of noisy.
     */
    chunkSizeWarningLimit: 1000,
    /**
     * Chunking strategy: let Rollup decide.
     *
     * An earlier hand-written `manualChunks` grouped "anything three-ish" into
     * one chunk. Because Vite's `__vitePreload` helper lives in a module that
     * is only reachable from lazy routes, grouping it against Three.js made the
     * *entry* statically import the 940 kB 3D chunk just to get the helper — a
     * modulepreload on every page, exactly the opposite of the goal.
     *
     * Rollup's automatic splitting already isolates the 3D graph correctly:
     * every Three.js consumer is behind `lazy()`, so it forms its own chunk that
     * is only fetched when the hero canvas or a 3D preview mounts. Verified against the
     * built `dist/index.html`, which modulepreloads only the React chunk.
     */
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    restoreMocks: true,
  },
});
