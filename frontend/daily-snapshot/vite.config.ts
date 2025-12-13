import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), Icons()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'https://daily-snapshot-1.onrender.com',
        changeOrigin: true,
        secure: true,
        ws: true
      }
    }
  }
})
