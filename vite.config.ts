import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {}
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sauo: resolve(__dirname, 'sauo/index.html')
      },
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts'
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion') || id.includes('node_modules/lenis')) {
            return 'vendor-motion'
          }
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark-gfm')) {
            return 'vendor-markdown'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
