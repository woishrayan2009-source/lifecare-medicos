/* ===================================================
   LifeCure Medicos — Authentication Module
   auth.js

   Used by: login.html, signup.html, dashboard.html, profile.html
   NOT used by: admin.html (admin.html has its own auth logic)
=================================================== */

'use strict';

// ✅ FIXED: Wrap in DOMContentLoaded so Firebase is ready before we read it
document.addEventListener('DOMContentLoaded', () => {

  const services = window.firebaseServices || {};
  const auth          = services.auth          || null;
  const db            = services.db            || null;
  const storage       = services.storage       || null;
  const googleProvider= services.googleProvider|| null;

  if (!auth || !db) {
    console.error('Firebase services not loaded. Check firebase-config.js.');
    return;
  }

  /* ===================================================
     STATE
  =================================================== */
  let currentUser     = null;
  let currentUserData = null;
  let userRole        = null;

  /* ===================================================
     AUTH STATE OBSERVER
  =================================================== */
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;

    if (user) {
      console.log('✓ User logged in:', user.email);
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          currentUserData = userDoc.data();
          userRole = currentUserData.role || 'user';
          console.log('✓ User role:', userRole);
          handleAuthRoute();
        } else {
          // No Firestore doc — redirect to complete profile
          const page = getCleanPageName();
          if (page !== 'complete-profile.html' && page !== 'signup.html') {
            window.location.href = 'complete-profile.html';
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      console.log('✓ User logged out');
      currentUserData = null;
      userRole = null;
      handleAuthRoute();
    }
  });

  /* ===================================================
     ROUTE PROTECTION
  =================================================== */
  function getCleanPageName() {
    const raw = window.location.pathname.split('/').pop() || 'index.html';
    return raw.includes('.') ? raw : raw + '.html';
  }

  function handleAuthRoute() {
    const currentPage = getCleanPageName();

    const publicPages    = ['index.html', 'login.html', 'signup.html'];
    const protectedPages = ['dashboard.html', 'profile.html', 'complete-profile.html'];

    // ✅ admin.html is handled entirely by admin.js — don't touch it here
    if (currentPage === 'admin.html') return;

    if (publicPages.includes(currentPage)) {
      if ((currentPage === 'login.html' || currentPage === 'signup.html') && currentUser) {
        if (userRole === 'admin') {
          window.location.href = 'admin.html';
        } else if (currentUserData?.profileCompleted) {
          window.location.href = 'dashboard.html';
        } else {
          window.location.href = 'complete-profile.html';
        }
      }
      return;
    }

    if (!currentUser && protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
      return;
    }

    if (currentPage === 'dashboard.html' && currentUser &&
        !currentUserData?.profileCompleted &&
        userRole !== 'admin') {
      window.location.href = 'complete-profile.html';
      return;
    }
  }

  /* ===================================================
     SESSION PERSISTENCE
  =================================================== */
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => console.error('Persistence error:', error));

  /* ===================================================
     SIGNUP
  =================================================== */
  async function handleSignup(formData) {
    try {
      const { name, phone, email, password, confirmPassword } = formData;
      if (!name || !phone || !email || !password) throw new Error('All fields are required');
      if (password !== confirmPassword) throw new Error('Passwords do not match');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email');

      const result = await auth.createUserWithEmailAndPassword(email, password);
      const uid = result.user.uid;
      await db.collection('users').doc(uid).set({
        uid, name, email, phone,
        role: 'user',
        profileCompleted: false,
        photoURL: null, dob: null, gender: null, bloodGroup: null,
        address: null, city: null, state: null, pincode: null,
        emergencyContact: null, allergies: null, diseases: null,
        createdAt: new Date()
      });
      console.log('✓ User created:', uid);
      return { success: true, uid };
    } catch (error) {
      console.error('Signup error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /* ===================================================
     LOGIN
  =================================================== */
  async function handleLogin(email, password) {
    try {
      if (!email || !password) throw new Error('Email and password are required');
      await auth.signInWithEmailAndPassword(email, password);
      console.log('✓ Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /* ===================================================
     GOOGLE LOGIN
  =================================================== */
  async function handleGoogleLogin() {
    try {
      if (!googleProvider) throw new Error('Google provider not configured');
      const result = await auth.signInWithPopup(googleProvider);
      const uid = result.user.uid;
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        await db.collection('users').doc(uid).set({
          uid,
          name: result.user.displayName || 'User',
          email: result.user.email,
          phone: null, role: 'user', profileCompleted: false,
          photoURL: result.user.photoURL || null,
          dob: null, gender: null, bloodGroup: null,
          address: null, city: null, state: null, pincode: null,
          emergencyContact: null, allergies: null, diseases: null,
          createdAt: new Date()
        });
      }
      console.log('✓ Google login successful');
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /* ===================================================
     LOGOUT
  =================================================== */
  async function handleLogout() {
    try {
      await auth.signOut();
      console.log('✓ Logged out');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /* ===================================================
     PASSWORD RESET
  =================================================== */
  async function handleForgotPassword(email) {
    try {
      if (!email) throw new Error('Email is required');
      await auth.sendPasswordResetEmail(email);
      console.log('✓ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('Reset error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /* ===================================================
     HELPERS
  =================================================== */
  function isLoggedIn()         { return currentUser !== null; }
  function isAdmin()            { return userRole === 'admin'; }
  function getCurrentUserId()   { return currentUser?.uid || null; }
  function getCurrentUserEmail(){ return currentUser?.email || null; }
  function getUserRole()        { return userRole; }
  function getUserData()        { return currentUserData; }

  // Expose globally for login.html, signup.html, dashboard.html
  window.handleLogin         = handleLogin;
  window.handleGoogleLogin   = handleGoogleLogin;
  window.handleSignup        = handleSignup;
  window.handleLogout        = handleLogout;
  window.handleForgotPassword= handleForgotPassword;
  window.isLoggedIn          = isLoggedIn;
  window.isAdmin             = isAdmin;
  window.getCurrentUserId    = getCurrentUserId;
  window.getCurrentUserEmail = getCurrentUserEmail;
  window.getUserRole         = getUserRole;
  window.getUserData         = getUserData;

}); // end DOMContentLoaded