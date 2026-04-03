import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// Use the backend's uploaded SSL cert for Vite HTTPS if one exists.
// This lets passkeys work over a custom domain in dev without Traefik.
const sslCertsDir = path.resolve(__dirname, '../backend/ssl-certs');
const certFile = path.join(sslCertsDir, 'custom.crt');
const keyFile  = path.join(sslCertsDir, 'custom.key');
const hasCustomCert = fs.existsSync(certFile) && fs.existsSync(keyFile);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // bind 0.0.0.0 so external DNS resolves to this machine
    https: hasCustomCert
      ? { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) }
      : undefined,
    proxy: {
      '/api': 'http://localhost:3000',
      '/env.js': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          // Charts library (heavy)
          'vendor-charts': ['recharts'],
          // Maps library (heavy)
          'vendor-maps': ['leaflet', 'react-leaflet'],
          // Form handling
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
})
