import { useState, useEffect } from 'react';

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Verificar se há atualização disponível
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      
      // Verificar por atualizações a cada 60 segundos
      const interval = setInterval(() => {
        reg.update();
      }, 60000);

      return () => clearInterval(interval);
    });

    // Escutar por novos service workers instalando
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!navigator.serviceWorker.controller) return;
      console.log('Novo Service Worker detectado');
      setUpdateAvailable(true);
    });

    // Escutar mensagens do service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('Service Worker atualizado para versão:', event.data.version);
        setUpdateAvailable(true);
      }
    });

  }, []);

  const applyUpdate = () => {
    if (!registration || !registration.waiting) {
      window.location.reload();
      return;
    }

    // Pedir ao service worker para tomar controle
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Recarregar após um pequeno delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const clearCacheAndReload = () => {
    // Limpar todos os caches
    if ('caches' in window) {
      caches.keys().then((names: string[]) => {
        Promise.all(names.map((name: string) => caches.delete(name)));
      });
    }

    // Enviar mensagem para o service worker se disponível
    if (registration?.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
    
    // Recarregar a página
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return {
    updateAvailable,
    applyUpdate,
    clearCacheAndReload
  };
};
