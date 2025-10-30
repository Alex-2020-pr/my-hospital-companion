// Service Worker para notificações push com controle de versão
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `am2-cache-${CACHE_VERSION}`;

// Precache manifest injected by vite-plugin-pwa
const precacheManifest = self.__WB_MANIFEST || [];

// Service Worker para notificações push
self.addEventListener('push', function(event) {
  console.log('Push recebido:', event);
  
  let data = {
    title: 'Nova Notificação',
    body: 'Você tem uma nova notificação',
    icon: '/favicon.png',
    badge: '/favicon.png'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Erro ao parsear dados do push:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada:', event.action);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

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
      }).then(() => {
        return self.registration.unregister();
      }).then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach(client => client.navigate(client.url));
      })
    );
  }
});
