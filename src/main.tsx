import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Register both service workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register app service worker
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('App Service Worker registrado:', registration);
      })
      .catch((error) => {
        console.error('Erro ao registrar App Service Worker:', error);
      });

    // Firebase messaging service worker is registered separately by Firebase SDK
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log('Service Worker atualizado para versão:', event.data.version);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
