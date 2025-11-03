import { useState, useEffect } from 'react';

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let interval: NodeJS.Timeout;

    const checkForUpdate = (reg: ServiceWorkerRegistration) => {
      // Verificar se há um service worker waiting
      if (reg.waiting) {
        console.log('Service Worker waiting detectado');
        setUpdateAvailable(true);
      }
    };

    // Verificar se há atualização disponível
    navigator.serviceWorker.ready.then((reg) => {
      // Ignorar o Firebase Service Worker
      if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
        return;
      }
      
      setRegistration(reg);
      checkForUpdate(reg);
      
      // Verificar por atualizações a cada 60 segundos
      interval = setInterval(() => {
        reg.update().then(() => {
          checkForUpdate(reg);
        });
      }, 60000);

      // Verificar quando um novo SW está instalando
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        
        // Ignorar Firebase Service Worker
        if (newWorker.scriptURL.includes('firebase-messaging-sw.js')) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nova versão do Service Worker instalada');
            setUpdateAvailable(true);
          }
        });
      });
    });

    // Escutar por novos service workers assumindo o controle
    const controllerChangeHandler = () => {
      console.log('Controller change detectado');
      setUpdateAvailable(true);
    };

    // Escutar mensagens do service worker
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        // Verificar se a mensagem vem do app SW, não do Firebase
        if (event.source && (event.source as any).scriptURL?.includes('firebase-messaging-sw.js')) {
          return;
        }
        console.log('Service Worker atualizado para versão:', event.data.version);
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
    navigator.serviceWorker.addEventListener('message', messageHandler);

    return () => {
      if (interval) clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      navigator.serviceWorker.removeEventListener('message', messageHandler);
    };
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

  const clearCacheAndReload = async () => {
    // Limpar todos os caches
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name: string) => caches.delete(name)));
    }

    // Enviar mensagem apenas para o app service worker
    if (registration?.active && registration.scope.includes('/sw.js')) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
    
    // Recarregar a página sem afetar o Firebase SW
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
