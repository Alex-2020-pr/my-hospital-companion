// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDummy-key-for-fcm",
  projectId: "seu-projeto-firebase",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
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
    vibrate: [200, 100, 200],
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});