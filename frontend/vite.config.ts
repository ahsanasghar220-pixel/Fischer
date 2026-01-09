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
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI component libraries
          ui: ['@headlessui/react', 'framer-motion'],
          // Icons - separate chunk as they're large
          icons: ['@heroicons/react'],
          // Data fetching
          query: ['@tanstack/react-query'],
          // Toast notifications
          toast: ['react-hot-toast'],
          // State management
          state: ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
