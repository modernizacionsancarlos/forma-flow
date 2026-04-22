import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGlobalLogger } from './utils/logger'

// Inicializar logger de errores global
initGlobalLogger();

if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Evita que un Service Worker/caché viejo rompa el flujo en localhost.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
