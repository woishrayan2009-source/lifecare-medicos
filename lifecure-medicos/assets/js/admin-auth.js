/* ===================================================
   LifeCure Medicos — Admin Authentication Module
   admin-auth.js
   
   Handles admin role verification and access control
   Uses Firebase Authentication and Firestore
=================================================== */

'use strict';

let currentAdminUser = null;
let currentAdminData = null;
let adminAuth = null;
let adminDb = null;

// Initialize admin authentication after Firebase is ready
document.addEventListener('DOMContentLoaded', async () => {
  const services = window.firebaseServices || {};
  adminAuth = services.auth;
  adminDb = services.db;

  if (!adminAuth || !adminDb) {
    console.error('Firebase services not loaded. Check firebase-config.js');
    return;
  }

  console.log('✓ Admin auth initialized');
});

/* ===================================================
   ADMIN LOGIN
=================================================== */
async function adminLoginWithEmail(email, password) {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!adminAuth || !adminDb) {
      throw new Error('Firebase not initialized');
    }

    const result = await adminAuth.signInWithEmailAndPassword(email, password);
    
    // Verify admin role
    const userDoc = await adminDb.collection('users').doc(result.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      await adminAuth.signOut();
      throw new Error('You do not have admin access');
    }

    currentAdminUser = result.user;
    currentAdminData = userDoc.data();
    console.log('✓ Admin login successful:', email);
    return { success: true };
  } catch (error) {
    console.error('Admin login error:', error.message);
    return { success: false, error: error.message };
  }
}

/* ===================================================
   ADMIN LOGOUT
=================================================== */
async function adminLogout() {
  try {
    if (!adminAuth) {
      throw new Error('Firebase not initialized');
    }
    await adminAuth.signOut();
    currentAdminUser = null;
    currentAdminData = null;
    console.log('✓ Admin logged out');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

/* ===================================================
   STATE OBSERVERS
=================================================== */
function onAdminAuthStateChanged(callback) {
  if (adminAuth) {
    adminAuth.onAuthStateChanged(callback);
  }
}

/* ===================================================
   EXPOSED FUNCTIONS
=================================================== */
window.adminLoginWithEmail = adminLoginWithEmail;
window.adminLogout = adminLogout;
window.getCurrentAdminUser = () => currentAdminUser;
window.getCurrentAdminData = () => currentAdminData;
window.getAdminDb = () => adminDb;
window.getAdminAuth = () => adminAuth;
window.onAdminAuthStateChanged = onAdminAuthStateChanged;

console.log('✓ Admin authentication module loaded');
