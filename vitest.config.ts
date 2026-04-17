/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/main.jsx',
        'src/**/*.d.ts',
      ],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
