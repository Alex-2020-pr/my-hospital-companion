// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem recebida em background:', payload);

  const notificationTitle = payload.notification?.title || 'Nova Notificação';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: 'notification-' + Date.now(),
    requireInteraction: true,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200],
    actions: [],
    data: payload.data || {}
  };

  console.log('Exibindo notificação:', notificationTitle);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle push events directly (para iOS e dispositivos que não suportam onBackgroundMessage)
self.addEventListener('push', function(event) {
  console.log('Push event recebido:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Payload do push:', payload);
      
      const notificationTitle = payload.notification?.title || payload.title || 'Nova Notificação';
      const notificationOptions = {
        body: payload.notification?.body || payload.body || '',
        icon: payload.notification?.icon || payload.icon || '/favicon.png',
        badge: '/favicon.png',
        tag: 'notification-' + Date.now(),
        requireInteraction: true,
        renotify: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        data: payload.data || {}
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (e) {
      console.error('Erro ao processar push:', e);
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});