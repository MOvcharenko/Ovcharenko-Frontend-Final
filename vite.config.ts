import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/<repository-name>/', // Replace with your actual repository name for GitHub Pages
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,           // So you don't need to import describe/it/expect
    environment: 'jsdom',    // Simulates browser environment for React components
    setupFiles: './src/test/setup.ts',  // Optional setup file
  }
})