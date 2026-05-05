import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGlobalLogger } from './utils/logger'

// Inicializar logger de errores global
initGlobalLogger();

// Solo en desarrollo: quita SW heredados para no interferir con Vite/HMR.
// En producción dejamos que vite-plugin-pwa gestione el ciclo de vida (modo "prompt").
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
