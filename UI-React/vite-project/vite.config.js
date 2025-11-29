import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
  },
  // For production, you might want to proxy API calls
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5047',
        changeOrigin: true,
      }
    }
  }
})
