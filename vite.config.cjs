const path = require('path')
const react = require('@vitejs/plugin-react').default
const { defineConfig } = require('vite')

// Usamos require para evitar problemas de ESM loader en rutas con caracteres especiales en Windows
module.exports = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('recharts')) return 'vendor-charts';
            return 'vendor'; // Otras dependencias
          }
        }
      }
    }
  }
})
