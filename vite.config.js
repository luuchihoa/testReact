import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'tối-ưu-css-không-chặn-render',
      // Biến đổi file index.html sau khi Vite đã dựng xong cấu trúc tệp
      transformIndexHtml(html) {
        // Tìm thẻ link CSS mà Vite tự chèn vào và biến nó thành tải bất đồng bộ (ngầm)
        return html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
          '<link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\'">'
        );
      }
    }
  ],
  
  base: process.env.GITHUB_ACTIONS ? '/testReact/' : '/',
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600, // Tăng nhẹ giới hạn để tránh cảnh báo thừa
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Gom các animation framework cốt lõi (Tải sau)
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-animation';
            }
            
            // 2. Gom React + tất cả các thư viện phụ thuộc trực tiếp vào lõi React (Đảm bảo không lệch context)
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react-router') || 
              id.includes('lucide-react') || 
              id.includes('framer-motion')
            ) {
              return 'vendor-react-core';
            }
            
            // 3. Các thư viện tiện ích độc lập khác (nếu có)
            return 'vendor-utils';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
      },
    },
    minify: 'esbuild',
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }
})