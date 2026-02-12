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
        rollupOptions: {
            output: {
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
