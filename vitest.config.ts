import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Automatically syncs with tsconfig.json paths
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    css: false,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", "dist", ".next", "**/*.config.*"],
    },
    mockReset: true,
    restoreMocks: true,
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": "/", // Explicitly map @ to src directory
    },
  },
});
