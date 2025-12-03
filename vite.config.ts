import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert() // Tạo chứng chỉ HTTPS ảo
  ],
  server: {
    proxy: {
      // Chuyển mọi request bắt đầu bằng /api sang Backend ở cổng 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false, 
    manifest: false,
    minify: 'esbuild',
  },
})