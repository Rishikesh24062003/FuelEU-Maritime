import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/// <reference types="vitest" />
/// <reference types="vite/client" />

// https://vitejs.dev/config/
export default defineConfig({
  // Cast to any to avoid type mismatch between vitest/vite plugin typings
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
