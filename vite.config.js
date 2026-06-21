import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  // Sử dụng luôn biến GITHUB_ACTIONS (chỉ tồn tại khi build ở GitHub)
  base: process.env.GITHUB_ACTIONS ? '/testReact/' : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 2. Định nghĩa alias @ trỏ vào thư mục src
    },
  },
})

