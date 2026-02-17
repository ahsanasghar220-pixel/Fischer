var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import http from 'http';
// Make CSS non-render-blocking in production build
// Critical CSS is already inlined in index.html <style> tags
function asyncCssPlugin() {
    return {
        name: 'async-css',
        enforce: 'post',
        transformIndexHtml: function (html) {
            // Replace stylesheet links with async pattern (only for built CSS, not Google Fonts which is already async)
            return html.replace(/<link rel="stylesheet"(?: crossorigin)? href="(\/assets\/[^"]+\.css)">/g, '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="$1"></noscript>');
        },
    };
}
// Custom proxy plugin to work around http-proxy incompatibility with Node 24
function manualProxy() {
    var BACKEND = { hostname: '127.0.0.1', port: 80 };
    var PATH_PREFIX = '/fischer/backend/public';
    return {
        name: 'manual-proxy',
        configureServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                var _a, _b;
                if (!((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/api')) && !((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith('/storage'))) {
                    return next();
                }
                var proxyReq = http.request({
                    hostname: BACKEND.hostname,
                    port: BACKEND.port,
                    path: PATH_PREFIX + req.url,
                    method: req.method,
                    headers: __assign(__assign({}, req.headers), { host: BACKEND.hostname }),
                }, function (proxyRes) {
                    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                    proxyRes.pipe(res);
                });
                proxyReq.on('error', function (err) {
                    console.error('Proxy error:', err.message);
                    if (!res.headersSent) {
                        res.writeHead(502);
                        res.end('Proxy error');
                    }
                });
                req.pipe(proxyReq);
            });
        },
    };
}
export default defineConfig({
    plugins: [react(), asyncCssPlugin(), manualProxy()],
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
                manualChunks: function (id) {
                    // Critical path optimization - keep core small
                    if (id.includes('node_modules')) {
                        // Core React libraries + essential peer deps - highest priority
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') ||
                            id.includes('use-sync-external-store') || id.includes('scheduler')) {
                            return 'vendor-core';
                        }
                        // Framer Motion - lazy load this
                        if (id.includes('framer-motion')) {
                            return 'animations';
                        }
                        // Headless UI - used in header/modals
                        if (id.includes('@headlessui')) {
                            return 'ui-components';
                        }
                        // Icons - split by type for better caching
                        if (id.includes('@heroicons/react/24/outline')) {
                            return 'icons-outline';
                        }
                        if (id.includes('@heroicons/react/24/solid')) {
                            return 'icons-solid';
                        }
                        // Data fetching
                        if (id.includes('@tanstack/react-query')) {
                            return 'data-query';
                        }
                        // Toast
                        if (id.includes('react-hot-toast')) {
                            return 'toast';
                        }
                        // State management
                        if (id.includes('zustand')) {
                            return 'state';
                        }
                        // Charts - only used in admin, keep separate
                        if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
                            return 'charts';
                        }
                        // Other node_modules
                        return 'vendor-misc';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
