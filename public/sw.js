// ⚠️ ESTE SERVICE WORKER FOI DESATIVADO ⚠️
// 
// O projeto agora usa um único service worker consolidado:
// firebase-messaging-sw.js
//
// Isso evita conflitos e garante que as notificações push funcionem
// corretamente em todos os dispositivos.
//
// NÃO REATIVE ESTE ARQUIVO - ele causará problemas!

console.log('[SW ANTIGO] Este SW foi desativado. Use firebase-messaging-sw.js');

// Desativa este service worker automaticamente

// Evento de instalação com cache busting
self.addEventListener('install', function(event) {
  console.log('Service Worker instalado - versão:', CACHE_VERSION);
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/favicon.png'
      ]);
    })
  );
});

// Evento de ativação com limpeza de caches antigos
self.addEventListener('activate', function(event) {
  console.log('Service Worker ativado - versão:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Limpar todos os caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediatamente
      clients.claim()
    ])
  );
  
  // Notificar todos os clientes sobre a atualização
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: CACHE_VERSION
      });
    });
  });
});

// Mensagem para forçar atualização
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
