import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  appType: 'mpa', // serve mobile.html directly, no SPA index.html fallback
  server: {
    port: 5174,
    open: '/mobile.html',
  },
})
