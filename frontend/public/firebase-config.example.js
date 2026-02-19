// Copy this file to firebase-config.js and fill in your Firebase project values.
// Get them from: Firebase Console > Project Settings > General (your apps) and Cloud Messaging (Web Push certificates).

window.STUDENT_PUSH_FIREBASE_CONFIG = {
  apiKey: 'YOUR_WEB_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
// VAPID key from Cloud Messaging > Web Push certificates (Key pair).
window.STUDENT_PUSH_VAPID_KEY = 'YOUR_VAPID_KEY';
