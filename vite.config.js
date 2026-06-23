import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Ép gộp CSS vào JS bằng cách can thiệp sâu vào cấu hình đầu ra (Rollup)
    cssInjectedByJsPlugin(),
  ],
  // Tự động điều chỉnh base path tùy thuộc môi trường build (GitHub Actions hoặc Cloudflare)
  base: process.env.GITHUB_ACTIONS ? '/testReact/' : '/',
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Định nghĩa alias @ trỏ vào thư mục src
    },
  },

  build: {
    // 1. TỐI ƯU CORE VITE: Vô hiệu hóa việc tự động tách file CSS của Vite
    cssCodeSplit: false,

    // 2. TỐI ƯU TAILWIND V4: Ép bộ đóng gói (Rollup) cấu hình asset inline hoàn toàn
    rollupOptions: {
      output: {
        // Nếu file CSS nhỏ hơn 50KB, Rollup sẽ tự động biến nó thành asset inline nếu có thể
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // Tự động dọn dẹp các log console.log khi build ra bản production để giảm dung lượng file JS
    minify: 'esbuild',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})