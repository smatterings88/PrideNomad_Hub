import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Define global constants at build time
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "img-src 'self' https://* data: maps.gstatic.com *.googleapis.com *.ggpht.com",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widgets.leadconnectorhq.com https://stcdn.leadconnectorhq.com https://services.leadconnectorhq.com https://*.googleapis.com https://maps.googleapis.com https://chat-widget.pages.dev",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.leadconnectorhq.com https://stcdn.leadconnectorhq.com https://services.leadconnectorhq.com wss://*.firebaseio.com https://api.bigdatacloud.net https://ipapi.co https://maps.googleapis.com https://chat-widget.pages.dev",
        "frame-src 'self' https://*.leadconnectorhq.com https://*.google.com https://chat-widget.pages.dev",
        "worker-src 'self' blob:",
        "child-src blob: https://*.google.com"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore']
  }
});