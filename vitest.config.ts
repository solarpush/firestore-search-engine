import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 60_000, // 60s pour tous les tests
    hookTimeout: 60_000, // idem pour les before/after hooks
  },
});
