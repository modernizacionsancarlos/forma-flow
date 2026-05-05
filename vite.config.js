/* global __dirname */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // "prompt": no activa el nuevo SW solo; evita recargas de página mientras se escribe.
      // La actualización ocurre cuando el usuario pulsa "Actualizar" en ReloadPrompt.
      registerType: 'prompt',
      workbox: {
        cleanupOutdatedCaches: true,
        // Hasta que el usuario confirme la actualización, el SW no toma el control de pestañas abiertas.
        clientsClaim: false,
        skipWaiting: false,
      },
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'og-image.png'],
      manifest: {
        name: 'FormaFlow - Gestión Municipal',
        short_name: 'FormaFlow',
        description: 'Plataforma líder para la modernización de trámites municipales con soporte offline.',
        theme_color: '#060b13',
        background_color: '#060b13',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('recharts')) return 'vendor-charts';
            return 'vendor'; // Other dependencies
          }
        }
      }
    }
  }
})
