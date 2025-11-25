// Firebase Messaging Service Worker v7.0 - FIX DUPLICATAS
console.log('[SW] Service Worker v7.0 carregando...');

// ===== CACHE E PWA =====
const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `am2-cache-${CACHE_VERSION}`;

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

console.log('[SW] Scripts do Firebase carregados');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCM4dZtxd7AA5daMjiRwoGKKpMgVWhLuOg",
  authDomain: "am2app.firebaseapp.com",
  projectId: "am2app",
  storageBucket: "am2app.firebasestorage.app",
  messagingSenderId: "99193179565",
  appId: "1:99193179565:web:1202f7b4873336e915e524",
  measurementId: "G-6FEGM33YZD"
};

firebase.initializeApp(firebaseConfig);
console.log('[SW] Firebase inicializado');

const messaging = firebase.messaging();
console.log('[SW] Messaging configurado, aguardando mensagens...');

// ⚡ Handler do Firebase para notificações em background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] ✅ Mensagem recebida:', JSON.stringify(payload, null, 2));

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nova Notificação';
  const notificationBody = payload.notification?.body || payload.data?.body || '';
  
  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || payload.data?.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: 'am2-notification', // Tag fixa para evitar duplicatas
    requireInteraction: true,
    silent: false,
    vibrate: [300, 100, 300, 100, 300],
    timestamp: Date.now(),
    renotify: true,
    data: {
      url: '/',
      timestamp: Date.now(),
      ...payload.data
    }
  };

  console.log('[SW] 📢 Exibindo notificação:', notificationTitle);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notificação clicada');
  event.notification.close();

  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('[SW] Clientes encontrados:', clientList.length);
      
      // Se já existe uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('[SW] Focando em cliente existente');
          return client.focus();
        }
      }
      
      // Caso contrário, abrir nova janela
      if (clients.openWindow) {
        const url = event.notification.data?.url || '/';
        console.log('[SW] Abrindo nova janela:', url);
        return clients.openWindow(url);
      }
    })
  );
});

// ===== INSTALAÇÃO COM CACHE =====
self.addEventListener('install', (event) => {
  console.log('[SW] 📥 Service Worker instalado - versão:', CACHE_VERSION);
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

// ===== ATIVAÇÃO COM LIMPEZA DE CACHE =====
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Service Worker ativado - versão:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediatamente
      clients.claim()
    ])
  );
  
  // Notificar clientes sobre atualização
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
    });
  });
});

// ===== MENSAGENS (HEARTBEAT + CACHE) =====
self.addEventListener('message', (event) => {
  console.log('[SW] 💬 Mensagem recebida do cliente:', event.data);
  
  if (event.data && event.data.type === 'HEARTBEAT') {
    console.log('[SW] ❤️ Heartbeat recebido, SW está ativo');
    event.ports[0].postMessage({ type: 'HEARTBEAT_RESPONSE', timestamp: Date.now() });
  }
  
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

console.log('[SW] Service Worker totalmente carregado e pronto!');