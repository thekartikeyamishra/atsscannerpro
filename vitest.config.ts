import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    // Node environment: everything under test is server-side logic. Component
    // tests would need jsdom, which is a separate (worthwhile) project.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    // Mirrors the "@/*" -> "./src/*" mapping in tsconfig.json so the modules
    // under test resolve their own imports identically to the app build.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
