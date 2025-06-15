// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Tenzie-Game/', // <-- IMPORTANT for GitHub Pages
  plugins: [react()]
})
