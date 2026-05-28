/* ===================================================
   LifeCure Medicos — Firebase Configuration
   firebase-config.js
   
   Initialize Firebase services:
   - Authentication
   - Firestore Database
   - Storage
   
   ⚠️ REPLACE with your Firebase project credentials
=================================================== */

// Firebase SDK from CDN (included in HTML)
// Check: https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "AIzaSyAREQXdf4qZ5n2s91wA0Jl6toYxrLnh2T0",
  authDomain: "lifecure-medicos.firebaseapp.com",
  projectId: "lifecure-medicos",
  storageBucket: "lifecure-medicos.firebasestorage.app",
  messagingSenderId: "842355887008",
  appId: "1:842355887008:web:18a5603e1d0310b4b432c5",
  measurementId: "G-11GWDX8VHL"
};

const placeholderApiKeys = [
  'AIzaSyDemoKeyReplaceMeWithRealKey123456789',
  'YOUR_API_KEY'
];

const isPlaceholderApiKey = placeholderApiKeys.some((key) => firebaseConfig.apiKey.includes(key));

if (isPlaceholderApiKey) {
  console.error('Firebase is not configured. Replace the placeholder API key in assets/js/firebase-config.js with your real Firebase Web API key.');
  window.firebaseServices = {
    auth: null,
    db: null,
    storage: null,
    googleProvider: null,
    firebase: window.firebase || null
  };
} else {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Get Firebase services locally to avoid leaking global bindings
  const firebaseAuth = firebase.auth();
  const firebaseDb = firebase.firestore();
  const firebaseStorage = firebase.storage();

  // Google Sign-In provider
  const firebaseGoogleProvider = new firebase.auth.GoogleAuthProvider();
  firebaseGoogleProvider.addScope('profile');
  firebaseGoogleProvider.addScope('email');

  // Export for use in other files
  window.firebaseServices = {
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
    googleProvider: firebaseGoogleProvider,
    firebase
  };

  console.log('✓ Firebase initialized successfully');
}
