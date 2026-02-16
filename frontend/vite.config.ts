import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import http from 'http'

// Custom proxy plugin to work around http-proxy incompatibility with Node 24
function manualProxy() {
  const BACKEND = { hostname: '127.0.0.1', port: 80 }
  const PATH_PREFIX = '/fischer/backend/public'

  return {
    name: 'manual-proxy',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api') && !req.url?.startsWith('/storage')) {
          return next()
        }

        const proxyReq = http.request(
          {
            hostname: BACKEND.hostname,
            port: BACKEND.port,
            path: PATH_PREFIX + req.url,
            method: req.method,
            headers: { ...req.headers, host: BACKEND.hostname },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
            proxyRes.pipe(res)
          }
        )

        proxyReq.on('error', (err) => {
          console.error('Proxy error:', err.message)
          if (!res.headersSent) {
            res.writeHead(502)
            res.end('Proxy error')
          }
        })

        req.pipe(proxyReq)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), manualProxy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Target modern browsers for smaller bundle size
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Skip compressed size reporting for faster builds
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Prevent too many tiny chunks (better caching, fewer requests)
        experimentalMinChunkSize: 20000,
        manualChunks: (id) => {
          // Critical path optimization - keep core small
          if (id.includes('node_modules')) {
            // Core React libraries - highest priority
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-core'
            }
            // Framer Motion - lazy load this
            if (id.includes('framer-motion')) {
              return 'animations'
            }
            // Headless UI - used in header/modals
            if (id.includes('@headlessui')) {
              return 'ui-components'
            }
            // Icons - split by type for better caching
            if (id.includes('@heroicons/react/24/outline')) {
              return 'icons-outline'
            }
            if (id.includes('@heroicons/react/24/solid')) {
              return 'icons-solid'
            }
            // Data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'data-query'
            }
            // Toast
            if (id.includes('react-hot-toast')) {
              return 'toast'
            }
            // State management
            if (id.includes('zustand')) {
              return 'state'
            }
            // Charts - only used in admin, keep separate
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'charts'
            }
            // Other node_modules
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
