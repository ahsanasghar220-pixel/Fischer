import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost/fischer/backend/public',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost/fischer/backend/public',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Target modern browsers for smaller bundle size
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
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
            // Other node_modules
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
