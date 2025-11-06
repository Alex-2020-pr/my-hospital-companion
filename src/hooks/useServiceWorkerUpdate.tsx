import { useState, useEffect } from 'react';

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let interval: NodeJS.Timeout;
    let hasShownUpdate = false;

    const checkForUpdate = (reg: ServiceWorkerRegistration) => {
      // Ignora Firebase SW
      if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
        return;
      }

      // Só mostra se houver um SW esperando E ainda não mostrou
      if (reg.waiting && !hasShownUpdate) {
        hasShownUpdate = true;
        console.log('[Update] Service Worker aguardando instalação');
        setUpdateAvailable(true);
        setRegistration(reg);
      }
    };

    // Verificar atualizações
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
        return;
      }
      
      setRegistration(reg);
      checkForUpdate(reg);
      
      // Verificar a cada 5 minutos (não a cada minuto para evitar overhead)
      interval = setInterval(() => {
        reg.update().then(() => checkForUpdate(reg));
      }, 300000);

      // Detectar novo SW instalando
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker || newWorker.scriptURL.includes('firebase-messaging-sw.js')) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !hasShownUpdate) {
            hasShownUpdate = true;
            console.log('[Update] Nova versão instalada');
            setUpdateAvailable(true);
          }
        });
      });
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const applyUpdate = () => {
    if (!registration || !registration.waiting) {
      window.location.reload();
      return;
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => window.location.reload(), 500);
  };

  const clearCacheAndReload = async () => {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name: string) => caches.delete(name)));
    }

    if (registration?.active && !registration.active.scriptURL.includes('firebase-messaging-sw.js')) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
    
    setTimeout(() => window.location.reload(), 500);
  };

  return {
    updateAvailable,
    applyUpdate,
    clearCacheAndReload
  };
};
