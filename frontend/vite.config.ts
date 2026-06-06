import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

const fixNode22BugPlugin = () => ({
  name: 'fix-node-22-bug',
  configureServer(server: any) {
    if (server.httpServer && typeof server.httpServer.shouldUpgradeCallback !== 'function') {
      server.httpServer.shouldUpgradeCallback = () => true;
    }
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    fixNode22BugPlugin()
  ],
  server: {
    proxy: {
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