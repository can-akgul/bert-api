import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Docker container için gerekli
    port: 3000,
    proxy: {
      '/predict': 'http://localhost:9999',
      '/generate': 'http://localhost:9999'
    }
  },
  preview: {
    host: true, // Docker container için gerekli
    port: 3000,
    proxy: {
      '/predict': 'http://localhost:9999',
      '/generate': 'http://localhost:9999'
    }
  }
})
