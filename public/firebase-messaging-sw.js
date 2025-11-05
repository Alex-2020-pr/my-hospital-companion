// Firebase Messaging Service Worker v1.1 - Debug version
console.log('[SW] Service Worker carregando...');

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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] ✅ Mensagem recebida via onBackgroundMessage:', payload);

  const notificationTitle = payload.notification?.title || 'Nova Notificação';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: payload.data?.notificationId || 'notification-' + Date.now(),
    requireInteraction: false,
    renotify: false,
    silent: false,
    vibrate: [200, 100, 200],
    data: payload.data || {}
  };

  console.log('[SW] 📢 Exibindo notificação:', notificationTitle, notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// REMOVIDO: Este listener estava causando notificações duplicadas
// O Firebase Messaging já gerencia os eventos de push através do onBackgroundMessage

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notificação clicada:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
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

console.log('[SW] Service Worker totalmente carregado e pronto!');