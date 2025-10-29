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

// Evento de instalação
self.addEventListener('install', function(event) {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', function(event) {
  console.log('Service Worker ativado');
  event.waitUntil(clients.claim());
});
