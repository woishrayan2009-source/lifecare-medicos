/* ===================================================
   LifeCure Medicos — Authentication Module
   auth.js
   
   Handles:
   - Email signup
   - Email login
   - Google login
   - Logout
   - Auth state management
   - Route protection
=================================================== */

'use strict';

const { auth, db, storage, googleProvider } = window.firebaseServices;

/* ===================================================
   AUTH STATE OBSERVER
   Runs on every page load
=================================================== */

let currentUser = null;
let currentUserData = null;
let userRole = null;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;

  if (user) {
    // User is logged in
    console.log('✓ User logged in:', user.email);

    try {
      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        currentUserData = userDoc.data();
        userRole = currentUserData.role || 'user';
        
        // Log the role
        console.log('✓ User role:', userRole);
        
        // Call route protection
        handleAuthRoute();
      } else {
        // First time user - redirect to signup if not on signup page
        if (!window.location.pathname.includes('signup.html') && 
            !window.location.pathname.includes('complete-profile.html')) {
          window.location.href = 'complete-profile.html';
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  } else {
    // User is logged out
    console.log('✓ User logged out');
    currentUserData = null;
    userRole = null;
    handleAuthRoute();
  }
});

/* ===================================================
   ROUTE PROTECTION
=================================================== */

function handleAuthRoute() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Public pages - no auth required
  const publicPages = ['index.html', 'login.html', 'signup.html', 'admin.html'];
  
  // Protected pages - auth required
  const protectedPages = ['dashboard.html', 'profile.html', 'complete-profile.html'];
  
  // Admin-only pages
  const adminPages = ['admin.html'];

  // If on public pages, allow access
  if (publicPages.includes(currentPage)) {
    // If on login/signup but already logged in, redirect
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

  // If user not logged in and tries protected page, redirect to login
  if (!currentUser && protectedPages.includes(currentPage)) {
    window.location.href = 'login.html';
    return;
  }

  // If user tries to access admin page but is not admin
  if (adminPages.includes(currentPage) && currentUser && userRole !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  // If logged in but profile not complete, redirect to complete-profile
  if (currentPage === 'dashboard.html' && currentUser && 
      !currentUserData?.profileCompleted && 
      userRole !== 'admin') {
    window.location.href = 'complete-profile.html';
    return;
  }
}

/* ===================================================
   SIGNUP
=================================================== */

async function handleSignup(formData) {
  try {
    const { name, phone, email, password, confirmPassword } = formData;

    // Validation
    if (!name || !phone || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please enter a valid email');
    }

    // Create auth user
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const uid = result.user.uid;

    // Save user to Firestore
    await db.collection('users').doc(uid).set({
      uid,
      name,
      email,
      phone,
      role: 'user',
      profileCompleted: false,
      photoURL: null,
      dob: null,
      gender: null,
      bloodGroup: null,
      address: null,
      city: null,
      state: null,
      pincode: null,
      emergencyContact: null,
      allergies: null,
      diseases: null,
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
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const result = await auth.signInWithEmailAndPassword(email, password);
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
    const result = await auth.signInWithPopup(googleProvider);
    const uid = result.user.uid;
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // First time Google login - create user document
      await db.collection('users').doc(uid).set({
        uid,
        name: user.displayName || 'User',
        email: user.email,
        phone: null,
        role: 'user',
        profileCompleted: false,
        photoURL: user.photoURL || null,
        dob: null,
        gender: null,
        bloodGroup: null,
        address: null,
        city: null,
        state: null,
        pincode: null,
        emergencyContact: null,
        allergies: null,
        diseases: null,
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
    if (!email) {
      throw new Error('Email is required');
    }

    await auth.sendPasswordResetEmail(email);
    console.log('✓ Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('Reset error:', error.message);
    return { success: false, error: error.message };
  }
}

/* ===================================================
   SESSION PERSISTENCE
   Keep user logged in across page refreshes
=================================================== */

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(error => console.error('Persistence error:', error));

/* ===================================================
   HELPER FUNCTIONS
=================================================== */

function isLoggedIn() {
  return currentUser !== null;
}

function isAdmin() {
  return userRole === 'admin';
}

function getCurrentUserId() {
  return currentUser?.uid || null;
}

function getCurrentUserEmail() {
  return currentUser?.email || null;
}

function getUserRole() {
  return userRole;
}

function getUserData() {
  return currentUserData;
}
