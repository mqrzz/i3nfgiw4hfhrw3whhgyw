// firebase-messaging-sw.js
//
// ВАЖНО: этот файл должен лежать в КОРНЕ домена — antviz.ru/firebase-messaging-sw.js,
// а не в подпапке. Scope service worker'а по умолчанию — это директория,
// в которой он находится (и всё, что глубже). Если положить его, например,
// в /profile/firebase-messaging-sw.js, push будет работать только пока
// открыта вкладка внутри /profile/*, а не для всего сайта.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Те же публичные значения, что в firebase-config.js — они не секретны,
// это просто идентификатор проекта для клиентского SDK, не сервисный ключ.
firebase.initializeApp({
  apiKey: "AIzaSyBLGr2hpmnmj1Mxf9072m8vQXJkLUN6YyY",
  authDomain: "antviz-515c8.firebaseapp.com",
  projectId: "antviz-515c8",
  storageBucket: "antviz-515c8.firebasestorage.app",
  messagingSenderId: "140073712504",
  appId: "1:140073712504:web:8a844268e38229cebde68d",
});

const messaging = firebase.messaging();

// Срабатывает, когда вкладка сайта ЗАКРЫТА или не в фокусе — ровно то самое
// системное уведомление в браузере/ОС, ради которого всё затевалось.
// Когда вкладка открыта и активна, это событие не летит — там уведомление
// показывает сам сайт через onMessage() (см. profile.html).
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Antviz';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  self.registration.showNotification(title, {
    body,
    icon: '/img/favicon.png',
    badge: '/img/favicon.png',
    data: { url: payload.fcmOptions?.link || payload.data?.link || 'https://antviz.ru/profile/notifications' },
  });
});

// Клик по системному уведомлению — открыть сайт, а если вкладка уже открыта
// где-то — просто переключиться на неё, а не плодить новую.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://antviz.ru/profile/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('antviz.ru') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
