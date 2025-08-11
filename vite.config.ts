import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      'node:crypto': path.resolve(__dirname, 'src/crypto-polyfill.ts'),
      'crypto': path.resolve(__dirname, 'src/crypto-polyfill.ts'),
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process']
  },
  server: {
    allowedHosts: ['my.local']
  }
})
