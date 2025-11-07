// Firebase Messaging Service Worker v5.0 - MODO PUSH NATIVO
console.log('[SW] Service Worker v5.0 carregando...');

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

// ⚡ MÉTODO 1: Evento PUSH NATIVO (funciona com app fechado)
self.addEventListener('push', (event) => {
  console.log('[SW] 🔥 PUSH EVENT recebido!', event);
  
  let data = {};
  let notificationTitle = 'Nova Notificação';
  let notificationBody = '';
  
  try {
    if (event.data) {
      data = event.data.json();
      console.log('[SW] 📦 Dados do push:', JSON.stringify(data, null, 2));
      
      // FCM envia os dados em diferentes formatos dependendo da plataforma
      notificationTitle = data.notification?.title || data.data?.title || data.title || 'Nova Notificação';
      notificationBody = data.notification?.body || data.data?.body || data.body || '';
    }
  } catch (e) {
    console.error('[SW] ❌ Erro ao processar dados do push:', e);
    // Se falhar ao parsear, tenta pegar os dados raw
    notificationTitle = 'Nova Mensagem';
    notificationBody = event.data ? event.data.text() : 'Você recebeu uma nova notificação';
  }
  
  const notificationOptions = {
    body: notificationBody,
    icon: data.notification?.icon || data.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: 'am2-push-' + Date.now(),
    requireInteraction: true,
    silent: false,
    vibrate: [300, 100, 300, 100, 300],
    timestamp: Date.now(),
    renotify: true,
    sticky: true,
    dir: 'ltr',
    lang: 'pt-BR',
    data: {
      url: '/',
      timestamp: Date.now(),
      ...data
    },
    actions: [
      { action: 'open', title: '✅ Abrir' },
      { action: 'close', title: '❌ Fechar' }
    ]
  };

  console.log('[SW] 📢 Exibindo notificação via PUSH EVENT:', notificationTitle, notificationOptions);
  
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// ⚡ MÉTODO 2: onBackgroundMessage do Firebase (backup)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] ✅ Mensagem recebida via onBackgroundMessage:', JSON.stringify(payload, null, 2));

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nova Notificação';
  const notificationBody = payload.notification?.body || payload.data?.body || '';
  
  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || payload.data?.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: 'am2-fcm-' + Date.now(),
    requireInteraction: true,
    silent: false,
    vibrate: [300, 100, 300, 100, 300],
    timestamp: Date.now(),
    renotify: true,
    sticky: true,
    dir: 'ltr',
    lang: 'pt-BR',
    data: {
      url: '/',
      timestamp: Date.now(),
      ...payload.data
    },
    actions: [
      { action: 'open', title: '✅ Abrir' },
      { action: 'close', title: '❌ Fechar' }
    ]
  };

  console.log('[SW] 📢 Exibindo notificação via FCM:', notificationTitle, notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notificação clicada:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    console.log('[SW] Notificação fechada pelo usuário');
    return;
  }

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

// Log quando o SW é instalado
self.addEventListener('install', (event) => {
  console.log('[SW] 📥 Service Worker instalado');
  self.skipWaiting(); // Ativa imediatamente
});

// Log quando o SW é ativado
self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Service Worker ativado');
  event.waitUntil(clients.claim()); // Toma controle imediatamente
});

// Heartbeat para manter o SW ativo
self.addEventListener('message', (event) => {
  console.log('[SW] 💬 Mensagem recebida do cliente:', event.data);
  
  if (event.data && event.data.type === 'HEARTBEAT') {
    console.log('[SW] ❤️ Heartbeat recebido, SW está ativo');
    event.ports[0].postMessage({ type: 'HEARTBEAT_RESPONSE', timestamp: Date.now() });
  }
});

console.log('[SW] Service Worker totalmente carregado e pronto!');