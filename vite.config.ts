import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Chạy netlify/functions/*.mjs ngay trong `npm run dev` (chỉ GET), để không cần `netlify dev`
function netlifyFunctionsDev(): Plugin {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/\.netlify\/functions\/([\w-]+)/)
        if (!match) return next()
        try {
          const mod = await server.ssrLoadModule(`/netlify/functions/${match[1]}.mjs`)
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
          }
          const response: Response = await mod.default(new Request(`http://localhost${req.url}`, { method: req.method, headers }))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), netlifyFunctionsDev()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {}
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sauo: resolve(__dirname, 'sauo/index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three'
          if (id.includes('node_modules/katex')) return 'vendor-katex'
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/unified') || id.includes('node_modules/micromark') || id.includes('node_modules/mdast')) return 'vendor-markdown'
        }
      }
    }
  }
})
