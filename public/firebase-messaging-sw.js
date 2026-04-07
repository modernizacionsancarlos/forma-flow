import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyArkS3n2DgsSc6rk_cvhQW1GWE4K_wc6i0",
  authDomain: "formflow-central-cdbaa.firebaseapp.com",
  projectId: "formflow-central-cdbaa",
  storageBucket: "formflow-central-cdbaa.firebasestorage.app",
  messagingSenderId: "537198713998",
  appId: "1:537198713998:web:3848029cd0da6395963ddf",
  measurementId: "G-SDC74MDWMD"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Background message received: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
