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
  apiKey: "AIzaSyDemoKeyReplaceMeWithRealKey123456789",
  authDomain: "lifecure-medicos.firebaseapp.com",
  projectId: "lifecure-medicos",
  storageBucket: "lifecure-medicos.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEFGHIJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Google Sign-In provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Firestore settings
db.settings({ timestampsInSnapshots: true });

// Export for use in other files
window.firebaseServices = {
  auth,
  db,
  storage,
  googleProvider,
  firebase
};

console.log('✓ Firebase initialized successfully');
