import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // Dev server proxy: forward API calls to the backend running on port 3000
  server: {
    proxy: {
      '/api': {
        target: 'https://daily-snapshot-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
