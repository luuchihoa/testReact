import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 1. Import module path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 2. Định nghĩa alias @ trỏ vào thư mục src
    },
  },
})

