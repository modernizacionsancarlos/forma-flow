import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGlobalLogger } from './utils/logger'

// Inicializar logger de errores global
initGlobalLogger();

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (import.meta.env.DEV || !isLocalhost) {
    // Fuerza actualización limpia para evitar bundles obsoletos en runtime.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
