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
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Tách riêng các thư viện nặng ra khỏi logic trang chủ của bạn
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Gom tất cả các animation framework nặng (nếu có) ra 1 tệp riêng để tải sau
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-animation';
            }
            // Gom các gói cốt lõi
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor-others';
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